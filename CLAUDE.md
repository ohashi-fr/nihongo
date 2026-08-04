# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # dev server, localhost:3000
npm run build    # production build (runs type-check + lint as part of the build)
npm start         # serve the production build
npm run lint      # next lint on its own
```

There is no test suite / test runner in this project (`npm run lint` and `npm run build` are the only checks). Environment setup (Supabase project, `.env.local`, seeding) is documented in `README.md` — follow that for local setup rather than re-deriving it here.

## Architecture

### Two parallel content systems — don't conflate them

1. **Seeded modules** (`modules` → `module_levels` → `cards`) — admin-authored content (Vocabulary, Kanji, Conjugation, Counting, Grammar quizzes). Managed via `/admin/*`, rendered via `/modules/[slug]/...`. `cards.fields` is a JSONB blob whose shape depends on a `card_type` discriminator (`noun_flashcard`, `verb_flashcard`, `adjective_flashcard`, `adverb_flashcard`, `verb_conjugation`, `kanji_flashcard`, `translation`, `counting`, ...). Each flashcard/quiz client component (`components/*FlashcardClient.tsx`, `components/*QuizClient.tsx`) owns a `parseXFields(card)` function that normalizes the raw JSONB into a typed shape — that's the pattern to follow when adding a new card type, not a shared schema.
2. **Custom decks** (`custom_decks` → `custom_cards`) — user-authored, private (RLS-scoped to `user_id`). Managed from `/reviews`, reviewed via a Leitner-box daily session (`components/CustomDeckSessionClient.tsx` + `lib/leitner.ts`). Fully separate table set and separate types (`lib/customDecks.ts`) from the seeded-module system — don't reuse `lib/types.ts`'s `Card` type here.

A third, independent content system: **Grammar** (`app/grammar`, `components/grammar/*`) is not database-backed at all — it's static data in `content/grammar/grammar-data.ts` / `grammar-quiz.ts`, transcribed from `content/grammar/recap-japonais-midterm.html`. That file's own header comment is a hard constraint: Japanese example strings must be transcribed verbatim from the source HTML, never paraphrased or "improved."

### Two review/spaced-repetition mechanisms — different status, don't merge them

- `lib/leitner.ts` — box-based scheduler (box 1-5, interval per box, leech detection) — **live**, powers custom-deck daily sessions.
- `lib/fsrs.ts` — thin wrapper around `ts-fsrs` — implemented but **not currently wired to any UI** (see the comment in `components/VerbFlashcardClient.tsx`: "FSRS rating UI removed — see lib/fsrs.ts to re-enable spaced repetition later"). `card_reviews` is the table it round-trips against.
- Separately, **favorites** (`favorites` table, `lib/hooks/useFavorites.ts`) is a third, simpler mechanism — a plain star-to-save list with no scheduling — that backs the "Favorites" section of `/reviews`, distinct from both of the above.

### Supabase client construction

- `lib/supabase/client.ts` (browser) is a **module-level singleton** — `createClient()` always returns the same `SupabaseClient` instance. This is deliberate: multiple independent clients in one tab race on the shared `localStorage` session key (Supabase's own "Multiple GoTrueClient instances" warning). Don't refactor this back to constructing a fresh client per call.
- `lib/supabase/server.ts` (server) is **intentionally not a singleton** — it reads `cookies()` per request, so it must be constructed fresh on every call. A module-level singleton here would leak one user's session into another user's concurrent request.
- Prefer `supabase.auth.getUser()` over `getSession()` in any server-side or security-relevant check — `getUser()` revalidates the JWT against the auth server, `getSession()` just trusts the cookie.

### Schema is cumulative across many files, not just `schema.sql`

`supabase/schema.sql` is only the original bootstrap (modules/levels/cards/sessions + their RLS policies). Every feature added since — favorites, custom decks, kanji flashcards, dictionary search, grammar quiz, level groups, MCQ support, etc. — lives in its own `supabase/migrate_*.sql` file (15+ of them) that must be run in addition to `schema.sql`, not instead of it. There is no single consolidated "current schema" file to read — reconstructing the full schema means reading `schema.sql` plus the relevant `migrate_*.sql` files.

### Auth model — admin is UI-only right now, not enforced

`lib/admin.ts`'s `isAdminEmail()` (checked against `NEXT_PUBLIC_ADMIN_EMAILS`) only hides/shows the admin nav link — it is **not** consulted by `middleware.ts` (which just checks "is a user logged in") or by the RLS write policies on `modules`/`module_levels`/`cards` (which just check `auth.role() = 'authenticated'`). In the current state, any account created via public `/signup` can reach `/admin/dashboard` and write to those tables. See `BACKLOG.md` for the fix shape — don't assume admin routes or content-write RLS are actually locked down.

### Dictionary / autocomplete

`dictionary_entries` (imported once from JMdict via `scripts/import_jmdict.mjs`) + the `search_dictionary(q, jp, max_rows)` Postgres RPC power `/api/dict/search`, used by `AddCardForm` for custom-card autocomplete. The `data/*.json` / `supabase/data/*.csv` raw dumps in the repo are one-time import inputs for that script and `scripts/ingest_tatoeba_examples.mjs` — nothing in `app/`, `components/`, or `lib/` reads them at runtime.

## Known issues / tech debt

Tracked in `BACKLOG.md` — check it before assuming something is a fresh finding, and add to it rather than fixing opportunistically mid-task unless asked.
