-- =========================================================
-- Nihongo — seed data
-- Idempotent: safe to re-run. Inserts the "Vocabulary" module
-- with one level "Level 1" and the starter card set.
-- =========================================================

-- 1) Module
insert into modules (name, slug, description, type)
values (
  'Vocabulary',
  'vocabulary',
  'Common Japanese words — beginner.',
  'quiz'
)
on conflict (slug) do nothing;

-- 2) Level
with m as (select id from modules where slug = 'vocabulary')
insert into module_levels (module_id, name, order_index, script)
select m.id, 'Level 1', 1, 'both' from m
where not exists (
  select 1 from module_levels lv
  where lv.module_id = (select id from m) and lv.name = 'Level 1'
);

-- 3) Cards — only insert if the level is currently empty.
with lv as (
  select lv.id from module_levels lv
  join modules m on m.id = lv.module_id
  where m.slug = 'vocabulary' and lv.name = 'Level 1'
),
do_seed as (
  select id from lv where not exists (select 1 from cards c where c.level_id = lv.id)
)
insert into cards (level_id, fields)
select ds.id, jsonb_build_object('english', e, 'japanese', j)
from do_seed ds
cross join (values
  ('rain','あめ'),
  ('good','いい'),
  ('house','いえ'),
  ('to go (polite)','いきます'),
  ('pencil','えんぴつ'),
  ('big','おおきい'),
  ('sushi','おすし'),
  ('green tea','おちゃ'),
  ('company / office','かいしゃ'),
  ('umbrella','かさ'),
  ('school','がっこう'),
  ('milk','ぎゅうにゅう'),
  ('today','きょう'),
  ('pretty / clean','きれい'),
  ('socks','くつした'),
  ('newspaper','しんぶん'),
  ('expensive / tall','たかい'),
  ('map','ちず'),
  ('Japan','にほん'),
  ('to drink (polite)','のみます'),
  ('water','みず'),
  ('vegetables','やさい'),
  ('night','よる'),
  ('apple','りんご'),
  ('yesterday','きのう'),
  ('café / coffee shop','きっさてん'),
  ('hospital','びょういん'),
  ('airport','くうこう'),
  ('black tea','こうちゃ'),
  ('delicious','おいしい'),
  ('difficult','むずかしい'),
  ('sunny (weather)','はれ'),
  ('cloudy (weather)','くもり'),
  ('siblings','きょうだい'),
  ('birthday','たんじょうび'),
  ('watch / clock','とけい'),
  ('electricity / light','でんき'),
  ('photo','しゃしん'),
  ('chopsticks / bridge','はし'),
  ('scissors','はさみ'),
  ('part-time job','アルバイト'),
  ('internet','インターネット'),
  ('can (metal)','カン'),
  ('coffee','コーヒー'),
  ('juice','ジュース'),
  ('cheese','チーズ'),
  ('test / exam','テスト'),
  ('door','ドア'),
  ('notebook','ノート'),
  ('bread','パン'),
  ('pizza','ピザ'),
  ('fork','フォーク'),
  ('plastic bottle','ペットボトル'),
  ('ramen','ラーメン'),
  ('class','クラス'),
  ('supermarket','スーパー'),
  ('nickname','ニックネーム'),
  ('convenience store','コンビニ'),
  ('restaurant','レストラン'),
  ('café','カフェ'),
  ('toilet / restroom','トイレ'),
  ('building','ビル'),
  ('beer','ビール'),
  ('shirt','シャツ'),
  ('pen','ペン'),
  ('smartphone','スマートフォン'),
  ('mechanical pencil','シャーペン'),
  ('air conditioner','エアコン'),
  ('calendar','カレンダー'),
  ('whiteboard','ホワイトボード'),
  ('television','テレビ'),
  ('spoon','スプーン'),
  ('cup / glass','コップ'),
  ('knife','ナイフ')
) as v(e, j);
