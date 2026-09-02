-- =========================================================
-- Nihongo — Kanji module seed, batch 3
-- Adds 1 themed level (Shrine & Society, 7 kanji) on top of
-- seed_kanji_batch2.sql's 16 levels (133 kanji), bringing the
-- module to 140 kanji total.
-- Idempotent: safe to re-run.
-- =========================================================

with m as (select id from modules where slug = 'kanji')
insert into module_levels (module_id, name, order_index, script)
select m.id, 'Shrine & Society', 17, 'none' from m
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m) and lv.name = 'Shrine & Society'
);

-- ─── Level 17 — Shrine & Society (7) ───────────────────────────────
with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'kanji' and lv.name = 'Shrine & Society'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id, fld::jsonb from do_seed ds
cross join (values
  ('{"kanji":"神","meanings":["god","spirit"],"kunyomi":["かみ"],"onyomi":["しん","じん"],"card_type":"kanji_flashcard","examples":[{"word":"神社","reading":"じんじゃ","meaning":"shrine"},{"word":"精神","reading":"せいしん","meaning":"mind, spirit"}]}'),
  ('{"kanji":"社","meanings":["company","shrine"],"kunyomi":["やしろ"],"onyomi":["しゃ"],"card_type":"kanji_flashcard","examples":[{"word":"会社","reading":"かいしゃ","meaning":"company"},{"word":"社会","reading":"しゃかい","meaning":"society"}]}'),
  ('{"kanji":"祖","meanings":["ancestor","grandparent"],"kunyomi":[],"onyomi":["そ"],"card_type":"kanji_flashcard","examples":[{"word":"お祖父さん","reading":"おじいさん","meaning":"grandfather"},{"word":"お祖母さん","reading":"おばあさん","meaning":"grandmother"},{"word":"祖父","reading":"そふ","meaning":"grandfather"},{"word":"祖母","reading":"そぼ","meaning":"grandmother"},{"word":"祖先","reading":"そせん","meaning":"ancestor"}]}'),
  ('{"kanji":"祭","meanings":["festival"],"kunyomi":["まつ.り"],"onyomi":["さい"],"card_type":"kanji_flashcard","examples":[{"word":"祭り","reading":"まつり","meaning":"festival"},{"word":"祭日","reading":"さいじつ","meaning":"national holiday"}]}'),
  ('{"kanji":"禁","meanings":["to prohibit","to forbid"],"kunyomi":[],"onyomi":["きん"],"card_type":"kanji_flashcard","examples":[{"word":"禁止する","reading":"きんしする","meaning":"to prohibit, to forbid"},{"word":"禁煙","reading":"きんえん","meaning":"no smoking"}]}'),
  ('{"kanji":"製","meanings":["manufacture","made in"],"kunyomi":[],"onyomi":["せい"],"card_type":"kanji_flashcard","examples":[{"word":"日本製","reading":"にほんせい","meaning":"made in japan"},{"word":"製品","reading":"せいひん","meaning":"product"}]}'),
  ('{"kanji":"初","meanings":["first","beginning"],"kunyomi":["はじ.め","はつ"],"onyomi":["しょ"],"card_type":"kanji_flashcard","examples":[{"word":"初めて","reading":"はじめて","meaning":"for the first time"},{"word":"初め","reading":"はじめ","meaning":"the beginning"},{"word":"初恋","reading":"はつこい","meaning":"one''s first love"},{"word":"初級","reading":"しょきゅう","meaning":"beginner's class"}]}')
) as v(fld);

-- =========================================================
-- Module description bump (133 → 140 kanji)
-- =========================================================
update modules
set description = 'Learn the 140 basic kanji — readings, meanings, and writing.'
where slug = 'kanji';

-- =========================================================
-- Sanity check
-- =========================================================
select lv.order_index, lv.name, count(c.id) as cards
from module_levels lv
join modules m on m.id = lv.module_id
left join cards c on c.level_id = lv.id
where m.slug = 'kanji'
group by lv.order_index, lv.name
order by lv.order_index;
