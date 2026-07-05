-- =========================================================
-- Nihongo — Ensure ON DELETE CASCADE on custom-deck FKs
-- =========================================================
-- Both cascades already exist in the original migrations
-- (migrate_custom_decks.sql, migrate_custom_card_reviews.sql).
-- This file re-asserts them so a delete on `custom_decks`
-- transitively removes all `custom_cards` and their review
-- rows — no orphans, no per-row cleanup from the app.
--
--   delete from custom_decks     -- cascades to →
--     custom_cards              -- cascades to →
--       custom_card_reviews
--
-- Idempotent — the drop-if-exists + re-add pattern makes
-- re-runs safe. On huge tables this briefly holds a schema
-- lock; for the size of these tables it's imperceptible.
-- =========================================================

-- Deck → cards
alter table custom_cards
  drop constraint if exists custom_cards_deck_id_fkey;
alter table custom_cards
  add constraint custom_cards_deck_id_fkey
  foreign key (deck_id)
  references custom_decks(id)
  on delete cascade;

-- Card → its review row
alter table custom_card_reviews
  drop constraint if exists custom_card_reviews_custom_card_id_fkey;
alter table custom_card_reviews
  add constraint custom_card_reviews_custom_card_id_fkey
  foreign key (custom_card_id)
  references custom_cards(id)
  on delete cascade;

-- Sanity check — both should now list "CASCADE" under delete_rule.
select
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  rc.delete_rule
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on kcu.constraint_name = tc.constraint_name
join information_schema.referential_constraints rc
  on rc.constraint_name = tc.constraint_name
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_name in ('custom_cards', 'custom_card_reviews')
order by tc.table_name, kcu.column_name;
