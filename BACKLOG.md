# Backlog

Running punch list from an informal staff-level pass over the codebase.
Nothing here is urgent — pick items off whenever you want to go deeper on
the app instead of adding features. Ordered roughly by impact.

## Open

### 🔴 Admin access control gap
Any signed-up user (via the public `/signup` form) can currently reach
`/admin/dashboard` and gains full write access to `modules`, `module_levels`,
and `cards` — nothing distinguishes a "public reviews account" session from
an "admin" session after login.

- `middleware.ts` gates `/admin/*` on "is a user logged in", not "is this
  user an admin".
- `schema.sql`'s write policies for `modules` / `module_levels` / `cards`
  check `auth.role() = 'authenticated'` — true for any signed-up user.
  Every other table (`favorites`, `custom_decks`, `custom_cards`,
  `custom_card_reviews`, `card_reviews`) correctly scopes with
  `auth.uid() = user_id`; these three are the only exception.
- `lib/admin.ts`'s `isAdminEmail()` is the only place that knows who's
  really an admin, but it's documented as UI-only — its own comment
  claiming "the middleware still gates the actual routes" is wrong,
  middleware never calls it.
- Related, minor: `NEXT_PUBLIC_ADMIN_EMAILS` ships the admin email list
  in the client JS bundle (info leak, not itself exploitable).

**Fix shape:** needs an actual server-side admin check — middleware should
verify the user's email against the admin list, and the RLS write policies
need a Postgres-side way to know "is this uid an admin" (small `admins`
table or an `is_admin` claim), since Postgres can't read a Next.js env var.
This is an auth-model decision, not a mechanical fix — worth a real
conversation before implementing.

### 33MB of one-time-use data committed to git
`data/jmdict-eng-common-3.6.2.json` (16MB) and `supabase/data/jpn_indices.csv`
(16MB) are tracked in git but only ever read by offline import scripts
(`scripts/import_jmdict.mjs`) — nothing in `app/`, `components/`, or `lib/`
imports them. Every clone and Vercel deploy checkout pays for this. The repo
already excludes `supabase/data/sentences.csv` / `links.csv` in `.gitignore`
for exactly this reason ("exceed GitHub's 100MB limit, kept locally only")
— these two were just missed. Fix: `git rm --cached` + add to `.gitignore`.

### Duplicated flashcard/quiz scaffolding beyond favorites
The `useFavorites` extraction (done) covered one duplicated slice. The
~9 flashcard/quiz client components (`NounFlashcardClient`,
`AdjectiveFlashcardClient`, `VerbFlashcardClient`, `MixedVocabFlashcardClient`,
`VerbConjugationFlashcardClient`, `KanjiQuizClient`, `ConjugationQuizClient`,
`CountingQuizClient`, `TranslationQuizClient` — ~4000 combined lines) still
share near-identical shuffle helpers, keyboard-nav wiring, and
`PreQuizScreen` direction-picking scaffolding, copy-pasted per card type.
Same maintenance cost as the favorites duplication: a fix in one doesn't
propagate to the others. Candidate extraction: a `useShuffledQueue` /
`useCardKeyboardNav` hook pair, same shape as `useFavorites`.

### Minor: custom-deck card counts computed client-side in JS
`app/reviews/page.tsx` fetches *every* `custom_cards` row (`select deck_id`)
for the user just to count cards per deck in a JS `Map`, instead of a
grouped aggregate query. Fine at current scale (a few decks, tens of
cards); worth revisiting if custom decks grow large. Low priority.

## Done
- Removed 3 leftover "TEMP debug" `console.log`/`getSession()` blocks
  shipped to production (`VerbFlashcardClient`, `CustomDeckSessionClient`,
  `QuizClient`) — one added a real extra round-trip on every favorite toggle.
- Moved `kuromoji` (~10MB dict, only used by an offline script) from
  `dependencies` to `devDependencies`.
- Fixed missing base table grants (`permission denied for table modules`)
  — `schema.sql` now grants `anon`/`authenticated` base privileges
  alongside the existing RLS policies.
- Extracted `lib/hooks/useFavorites.ts` — removed ~420 duplicated lines
  of auth/favorites logic across 6 flashcard/quiz components.
- Made the browser Supabase client (`lib/supabase/client.ts`) a proper
  singleton — was constructing a fresh `SupabaseClient` (and fresh
  `GoTrueClient`) on every one of 57 call sites, risking the "Multiple
  GoTrueClient instances" session-refresh race. Server client correctly
  stays per-request (must not be a singleton — it's scoped to one
  request's cookies).
