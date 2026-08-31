-- =========================================================
-- Nihongo — Kanji module seed, batch 2
-- Adds 10 themed/radical-grouped levels + 48 kanji on top of
-- seed_kanji.sql's original 6 levels (85 kanji), bringing the
-- module to 133 kanji total.
-- Idempotent: safe to re-run (each level created only if missing,
-- each level's cards seeded only if it currently has none).
-- =========================================================

with m as (select id from modules where slug = 'kanji')
insert into module_levels (module_id, name, order_index, script)
select m.id, lv_name, lv_order, 'none' from m
cross join (values
  ('Weather & Time',    7),
  ('Tree & Wood',       8),
  ('Gate',              9),
  ('Language & Study', 10),
  ('Money & Value',    11),
  ('Rain & Sky',       12),
  ('Thread & Paper',   13),
  ('Bow & Strength',   14),
  ('Ground & Place',   15),
  ('Family & Feelings',16)
) as v(lv_name, lv_order)
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m) and lv.name = lv_name
);

-- ─── Level 7 — Weather & Time (7) ──────────────────────────────────
with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'kanji' and lv.name = 'Weather & Time'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id, fld::jsonb from do_seed ds
cross join (values
  ('{"kanji":"早","meanings":["early"],"kunyomi":["はや.い"],"onyomi":["そう"],"card_type":"kanji_flashcard","examples":[{"word":"早い","reading":"はやい","meaning":"early"},{"word":"早朝","reading":"そうちょう","meaning":"early morning"}]}'),
  ('{"kanji":"春","meanings":["spring"],"kunyomi":["はる"],"onyomi":["しゅん"],"card_type":"kanji_flashcard","examples":[{"word":"春","reading":"はる","meaning":"spring"},{"word":"春休み","reading":"はるやすみ","meaning":"spring break"},{"word":"春夏秋冬","reading":"しゅんかしゅうとう","meaning":"the four seasons"},{"word":"春分の日","reading":"しゅんぶんのひ","meaning":"the Vernal Equinox"}]}'),
  ('{"kanji":"晴","meanings":["clear up","fine weather"],"kunyomi":["は.れる"],"onyomi":["せい"],"card_type":"kanji_flashcard","examples":[{"word":"晴れ","reading":"はれ","meaning":"sunny weather"},{"word":"晴れる","reading":"はれる","meaning":"to clear up"},{"word":"晴天","reading":"せいてん","meaning":"fine weather"},{"word":"快晴","reading":"かいせい","meaning":"clear and sunny"}]}'),
  ('{"kanji":"暑","meanings":["hot (weather)"],"kunyomi":["あつ.い"],"onyomi":["しょ"],"card_type":"kanji_flashcard","examples":[{"word":"暑い","reading":"あつい","meaning":"hot weather"},{"word":"残暑","reading":"ざんしょ","meaning":"the late summer heat"},{"word":"猛暑","reading":"もうしょ","meaning":"intense heat"}]}'),
  ('{"kanji":"暖","meanings":["warm"],"kunyomi":["あたた.かい"],"onyomi":["だん"],"card_type":"kanji_flashcard","examples":[{"word":"暖かい","reading":"あたたかい","meaning":"warm weather"},{"word":"暖房","reading":"だんぼう","meaning":"heating"},{"word":"暖冬","reading":"だんとう","meaning":"mild winter"}]}'),
  ('{"kanji":"暗","meanings":["dark"],"kunyomi":["くら.い"],"onyomi":["あん"],"card_type":"kanji_flashcard","examples":[{"word":"暗い","reading":"くらい","meaning":"dark"},{"word":"暗記する","reading":"あんきする","meaning":"to memorize"}]}'),
  ('{"kanji":"曜","meanings":["day of the week"],"kunyomi":[],"onyomi":["よう"],"card_type":"kanji_flashcard","examples":[{"word":"日曜日","reading":"にちようび","meaning":"Sunday"},{"word":"何曜日","reading":"なんようび","meaning":"What day of the week?"}]}')
) as v(fld);

-- ─── Level 8 — Tree & Wood (7) ─────────────────────────────────────
with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'kanji' and lv.name = 'Tree & Wood'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id, fld::jsonb from do_seed ds
cross join (values
  ('{"kanji":"東","meanings":["east"],"kunyomi":["ひがし"],"onyomi":["とう"],"card_type":"kanji_flashcard","examples":[{"word":"東","reading":"ひがし","meaning":"the east"},{"word":"東口","reading":"ひがしぐち","meaning":"the east exit"},{"word":"東京","reading":"とうきょう","meaning":"Tokyo"},{"word":"関東地方","reading":"かんとうちほう","meaning":"the Kanto region"}]}'),
  ('{"kanji":"末","meanings":["end"],"kunyomi":["すえ"],"onyomi":["まつ"],"card_type":"kanji_flashcard","examples":[{"word":"末っ子","reading":"すえっこ","meaning":"the youngest child"},{"word":"年末","reading":"ねんまつ","meaning":"the end of the year"},{"word":"週末","reading":"しゅうまつ","meaning":"weekend"}]}'),
  ('{"kanji":"未","meanings":["not yet"],"kunyomi":[],"onyomi":["み"],"card_type":"kanji_flashcard","examples":[{"word":"未来","reading":"みらい","meaning":"future"},{"word":"未定","reading":"みてい","meaning":"undecided"},{"word":"未成年","reading":"みせいねん","meaning":"minority, underage"}]}'),
  ('{"kanji":"果","meanings":["fruit","result"],"kunyomi":["は.たす"],"onyomi":["か"],"card_type":"kanji_flashcard","examples":[{"word":"果たす","reading":"はたす","meaning":"to accomplish"},{"word":"果物","reading":"くだもの","meaning":"fruit"},{"word":"結果","reading":"けっか","meaning":"result"}]}'),
  ('{"kanji":"林","meanings":["woods"],"kunyomi":["はやし"],"onyomi":["りん"],"card_type":"kanji_flashcard","examples":[{"word":"林","reading":"はやし","meaning":"woods"},{"word":"小林さん","reading":"こばやしさん","meaning":"Mr./Ms. Kobayashi"},{"word":"山林","reading":"さんりん","meaning":"mountain forest"}]}'),
  ('{"kanji":"森","meanings":["forest"],"kunyomi":["もり"],"onyomi":["しん"],"card_type":"kanji_flashcard","examples":[{"word":"森","reading":"もり","meaning":"forest"},{"word":"森林","reading":"しんりん","meaning":"woods and forests"}]}'),
  ('{"kanji":"枚","meanings":["counter for flat objects"],"kunyomi":[],"onyomi":["まい"],"card_type":"kanji_flashcard","examples":[{"word":"一枚","reading":"いちまい","meaning":"a sheet of paper"}]}')
) as v(fld);

-- ─── Level 9 — Gate (4) ────────────────────────────────────────────
with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'kanji' and lv.name = 'Gate'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id, fld::jsonb from do_seed ds
cross join (values
  ('{"kanji":"開","meanings":["open"],"kunyomi":["あ.く","あ.ける","ひら.く"],"onyomi":["かい"],"card_type":"kanji_flashcard","examples":[{"word":"店が開く","reading":"みせがあく","meaning":"The store opens."},{"word":"窓を開ける","reading":"まどをあける","meaning":"to open a window"},{"word":"開く","reading":"ひらく","meaning":"to open"},{"word":"開店","reading":"かいてん","meaning":"to open a store"},{"word":"開始する","reading":"かいしする","meaning":"to begin, to start"}]}'),
  ('{"kanji":"閉","meanings":["close","shut"],"kunyomi":["し.まる","し.める","と.じる"],"onyomi":["へい"],"card_type":"kanji_flashcard","examples":[{"word":"店が閉まる","reading":"みせがしまる","meaning":"The store closes."},{"word":"窓を閉める","reading":"まどをしめる","meaning":"to close a window."},{"word":"閉じる","reading":"とじる","meaning":"to close"},{"word":"閉店","reading":"へいてん","meaning":"to close a store"},{"word":"開閉","reading":"かいへい","meaning":"to open and close"}]}'),
  ('{"kanji":"間","meanings":["interval","between"],"kunyomi":["あいだ","ま"],"onyomi":["かん","けん"],"card_type":"kanji_flashcard","examples":[{"word":"間に合う","reading":"まにあう","meaning":"be on time"},{"word":"間","reading":"あいだ","meaning":"between"},{"word":"日本間","reading":"にほんま","meaning":"Japanese style room"},{"word":"時間","reading":"じかん","meaning":"time"},{"word":"一年間","reading":"いちねんかん","meaning":"a year"},{"word":"人間","reading":"にんげん","meaning":"human being"}]}'),
  ('{"kanji":"問","meanings":["question"],"kunyomi":["と.う"],"onyomi":["もん"],"card_type":"kanji_flashcard","examples":[{"word":"問い合わせ","reading":"といあわせ","meaning":"inquiry"},{"word":"質問する","reading":"しつもんする","meaning":"to ask a question"},{"word":"問題","reading":"もんだい","meaning":"question, a problem"}]}')
) as v(fld);

-- ─── Level 10 — Language & Study (4) ───────────────────────────────
with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'kanji' and lv.name = 'Language & Study'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id, fld::jsonb from do_seed ds
cross join (values
  ('{"kanji":"語","meanings":["word","language"],"kunyomi":["かた.る"],"onyomi":["ご"],"card_type":"kanji_flashcard","examples":[{"word":"語る","reading":"かたる","meaning":"to talk, to tell"},{"word":"物語","reading":"ものがたり","meaning":"story"},{"word":"日本語","reading":"にほんご","meaning":"Japanese language"},{"word":"外国語","reading":"がいこくご","meaning":"foreign language"}]}'),
  ('{"kanji":"課","meanings":["lesson","section"],"kunyomi":[],"onyomi":["か"],"card_type":"kanji_flashcard","examples":[{"word":"二課","reading":"にか","meaning":"Lesson 2"},{"word":"人事課","reading":"じんじか","meaning":"the personnel section"}]}'),
  ('{"kanji":"訳","meanings":["reason","translation"],"kunyomi":["わけ"],"onyomi":["やく"],"card_type":"kanji_flashcard","examples":[{"word":"申し訳ありません","reading":"もうしわけありません","meaning":"I am sorry."},{"word":"通訳","reading":"つうやく","meaning":"interpreter"}]}'),
  ('{"kanji":"記","meanings":["record","chronicle"],"kunyomi":["しる.す"],"onyomi":["き"],"card_type":"kanji_flashcard","examples":[{"word":"記す","reading":"しるす","meaning":"to write down"},{"word":"日記","reading":"にっき","meaning":"diary"},{"word":"記念","reading":"きねん","meaning":"commemoration"},{"word":"記入する","reading":"きにゅうする","meaning":"to fill in"}]}')
) as v(fld);

-- ─── Level 11 — Money & Value (6) ──────────────────────────────────
with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'kanji' and lv.name = 'Money & Value'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id, fld::jsonb from do_seed ds
cross join (values
  ('{"kanji":"貸","meanings":["lend","rent out"],"kunyomi":["か.す"],"onyomi":["たい"],"card_type":"kanji_flashcard","examples":[{"word":"貸す","reading":"かす","meaning":"to lend, to rent"},{"word":"賃貸","reading":"ちんたい","meaning":"to hire, to lease, to rent"}]}'),
  ('{"kanji":"貧","meanings":["poor"],"kunyomi":["まず.しい"],"onyomi":["ひん","びん"],"card_type":"kanji_flashcard","examples":[{"word":"貧しい","reading":"まずしい","meaning":"poor"},{"word":"貧乏","reading":"びんぼう","meaning":"poor"},{"word":"貧富","reading":"ひんぷ","meaning":"rich and poor, wealth and poverty"}]}'),
  ('{"kanji":"費","meanings":["expense","cost"],"kunyomi":["つい.やす"],"onyomi":["ひ"],"card_type":"kanji_flashcard","examples":[{"word":"費やす","reading":"ついやす","meaning":"to spend"},{"word":"食費","reading":"しょくひ","meaning":"food expenses"},{"word":"学費","reading":"がくひ","meaning":"school expenses"},{"word":"交通費","reading":"こうつうひ","meaning":"travel expenses"}]}'),
  ('{"kanji":"貯","meanings":["save (money)","store"],"kunyomi":[],"onyomi":["ちょ"],"card_type":"kanji_flashcard","examples":[{"word":"貯金する","reading":"ちょきんする","meaning":"to save money"}]}'),
  ('{"kanji":"質","meanings":["quality","nature"],"kunyomi":[],"onyomi":["しつ"],"card_type":"kanji_flashcard","examples":[{"word":"質問する","reading":"しつもんする","meaning":"to ask a question"},{"word":"性質","reading":"せいしつ","meaning":"nature, character"}]}'),
  ('{"kanji":"贈","meanings":["present (a gift)","donate"],"kunyomi":["おく.る"],"onyomi":["ぞう"],"card_type":"kanji_flashcard","examples":[{"word":"贈る","reading":"おくる","meaning":"to present, to donate"},{"word":"贈答品","reading":"ぞうとうひん","meaning":"presents, gifts"}]}')
) as v(fld);

-- ─── Level 12 — Rain & Sky (3) ─────────────────────────────────────
with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'kanji' and lv.name = 'Rain & Sky'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id, fld::jsonb from do_seed ds
cross join (values
  ('{"kanji":"雲","meanings":["cloud"],"kunyomi":["くも"],"onyomi":["うん"],"card_type":"kanji_flashcard","examples":[{"word":"雲","reading":"くも","meaning":"cloud"},{"word":"雨雲","reading":"あまぐも","meaning":"rain cloud"}]}'),
  ('{"kanji":"曇","meanings":["cloudy"],"kunyomi":["くも.る"],"onyomi":[],"card_type":"kanji_flashcard","examples":[{"word":"曇り","reading":"くもり","meaning":"cloudy sky"},{"word":"曇る","reading":"くもる","meaning":"to become cloudy"}]}'),
  ('{"kanji":"雪","meanings":["snow"],"kunyomi":["ゆき"],"onyomi":["せつ"],"card_type":"kanji_flashcard","examples":[{"word":"雪","reading":"ゆき","meaning":"snow"},{"word":"雪国","reading":"ゆきぐに","meaning":"snow country"},{"word":"新雪","reading":"しんせつ","meaning":"fresh snow"}]}')
) as v(fld);

-- ─── Level 13 — Thread & Paper (5) ─────────────────────────────────
with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'kanji' and lv.name = 'Thread & Paper'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id, fld::jsonb from do_seed ds
cross join (values
  ('{"kanji":"線","meanings":["line"],"kunyomi":[],"onyomi":["せん"],"card_type":"kanji_flashcard","examples":[{"word":"新幹線","reading":"しんかんせん","meaning":"Shinkansen, a bullet train"},{"word":"山手線","reading":"やまのてせん","meaning":"Yamanote line"},{"word":"線を引く","reading":"せんをひく","meaning":"to draw a line"}]}'),
  ('{"kanji":"細","meanings":["thin","detailed"],"kunyomi":["ほそ.い","こま.かい"],"onyomi":["さい"],"card_type":"kanji_flashcard","examples":[{"word":"細い","reading":"ほそい","meaning":"thin"},{"word":"細かい","reading":"こまかい","meaning":"small, fine"},{"word":"細心","reading":"さいしん","meaning":"careful"}]}'),
  ('{"kanji":"結","meanings":["tie","connect","conclude"],"kunyomi":["むす.ぶ"],"onyomi":["けつ"],"card_type":"kanji_flashcard","examples":[{"word":"結ぶ","reading":"むすぶ","meaning":"to bind, to connect, to tie"},{"word":"結婚する","reading":"けっこんする","meaning":"to get married"},{"word":"結果","reading":"けっか","meaning":"result"},{"word":"結論","reading":"けつろん","meaning":"conclusion"}]}'),
  ('{"kanji":"終","meanings":["end","finish"],"kunyomi":["お.わる"],"onyomi":["しゅう"],"card_type":"kanji_flashcard","examples":[{"word":"終わる","reading":"おわる","meaning":"to end"},{"word":"終電","reading":"しゅうでん","meaning":"the last train"},{"word":"終点","reading":"しゅうてん","meaning":"terminal"}]}'),
  ('{"kanji":"紙","meanings":["paper"],"kunyomi":["かみ"],"onyomi":["し"],"card_type":"kanji_flashcard","examples":[{"word":"手紙","reading":"てがみ","meaning":"letter"},{"word":"表紙","reading":"ひょうし","meaning":"cover"}]}')
) as v(fld);

-- ─── Level 14 — Bow & Strength (4) ─────────────────────────────────
with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'kanji' and lv.name = 'Bow & Strength'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id, fld::jsonb from do_seed ds
cross join (values
  ('{"kanji":"引","meanings":["pull","draw"],"kunyomi":["ひ.く"],"onyomi":["いん"],"card_type":"kanji_flashcard","examples":[{"word":"引く","reading":"ひく","meaning":"to pull, to draw"},{"word":"引力","reading":"いんりょく","meaning":"gravity"},{"word":"引退する","reading":"いんたいする","meaning":"to retire"}]}'),
  ('{"kanji":"強","meanings":["strong"],"kunyomi":["つよ.い"],"onyomi":["きょう","ごう"],"card_type":"kanji_flashcard","examples":[{"word":"強い","reading":"つよい","meaning":"strong"},{"word":"勉強する","reading":"べんきょうする","meaning":"to study"},{"word":"強弱","reading":"きょうじゃく","meaning":"strength and weakness"}]}'),
  ('{"kanji":"弱","meanings":["weak"],"kunyomi":["よわ.い"],"onyomi":["じゃく"],"card_type":"kanji_flashcard","examples":[{"word":"弱い","reading":"よわい","meaning":"weak"},{"word":"弱点","reading":"じゃくてん","meaning":"weak point"}]}'),
  ('{"kanji":"弟","meanings":["younger brother"],"kunyomi":["おとうと"],"onyomi":["だい","てい"],"card_type":"kanji_flashcard","examples":[{"word":"弟","reading":"おとうと","meaning":"one''s younger brother"},{"word":"兄弟","reading":"きょうだい","meaning":"brothers"}]}')
) as v(fld);

-- ─── Level 15 — Ground & Place (3) ─────────────────────────────────
with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'kanji' and lv.name = 'Ground & Place'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id, fld::jsonb from do_seed ds
cross join (values
  ('{"kanji":"地","meanings":["ground","earth","land"],"kunyomi":[],"onyomi":["ち","じ"],"card_type":"kanji_flashcard","examples":[{"word":"地下鉄","reading":"ちかてつ","meaning":"subway"},{"word":"地図","reading":"ちず","meaning":"map"},{"word":"地面","reading":"じめん","meaning":"the ground"}]}'),
  ('{"kanji":"場","meanings":["place"],"kunyomi":["ば"],"onyomi":["じょう"],"card_type":"kanji_flashcard","examples":[{"word":"場所","reading":"ばしょ","meaning":"place"},{"word":"駐車場","reading":"ちゅうしゃじょう","meaning":"parking place"},{"word":"工場","reading":"こうじょう","meaning":"factory"}]}'),
  ('{"kanji":"型","meanings":["type","model"],"kunyomi":["かた"],"onyomi":["けい"],"card_type":"kanji_flashcard","examples":[{"word":"血液型","reading":"けつえきがた","meaning":"blood type"},{"word":"新型","reading":"しんがた","meaning":"new type"},{"word":"模型","reading":"もけい","meaning":"model"}]}')
) as v(fld);

-- ─── Level 16 — Family & Feelings (5) ──────────────────────────────
with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'kanji' and lv.name = 'Family & Feelings'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id, fld::jsonb from do_seed ds
cross join (values
  ('{"kanji":"好","meanings":["like","fond of"],"kunyomi":["す.き","この.む"],"onyomi":["こう"],"card_type":"kanji_flashcard","examples":[{"word":"好き","reading":"すき","meaning":"to like, favorite"},{"word":"好物","reading":"こうぶつ","meaning":"one''s favorite food"}]}'),
  ('{"kanji":"嫌","meanings":["dislike","hate"],"kunyomi":["きら.い","いや"],"onyomi":["けん"],"card_type":"kanji_flashcard","examples":[{"word":"嫌い","reading":"きらい","meaning":"dislike"},{"word":"嫌","reading":"いや","meaning":"unpleasant"},{"word":"機嫌がいい","reading":"きげんがいい","meaning":"in a good mood"}]}'),
  ('{"kanji":"姉","meanings":["older sister"],"kunyomi":["あね"],"onyomi":["し"],"card_type":"kanji_flashcard","examples":[{"word":"姉","reading":"あね","meaning":"one''s older sister"},{"word":"お姉さん","reading":"おねえさん","meaning":"older sister"},{"word":"姉妹","reading":"しまい","meaning":"sisters"}]}'),
  ('{"kanji":"妹","meanings":["younger sister"],"kunyomi":["いもうと"],"onyomi":["まい"],"card_type":"kanji_flashcard","examples":[{"word":"妹","reading":"いもうと","meaning":"one''s younger sister"}]}'),
  ('{"kanji":"始","meanings":["begin","start"],"kunyomi":["はじ.まる","はじ.める"],"onyomi":["し"],"card_type":"kanji_flashcard","examples":[{"word":"始まる","reading":"はじまる","meaning":"to start"},{"word":"始める","reading":"はじめる","meaning":"to start something"},{"word":"開始する","reading":"かいしする","meaning":"to begin"},{"word":"始発","reading":"しはつ","meaning":"the first train"}]}')
) as v(fld);

-- =========================================================
-- Module description bump (85 → 133 kanji)
-- =========================================================
update modules
set description = 'Learn the 133 basic kanji — readings, meanings, and writing.'
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
