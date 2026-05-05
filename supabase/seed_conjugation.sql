-- =========================================================
-- Nihongo — Conjugation module seed
-- Run after schema.sql. Idempotent: safe to re-run.
-- Adds: module "Conjugation" + 2 levels + their cards.
-- =========================================================

-- 1) Module
insert into modules (name, slug, description, type)
values (
  'Conjugation',
  'conjugation',
  'Verb forms, tenses, and word-type practice.',
  'quiz'
)
on conflict (slug) do nothing;

-- =========================================================
-- Level A: Tense Test Level 1 (translation quiz)
-- Cards have english + japanese (long form) + short_form + word_type.
-- =========================================================

with m as (select id from modules where slug = 'conjugation')
insert into module_levels (module_id, name, order_index, script)
select m.id, 'Tense Test Level 1', 1, 'hiragana' from m
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m) and lv.name = 'Tense Test Level 1'
);

with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'conjugation' and lv.name = 'Tense Test Level 1'
),
do_seed as (
  select id from lv where not exists (select 1 from cards c where c.level_id = lv.id)
)
insert into cards (level_id, fields)
select ds.id, jsonb_build_object(
  'english', e,
  'japanese', j,
  'short_form', s,
  'word_type', t
)
from do_seed ds
cross join (values
  ('to eat',          'たべます',     'たべる',      'doshi'),
  ('to go',           'いきます',     'いく',        'doshi'),
  ('to drink',        'のみます',     'のむ',        'doshi'),
  ('to do',           'します',       'する',        'suru_meishi'),
  ('to be (animate)', 'います',       'いる',        'doshi'),
  ('to open',         'あけます',     'あける',      'doshi'),
  ('to close',        'しめます',     'しめる',      'doshi'),
  ('to buy',          'かいます',     'かう',        'doshi'),
  ('to stand',        'たちます',     'たつ',        'doshi'),
  ('to sit',          'すわります',   'すわる',      'doshi'),
  ('to see/watch',    'みます',       'みる',        'doshi'),
  ('to listen',       'ききます',     'きく',        'doshi'),
  ('to read',         'よみます',     'よむ',        'doshi'),
  ('to write',        'かきます',     'かく',        'doshi'),
  ('to speak',        'はなします',   'はなす',      'doshi'),
  ('to take (photo)', 'とります',     'とる',        'doshi'),
  ('to come',         'きます',       'くる',        'doshi'),
  ('delicious',       'おいしいです', 'おいしい',    'i_keiyoshi'),
  ('bad tasting',     'まずいです',   'まずい',      'i_keiyoshi'),
  ('cheap/easy',      'やすいです',   'やすい',      'i_keiyoshi'),
  ('interesting',     'おもしろいです','おもしろい', 'i_keiyoshi'),
  ('boring',          'つまらないです','つまらない', 'i_keiyoshi'),
  ('expensive/tall',  'たかいです',   'たかい',      'i_keiyoshi'),
  ('small',           'ちいさいです', 'ちいさい',    'i_keiyoshi'),
  ('new',             'あたらしいです','あたらしい', 'i_keiyoshi'),
  ('old',             'ふるいです',   'ふるい',      'i_keiyoshi'),
  ('easy',            'やさしいです', 'やさしい',    'i_keiyoshi'),
  ('difficult',       'むずかしいです','むずかしい', 'i_keiyoshi'),
  ('warm',            'あたたかいです','あたたか',   'i_keiyoshi'),
  ('cool',            'すずしいです', 'すずしい',    'i_keiyoshi'),
  ('hot',             'あついです',   'あつい',      'i_keiyoshi'),
  ('cold',            'さむいです',   'さむい',      'i_keiyoshi'),
  ('many/much',       'おおいです',   'おおい',      'i_keiyoshi'),
  ('few/little',      'すくないです', 'すくない',    'i_keiyoshi'),
  ('long',            'ながいです',   'ながい',      'i_keiyoshi'),
  ('short',           'みじかいです', 'みじかい',    'i_keiyoshi'),
  ('sunny',           'はれです',     'はれ',        'meishi'),
  ('cloudy',          'くもりです',   'くもり',      'meishi'),
  ('student',         'がくせいです', 'がくせい',    'meishi'),
  ('teacher',         'せんせいです', 'せんせい',    'meishi'),
  ('pretty/clean',    'きれいです',   'きれい',      'na_keiyoshi'),
  ('like',            'すきです',     'すき',        'na_keiyoshi'),
  ('dislike',         'きらいです',   'きらい',      'na_keiyoshi'),
  ('no good',         'だめです',     'だめ',        'na_keiyoshi'),
  ('quiet',           'しずかです',   'しずか',      'na_keiyoshi'),
  ('lively',          'にぎやかです', 'にぎやか',    'na_keiyoshi')
) as v(e, j, s, t);

-- =========================================================
-- Level B: Conjugation Level 1 (5-form conjugation drill)
-- Cards have word + word_type + forms{} object.
-- =========================================================

with m as (select id from modules where slug = 'conjugation')
insert into module_levels (module_id, name, order_index, script)
select m.id, 'Conjugation Level 1', 2, 'hiragana' from m
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m) and lv.name = 'Conjugation Level 1'
);

with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'conjugation' and lv.name = 'Conjugation Level 1'
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
  ('たべます',     'たべません',     'たべました',     'たべませんでした',     'たべましょう',     'doshi'),
  ('いきます',     'いきません',     'いきました',     'いきませんでした',     'いきましょう',     'doshi'),
  ('のみます',     'のみません',     'のみました',     'のみませんでした',     'のみましょう',     'doshi'),
  ('します',       'しません',       'しました',       'しませんでした',       'しましょう',       'suru_meishi'),
  ('います',       'いません',       'いました',       'いませんでした',       'いましょう',       'doshi'),
  ('あけます',     'あけません',     'あけました',     'あけませんでした',     'あけましょう',     'doshi'),
  ('しめます',     'しめません',     'しめました',     'しめませんでした',     'しめましょう',     'doshi'),
  ('かいます',     'かいません',     'かいました',     'かいませんでした',     'かいましょう',     'doshi'),
  ('たちます',     'たちません',     'たちました',     'たちませんでした',     'たちましょう',     'doshi'),
  ('すわります',   'すわりません',   'すわりました',   'すわりませんでした',   'すわりましょう',   'doshi'),
  ('みます',       'みません',       'みました',       'みませんでした',       'みましょう',       'doshi'),
  ('ききます',     'ききません',     'ききました',     'ききませんでした',     'ききましょう',     'doshi'),
  ('よみます',     'よみません',     'よみました',     'よみませんでした',     'よみましょう',     'doshi'),
  ('かきます',     'かきません',     'かきました',     'かきませんでした',     'かきましょう',     'doshi'),
  ('はなします',   'はなしません',   'はなしました',   'はなしませんでした',   'はなしましょう',   'doshi'),
  ('とります',     'とりません',     'とりました',     'とりませんでした',     'とりましょう',     'doshi'),
  ('きます',       'きません',       'きました',       'きませんでした',       'きましょう',       'doshi')
) as v(w, np, ap, ng, vo, t);
