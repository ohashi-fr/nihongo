-- =========================================================
-- Nihongo — Tense Test level: replace card list
-- =========================================================
-- Wipes the cards in the "Tense Test" level and re-inserts the
-- corrected 69-card set. Idempotent: re-running gives the same
-- final state.
--
-- Tolerant of both naming conventions:
--   slug:  'conjugation' (current English) or 'conjugaison' (old French)
--   level: 'Tense Test Level 1' or 'Tense Test Niveau 1'
-- so it works whether or not migrate_to_english.sql was run.
-- =========================================================

-- 1) Delete existing cards.
delete from cards
where level_id in (
  select lv.id
  from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug in ('conjugation', 'conjugaison')
    and lv.name in ('Tense Test Level 1', 'Tense Test Niveau 1')
);

-- 2) Re-insert the corrected card list (69 cards).
with target_level as (
  select lv.id
  from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug in ('conjugation', 'conjugaison')
    and lv.name in ('Tense Test Level 1', 'Tense Test Niveau 1')
)
insert into cards (level_id, fields)
select tl.id, jsonb_build_object(
  'english', e,
  'japanese', j,
  'short_form', s,
  'word_type', t
)
from target_level tl
cross join (values
  -- 動詞 doshi (21)
  ('to go',                'いきます',                 'いく',                 'doshi'),
  ('to eat',               'たべます',                 'たべる',               'doshi'),
  ('to drink',             'のみます',                 'のむ',                 'doshi'),
  ('to buy',               'かいます',                 'かう',                 'doshi'),
  ('to wear (clothes)',    'きます',                   'きる',                 'doshi'),
  ('to attach/turn on',    'つけます',                 'つける',               'doshi'),
  ('to say',               'いいます',                 'いう',                 'doshi'),
  ('to open',              'あけます',                 'あける',               'doshi'),
  ('to turn off/erase',    'けします',                 'けす',                 'doshi'),
  ('to close',             'しめます',                 'しめる',               'doshi'),
  ('to stand',             'たちます',                 'たつ',                 'doshi'),
  ('to see/watch',         'みます',                   'みる',                 'doshi'),
  ('to sit',               'すわります',               'すわる',               'doshi'),
  ('to show',              'みせます',                 'みせる',               'doshi'),
  ('to write',             'かきます',                 'かく',                 'doshi'),
  ('to listen',            'ききます',                 'きく',                 'doshi'),
  ('to read',              'よみます',                 'よむ',                 'doshi'),
  ('to speak',             'はなします',               'はなす',               'doshi'),
  ('to take (photo)',      'とります',                 'とる',                 'doshi'),
  ('to do',                'します',                   'する',                 'doshi'),
  ('to come',              'きます',                   'くる',                 'doshi'),

  -- する名詞 suru_meishi (7)
  ('to introduce oneself', 'じこしょうかいします',     'じこしょうかいする',   'suru_meishi'),
  ('to greet',             'あいさつします',           'あいさつする',         'suru_meishi'),
  ('to cook',              'りょうりします',           'りょうりする',         'suru_meishi'),
  ('to have a meal',       'しょくじします',           'しょくじする',         'suru_meishi'),
  ('to shop',              'かいものします',           'かいものする',         'suru_meishi'),
  ('to study',             'べんきょうします',         'べんきょうする',       'suru_meishi'),
  ('to work',              'しごとします',             'しごとする',           'suru_meishi'),

  -- い形容詞 i_keiyoshi (22)
  ('delicious',            'おいしいです',             'おいしい',             'i_keiyoshi'),
  ('good',                 'いいです',                 'いい',                 'i_keiyoshi'),
  ('bad tasting',          'まずいです',               'まずい',               'i_keiyoshi'),
  ('cheap',                'やすいです',               'やすい',               'i_keiyoshi'),
  ('bad',                  'わるいです',               'わるい',               'i_keiyoshi'),
  ('interesting',          'おもしろいです',           'おもしろい',           'i_keiyoshi'),
  ('expensive/tall',       'たかいです',               'たかい',               'i_keiyoshi'),
  ('boring',               'つまらないです',           'つまらない',           'i_keiyoshi'),
  ('big',                  'おおきいです',             'おおきい',             'i_keiyoshi'),
  ('new',                  'あたらしいです',           'あたらしい',           'i_keiyoshi'),
  ('small',                'ちいさいです',             'ちいさい',             'i_keiyoshi'),
  ('old',                  'ふるいです',               'ふるい',               'i_keiyoshi'),
  ('easy',                 'やさしいです',             'やさしい',             'i_keiyoshi'),
  ('warm',                 'あたたかいです',           'あたたかい',           'i_keiyoshi'),
  ('difficult',            'むずかしいです',           'むずかしい',           'i_keiyoshi'),
  ('cool',                 'すずしいです',             'すずしい',             'i_keiyoshi'),
  ('hot',                  'あついです',               'あつい',               'i_keiyoshi'),
  ('many/much',            'おおいです',               'おおい',               'i_keiyoshi'),
  ('cold',                 'さむいです',               'さむい',               'i_keiyoshi'),
  ('few/little',           'すくないです',             'すくない',             'i_keiyoshi'),
  ('long',                 'ながいです',               'ながい',               'i_keiyoshi'),
  ('short',                'みじかいです',             'みじかい',             'i_keiyoshi'),

  -- 時数詞 days of the week (meishi, 7)
  ('Monday',               'げつようびです',           'げつようび',           'meishi'),
  ('Tuesday',              'かようびです',             'かようび',             'meishi'),
  ('Wednesday',            'すいようびです',           'すいようび',           'meishi'),
  ('Thursday',             'もくようびです',           'もくようび',           'meishi'),
  ('Friday',               'きんようびです',           'きんようび',           'meishi'),
  ('Saturday',             'どようびです',             'どようび',             'meishi'),
  ('Sunday',               'にちようびです',           'にちようび',           'meishi'),

  -- 名詞 meishi (5)
  ('sunny',                'はれです',                 'はれ',                 'meishi'),
  ('rain',                 'あめです',                 'あめ',                 'meishi'),
  ('cloudy',               'くもりです',               'くもり',               'meishi'),
  ('student',              'がくせいです',             'がくせい',             'meishi'),
  ('teacher',              'せんせいです',             'せんせい',             'meishi'),

  -- な形容詞 na_keiyoshi (7)
  ('healthy/fine',         'げんきです',               'げんき',               'na_keiyoshi'),
  ('like',                 'すきです',                 'すき',                 'na_keiyoshi'),
  ('dislike',              'きらいです',               'きらい',               'na_keiyoshi'),
  ('pretty/clean',         'きれいです',               'きれい',               'na_keiyoshi'),
  ('no good',              'だめです',                 'だめ',                 'na_keiyoshi'),
  ('quiet',                'しずかです',               'しずか',               'na_keiyoshi'),
  ('lively',               'にぎやかです',             'にぎやか',             'na_keiyoshi')
) as v(e, j, s, t);

-- 3) Quick sanity check.
select
  m.slug as module_slug,
  lv.name as level_name,
  count(*) as cards
from cards c
join module_levels lv on lv.id = c.level_id
join modules m on m.id = lv.module_id
where m.slug in ('conjugation', 'conjugaison')
  and lv.name in ('Tense Test Level 1', 'Tense Test Niveau 1')
group by m.slug, lv.name;
