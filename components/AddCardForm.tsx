"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { revalidateDeck } from "@/app/reviews/actions";
import type { CustomCard } from "@/lib/customDecks";

/**
 * The reusable "add card" form — dictionary search + prefill + four
 * editable fields (kanji, reading, meaning_en, note). Saves to
 * `custom_cards` under the caller-supplied `deckId` and `userId`,
 * then either notifies the parent (via `onAdded`) and resets so the
 * user can chain another add.
 *
 * Extracted from CustomDeckClient so the mobile bottom-nav
 * QuickAddCardModal can reuse the exact same form + behaviour.
 */

type DictResult = {
  id: string;
  kanji: string | null;
  reading: string;
  romaji: string | null;
  meanings: string[];
};

type Props = {
  deckId: string;
  userId: string;
  /** Called with the newly inserted row on success (ADD mode). */
  onAdded?: (card: CustomCard) => void;
  /**
   * Optional "close/done" affordance. Rendered as the outline button
   * next to the primary Save action. If omitted, no cancel button is
   * shown (the parent may host its own dismiss).
   */
  onCancel?: () => void;
  /** Header label shown above the form; hidden if empty string. */
  heading?: string;
  /**
   * When true, focus the search input on mount. Handy inside a modal
   * so typing starts immediately.
   */
  autoFocus?: boolean;
  /**
   * If supplied, the form switches to EDIT mode: fields prefill with
   * the card's current values, "Save" calls UPDATE instead of INSERT,
   * and the form does NOT reset after save. The submission calls
   * `onEdited(updatedCard)` and the parent is expected to close the
   * form itself.
   *
   * Editing does NOT touch `custom_card_reviews` — the box, due_date
   * and lapses of a card stay exactly as they were. Only content
   * fields on `custom_cards` are mutated.
   */
  existingCard?: CustomCard;
  /** Called with the updated row on success (EDIT mode). */
  onEdited?: (card: CustomCard) => void;
};

const SEARCH_DEBOUNCE_MS = 200;

export default function AddCardForm({
  deckId,
  userId,
  onAdded,
  onCancel,
  heading,
  autoFocus = false,
  existingCard,
  onEdited,
}: Props) {
  const isEditing = Boolean(existingCard);
  const resolvedHeading =
    heading ?? (isEditing ? "Edit card" : "Add a card");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DictResult[]>([]);
  const [searching, setSearching] = useState(false);

  // Prefill from the existing card in edit mode; empty otherwise.
  const [kanji, setKanji] = useState(existingCard?.kanji ?? "");
  const [reading, setReading] = useState(existingCard?.reading ?? "");
  const [meaning, setMeaning] = useState(existingCard?.meaning_en ?? "");
  const [note, setNote] = useState(existingCard?.note ?? "");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) searchRef.current?.focus();
  }, [autoFocus]);

  // Debounced dictionary search.
  useEffect(() => {
    const q = query.trim();
    if (q.length === 0) {
      setResults([]);
      return;
    }
    setSearching(true);
    const controller = new AbortController();
    const id = window.setTimeout(async () => {
      try {
        const r = await fetch(
          `/api/dict/search?q=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        );
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const body: { results: DictResult[] } = await r.json();
        setResults(body.results ?? []);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        // eslint-disable-next-line no-console
        console.error("[dict/search] fetch failed:", e);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      controller.abort();
      window.clearTimeout(id);
    };
  }, [query]);

  function pick(r: DictResult) {
    setKanji(r.kanji ?? "");
    setReading(r.reading);
    setMeaning(r.meanings[0] ?? "");
    setResults([]);
    setQuery("");
    searchRef.current?.focus();
  }

  const canSave =
    reading.trim().length > 0 && meaning.trim().length > 0 && !saving;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;

    setSaving(true);
    setErr(null);

    const supabase = createClient();

    // Content-only fields — same shape for INSERT and UPDATE.
    // Deliberately does NOT include anything from custom_card_reviews;
    // editing a card's spelling never resets learning progress.
    const contentFields = {
      kanji: kanji.trim() || null,
      reading: reading.trim(),
      meaning_en: meaning.trim(),
      note: note.trim() || null,
    };

    if (isEditing && existingCard) {
      // ── EDIT — UPDATE the existing row ──────────────────────
      const { data, error } = await supabase
        .from("custom_cards")
        .update(contentFields)
        .eq("id", existingCard.id)
        .select(
          "id, deck_id, user_id, kanji, reading, meaning_en, note, created_at, example_jp, example_en, example_reading, example_source"
        )
        .single();

      if (error || !data) {
        // eslint-disable-next-line no-console
        console.error("[custom_cards] update failed:", error);
        setErr("Couldn't save. Try again?");
        setSaving(false);
        return;
      }

      onEdited?.(data as CustomCard);
      void revalidateDeck(deckId);
      setSaving(false);
      // No field reset — the parent closes the form now.
      return;
    }

    // ── ADD — INSERT a new row ─────────────────────────────────
    // Look up an example sentence up front so we can bake it into
    // the INSERT (avoids a second round-trip). Failures here are
    // silent — the card is created without an example if the RPC
    // errors or returns nothing.
    type PickBest = {
      jp_text: string | null;
      en_text: string | null;
      reading: string | null;
      source: string | null;
    };
    let example: PickBest | null = null;
    try {
      const { data: rpcData } = await supabase.rpc("pick_best_example", {
        p_kanji: contentFields.kanji,
        p_reading: contentFields.reading,
      });
      if (rpcData) example = rpcData as unknown as PickBest;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[pick_best_example] failed:", e);
    }

    const insertPayload = {
      ...contentFields,
      deck_id: deckId,
      user_id: userId,
      example_jp: example ? example.jp_text : null,
      example_en: example ? example.en_text : null,
      example_reading: example ? example.reading : null,
      example_source: example ? example.source : null,
    };

    const { data, error } = await supabase
      .from("custom_cards")
      .insert(insertPayload)
      .select(
        "id, deck_id, user_id, kanji, reading, meaning_en, note, created_at, example_jp, example_en, example_reading, example_source"
      )
      .single();

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.error("[custom_cards] insert failed:", error);
      setErr("Couldn't save. Try again?");
      setSaving(false);
      return;
    }

    // Optimistic append in the parent stays the primary UX signal —
    // the new card shows up in the visible list immediately. The
    // revalidator runs after so a navigation away and back (or a
    // fresh add via a different surface) sees fresh data too.
    onAdded?.(data as CustomCard);
    void revalidateDeck(deckId);

    // Reset for the next add — user can chain multiple cards.
    setKanji("");
    setReading("");
    setMeaning("");
    setNote("");
    setQuery("");
    setResults([]);
    setSaving(false);
    searchRef.current?.focus();
  }

  return (
    <form
      onSubmit={save}
      className="rounded-2xl border border-border bg-white p-4 shadow-card"
    >
      {resolvedHeading && (
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-tight text-ink">
            {resolvedHeading}
          </h3>
        </div>
      )}

      {/* Search — Japanese, romaji, or English */}
      <div className="relative">
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search dictionary — 食べる / taberu / eat"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="w-full rounded-xl border border-border bg-paper px-3 py-2.5 text-sm text-ink shadow-soft outline-none transition focus:border-primary"
        />
        {query.trim().length > 0 && (
          <ResultsDropdown
            results={results}
            searching={searching}
            onPick={pick}
          />
        )}
        <p className="mt-1.5 text-[10px] leading-snug text-muted">
          Dictionary data from{" "}
          <a
            href="https://www.edrdg.org/"
            target="_blank"
            rel="noreferrer noopener"
            className="underline decoration-dotted underline-offset-2 hover:text-ink"
          >
            JMdict
          </a>{" "}
          (EDRDG,{" "}
          <a
            href="https://www.edrdg.org/edrdg/licence.html"
            target="_blank"
            rel="noreferrer noopener"
            className="underline decoration-dotted underline-offset-2 hover:text-ink"
          >
            CC-BY-SA 4.0
          </a>
          ). Example sentences from{" "}
          <a
            href="https://tatoeba.org/"
            target="_blank"
            rel="noreferrer noopener"
            className="underline decoration-dotted underline-offset-2 hover:text-ink"
          >
            Tatoeba
          </a>{" "}
          (CC-BY 2.0 FR). Nothing matches? Fill the fields below
          manually.
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field
          label="Reading (hiragana)"
          value={reading}
          onChange={setReading}
          placeholder="たべる"
          required
          japanese
        />
        <Field
          label="Kanji (optional)"
          value={kanji}
          onChange={setKanji}
          placeholder="食べる"
          japanese
        />
      </div>
      <div className="mt-3">
        <Field
          label="Meaning"
          value={meaning}
          onChange={setMeaning}
          placeholder="to eat"
          required
        />
      </div>
      <div className="mt-3">
        <Field
          label="Note (optional)"
          value={note}
          onChange={setNote}
          placeholder="Where you saw it — station, work chat, …"
        />
      </div>

      {err && (
        <p role="alert" className="mt-3 text-xs text-red-600">
          {err}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="btn-outline flex-1 justify-center disabled:opacity-40"
          >
            {isEditing ? "Cancel" : "Done"}
          </button>
        )}
        <button
          type="submit"
          disabled={!canSave}
          className="btn-accent flex-1 justify-center disabled:opacity-40"
        >
          {saving
            ? "Saving…"
            : isEditing
              ? "Save changes"
              : "Save card"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  japanese,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  japanese?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className={`w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-ink shadow-soft outline-none transition focus:border-primary ${
          japanese ? "jp" : ""
        }`}
      />
    </label>
  );
}

function ResultsDropdown({
  results,
  searching,
  onPick,
}: {
  results: DictResult[];
  searching: boolean;
  onPick: (r: DictResult) => void;
}) {
  if (results.length === 0) {
    return (
      <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-border bg-white p-3 text-xs text-muted shadow-cardHover">
        {searching
          ? "Searching…"
          : "No matches — you can still fill fields manually below."}
      </div>
    );
  }
  return (
    <ul
      role="listbox"
      className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-xl border border-border bg-white p-1 shadow-cardHover"
    >
      {results.map((r) => {
        const primary = r.kanji ?? r.reading;
        const showReading = r.kanji ? r.reading : null;
        return (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onPick(r)}
              className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-soft"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="jp text-base text-ink">{primary}</span>
                  {showReading && (
                    <span className="jp text-xs text-muted">
                      {showReading}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 truncate text-xs text-muted">
                  {r.meanings.slice(0, 3).join("; ") || "—"}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
