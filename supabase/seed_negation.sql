-- =========================================================
-- Nihongo — Négation Niveau 1 level seed
-- Adds a third level "Négation Niveau 1" to the conjugation
-- module. Idempotent: safe to re-run.
--
-- Tolerant of both naming conventions:
--   slug: 'conjugation' (current English) or 'conjugaison' (old French)
-- so it works whether or not migrate_to_english.sql was applied.
-- =========================================================

-- 1) Level
with m as (
  select id from modules where slug in ('conjugation', 'conjugaison') limit 1
)
insert into module_levels (module_id, name, order_index, script)
select m.id, 'Négation Niveau 1', 3, 'hiragana' from m
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m) and lv.name = 'Négation Niveau 1'
);

-- 2) Cards — only insert if the level is currently empty.
with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug in ('conjugation', 'conjugaison')
    and lv.name = 'Négation Niveau 1'
),
do_seed as (
  select id from lv where not exists (select 1 from cards c where c.level_id = lv.id)
)
insert into cards (level_id, fields)
select ds.id, jsonb_build_object(
  'word', w,
  'word_type', t,
  'forms', jsonb_build_object(
    'affirmative_present', w,
    'negative_present',    np,
    'affirmative_past',    ap,
    'negative_past',       ng,
    'volitional',          vo
  )
)
from do_seed ds
cross join (values
  -- 動詞 doshi (8) — full 5 forms
  ('いきます',         'いきません',         'いきました',     'いきませんでした',     'いきましょう',     'doshi'),
  ('のみます',         'のみません',         'のみました',     'のみませんでした',     'のみましょう',     'doshi'),
  ('かいます',         'かいません',         'かいました',     'かいませんでした',     'かいましょう',     'doshi'),
  ('たべます',         'たべません',         'たべました',     'たべませんでした',     'たべましょう',     'doshi'),
  ('みます',           'みません',           'みました',       'みませんでした',       'みましょう',       'doshi'),
  ('きます',           'きません',           'きました',       'きませんでした',       'きましょう',       'doshi'),
  ('します',           'しません',           'しました',       'しませんでした',       'しましょう',       'doshi'),
  ('きます',           'きません',           'きました',       'きませんでした',       'きましょう',       'doshi'),

  -- する名詞 suru_meishi (1) — full 5 forms
  ('べんきょうします', 'べんきょうしません', 'べんきょうしました', 'べんきょうしませんでした', 'べんきょうしましょう', 'suru_meishi'),

  -- い形容詞 i_keiyoshi (6) — no volitional
  ('おいしいです',     'おいしくありません',   'おいしかったです',   'おいしくありませんでした',   null::text, 'i_keiyoshi'),
  ('いいです',         'よくありません',       'よかったです',       'よくありませんでした',       null::text, 'i_keiyoshi'),
  ('たかいです',       'たかくありません',     'たかかったです',     'たかくありませんでした',     null::text, 'i_keiyoshi'),
  ('やすいです',       'やすくありません',     'やすかったです',     'やすくありませんでした',     null::text, 'i_keiyoshi'),
  ('おもしろいです',   'おもしろくありません', 'おもしろかったです', 'おもしろくありませんでした', null::text, 'i_keiyoshi'),
  ('さむいです',       'さむくありません',     'さむかったです',     'さむくありませんでした',     null::text, 'i_keiyoshi'),

  -- な形容詞 na_keiyoshi (4) — no volitional
  ('げんきです',       'げんきじゃありません', 'げんきでした',       'げんきじゃありませんでした', null::text, 'na_keiyoshi'),
  ('きれいです',       'きれいじゃありません', 'きれいでした',       'きれいじゃありませんでした', null::text, 'na_keiyoshi'),
  ('すきです',         'すきじゃありません',   'すきでした',         'すきじゃありませんでした',   null::text, 'na_keiyoshi'),
  ('しずかです',       'しずかじゃありません', 'しずかでした',       'しずかじゃありませんでした', null::text, 'na_keiyoshi'),

  -- 名詞 meishi (6) — no volitional
  ('がくせいです',     'がくせいじゃありません', 'がくせいでした',   'がくせいじゃありませんでした', null::text, 'meishi'),
  ('せんせいです',     'せんせいじゃありません', 'せんせいでした',   'せんせいじゃありませんでした', null::text, 'meishi'),
  ('げつようびです',   'げつようびじゃありません','げつようびでした','げつようびじゃありませんでした', null::text, 'meishi'),
  ('あめです',         'あめじゃありません',     'あめでした',       'あめじゃありませんでした',     null::text, 'meishi'),
  ('はれです',         'はれじゃありません',     'はれでした',       'はれじゃありませんでした',     null::text, 'meishi'),
  ('くもりです',       'くもりじゃありません',   'くもりでした',     'くもりじゃありませんでした',   null::text, 'meishi')
) as v(w, np, ap, ng, vo, t);

-- 3) Sanity check.
select m.slug as module_slug, lv.name as level_name, count(c.id) as cards
from module_levels lv
join modules m on m.id = lv.module_id
left join cards c on c.level_id = lv.id
where m.slug in ('conjugation', 'conjugaison')
  and lv.name = 'Négation Niveau 1'
group by m.slug, lv.name;
