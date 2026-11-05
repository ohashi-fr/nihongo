/**
 * 文法12–26 — Quiz for the "Beginner 2" tab (grammar-beginner1-part2.ts module).
 *
 * Built from the course worksheets (新宿日本語学校 文法ノート exercises) so every
 * blank tests one of the 15 notions in that module (文法12–26) and nothing else:
 * the answers only use grammar you're expected to know by that point.
 *
 * Coverage (one courseRef per 文法 notion, lookup via getNotionByCourseNumberBeginner1B):
 *   文法12 時数詞+中(じゅう) · 文法13 ば · 文法14 する名詞+中(ちゅう) · 文法15 だけでなく〜も
 *   文法16 こともある · 文法17 〜し〜し〜から · 文法18 やすい/にくい · 文法19 すぎる
 *   文法20 と · 文法21 ところ · 文法22 理由の〜て · 文法23 よう · 文法24 みたい
 *   文法25 ても · 文法26 疑問詞+ても
 * (文法27 らしい is intentionally left out — it isn't in the module yet.)
 *
 * Same format/renderer as beginner1-particles-quiz.ts (fill_blank, Kimatsu types).
 * section_id uses 文法 numbers, not 問題N: KimatsuQuiz.tsx maps 問題1–4 to
 * its own "Particles / Verb forms / …" labels, which would mislabel these.
 * prompt = kanji with （　）; prompt_hiragana = kana (what the UI renders);
 * answers[i] = accepted variants for the i-th （　）.
 */

import type { KimatsuQuiz } from "./kimatsu-quiz";

export const beginner1Part2Quiz: KimatsuQuiz = {
  title: "文法12–26 まとめ — Beginner 2 (課2後半・課3)",
  description:
    "Révision du module 文法12–26 (le nouvel onglet « Beginner 2 »). Phrases tirées des feuilles du cours ; chaque trou teste une notion de 文法12 à 文法26. Même format que le quiz de particules (fill_blank).",
  sections: [
    // ── 問題1 ─ 〜中（じゅう／ちゅう）: 文法12 / 文法14 ──────────────────
    {
      section_id: "文法12・14",
      title: "〜中 — じゅう or ちゅう?",
      autoGraded: true,
      instructions: "（　）に「じゅう」か「ちゅう」を書いてください。",
      questions: [
        {
          id: 1,
          type: "fill_blank",
          courseRef: "文法14",
          prompt: "今、旅行（　）です。",
          prompt_hiragana: "いま、りょこう（　）です。",
          answers: [["ちゅう"]],
        },
        {
          id: 2,
          type: "fill_blank",
          courseRef: "文法12",
          prompt: "昨日は一日（　）、ずっと雨が降っていました。",
          prompt_hiragana: "きのうは いちにち（　）、ずっと あめが ふっていました。",
          answers: [["じゅう"]],
        },
        {
          id: 3,
          type: "fill_blank",
          courseRef: "文法12",
          prompt: "あの山の上には一年（　）、雪があります。",
          prompt_hiragana: "あの やまの うえには いちねん（　）、ゆきが あります。",
          answers: [["じゅう"]],
        },
        {
          id: 4,
          type: "fill_blank",
          courseRef: "文法14",
          prompt: "この道は工事（　）だから、通れません。",
          prompt_hiragana: "この みちは こうじ（　）だから、とおれません。",
          answers: [["ちゅう"]],
        },
      ],
    },

    // ── 問題2 ─ じょうけん「ば・と・ても」: 文法13 / 20 / 25 / 26 ─────────
    {
      section_id: "文法13・20・25・26",
      title: "じょうけん — ば / と / ても",
      autoGraded: true,
      instructions: "「Use」のことばを 正しい形にして、（　）に書いてください。",
      questions: [
        {
          id: 5,
          type: "fill_blank",
          courseRef: "文法13",
          prompt: "薬を（　）、早くかぜが治ります。",
          prompt_hiragana: "くすりを（　）、はやく かぜが なおります。",
          base_word: "のむ",
          base_word_hiragana: "のむ",
          answers: [["のめば"]],
          note: "ばけい。",
        },
        {
          id: 6,
          type: "fill_blank",
          courseRef: "文法13",
          prompt: "たくさん漢字を（　）、覚えられます。",
          prompt_hiragana: "たくさん かんじを（　）、おぼえられます。",
          base_word: "かく",
          base_word_hiragana: "かく",
          answers: [["かけば"]],
          note: "ばけい。",
        },
        {
          id: 7,
          type: "fill_blank",
          courseRef: "文法20",
          prompt: "そのスイッチを（　）、電源が入ります。",
          prompt_hiragana: "その スイッチを（　）、でんげんが はいります。",
          base_word: "おす",
          base_word_hiragana: "おす",
          answers: [["おすと"]],
          note: "と（しぜんな けっか）。",
        },
        {
          id: 8,
          type: "fill_blank",
          courseRef: "文法20",
          prompt: "日本では20歳に（　）、お酒が飲めません。",
          prompt_hiragana: "にほんでは はたちに（　）、おさけが のめません。",
          base_word: "なる",
          base_word_hiragana: "なる",
          answers: [["ならないと"]],
          note: "ひていけい＋と。",
        },
        {
          id: 9,
          type: "fill_blank",
          courseRef: "文法25",
          prompt: "明日、雨が（　）、試合はします。",
          prompt_hiragana: "あした、あめが（　）、しあいは します。",
          base_word: "ふる",
          base_word_hiragana: "ふる",
          answers: [["ふっても"]],
          note: "ても（even if）。",
        },
        {
          id: 10,
          type: "fill_blank",
          courseRef: "文法25",
          prompt: "このかばんは（　）、買いたいんです。",
          prompt_hiragana: "この かばんは（　）、かいたいんです。",
          base_word: "たかい",
          base_word_hiragana: "たかい",
          answers: [["たかくても"]],
          note: "いけいようし＋ても。",
        },
        {
          id: 11,
          type: "fill_blank",
          courseRef: "文法26",
          prompt: "京都はどこへ（　）、お寺があります。",
          prompt_hiragana: "きょうとは どこへ（　）、おてらが あります。",
          base_word: "いく",
          base_word_hiragana: "いく",
          answers: [["いっても"]],
          note: "ぎもんし（どこ）＋ても。",
        },
        {
          id: 12,
          type: "fill_blank",
          courseRef: "文法26",
          prompt: "大阪では何を（　）、おいしいです。",
          prompt_hiragana: "おおさかでは なにを（　）、おいしいです。",
          base_word: "たべる",
          base_word_hiragana: "たべる",
          answers: [["たべても"]],
          note: "ぎもんし（なに）＋ても。",
        },
      ],
    },

    // ── 問題3 ─ 〜やすい／にくい・すぎる・ところ: 文法18 / 19 / 21 ────────
    {
      section_id: "文法18・19・21",
      title: "〜やすい／にくい・すぎる・ところ",
      autoGraded: true,
      instructions: "「Use」のことばを 正しい形にして、（　）に書いてください。",
      questions: [
        {
          id: 13,
          type: "fill_blank",
          courseRef: "文法18",
          prompt: "このペンは（　）です。",
          prompt_hiragana: "この ペンは（　）です。",
          base_word: "かく",
          base_word_hiragana: "かく",
          answers: [["かきやすい"]],
          note: "ますけい＋やすい。",
        },
        {
          id: 14,
          type: "fill_blank",
          courseRef: "文法18",
          prompt: "このカタカナは（　）です。",
          prompt_hiragana: "この カタカナは（　）です。",
          base_word: "よむ",
          base_word_hiragana: "よむ",
          answers: [["よみにくい"]],
          note: "ますけい＋にくい。",
        },
        {
          id: 15,
          type: "fill_blank",
          courseRef: "文法19",
          prompt: "コーヒーを（　）、寝られませんでした。",
          prompt_hiragana: "コーヒーを（　）、ねられませんでした。",
          base_word: "のむ",
          base_word_hiragana: "のむ",
          answers: [["のみすぎて"]],
          note: "ますけい＋すぎる。",
        },
        {
          id: 16,
          type: "fill_blank",
          courseRef: "文法19",
          prompt: "この料理は（　）、食べられません。",
          prompt_hiragana: "この りょうりは（　）、たべられません。",
          base_word: "からい",
          base_word_hiragana: "からい",
          answers: [["からすぎて"]],
          note: "いけいようし（い をとる）＋すぎる。",
        },
        {
          id: 17,
          type: "fill_blank",
          courseRef: "文法19",
          prompt: "たばこの（　）は、体に悪いですよ。",
          prompt_hiragana: "たばこの（　）は、からだに わるいですよ。",
          base_word: "すう",
          base_word_hiragana: "すう",
          answers: [["すいすぎ"]],
          note: "めいしにする：ますけい＋すぎ。",
        },
        {
          id: 18,
          type: "fill_blank",
          courseRef: "文法21",
          prompt: "「もうお昼を食べましたか。」「いいえ、今から（　）ところです。」",
          prompt_hiragana: "「もう おひるを たべましたか。」「いいえ、いまから（　）ところです。」",
          base_word: "たべる",
          base_word_hiragana: "たべる",
          answers: [["たべる"]],
          note: "じしょけい＋ところ＝これから する。",
        },
        {
          id: 19,
          type: "fill_blank",
          courseRef: "文法21",
          prompt: "「遅れてごめん。」「大丈夫、僕も今（　）ところだよ。」",
          prompt_hiragana: "「おくれて ごめん。」「だいじょうぶ、ぼくも いま（　）ところだよ。」",
          base_word: "くる",
          base_word_hiragana: "くる",
          answers: [["きた"]],
          note: "たけい＋ところ＝〜した ばかり。",
        },
      ],
    },

    // ── 問題4 ─ つなぎ（だけでなく・こともある・し・理由の〜て）─────────
    {
      section_id: "文法15・16・17・22",
      title: "つなぎ — だけでなく・こともある・し・理由の〜て",
      autoGraded: true,
      instructions: "（　）に合うことばを入れてください。（「Use」があるときは、そのことばを使います。）",
      questions: [
        {
          id: 20,
          type: "fill_blank",
          courseRef: "文法15",
          prompt: "まんがは子ども（　）、大人もよく見ています。",
          prompt_hiragana: "まんがは こども（　）、おとなも よく みています。",
          answers: [["だけでなく", "だけではなく", "だけじゃなく"]],
          note: "〜だけでなく〜も。",
        },
        {
          id: 21,
          type: "fill_blank",
          courseRef: "文法16",
          prompt: "いつも家で料理を作りますが、たまにレストランで（　）こともあります。",
          prompt_hiragana: "いつも いえで りょうりを つくりますが、たまに レストランで（　）ことも あります。",
          base_word: "たべる",
          base_word_hiragana: "たべる",
          answers: [["たべる"]],
          note: "じしょけい＋こともある。",
        },
        {
          id: 22,
          type: "fill_blank",
          courseRef: "文法16",
          prompt: "毎日朝走っていますが、天気が悪い時は（　）こともあります。",
          prompt_hiragana: "まいにち あさ はしっていますが、てんきが わるい ときは（　）ことも あります。",
          base_word: "はしる",
          base_word_hiragana: "はしる",
          answers: [["はしらない"]],
          note: "ないけい＋こともある。",
        },
        {
          id: 23,
          type: "fill_blank",
          courseRef: "文法17",
          prompt: "バスはいつも（　）し、料金も高いし、それに時間がかかるから、自転車で来ます。",
          prompt_hiragana: "バスは いつも（　）し、りょうきんも たかいし、それに じかんが かかるから、じてんしゃで きます。",
          base_word: "こむ",
          base_word_hiragana: "こむ",
          answers: [["こむ"]],
          note: "ふつうけい＋し。",
        },
        {
          id: 24,
          type: "fill_blank",
          courseRef: "文法22",
          prompt: "古い牛乳を（　）、お腹が痛くなりました。",
          prompt_hiragana: "ふるい ぎゅうにゅうを（　）、おなかが いたく なりました。",
          base_word: "のむ",
          base_word_hiragana: "のむ",
          answers: [["のんで"]],
          note: "りゆうの〜て（どうし）。",
        },
        {
          id: 25,
          type: "fill_blank",
          courseRef: "文法22",
          prompt: "頭が（　）、学校を休みました。",
          prompt_hiragana: "あたまが（　）、がっこうを やすみました。",
          base_word: "いたい",
          base_word_hiragana: "いたい",
          answers: [["いたくて"]],
          note: "りゆうの〜て（いけいようし→くて）。",
        },
        {
          id: 26,
          type: "fill_blank",
          courseRef: "文法22",
          prompt: "（　）、電車が止まりました。",
          prompt_hiragana: "（　）、でんしゃが とまりました。",
          base_word: "雪",
          base_word_hiragana: "ゆき",
          answers: [["ゆきで"]],
          note: "りゆうの〜で（めいし）。",
        },
      ],
    },

    // ── 問題5 ─ ひゆ（よう・みたい）: 文法23 / 24 ───────────────────────
    {
      section_id: "文法23・24",
      title: "ひゆ — よう / みたい",
      autoGraded: true,
      instructions: "「Use」のことばを使って、「よう」か「みたい」の正しい形にしてください。",
      questions: [
        {
          id: 27,
          type: "fill_blank",
          courseRef: "文法23",
          prompt: "今日は4月ですが、とても暑くて、まるで（　）です。",
          prompt_hiragana: "きょうは しがつですが、とても あつくて、まるで（　）です。",
          base_word: "夏・よう",
          base_word_hiragana: "なつ・よう",
          answers: [["なつのよう"]],
          note: "めいし＋の＋ようだ。",
        },
        {
          id: 28,
          type: "fill_blank",
          courseRef: "文法23",
          prompt: "1月ですが、暖かくて、まるで春（　）よう（　）天気です。",
          prompt_hiragana: "いちがつですが、あたたかくて、まるで はる（　）よう（　）てんきです。",
          answers: [["の"], ["な"]],
          note: "めいし＋の＋ような＋めいし。",
        },
        {
          id: 29,
          type: "fill_blank",
          courseRef: "文法24",
          prompt: "沖縄はアメリカのハワイ（　）ところです。",
          prompt_hiragana: "おきなわは アメリカの ハワイ（　）ところです。",
          base_word: "みたい",
          base_word_hiragana: "みたい",
          answers: [["みたいな"]],
          note: "めいし＋みたいな＋めいし（の は つかない）。",
        },
        {
          id: 30,
          type: "fill_blank",
          courseRef: "文法24",
          prompt: "髪型はこの写真（　）してください。",
          prompt_hiragana: "かみがたは この しゃしん（　） して ください。",
          base_word: "みたい",
          base_word_hiragana: "みたい",
          answers: [["みたいに"]],
          note: "めいし＋みたいに＋どうし。",
        },
      ],
    },
  ],
};

export const totalBeginner1Part2QuestionCount: number =
  beginner1Part2Quiz.sections.reduce((n, sec) => n + sec.questions.length, 0);
