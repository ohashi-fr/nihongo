-- =========================================================
-- Nihongo — fix kun'yomi okurigana notation
-- For 38 kanji, replace the kunyomi array with the dictionary
-- form `<reading>.<okurigana>` (dot = separator).
-- Idempotent: re-running just re-sets the same values.
-- =========================================================

with fixes(kanji_char, new_kun) as (
  values
    -- Numbers (9)
    ('一', '["ひと.つ"]'::jsonb),
    ('二', '["ふた.つ"]'::jsonb),
    ('三', '["みっ.つ"]'::jsonb),
    ('四', '["よっ.つ"]'::jsonb),
    ('五', '["いつ.つ"]'::jsonb),
    ('六', '["むっ.つ"]'::jsonb),
    ('七', '["なな.つ"]'::jsonb),
    ('八', '["やっ.つ"]'::jsonb),
    ('九', '["ここの.つ"]'::jsonb),

    -- Position (2)
    ('上', '["うえ","あ.がる"]'::jsonb),
    ('下', '["した","さ.がる","くだ.さい"]'::jsonb),

    -- Appearance (8)
    ('大', '["おお.きい"]'::jsonb),
    ('小', '["ちい.さい"]'::jsonb),
    ('多', '["おお.い"]'::jsonb),
    ('少', '["すく.ない","すこ.し"]'::jsonb),
    ('高', '["たか.い"]'::jsonb),
    ('長', '["なが.い"]'::jsonb),
    ('白', '["しろ.い"]'::jsonb),
    ('青', '["あお.い"]'::jsonb),

    -- People & Body (1)
    ('自', '["みずか.ら"]'::jsonb),

    -- Movement & Actions (18)
    ('行', '["い.く"]'::jsonb),
    ('来', '["く.る"]'::jsonb),
    ('入', '["はい.る","い.れる"]'::jsonb),
    ('出', '["で.る","だ.す"]'::jsonb),
    ('立', '["た.つ"]'::jsonb),
    ('止', '["と.まる"]'::jsonb),
    ('歩', '["ある.く"]'::jsonb),
    ('回', '["まわ.る"]'::jsonb),
    ('向', '["む.く"]'::jsonb),
    ('走', '["はし.る"]'::jsonb),
    ('食', '["た.べる"]'::jsonb),
    ('言', '["い.う"]'::jsonb),
    ('書', '["か.く"]'::jsonb),
    ('考', '["かんが.える"]'::jsonb),
    ('生', '["い.きる","う.む"]'::jsonb),
    ('交', '["まじ.わる"]'::jsonb),
    ('示', '["しめ.す"]'::jsonb),
    ('欠', '["か.ける"]'::jsonb)
)
update cards c
set fields = jsonb_set(c.fields, '{kunyomi}', f.new_kun)
from fixes f, module_levels lv, modules m
where c.level_id = lv.id
  and lv.module_id = m.id
  and m.slug = 'kanji'
  and c.fields->>'kanji' = f.kanji_char;

-- Sanity check
select c.fields->>'kanji' as kanji,
       c.fields->'kunyomi' as kunyomi,
       lv.name as level
from cards c
join module_levels lv on lv.id = c.level_id
join modules m on m.id = lv.module_id
where m.slug = 'kanji'
  and c.fields->'kunyomi' @> '[]'::jsonb
  and jsonb_array_length(c.fields->'kunyomi') > 0
order by lv.order_index, c.fields->>'kanji';
