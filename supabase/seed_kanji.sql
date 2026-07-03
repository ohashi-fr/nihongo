-- =========================================================
-- Nihongo — Kanji module seed
-- Module + 6 themed levels + 85 starter kanji.
-- Idempotent: safe to re-run.
--
-- Requires modules.type to allow 'kanji'. The first statement
-- updates the check constraint if needed.
-- =========================================================

alter table modules drop constraint if exists modules_type_check;
alter table modules add constraint modules_type_check
  check (type in ('quiz', 'conjugation', 'kanji'));

-- 1) Module
insert into modules (name, slug, description, type)
values (
  'Kanji',
  'kanji',
  'Learn the 111 basic kanji — readings, meanings, and writing.',
  'kanji'
)
on conflict (slug) do nothing;

-- =========================================================
-- Levels (idempotent inserts)
-- =========================================================
with m as (select id from modules where slug = 'kanji')
insert into module_levels (module_id, name, order_index, script)
select m.id, lv_name, lv_order, 'none' from m
cross join (values
  ('Numbers',              1),
  ('Nature',               2),
  ('Position',             3),
  ('Appearance',           4),
  ('People & Body',        5),
  ('Movement & Actions',   6)
) as v(lv_name, lv_order)
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m) and lv.name = lv_name
);

-- =========================================================
-- Helper pattern: each level block is "create-if-empty"-style.
-- =========================================================

-- ─── Level 1 — Numbers (15) ────────────────────────────────────────
with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'kanji' and lv.name = 'Numbers'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id, fld::jsonb from do_seed ds
cross join (values
  ('{"kanji":"一","meanings":["one"],"kunyomi":["ひとつ"],"onyomi":["いち"],"examples":[{"word":"一月","reading":"いちがつ","meaning":"January"}]}'),
  ('{"kanji":"二","meanings":["two"],"kunyomi":["ふたつ"],"onyomi":["に"],"examples":[{"word":"二月","reading":"にがつ","meaning":"February"}]}'),
  ('{"kanji":"三","meanings":["three"],"kunyomi":["みっつ"],"onyomi":["さん"],"examples":[{"word":"三月","reading":"さんがつ","meaning":"March"}]}'),
  ('{"kanji":"四","meanings":["four"],"kunyomi":["よっつ"],"onyomi":["し"],"examples":[{"word":"四月","reading":"しがつ","meaning":"April"}]}'),
  ('{"kanji":"五","meanings":["five"],"kunyomi":["いつつ"],"onyomi":["ご"],"examples":[{"word":"五月","reading":"ごがつ","meaning":"May"}]}'),
  ('{"kanji":"六","meanings":["six"],"kunyomi":["むっつ"],"onyomi":["ろく"],"examples":[{"word":"六月","reading":"ろくがつ","meaning":"June"}]}'),
  ('{"kanji":"七","meanings":["seven"],"kunyomi":["ななつ"],"onyomi":["しち"],"examples":[{"word":"七月","reading":"しちがつ","meaning":"July"}]}'),
  ('{"kanji":"八","meanings":["eight"],"kunyomi":["やっつ"],"onyomi":["はち"],"examples":[{"word":"八月","reading":"はちがつ","meaning":"August"}]}'),
  ('{"kanji":"九","meanings":["nine"],"kunyomi":["ここのつ"],"onyomi":["く","きゅう"],"examples":[{"word":"九月","reading":"くがつ","meaning":"September"}]}'),
  ('{"kanji":"十","meanings":["ten"],"kunyomi":["とお"],"onyomi":["じゅう"],"examples":[{"word":"十月","reading":"じゅうがつ","meaning":"October"}]}'),
  ('{"kanji":"百","meanings":["hundred"],"kunyomi":[],"onyomi":["ひゃく"],"examples":[{"word":"百","reading":"ひゃく","meaning":"hundred"}]}'),
  ('{"kanji":"千","meanings":["thousand"],"kunyomi":[],"onyomi":["せん"],"examples":[{"word":"千","reading":"せん","meaning":"thousand"}]}'),
  ('{"kanji":"万","meanings":["ten thousand"],"kunyomi":[],"onyomi":["まん"],"examples":[{"word":"万","reading":"まん","meaning":"ten thousand"}]}'),
  ('{"kanji":"寸","meanings":["about 3cm"],"kunyomi":[],"onyomi":["すん"],"examples":[]}'),
  ('{"kanji":"尺","meanings":["about 30cm"],"kunyomi":[],"onyomi":["しゃく"],"examples":[]}')
) as v(fld);

-- ─── Level 2 — Nature (20) ─────────────────────────────────────────
with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'kanji' and lv.name = 'Nature'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id, fld::jsonb from do_seed ds
cross join (values
  ('{"kanji":"日","meanings":["sun"],"kunyomi":["ひ"],"onyomi":["にち"],"examples":[{"word":"日曜日","reading":"にちようび","meaning":"Sunday"},{"word":"休日","reading":"きゅうじつ","meaning":"holiday"}]}'),
  ('{"kanji":"月","meanings":["moon"],"kunyomi":["つき"],"onyomi":["げつ","がつ"],"examples":[{"word":"月曜日","reading":"げつようび","meaning":"Monday"},{"word":"一月","reading":"いちがつ","meaning":"January"}]}'),
  ('{"kanji":"火","meanings":["fire"],"kunyomi":["ひ"],"onyomi":["か"],"examples":[{"word":"火曜日","reading":"かようび","meaning":"Tuesday"}]}'),
  ('{"kanji":"水","meanings":["water"],"kunyomi":["みず"],"onyomi":["すい"],"examples":[{"word":"水曜日","reading":"すいようび","meaning":"Wednesday"}]}'),
  ('{"kanji":"木","meanings":["tree"],"kunyomi":["き"],"onyomi":["もく"],"examples":[{"word":"木曜日","reading":"もくようび","meaning":"Thursday"}]}'),
  ('{"kanji":"金","meanings":["money"],"kunyomi":["かね"],"onyomi":["きん"],"examples":[{"word":"金曜日","reading":"きんようび","meaning":"Friday"}]}'),
  ('{"kanji":"土","meanings":["soil"],"kunyomi":["つち"],"onyomi":["ど"],"examples":[{"word":"土曜日","reading":"どようび","meaning":"Saturday"}]}'),
  ('{"kanji":"山","meanings":["mountain"],"kunyomi":["やま"],"onyomi":["さん"],"examples":[{"word":"富士山","reading":"ふじさん","meaning":"Mt. Fuji"}]}'),
  ('{"kanji":"川","meanings":["river"],"kunyomi":["かわ"],"onyomi":["せん"],"examples":[{"word":"河川","reading":"かせん","meaning":"river"}]}'),
  ('{"kanji":"田","meanings":["rice field"],"kunyomi":["た"],"onyomi":["でん"],"examples":[{"word":"水田","reading":"すいでん","meaning":"paddy field"}]}'),
  ('{"kanji":"石","meanings":["stone"],"kunyomi":["いし"],"onyomi":["せき"],"examples":[{"word":"石油","reading":"せきゆ","meaning":"oil"}]}'),
  ('{"kanji":"穴","meanings":["hole"],"kunyomi":["あな"],"onyomi":[],"examples":[]}'),
  ('{"kanji":"雨","meanings":["rain"],"kunyomi":["あめ"],"onyomi":["う"],"examples":[{"word":"雨天","reading":"うてん","meaning":"rainy weather"}]}'),
  ('{"kanji":"風","meanings":["wind"],"kunyomi":["かぜ"],"onyomi":["ふう"],"examples":[{"word":"台風","reading":"たいふう","meaning":"typhoon"}]}'),
  ('{"kanji":"音","meanings":["sound"],"kunyomi":["おと"],"onyomi":["おん"],"examples":[{"word":"音楽","reading":"おんがく","meaning":"music"}]}'),
  ('{"kanji":"夕","meanings":["evening"],"kunyomi":["ゆう"],"onyomi":[],"examples":[]}'),
  ('{"kanji":"方","meanings":["direction"],"kunyomi":["かた"],"onyomi":["ほう"],"examples":[{"word":"方向","reading":"ほうこう","meaning":"direction"}]}'),
  ('{"kanji":"米","meanings":["rice"],"kunyomi":["こめ"],"onyomi":["べい","まい"],"examples":[{"word":"新米","reading":"しんまい","meaning":"new rice"},{"word":"米国","reading":"べいこく","meaning":"U.S.A."}]}'),
  ('{"kanji":"竹","meanings":["bamboo"],"kunyomi":["たけ"],"onyomi":["ちく"],"examples":[{"word":"竹林","reading":"ちくりん","meaning":"bamboo bush"}]}'),
  ('{"kanji":"豆","meanings":["bean"],"kunyomi":["まめ"],"onyomi":["とう"],"examples":[{"word":"豆腐","reading":"とうふ","meaning":"tofu"}]}')
) as v(fld);

-- ─── Level 3 — Position (7) ────────────────────────────────────────
with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'kanji' and lv.name = 'Position'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id, fld::jsonb from do_seed ds
cross join (values
  ('{"kanji":"上","meanings":["top","above","on"],"kunyomi":["うえ","あがる"],"onyomi":["じょう"],"examples":[{"word":"上下","reading":"じょうげ","meaning":"up and down"}]}'),
  ('{"kanji":"中","meanings":["inside"],"kunyomi":["なか"],"onyomi":["ちゅう"],"examples":[{"word":"中学校","reading":"ちゅうがっこう","meaning":"junior high school"},{"word":"一日中","reading":"いちにちちゅう","meaning":"all day long"}]}'),
  ('{"kanji":"下","meanings":["under","below","down"],"kunyomi":["した","さがる","ください"],"onyomi":["か","げ"],"examples":[{"word":"地下鉄","reading":"ちかてつ","meaning":"subway"}]}'),
  ('{"kanji":"右","meanings":["right"],"kunyomi":["みぎ"],"onyomi":["う"],"examples":[{"word":"右折","reading":"うせつ","meaning":"right turn"}]}'),
  ('{"kanji":"左","meanings":["left"],"kunyomi":["ひだり"],"onyomi":["さ"],"examples":[{"word":"左折","reading":"させつ","meaning":"left turn"}]}'),
  ('{"kanji":"本","meanings":["book","base"],"kunyomi":["もと"],"onyomi":["ほん"],"examples":[{"word":"本","reading":"ほん","meaning":"book"}]}'),
  ('{"kanji":"頁","meanings":["page"],"kunyomi":["ページ"],"onyomi":[],"examples":[{"word":"二頁","reading":"にページ","meaning":"page 2"}]}')
) as v(fld);

-- ─── Level 4 — Appearance (8) ──────────────────────────────────────
with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'kanji' and lv.name = 'Appearance'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id, fld::jsonb from do_seed ds
cross join (values
  ('{"kanji":"大","meanings":["big","large"],"kunyomi":["おおきい"],"onyomi":["だい"],"examples":[{"word":"大学","reading":"だいがく","meaning":"university"}]}'),
  ('{"kanji":"小","meanings":["small"],"kunyomi":["ちいさい"],"onyomi":["しょう"],"examples":[{"word":"小学校","reading":"しょうがっこう","meaning":"elementary school"}]}'),
  ('{"kanji":"多","meanings":["many","a lot of"],"kunyomi":["おおい"],"onyomi":["た"],"examples":[{"word":"多少","reading":"たしょう","meaning":"a few, a little"}]}'),
  ('{"kanji":"少","meanings":["few","little"],"kunyomi":["すくない","すこし"],"onyomi":["しょう"],"examples":[{"word":"少女","reading":"しょうじょ","meaning":"girl"}]}'),
  ('{"kanji":"高","meanings":["high"],"kunyomi":["たかい"],"onyomi":["こう"],"examples":[{"word":"高校","reading":"こうこう","meaning":"high school"}]}'),
  ('{"kanji":"長","meanings":["long"],"kunyomi":["ながい"],"onyomi":["ちょう"],"examples":[{"word":"校長","reading":"こうちょう","meaning":"principal"}]}'),
  ('{"kanji":"白","meanings":["white"],"kunyomi":["しろい"],"onyomi":["はく"],"examples":[{"word":"白紙","reading":"はくし","meaning":"blank paper"}]}'),
  ('{"kanji":"青","meanings":["blue"],"kunyomi":["あおい"],"onyomi":["せい"],"examples":[{"word":"青年","reading":"せいねん","meaning":"young man and women"}]}')
) as v(fld);

-- ─── Level 5 — People & Body (17) ──────────────────────────────────
with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'kanji' and lv.name = 'People & Body'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id, fld::jsonb from do_seed ds
cross join (values
  ('{"kanji":"人","meanings":["person","people"],"kunyomi":["ひと"],"onyomi":["にん","じん"],"examples":[{"word":"日本人","reading":"にほんじん","meaning":"Japanese"},{"word":"三人","reading":"さんにん","meaning":"three people"}]}'),
  ('{"kanji":"子","meanings":["child"],"kunyomi":["こ"],"onyomi":["し"],"examples":[{"word":"女子","reading":"じょし","meaning":"girl"}]}'),
  ('{"kanji":"女","meanings":["woman"],"kunyomi":["おんな"],"onyomi":["じょ"],"examples":[{"word":"女性","reading":"じょせい","meaning":"woman"}]}'),
  ('{"kanji":"母","meanings":["mother"],"kunyomi":["はは"],"onyomi":["ぼ"],"examples":[{"word":"お母さん","reading":"おかあさん","meaning":"mother"}]}'),
  ('{"kanji":"父","meanings":["father"],"kunyomi":["ちち"],"onyomi":["ふ"],"examples":[{"word":"お父さん","reading":"おとうさん","meaning":"father"}]}'),
  ('{"kanji":"王","meanings":["king"],"kunyomi":[],"onyomi":["おう"],"examples":[]}'),
  ('{"kanji":"口","meanings":["mouth"],"kunyomi":["くち"],"onyomi":["こう"],"examples":[{"word":"人口","reading":"じんこう","meaning":"population"}]}'),
  ('{"kanji":"目","meanings":["eye"],"kunyomi":["め"],"onyomi":["もく"],"examples":[{"word":"目的","reading":"もくてき","meaning":"purpose"}]}'),
  ('{"kanji":"自","meanings":["oneself"],"kunyomi":["みずから"],"onyomi":["じ"],"examples":[{"word":"自分","reading":"じぶん","meaning":"oneself"}]}'),
  ('{"kanji":"首","meanings":["neck"],"kunyomi":["くび"],"onyomi":["しゅ"],"examples":[{"word":"首都","reading":"しゅと","meaning":"capital"}]}'),
  ('{"kanji":"耳","meanings":["ear"],"kunyomi":["みみ"],"onyomi":["じ"],"examples":[{"word":"耳鼻科","reading":"じびか","meaning":"ear, nose, throat clinic"}]}'),
  ('{"kanji":"面","meanings":["surface"],"kunyomi":["おもて"],"onyomi":["めん"],"examples":[{"word":"面白い","reading":"おもしろい","meaning":"interesting"},{"word":"面接","reading":"めんせつ","meaning":"interview"}]}'),
  ('{"kanji":"手","meanings":["hand"],"kunyomi":["て"],"onyomi":["しゅ"],"examples":[{"word":"歌手","reading":"かしゅ","meaning":"singer"}]}'),
  ('{"kanji":"又","meanings":["again"],"kunyomi":["また"],"onyomi":[],"examples":[]}'),
  ('{"kanji":"足","meanings":["foot","leg"],"kunyomi":["あし"],"onyomi":["そく"],"examples":[{"word":"一足","reading":"いっそく","meaning":"a pair of"}]}'),
  ('{"kanji":"力","meanings":["power"],"kunyomi":["ちから"],"onyomi":["りょく","りき"],"examples":[{"word":"火力","reading":"かりょく","meaning":"heating power"}]}'),
  ('{"kanji":"心","meanings":["heart"],"kunyomi":["こころ"],"onyomi":["しん"],"examples":[{"word":"中心","reading":"ちゅうしん","meaning":"center"}]}')
) as v(fld);

-- ─── Level 6 — Movement & Actions (18) ────────────────────────────
with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'kanji' and lv.name = 'Movement & Actions'
),
do_seed as (select id from lv where not exists (select 1 from cards c where c.level_id = lv.id))
insert into cards (level_id, fields)
select ds.id, fld::jsonb from do_seed ds
cross join (values
  ('{"kanji":"行","meanings":["to go"],"kunyomi":["いく"],"onyomi":["こう","ぎょう"],"examples":[{"word":"銀行","reading":"ぎんこう","meaning":"bank"},{"word":"行列","reading":"ぎょうれつ","meaning":"to wait in line"}]}'),
  ('{"kanji":"来","meanings":["to come"],"kunyomi":["くる"],"onyomi":["らい"],"examples":[{"word":"来月","reading":"らいげつ","meaning":"next month"}]}'),
  ('{"kanji":"入","meanings":["to enter","to put into"],"kunyomi":["はいる","いれる"],"onyomi":["にゅう"],"examples":[{"word":"入学","reading":"にゅうがく","meaning":"to enter a school"}]}'),
  ('{"kanji":"出","meanings":["to come out","to take out","to go out"],"kunyomi":["でる","だす"],"onyomi":["しゅつ"],"examples":[{"word":"外出","reading":"がいしゅつ","meaning":"to go out"},{"word":"出席","reading":"しゅっせき","meaning":"to attend"}]}'),
  ('{"kanji":"立","meanings":["to stand"],"kunyomi":["たつ"],"onyomi":["りつ"],"examples":[{"word":"国立","reading":"こくりつ","meaning":"national"},{"word":"立派","reading":"りっぱ","meaning":"excellent, magnificent"}]}'),
  ('{"kanji":"止","meanings":["to stop"],"kunyomi":["とまる"],"onyomi":["し"],"examples":[{"word":"中止","reading":"ちゅうし","meaning":"to cancel, to discontinue"}]}'),
  ('{"kanji":"歩","meanings":["to walk"],"kunyomi":["あるく"],"onyomi":["ほ"],"examples":[{"word":"歩道","reading":"ほどう","meaning":"side walk"}]}'),
  ('{"kanji":"回","meanings":["to turn"],"kunyomi":["まわる"],"onyomi":["かい"],"examples":[{"word":"一回","reading":"いっかい","meaning":"once"}]}'),
  ('{"kanji":"向","meanings":["to turn toward"],"kunyomi":["むく"],"onyomi":["こう"],"examples":[{"word":"方向","reading":"ほうこう","meaning":"direction"}]}'),
  ('{"kanji":"走","meanings":["to run"],"kunyomi":["はしる"],"onyomi":["そう"],"examples":[{"word":"走者","reading":"そうしゃ","meaning":"runner"}]}'),
  ('{"kanji":"食","meanings":["to eat"],"kunyomi":["たべる"],"onyomi":["しょく"],"examples":[{"word":"夕食","reading":"ゆうしょく","meaning":"dinner"}]}'),
  ('{"kanji":"言","meanings":["to say"],"kunyomi":["いう"],"onyomi":["げん","ごん"],"examples":[{"word":"言語","reading":"げんご","meaning":"language"},{"word":"伝言","reading":"でんごん","meaning":"message"}]}'),
  ('{"kanji":"書","meanings":["to write"],"kunyomi":["かく"],"onyomi":["しょ"],"examples":[{"word":"読書","reading":"どくしょ","meaning":"to read"}]}'),
  ('{"kanji":"考","meanings":["to think"],"kunyomi":["かんがえる"],"onyomi":["こう"],"examples":[{"word":"参考","reading":"さんこう","meaning":"reference"}]}'),
  ('{"kanji":"生","meanings":["to live","to have a baby"],"kunyomi":["いきる","うむ"],"onyomi":["せい"],"examples":[{"word":"先生","reading":"せんせい","meaning":"teacher"},{"word":"一生","reading":"いっしょう","meaning":"all one''s life"}]}'),
  ('{"kanji":"交","meanings":["to cross","to associate"],"kunyomi":["まじわる"],"onyomi":["こう"],"examples":[{"word":"交差点","reading":"こうさてん","meaning":"crossing, junction"}]}'),
  ('{"kanji":"示","meanings":["to show","to indicate"],"kunyomi":["しめす"],"onyomi":["じ"],"examples":[{"word":"掲示板","reading":"けいじばん","meaning":"notice board"}]}'),
  ('{"kanji":"欠","meanings":["to be missing","to be lacking"],"kunyomi":["かける"],"onyomi":["けつ"],"examples":[{"word":"欠席","reading":"けっせき","meaning":"to be absent"},{"word":"出席","reading":"しゅっせき","meaning":"attendance"}]}')
) as v(fld);

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
