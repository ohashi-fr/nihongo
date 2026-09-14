/**
 * 期末復習問題 — FULL end-of-term review quiz (L1–L6), content only.
 * Complete, faithful transcription of the printed 12-page worksheet.
 * Rendered by components/grammar/KimatsuQuiz.tsx.
 *
 * Every question has a `type`; a section groups questions and carries
 * `autoGraded` + `instructions` (+ `passage` for the reading section):
 *   fill_blank      問題1/2/3 — type the answer (hiragana). answers[i] = variants for i-th （　）.
 *   multiple_choice 問題4     — pick an option. answers[0] = correct option (verbatim).
 *   true_false      問題6     — options ["○","×"], answers[0] = correct mark.
 *   ordering        問題6-5   — answers[i] = correct letter for the i-th blank (see note for ア–カ).
 *   production      (unused)  — write from a picture; modelAnswer given (reveal, not strict match).
 *   open            問題7 / 会話練習 / 会話14 — FREE answer, no single correct response
 *                    (autoGraded:false). Self-assessed; some carry a modelAnswer for reference.
 *
 * `courseRef` = printed 課No./文法No. label. Japanese in kanji + `prompt_hiragana` for
 * the graded grammar; open items carry an English `gloss` instead.
 *
 * Answers were generated from grammar (the source sheet is blank) — verify against the
 * class key, esp. 問題2·1 (泳げるように) and 問題2·15/16 (様態 ふり vs 伝聞 ふる).
 * 問題5 (giving/receiving from pictures) was dropped — the worksheet's photos aren't
 * transcribed, so the section was untestable text-only.
 */

export type KimatsuQuestionType =
  | "fill_blank" | "multiple_choice" | "true_false" | "ordering" | "production" | "open";

export interface KimatsuQuestion {
  id: number;
  type: KimatsuQuestionType;
  courseRef?: string;
  prompt: string;
  prompt_hiragana?: string;
  gloss?: string;
  base_word?: string;
  base_word_hiragana?: string;
  options?: string[];
  options_hiragana?: string[];
  scene?: string;
  answers?: string[][];
  modelAnswer?: string;
  modelAnswer_hiragana?: string;
  note?: string;
}

export interface KimatsuSection {
  section_id: string;
  title: string;
  autoGraded: boolean;
  instructions: string;
  /** Kanji form, kept for reference. */
  passage?: string;
  /** Same passage fully in kana — what the UI actually renders (beginners
   * can't reliably read the kanji version). */
  passage_hiragana?: string;
  questions: KimatsuQuestion[];
}

export interface KimatsuQuiz {
  title: string;
  description: string;
  sections: KimatsuSection[];
}

export const kimatsuReviewQuiz: KimatsuQuiz =
{
  "title": "期末復習問題 — Full end-of-term review quiz (L1–L6)",
  "description": "Complete faithful transcription of the printed 期末復習問題 (12 pages), minus 問題5 (giving/receiving from pictures — dropped, the worksheet's photos aren't transcribed). Auto-graded: 問題1/2/3 (fill_blank), 問題4 (multiple_choice), 問題6 (true_false + ordering). Open (no single correct answer, self-assessed / free production): 問題7, 会話練習, 会話14 — flagged via autoGraded:false and their instructions. Answers were generated (source sheet blank) — verify against the class key.",
  "sections": [
    {
      "section_id": "問題1",
      "title": "助詞 — Particles",
      "autoGraded": true,
      "instructions": "助詞を書く問題です。（課No. 文法No.）",
      "questions": [
        {
          "id": 1,
          "type": "fill_blank",
          "courseRef": "L3-2, 31",
          "prompt": "将来、医者（　）なりたいです。",
          "prompt_hiragana": "しょうらい、いしゃ（　）なりたいです。",
          "answers": [["に"]]
        },
        {
          "id": 2,
          "type": "fill_blank",
          "courseRef": "L4-4, 40",
          "prompt": "一日（　）三回、薬を飲みます。",
          "prompt_hiragana": "いちにち（　）さんかい、くすりを のみます。",
          "answers": [["に"]]
        },
        {
          "id": 3,
          "type": "fill_blank",
          "courseRef": "L4-4, 41",
          "prompt": "公園で子供が遊んでいる（　）（　）見えます。",
          "prompt_hiragana": "こうえんで こどもが あそんでいる（　）（　）みえます。",
          "answers": [["の"], ["が"]]
        },
        {
          "id": 4,
          "type": "fill_blank",
          "courseRef": "L4-4, 41",
          "prompt": "昨日、タンさんが喫茶店で勉強している（　）（　）見ました。",
          "prompt_hiragana": "きのう、タンさんが きっさてんで べんきょうしている（　）（　）みました。",
          "answers": [["の"], ["を"]]
        },
        {
          "id": 5,
          "type": "fill_blank",
          "courseRef": "L5-1, 47",
          "prompt": "この料理は全部自分（　）作りました。",
          "prompt_hiragana": "この りょうりは ぜんぶ じぶん（　）つくりました。",
          "answers": [["で"]]
        },
        {
          "id": 6,
          "type": "fill_blank",
          "courseRef": "L5-2, 50",
          "prompt": "新しいカメラ（　）欲しいです。",
          "prompt_hiragana": "あたらしい カメラ（　）ほしいです。",
          "answers": [["が"]]
        },
        {
          "id": 7,
          "type": "fill_blank",
          "courseRef": "L5-2, 51①",
          "prompt": "国に帰る友達（　）プレゼント（　）あげます。",
          "prompt_hiragana": "くにに かえる ともだち（　）プレゼント（　）あげます。",
          "answers": [["に"], ["を"]]
        },
        {
          "id": 8,
          "type": "fill_blank",
          "courseRef": "L5-2, 51②",
          "prompt": "私の誕生日に、山田さん（　）ネクタイ（　）もらいました。",
          "prompt_hiragana": "わたしの たんじょうびに、やまださん（　）ネクタイ（　）もらいました。",
          "answers": [["に", "から"], ["を"]]
        },
        {
          "id": 9,
          "type": "fill_blank",
          "courseRef": "L5-3, 51③",
          "prompt": "母（　）お菓子（　）くれました。",
          "prompt_hiragana": "はは（　）おかし（　）くれました。",
          "answers": [["が"], ["を"]]
        },
        {
          "id": 10,
          "type": "fill_blank",
          "courseRef": "L5-5, 52①",
          "prompt": "日本人の友達（　）英語（　）教えてあげました。",
          "prompt_hiragana": "にほんじんの ともだち（　）えいご（　）おしえてあげました。",
          "answers": [["に"], ["を"]]
        },
        {
          "id": 11,
          "type": "fill_blank",
          "courseRef": "L5-5, 52①",
          "prompt": "祖母（　）荷物（　）持ってあげました。",
          "prompt_hiragana": "そぼ（　）にもつ（　）もってあげました。",
          "answers": [["の"], ["を"]]
        },
        {
          "id": 12,
          "type": "fill_blank",
          "courseRef": "L5-5, 52①",
          "prompt": "国の友達（　）浅草（　）連れて行ってあげました。",
          "prompt_hiragana": "くにの ともだち（　）あさくさ（　）つれていってあげました。",
          "answers": [["を"], ["へ", "に"]]
        },
        {
          "id": 13,
          "type": "fill_blank",
          "courseRef": "L5-5, 52②",
          "prompt": "母（　）国のお菓子（　）送ってもらいました。",
          "prompt_hiragana": "はは（　）くにの おかし（　）おくってもらいました。",
          "answers": [["に"], ["を"]]
        },
        {
          "id": 14,
          "type": "fill_blank",
          "courseRef": "L5-6, 52③",
          "prompt": "母（　）国のお菓子（　）送ってくれました。",
          "prompt_hiragana": "はは（　）くにの おかし（　）おくってくれました。",
          "answers": [["が"], ["を"]]
        },
        {
          "id": 15,
          "type": "fill_blank",
          "courseRef": "L5-7, 53",
          "prompt": "コピー機（　）使い方が分かりません。",
          "prompt_hiragana": "コピーき（　）つかいかたが わかりません。",
          "answers": [["の"]]
        },
        {
          "id": 16,
          "type": "fill_blank",
          "courseRef": "L6-1",
          "prompt": "去年、大学（　）卒業しました。",
          "prompt_hiragana": "きょねん、だいがく（　）そつぎょうしました。",
          "answers": [["を"]]
        },
        {
          "id": 17,
          "type": "fill_blank",
          "courseRef": "L6-1",
          "prompt": "半年前に新宿日本語学校（　）入学しました。",
          "prompt_hiragana": "はんとしまえに しんじゅく にほんごがっこう（　）にゅうがくしました。",
          "answers": [["に", "へ"]]
        },
        {
          "id": 18,
          "type": "fill_blank",
          "courseRef": "L6-4",
          "prompt": "はじめ（　）お湯を沸かしてください。",
          "prompt_hiragana": "はじめ（　）おゆを わかしてください。",
          "answers": [["に"]]
        }
      ]
    },
    {
      "section_id": "問題2",
      "title": "動詞 — Verb forms",
      "autoGraded": true,
      "instructions": "動詞を書く文法の問題です。",
      "questions": [
        {
          "id": 1,
          "type": "fill_blank",
          "courseRef": "L3-2, 31",
          "prompt": "一生懸命練習したから、（　）なりました。",
          "prompt_hiragana": "いっしょうけんめい れんしゅうしたから、（　）なりました。",
          "base_word": "泳ぎます",
          "base_word_hiragana": "およぎます",
          "answers": [["およげるように", "泳げるように"]]
        },
        {
          "id": 2,
          "type": "fill_blank",
          "courseRef": "L4-2, 38",
          "prompt": "おたばこを（　）になりますか。",
          "prompt_hiragana": "おたばこを（　）になりますか。",
          "base_word": "吸います",
          "base_word_hiragana": "すいます",
          "answers": [["おすい"]]
        },
        {
          "id": 3,
          "type": "fill_blank",
          "courseRef": "L5-7, 53",
          "prompt": "駅への（　）が分かりません。",
          "prompt_hiragana": "えきへの（　）が わかりません。",
          "base_word": "行きます",
          "base_word_hiragana": "いきます",
          "answers": [["いきかた", "行き方"]]
        },
        {
          "id": 4,
          "type": "fill_blank",
          "courseRef": "L1-3, 4",
          "prompt": "鞄がないから、田中さんはもう（　）と思います。",
          "prompt_hiragana": "かばんが ないから、たなかさんは もう（　）と おもいます。",
          "base_word": "帰ります",
          "base_word_hiragana": "かえります",
          "answers": [["かえった", "帰った"]]
        },
        {
          "id": 5,
          "type": "fill_blank",
          "courseRef": "L6-1, 55",
          "prompt": "雨が降るから今日は早く（　）と思います。",
          "prompt_hiragana": "あめが ふるから きょうは はやく（　）と おもいます。",
          "base_word": "帰ります",
          "base_word_hiragana": "かえります",
          "answers": [["かえろう", "帰ろう"]]
        },
        {
          "id": 6,
          "type": "fill_blank",
          "courseRef": "L6-2, 57",
          "prompt": "田中さんの誕生日にはCDを（　）つもりです。",
          "prompt_hiragana": "たなかさんの たんじょうびには CDを（　）つもりです。",
          "base_word": "あげます",
          "base_word_hiragana": "あげます",
          "answers": [["あげる"]]
        },
        {
          "id": 7,
          "type": "fill_blank",
          "courseRef": "L4-1, 37",
          "prompt": "日本語を上手に話したいので、毎日、（　）ことにしました。",
          "prompt_hiragana": "にほんごを じょうずに はなしたいので、まいにち、（　）ことにしました。",
          "base_word": "話します",
          "base_word_hiragana": "はなします",
          "answers": [["はなす", "話す"]]
        },
        {
          "id": 8,
          "type": "fill_blank",
          "courseRef": "L6-3, 59",
          "prompt": "仕事で、国へ（　）ことになりました。",
          "prompt_hiragana": "しごとで、くにへ（　）ことになりました。",
          "base_word": "帰ります",
          "base_word_hiragana": "かえります",
          "answers": [["かえる", "帰る"]]
        },
        {
          "id": 9,
          "type": "fill_blank",
          "courseRef": "L6-1, 56",
          "prompt": "沖縄へ（　）ら、海で泳ぎましょう。",
          "prompt_hiragana": "おきなわへ（　）ら、うみで およぎましょう。",
          "base_word": "行きます",
          "base_word_hiragana": "いきます",
          "answers": [["いった", "行った"]]
        },
        {
          "id": 10,
          "type": "fill_blank",
          "courseRef": "L6-2, 58",
          "prompt": "休みの日は（　）り、本を（　）りしています。",
          "prompt_hiragana": "やすみの ひは（　）り、ほんを（　）り しています。",
          "base_word": "散歩します・読みます",
          "base_word_hiragana": "さんぽします・よみます",
          "answers": [["さんぽした", "散歩した"], ["よんだ", "読んだ"]]
        },
        {
          "id": 11,
          "type": "fill_blank",
          "courseRef": "L6-3, 60",
          "prompt": "（B）いいえ、お風呂に（　）から食べようと思います。",
          "prompt_hiragana": "（B）いいえ、おふろに（　）から たべようと おもいます。",
          "base_word": "入ります",
          "base_word_hiragana": "はいります",
          "answers": [["はいって", "入って"]]
        },
        {
          "id": 12,
          "type": "fill_blank",
          "courseRef": "L6-4, 61",
          "prompt": "田中さんが来たら（　）始めましょう。",
          "prompt_hiragana": "たなかさんが きたら（　）はじめましょう。",
          "base_word": "食べます",
          "base_word_hiragana": "たべます",
          "answers": [["たべ", "食べ"]]
        },
        {
          "id": 13,
          "type": "fill_blank",
          "courseRef": "L2-4, 19",
          "prompt": "漢字を（　）ことができますか。",
          "prompt_hiragana": "かんじを（　）ことが できますか。",
          "base_word": "読みます",
          "base_word_hiragana": "よみます",
          "answers": [["よむ", "読む"]]
        },
        {
          "id": 14,
          "type": "fill_blank",
          "courseRef": "L3-3, 33",
          "prompt": "玉ねぎを（　）と、涙がでます。",
          "prompt_hiragana": "たまねぎを（　）と、なみだが でます。",
          "base_word": "切ります",
          "base_word_hiragana": "きります",
          "answers": [["きる", "切る"]]
        },
        {
          "id": 15,
          "type": "fill_blank",
          "courseRef": "L3-4, 34",
          "prompt": "空が暗いですね。雨が（　）そうです。",
          "prompt_hiragana": "そらが くらいですね。あめが（　）そうです。",
          "base_word": "降ります",
          "base_word_hiragana": "ふります",
          "answers": [["ふり", "降り"]]
        },
        {
          "id": 16,
          "type": "fill_blank",
          "courseRef": "基礎クラス",
          "prompt": "母に聞きました。あした雨が（　）そうです。",
          "prompt_hiragana": "ははに ききました。あした あめが（　）そうです。",
          "base_word": "降ります",
          "base_word_hiragana": "ふります",
          "answers": [["ふる", "降る"]]
        }
      ]
    },
    {
      "section_id": "問題3",
      "title": "形容詞・な形容詞・名詞 — Adjectives & nouns",
      "autoGraded": true,
      "instructions": "形容詞、な形容詞、名詞を書く文法の問題です。",
      "questions": [
        {
          "id": 1,
          "type": "fill_blank",
          "courseRef": "L3-2, 32",
          "prompt": "将来は（　）なりたいです。",
          "prompt_hiragana": "しょうらいは（　）なりたいです。",
          "base_word": "医者です",
          "base_word_hiragana": "いしゃです",
          "answers": [["いしゃに", "医者に"]]
        },
        {
          "id": 2,
          "type": "fill_blank",
          "courseRef": "L3-2, 32",
          "prompt": "冬になると（　）なります。",
          "prompt_hiragana": "ふゆになると（　）なります。",
          "base_word": "寒いです",
          "base_word_hiragana": "さむいです",
          "answers": [["さむく", "寒く"]]
        },
        {
          "id": 3,
          "type": "fill_blank",
          "courseRef": "L3-2, 32",
          "prompt": "私の町は子供の時より今の方が（　）なりました。",
          "prompt_hiragana": "わたしの まちは こどもの ときより いまの ほうが（　）なりました。",
          "base_word": "便利です",
          "base_word_hiragana": "べんりです",
          "answers": [["べんりに", "便利に"]]
        },
        {
          "id": 4,
          "type": "fill_blank",
          "courseRef": "L4-1, 36",
          "prompt": "電子レンジでスープを（　）します。",
          "prompt_hiragana": "でんしレンジで スープを（　）します。",
          "base_word": "熱いです",
          "base_word_hiragana": "あついです",
          "answers": [["あつく", "熱く"]]
        },
        {
          "id": 5,
          "type": "fill_blank",
          "courseRef": "L4-1, 36",
          "prompt": "みなさん、うるさいですよ。（　）してください。",
          "prompt_hiragana": "みなさん、うるさいですよ。（　）してください。",
          "base_word": "静かです",
          "base_word_hiragana": "しずかです",
          "answers": [["しずかに", "静かに"]]
        },
        {
          "id": 6,
          "type": "fill_blank",
          "courseRef": "基礎クラス",
          "prompt": "昨日は（　）から、パーティーへ行けませんでした。",
          "prompt_hiragana": "きのうは（　）から、パーティーへ いけませんでした。",
          "base_word": "風邪です",
          "base_word_hiragana": "かぜです",
          "answers": [["かぜだった", "風邪だった"]]
        },
        {
          "id": 7,
          "type": "fill_blank",
          "courseRef": "L3-4, 35",
          "prompt": "佐藤さんは（　）漫画を読んでいます。",
          "prompt_hiragana": "さとうさんは（　）まんがを よんでいます。",
          "base_word": "おもしろいです+そうです",
          "base_word_hiragana": "おもしろいです+そうです",
          "answers": [["おもしろそうな", "面白そうな"]]
        },
        {
          "id": 8,
          "type": "fill_blank",
          "courseRef": "L2-2, 13",
          "prompt": "先生：みなさん、先生と（　）書いてください。",
          "prompt_hiragana": "せんせい：みなさん、せんせいと（　）かいてください。",
          "base_word": "同じです",
          "base_word_hiragana": "おなじです",
          "answers": [["おなじように", "同じように"]]
        },
        {
          "id": 9,
          "type": "fill_blank",
          "courseRef": "L2-1, 12",
          "prompt": "吉田さんは、（　）仕事をしています。",
          "prompt_hiragana": "よしださんは、（　）しごとを しています。",
          "base_word": "危険です+むずかしいです",
          "base_word_hiragana": "きけんです+むずかしいです",
          "answers": [["きけんでむずかしい", "危険でむずかしい"]]
        },
        {
          "id": 10,
          "type": "fill_blank",
          "courseRef": "L2-1, 12",
          "prompt": "マリさんは（　）人です。",
          "prompt_hiragana": "マリさんは（　）ひとです。",
          "base_word": "明るいです+元気です",
          "base_word_hiragana": "あかるいです+げんきです",
          "answers": [["あかるくてげんきな", "明るくて元気な"]]
        }
      ]
    },
    {
      "section_id": "問題4",
      "title": "合っているものを選ぶ — Choose the correct form",
      "autoGraded": true,
      "instructions": "合っているものを選ぶ問題です。",
      "questions": [
        {
          "id": 1,
          "type": "multiple_choice",
          "courseRef": "L2-4, 19",
          "prompt": "英語を（　）ことができますか。",
          "prompt_hiragana": "えいごを（　）ことが できますか。",
          "options": ["話す", "話して", "話せる", "話せて"],
          "options_hiragana": ["はなす", "はなして", "はなせる", "はなせて"],
          "answers": [["話す"]]
        },
        {
          "id": 2,
          "type": "multiple_choice",
          "courseRef": "L5-7, 54",
          "prompt": "マリ：田中さん、私の結婚パーティーでスピーチ（　）。",
          "prompt_hiragana": "マリ：たなかさん、わたしの けっこんパーティーで スピーチ（　）。",
          "options": ["してもいいですか", "してもらえませんか", "してもらいませんか", "しませんか"],
          "answers": [["してもらえませんか"]]
        },
        {
          "id": 3,
          "type": "multiple_choice",
          "courseRef": "L4-4, 41",
          "prompt": "公園で子供が遊んでいる（　）見えます。",
          "prompt_hiragana": "こうえんで こどもが あそんでいる（　）みえます。",
          "options": ["ので", "のが", "のを", "の"],
          "answers": [["のが"]]
        },
        {
          "id": 4,
          "type": "multiple_choice",
          "courseRef": "L4-1, 37",
          "prompt": "家族に会いたいから、今度の休みは帰国（　）。",
          "prompt_hiragana": "かぞくに あいたいから、こんどの やすみは きこく（　）。",
          "options": ["することをしました", "することになりました", "することです", "することにしました"],
          "answers": [["することにしました"]]
        },
        {
          "id": 5,
          "type": "multiple_choice",
          "courseRef": "L6-3, 59",
          "prompt": "皆さん、聞いてください。先生に花を（　）。",
          "prompt_hiragana": "みなさん、きいてください。せんせいに はなを（　）。",
          "options": ["さしあげることをしました", "さしあげることになりました", "さしあげることです", "さしあげることにしました"],
          "answers": [["さしあげることになりました"]]
        },
        {
          "id": 6,
          "type": "multiple_choice",
          "courseRef": "L6-4 料理の動詞",
          "prompt": "フライパンで肉と野菜を（　）。",
          "prompt_hiragana": "フライパンで にくと やさいを（　）。",
          "options": ["沸かしします", "炊きます", "切ります", "炒めます"],
          "options_hiragana": ["わかしします", "たきます", "きります", "いためます"],
          "answers": [["炒めます"]]
        },
        {
          "id": 7,
          "type": "multiple_choice",
          "courseRef": "L4-7, 46",
          "prompt": "あした、だれが行く（　）教えてください。",
          "prompt_hiragana": "あした、だれが いく（　）おしえてください。",
          "options": ["のか", "かどうか", "のが", "のを"],
          "answers": [["のか"]]
        },
        {
          "id": 8,
          "type": "multiple_choice",
          "courseRef": "L4-7, 45",
          "prompt": "あした晴れる（　）わかりません。",
          "prompt_hiragana": "あした はれる（　）わかりません。",
          "options": ["のが", "かどうか", "ことを", "とか"],
          "answers": [["かどうか"]]
        },
        {
          "id": 9,
          "type": "multiple_choice",
          "courseRef": "L5-5表現",
          "prompt": "この漢字は難しいので、どうしても（　）。",
          "prompt_hiragana": "この かんじは むずかしいので、どうしても（　）。",
          "options": ["おぼえられません", "おぼえました", "おぼえられます", "おぼえません"],
          "answers": [["おぼえられません"]]
        },
        {
          "id": 10,
          "type": "multiple_choice",
          "courseRef": "L2-2 着脱動詞・L2-4, 18",
          "prompt": "あの赤いマフラーを（　）人がマリさんです。",
          "prompt_hiragana": "あの あかい マフラーを（　）ひとが マリさんです。",
          "options": ["かぶっている", "はいている", "きている", "まいている"],
          "answers": [["まいている"]],
          "note": "マフラー＝scarf → 巻く（まく）→ まいている。"
        },
        {
          "id": 11,
          "type": "multiple_choice",
          "courseRef": "L2-2 着脱動詞",
          "prompt": "今日は、母にもらった腕時計を（　）。",
          "prompt_hiragana": "きょうは、ははに もらった うでどけいを（　）。",
          "options": ["きています", "はめています", "かぶっています", "しめています"],
          "answers": [["はめています"]],
          "note": "腕時計・指輪 → はめる。ネクタイ・ベルト → しめる。"
        },
        {
          "id": 12,
          "type": "multiple_choice",
          "courseRef": "L5-6表現",
          "prompt": "中村：マリさん、この漢字が読めないんですけど・・・ マリ：私も読めないから、田中さんに（　）。",
          "prompt_hiragana": "なかむら：マリさん、この かんじが よめないんですけど・・・ マリ：わたしも よめないから、たなかさんに（　）。",
          "options": ["読んでください", "読んでもらってください", "読んであげます", "読んであげてください"],
          "answers": [["読んでもらってください"]]
        }
      ]
    },
    {
      "section_id": "問題6",
      "title": "読解 — Reading comprehension",
      "autoGraded": true,
      "instructions": "文を読んで答える問題です。〇×と並べ替えは正解あり。",
      "passage": "おいしい焼きそばの作り方を紹介します。材料は麺、豚肉、玉ねぎ、にんじんです。まず、材料を全部切ります。それから、フライパンに油を入れます。油が熱くなってから、肉と野菜を入れて炒めます。そして、麺を入れて一緒に炒めます。麺を入れてから少しだけ水をかけると、麺が柔らかくなります。最後に、ソースを入れて炒めたら、できあがりです。とても簡単なので、作ってみてください。（麺＝noodle）",
      "passage_hiragana": "おいしい やきそばの つくりかたを しょうかいします。ざいりょうは めん、ぶたにく、たまねぎ、にんじんです。まず、ざいりょうを ぜんぶ きります。それから、フライパンに あぶらを いれます。あぶらが あつくなってから、にくと やさいを いれて いためます。そして、めんを いれて いっしょに いためます。めんを いれてから すこしだけ みずを かけると、めんが やわらかくなります。さいごに、ソースを いれて いためたら、できあがりです。とても かんたんなので、つくってみてください。（めん＝noodle）",
      "questions": [
        {
          "id": 1,
          "type": "true_false",
          "prompt": "材料は、麺と肉と野菜です。",
          "prompt_hiragana": "ざいりょうは、めんと にくと やさいです。",
          "options": ["○", "×"],
          "answers": [["○"]]
        },
        {
          "id": 2,
          "type": "true_false",
          "prompt": "焼きそばは深い鍋で作ります。",
          "prompt_hiragana": "やきそばは ふかい なべで つくります。",
          "options": ["○", "×"],
          "answers": [["×"]],
          "note": "本文はフライパン。"
        },
        {
          "id": 3,
          "type": "true_false",
          "prompt": "麺を炒める時、水を入れると麺が固くなくなります。",
          "prompt_hiragana": "めんを いためる とき、みずを いれると めんが かたく なくなります。",
          "options": ["○", "×"],
          "answers": [["○"]],
          "note": "水をかけると麺が柔らかくなる＝固くなくなる。"
        },
        {
          "id": 4,
          "type": "true_false",
          "prompt": "焼きそばは料理が上手な人しか作れません。",
          "prompt_hiragana": "やきそばは りょうりが じょうずな ひとしか つくれません。",
          "options": ["○", "×"],
          "answers": [["×"]],
          "note": "本文「とても簡単なので、作ってみてください」。"
        },
        {
          "id": 5,
          "type": "ordering",
          "prompt": "作る順番に並べ替えてください。 （ウ）→（　）→（　）→（　）→（オ）",
          "answers": [["エ"], ["カ"], ["ア"]],
          "note": "ア=ソースを入れる／イ=材料を切る／ウ=肉と野菜を炒める／エ=麺を入れる／オ=できあがり／カ=水を入れる。 正解: ウ→エ→カ→ア→オ（イ は最初の下準備なので、この並びには入らない＝ダミー）。"
        }
      ]
    },
    {
      "section_id": "問題7",
      "title": "質問に答える — Answer the questions",
      "autoGraded": false,
      "instructions": "réponse libre — pas de bonne réponse unique. Chaque élève répond avec ses propres informations (auto-évaluation / production libre).",
      "questions": [
        { "id": 1, "type": "open", "prompt": "どうして日本語を勉強していますか。", "gloss": "Why are you studying Japanese?" },
        { "id": 2, "type": "open", "prompt": "一日に何時間ぐらい勉強しますか。", "gloss": "About how many hours a day do you study?" },
        { "id": 3, "type": "open", "prompt": "友達に日本のお土産をあげます。何をあげますか。", "gloss": "You'll give a friend a Japanese souvenir. What will you give?" },
        { "id": 4, "type": "open", "prompt": "来年の誕生日に何がほしいですか。", "gloss": "What do you want for your birthday next year?" },
        { "id": 5, "type": "open", "prompt": "去年の誕生日に何をもらいましたか。", "gloss": "What did you get for your birthday last year?" },
        { "id": 6, "type": "open", "prompt": "暇な時、何をするのが好きですか。", "gloss": "What do you like doing in your free time?" },
        { "id": 7, "type": "open", "prompt": "日本語学校を卒業したら、どうしますか。", "gloss": "What will you do after graduating from language school?" },
        { "id": 8, "type": "open", "prompt": "テストが終わったら、何をしようと思っていますか。", "gloss": "What are you thinking of doing after the test?" }
      ]
    },
    {
      "section_id": "会話練習",
      "title": "会話練習 — Speaking practice",
      "autoGraded": false,
      "instructions": "réponse libre (oral) — pas de bonne réponse unique. Amorces de conversation à pratiquer, l'élève répond librement.",
      "questions": [
        { "id": 1, "type": "open", "prompt": "〜人で：一人で住んでいますか。何人で住んでいますか。いつも一人でご飯を食べますか。それとも友達と一緒に食べますか。", "gloss": "Living alone / with how many / eating alone or with friends." },
        { "id": 2, "type": "open", "prompt": "趣味：何をするのが好きですか。趣味は何ですか。どのぐらいしますか。（一週間に一回、一日に何時間など）いつ始めましたか。誰としますか。", "gloss": "Hobbies: what, how often, when started, with whom." },
        { "id": 3, "type": "open", "prompt": "疑問詞＋か：何かスポーツをしますか。何をしますか。週末どこか行きましたか。どこへ行きましたか。今朝何か食べましたか。何を食べましたか。", "gloss": "Question word + か: any sport / went anywhere / ate anything." },
        { "id": 4, "type": "open", "prompt": "〜たり、〜たり：土日はいつも何をしていますか。", "gloss": "〜たり〜たり: what do you usually do on weekends?" },
        { "id": 5, "type": "open", "prompt": "料理：お国のおすすめの料理は何ですか。何という料理ですか。材料は何ですか。", "gloss": "Food: recommended dish from your country, its name, ingredients." },
        { "id": 6, "type": "open", "prompt": "性格：ご両親（ご兄弟）はどんな方ですか。どんな性格ですか。", "gloss": "Personality: what are your parents/siblings like?" },
        { "id": 7, "type": "open", "prompt": "今、何か欲しいものがありますか。", "gloss": "Is there anything you want right now?" },
        { "id": 8, "type": "open", "prompt": "去年の誕生日に何をもらいましたか。", "gloss": "What did you get last birthday?" },
        { "id": 9, "type": "open", "prompt": "友達の誕生日に何をあげますか。", "gloss": "What do you give a friend for their birthday?" },
        { "id": 10, "type": "open", "prompt": "〜てあげる：友達が病気です。何をしてあげますか。国の友達が日本へ来ます。何をしてあげますか。", "gloss": "〜てあげる: friend is sick / friend visits Japan — what will you do for them?" },
        { "id": 11, "type": "open", "prompt": "休みになったら、何をしようと思っていますか。会話試験が終わったら、何をするつもりですか。SNGを卒業したら、何をするつもりですか。", "gloss": "When the break/exam/graduation comes, what do you plan to do?" },
        { "id": 12, "type": "open", "prompt": "レストランで何にしますか。（カレー、ラーメン、からあげ、おさしみ・・・ ビール、ハイボール、ジュース、おちゃ・・・）", "gloss": "At a restaurant, what will you have?" },
        { "id": 13, "type": "open", "prompt": "友達と〜へ行きたいです。友達を〜に誘ってください。（映画、コンサート、美術館、買い物、新宿、カラオケなど）", "gloss": "Invite a friend somewhere (movie, concert, museum, shopping, karaoke…)." }
      ]
    },
    {
      "section_id": "会話14",
      "title": "会話を覚えて話す — Memorise & perform",
      "autoGraded": false,
      "instructions": "réponse libre — mémoriser le dialogue modèle puis le rejouer avec ses propres infos. modelAnswer = le dialogue de référence.",
      "questions": [
        {
          "id": 1,
          "type": "open",
          "prompt": "会話を覚えて、自分の趣味に合わせて話してください。",
          "gloss": "Memorise the model dialogue, then perform it with your own hobby.",
          "modelAnswer": "田中：マリさん、マリさんの趣味は何ですか。／ マリ：趣味ですか。そうですね。テニスです。／ 田中：え、テニスですか。／ マリ：ええ、先月から始めたんです。一週間に2回テニスをしています。田中さんの趣味は。／ 田中：私は映画を見るのが好きです。／ マリ：どんな映画ですか。／ 田中：ホラー映画です。今度、一緒に見ませんか。／ マリ：・・・いいですね。",
          "note": "Modèle à réutiliser en remplaçant テニス／先月から／一週間に2回 par les vraies infos de l'élève."
        }
      ]
    }
  ]
};

export const totalKimatsuQuestionCount: number = kimatsuReviewQuiz.sections.reduce(
  (n, sec) => n + sec.questions.length,
  0
);
