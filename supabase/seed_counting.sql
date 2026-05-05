-- =========================================================
-- Nihongo — Counting module seed
-- Module + 11 levels of counter practice. Idempotent: safe to re-run.
-- Level 11 ("Final Boss") is intentionally seeded with NO cards —
-- the route picks 10 random cards from levels 1–10 at runtime.
-- =========================================================

-- 1) Module
insert into modules (name, slug, description, type)
values (
  'Counting',
  'counting',
  'Master Japanese counters from universal objects to time and dates.',
  'quiz'
)
on conflict (slug) do nothing;

-- =========================================================
-- LEVEL 1 — Universal Objects (hitotsu) — rotating emojis
-- =========================================================
with m as (select id from modules where slug = 'counting')
insert into module_levels (module_id, name, order_index, script)
select m.id, 'Universal Objects — Everything Counts', 1, 'hiragana' from m
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m) and lv.name = 'Universal Objects — Everything Counts'
);

with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'counting' and lv.name = 'Universal Objects — Everything Counts'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id,
  case when isq
    then jsonb_build_object(
      'counter_type','hitotsu',
      'value','?',
      'reading',rd,
      'question_word',rd,
      'emoji','❓',
      'emoji_label','items',
      'is_question_card',true
    )
    else jsonb_build_object(
      'counter_type','hitotsu',
      'value',val,
      'reading',rd,
      'question_word','いくつ',
      'emoji',em,
      'emoji_label',label,
      'is_question_card',false
    )
  end
from do_seed ds
cross join (values
  (1::int,'ひとつ',  '🍎',                                 'apples',  false),
  (2,     'ふたつ',  '🍬🍬',                               'candies', false),
  (3,     'みっつ',  '📦📦📦',                             'boxes',   false),
  (4,     'よっつ',  '🍎🍎🍎🍎',                            'apples',  false),
  (5,     'いつつ',  '🍬🍬🍬🍬🍬',                          'candies', false),
  (6,     'むっつ',  '📦📦📦📦📦📦',                        'boxes',   false),
  (7,     'ななつ',  '🍎🍎🍎🍎🍎🍎🍎',                      'apples',  false),
  (8,     'やっつ',  '🍬🍬🍬🍬🍬🍬🍬🍬',                    'candies', false),
  (9,     'ここのつ', '📦📦📦📦📦📦📦📦📦',                  'boxes',   false),
  (10,    'とお',    '🍎🍎🍎🍎🍎🍎🍎🍎🍎🍎',                'apples',  false),
  (null,  'いくつ',  '❓',                                 'items',   true)
) as v(val, rd, em, label, isq);

-- =========================================================
-- LEVEL 2 — People (nin / mei) — two readings per card
-- =========================================================
with m as (select id from modules where slug = 'counting')
insert into module_levels (module_id, name, order_index, script)
select m.id, 'People — Crowd Control', 2, 'hiragana' from m
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m) and lv.name = 'People — Crowd Control'
);

with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'counting' and lv.name = 'People — Crowd Control'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id,
  case when isq
    then jsonb_build_object(
      'counter_type','nin_mei',
      'value','?',
      'standard_reading',std,
      'honorific_reading',hon,
      'question_word_standard',std,
      'question_word_honorific',hon,
      'emoji','❓',
      'is_question_card',true
    )
    else jsonb_build_object(
      'counter_type','nin_mei',
      'value',val,
      'standard_reading',std,
      'honorific_reading',hon,
      'question_word_standard','なんにん',
      'question_word_honorific','なんめい',
      'emoji',repeat('🧑', val),
      'is_question_card',false
    )
  end
from do_seed ds
cross join (values
  (1::int, 'ひとり',             'いちめい',           false),
  (2,      'ふたり',             'にめい',             false),
  (3,      'さんにん',           'さんめい',           false),
  (4,      'よにん',             'よんめい',           false),
  (5,      'ごにん',             'ごめい',             false),
  (6,      'ろくにん',           'ろくめい',           false),
  (7,      'ななにん / しちにん', 'ななめい / しちめい', false),
  (8,      'はちにん',           'はちめい',           false),
  (9,      'きゅうにん / くにん', 'きゅうめい',         false),
  (10,     'じゅうにん',         'じゅうめい',         false),
  (11,     'じゅういちにん',     'じゅういちめい',     false),
  (null,   'なんにん',           'なんめい',           true)
) as v(val, std, hon, isq);

-- =========================================================
-- Helper note for levels 3–10:
-- Each block (a) creates the level idempotently and (b) inserts
-- the standard counter cards using `repeat()` on the emoji.
-- =========================================================

-- =========================================================
-- LEVEL 3 — Flat Objects (mai)
-- =========================================================
with m as (select id from modules where slug = 'counting')
insert into module_levels (module_id, name, order_index, script)
select m.id, 'Flat Objects — Flat Pack', 3, 'hiragana' from m
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m) and lv.name = 'Flat Objects — Flat Pack'
);

with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'counting' and lv.name = 'Flat Objects — Flat Pack'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id,
  case when isq
    then jsonb_build_object('counter_type','mai','value','?','reading',rd,'question_word',rd,'emoji','❓','emoji_label','sheets','is_question_card',true)
    else jsonb_build_object('counter_type','mai','value',val,'reading',rd,'question_word','なんまい','emoji',repeat('📄',val),'emoji_label','sheets','is_question_card',false)
  end
from do_seed ds
cross join (values
  (1::int,'いちまい',false),
  (2,     'にまい',  false),
  (3,     'さんまい',false),
  (4,     'よんまい',false),
  (5,     'ごまい',  false),
  (6,     'ろくまい',false),
  (7,     'ななまい',false),
  (8,     'はちまい',false),
  (9,     'きゅうまい',false),
  (10,    'じゅうまい',false),
  (null,  'なんまい',true)
) as v(val, rd, isq);

-- =========================================================
-- LEVEL 4 — Long Objects (hon)
-- =========================================================
with m as (select id from modules where slug = 'counting')
insert into module_levels (module_id, name, order_index, script)
select m.id, 'Long Objects — Long Story', 4, 'hiragana' from m
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m) and lv.name = 'Long Objects — Long Story'
);

with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'counting' and lv.name = 'Long Objects — Long Story'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id,
  case when isq
    then jsonb_build_object('counter_type','hon','value','?','reading',rd,'question_word',rd,'emoji','❓','emoji_label','pens','is_question_card',true)
    else jsonb_build_object('counter_type','hon','value',val,'reading',rd,'question_word','なんぼん','emoji',repeat('🖊️',val),'emoji_label','pens','is_question_card',false)
  end
from do_seed ds
cross join (values
  (1::int,'いっぽん',  false),
  (2,     'にほん',    false),
  (3,     'さんぼん',  false),
  (4,     'よんほん',  false),
  (5,     'ごほん',    false),
  (6,     'ろっぽん',  false),
  (7,     'ななほん',  false),
  (8,     'はっぽん',  false),
  (9,     'きゅうほん',false),
  (10,    'じゅっぽん',false),
  (null,  'なんぼん',  true)
) as v(val, rd, isq);

-- =========================================================
-- LEVEL 5 — Bound Objects (satsu)
-- =========================================================
with m as (select id from modules where slug = 'counting')
insert into module_levels (module_id, name, order_index, script)
select m.id, 'Bound Objects — By the Book', 5, 'hiragana' from m
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m) and lv.name = 'Bound Objects — By the Book'
);

with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'counting' and lv.name = 'Bound Objects — By the Book'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id,
  case when isq
    then jsonb_build_object('counter_type','satsu','value','?','reading',rd,'question_word',rd,'emoji','❓','emoji_label','books','is_question_card',true)
    else jsonb_build_object('counter_type','satsu','value',val,'reading',rd,'question_word','なんさつ','emoji',repeat('📚',val),'emoji_label','books','is_question_card',false)
  end
from do_seed ds
cross join (values
  (1::int,'いっさつ',                false),
  (2,     'にさつ',                  false),
  (3,     'さんさつ',                false),
  (4,     'よんさつ',                false),
  (5,     'ごさつ',                  false),
  (6,     'ろくさつ',                false),
  (7,     'ななさつ',                false),
  (8,     'はっさつ / はちさつ',     false),
  (9,     'きゅうさつ',              false),
  (10,    'じゅっさつ / じゅうさつ', false),
  (null,  'なんさつ',                true)
) as v(val, rd, isq);

-- =========================================================
-- LEVEL 6 — Cups & Bowls (hai)
-- =========================================================
with m as (select id from modules where slug = 'counting')
insert into module_levels (module_id, name, order_index, script)
select m.id, 'Cups & Bowls — Fill It Up', 6, 'hiragana' from m
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m) and lv.name = 'Cups & Bowls — Fill It Up'
);

with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'counting' and lv.name = 'Cups & Bowls — Fill It Up'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id,
  case when isq
    then jsonb_build_object('counter_type','hai','value','?','reading',rd,'question_word',rd,'emoji','❓','emoji_label','cups','is_question_card',true)
    else jsonb_build_object('counter_type','hai','value',val,'reading',rd,'question_word','なんばい','emoji',repeat('🍵',val),'emoji_label','cups','is_question_card',false)
  end
from do_seed ds
cross join (values
  (1::int,'いっぱい',  false),
  (2,     'にはい',    false),
  (3,     'さんばい',  false),
  (4,     'よんはい',  false),
  (5,     'ごはい',    false),
  (6,     'ろっぱい',  false),
  (7,     'ななはい',  false),
  (8,     'はっぱい',  false),
  (9,     'きゅうはい',false),
  (10,    'じゅっぱい',false),
  (null,  'なんばい',  true)
) as v(val, rd, isq);

-- =========================================================
-- LEVEL 7 — Machines & Vehicles (dai)
-- =========================================================
with m as (select id from modules where slug = 'counting')
insert into module_levels (module_id, name, order_index, script)
select m.id, 'Machines & Vehicles — Heavy Metal', 7, 'hiragana' from m
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m) and lv.name = 'Machines & Vehicles — Heavy Metal'
);

with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'counting' and lv.name = 'Machines & Vehicles — Heavy Metal'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id,
  case when isq
    then jsonb_build_object('counter_type','dai','value','?','reading',rd,'question_word',rd,'emoji','❓','emoji_label','vehicles','is_question_card',true)
    else jsonb_build_object('counter_type','dai','value',val,'reading',rd,'question_word','なんだい','emoji',repeat('🚗',val),'emoji_label','vehicles','is_question_card',false)
  end
from do_seed ds
cross join (values
  (1::int,'いちだい',  false),
  (2,     'にだい',    false),
  (3,     'さんだい',  false),
  (4,     'よんだい',  false),
  (5,     'ごだい',    false),
  (6,     'ろくだい',  false),
  (7,     'ななだい',  false),
  (8,     'はちだい',  false),
  (9,     'きゅうだい',false),
  (10,    'じゅうだい',false),
  (null,  'なんだい',  true)
) as v(val, rd, isq);

-- =========================================================
-- LEVEL 8 — Houses & Buildings (ken)
-- =========================================================
with m as (select id from modules where slug = 'counting')
insert into module_levels (module_id, name, order_index, script)
select m.id, 'Houses & Buildings — Home Count', 8, 'hiragana' from m
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m) and lv.name = 'Houses & Buildings — Home Count'
);

with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'counting' and lv.name = 'Houses & Buildings — Home Count'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id,
  case when isq
    then jsonb_build_object('counter_type','ken','value','?','reading',rd,'question_word',rd,'emoji','❓','emoji_label','houses','is_question_card',true)
    else jsonb_build_object('counter_type','ken','value',val,'reading',rd,'question_word','なんげん','emoji',repeat('🏠',val),'emoji_label','houses','is_question_card',false)
  end
from do_seed ds
cross join (values
  (1::int,'いっけん',  false),
  (2,     'にけん',    false),
  (3,     'さんげん',  false),
  (4,     'よんけん',  false),
  (5,     'ごけん',    false),
  (6,     'ろっけん',  false),
  (7,     'ななけん',  false),
  (8,     'はっけん',  false),
  (9,     'きゅうけん',false),
  (10,    'じゅっけん',false),
  (null,  'なんげん',  true)
) as v(val, rd, isq);

-- =========================================================
-- LEVEL 9 — Floors (kai — floor)
-- =========================================================
with m as (select id from modules where slug = 'counting')
insert into module_levels (module_id, name, order_index, script)
select m.id, 'Floors — Floor by Floor', 9, 'hiragana' from m
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m) and lv.name = 'Floors — Floor by Floor'
);

with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'counting' and lv.name = 'Floors — Floor by Floor'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id,
  case when isq
    then jsonb_build_object('counter_type','kai_floor','value','?','reading',rd,'question_word',rd,'emoji','❓','emoji_label','floors','is_question_card',true)
    else jsonb_build_object('counter_type','kai_floor','value',val,'reading',rd,'question_word','なんがい / なんかい','emoji',repeat('🏢',val),'emoji_label','floors','is_question_card',false)
  end
from do_seed ds
cross join (values
  (1::int,'いっかい',                  false),
  (2,     'にかい',                    false),
  (3,     'さんがい / さんかい',       false),
  (4,     'よんかい',                  false),
  (5,     'ごかい',                    false),
  (6,     'ろっかい',                  false),
  (7,     'ななかい',                  false),
  (8,     'はっかい / はちかい',       false),
  (9,     'きゅうかい',                false),
  (10,    'じゅっかい / じゅうかい',   false),
  (null,  'なんがい / なんかい',       true)
) as v(val, rd, isq);

-- =========================================================
-- LEVEL 10 — Occurrences (kai — times)
-- =========================================================
with m as (select id from modules where slug = 'counting')
insert into module_levels (module_id, name, order_index, script)
select m.id, 'Occurrences — How Many Times?', 10, 'hiragana' from m
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m) and lv.name = 'Occurrences — How Many Times?'
);

with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'counting' and lv.name = 'Occurrences — How Many Times?'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id,
  case when isq
    then jsonb_build_object('counter_type','kai_times','value','?','reading',rd,'question_word',rd,'emoji','❓','emoji_label','times','is_question_card',true)
    else jsonb_build_object('counter_type','kai_times','value',val,'reading',rd,'question_word','なんかい','emoji',repeat('🔁',val),'emoji_label','times','is_question_card',false)
  end
from do_seed ds
cross join (values
  (1::int,'いっかい',                  false),
  (2,     'にかい',                    false),
  (3,     'さんかい',                  false),
  (4,     'よんかい',                  false),
  (5,     'ごかい',                    false),
  (6,     'ろっかい',                  false),
  (7,     'ななかい',                  false),
  (8,     'はっかい / はちかい',       false),
  (9,     'きゅうかい',                false),
  (10,    'じゅっかい / じゅうかい',   false),
  (null,  'なんかい',                  true)
) as v(val, rd, isq);

-- =========================================================
-- LEVEL 11 — Final Boss (no cards stored; runtime picks 10 random)
-- =========================================================
with m as (select id from modules where slug = 'counting')
insert into module_levels (module_id, name, order_index, script)
select m.id, 'Final Boss — The Counting Master', 11, 'hiragana' from m
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m) and lv.name = 'Final Boss — The Counting Master'
);

-- =========================================================
-- Sanity check
-- =========================================================
select lv.order_index, lv.name, count(c.id) as cards
from module_levels lv
join modules m on m.id = lv.module_id
left join cards c on c.level_id = lv.id
where m.slug = 'counting'
group by lv.order_index, lv.name
order by lv.order_index;
