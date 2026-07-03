import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/dict/search?q=<query>
 *
 * Autocomplete / lookup endpoint over the self-hosted JMdict subset
 * (`dictionary_entries` table). Delegates the actual work to the
 * `search_dictionary(q, jp, max_rows)` SQL function so ranking, tier
 * merging, and `is_common` sorting all happen in one round-trip.
 *
 * Input detection:
 *   - If `q` contains any Japanese character (Hiragana / Katakana /
 *     CJK Unified Ideographs) → search kanji + reading columns.
 *   - Otherwise → search romaji (prefix) + English meanings.
 *
 * Ranking (from the SQL side): tier asc → is_common desc → kanji/reading.
 *
 * Response shape:
 *   { results: Array<{ id, kanji, reading, romaji, meanings }> }
 *
 * Never returns more than 15 rows. Empty query → empty results (no 400).
 * Cached for 60 s on the CDN — the dictionary is effectively static so
 * repeat autocomplete keystrokes share cached responses.
 */

// Any Hiragana, Katakana, or CJK Unified Ideograph → treat as JP.
const HAS_JAPANESE = /[぀-ゟ゠-ヿ一-鿿]/;

// Safety caps.
const LIMIT = 15;
const MAX_QUERY_LEN = 64;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type DictResult = {
  id: string;
  kanji: string | null;
  reading: string;
  romaji: string | null;
  meanings: string[];
};

type DictRow = DictResult & {
  is_common: boolean;
  tier: number;
};

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("q") ?? "";
  const q = raw.trim();

  // Empty input → return empty list (not an error — the client can
  // safely bind this endpoint to onChange without extra guards).
  if (q.length === 0) {
    return json({ results: [] });
  }

  if (q.length > MAX_QUERY_LEN) {
    return json({ error: "query too long" }, { status: 400 });
  }

  const jp = HAS_JAPANESE.test(q);
  const supabase = createClient();

  const { data, error } = await supabase.rpc("search_dictionary", {
    q,
    jp,
    max_rows: LIMIT,
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error("[dict/search] rpc failed:", error);
    return json({ error: "search failed" }, { status: 500 });
  }

  const results: DictResult[] = ((data ?? []) as DictRow[]).map((r) => ({
    id: r.id,
    kanji: r.kanji,
    reading: r.reading,
    romaji: r.romaji,
    meanings: r.meanings,
  }));

  return json({ results });
}

/** Small helper — attaches sensible cache headers to every response. */
function json(body: unknown, init: { status?: number } = {}) {
  return NextResponse.json(body, {
    status: init.status ?? 200,
    headers: {
      // Dictionary data is stable — cache aggressively at the edge,
      // give browsers a shorter TTL for freshness during dev.
      "Cache-Control":
        init.status && init.status >= 400
          ? "no-store"
          : "public, max-age=30, s-maxage=300",
    },
  });
}
