/**
 * 1-2課 助詞 — Particle quiz for the "Beginner 1 · Lessons 1–2" module.
 * Faithful transcription of the printed worksheet (18 particle fill-ins).
 * Same format as the existing quiz — reuses the Kimatsu quiz types + renderer.
 *
 * Fix the import path below to wherever KimatsuQuiz/KimatsuSection/KimatsuQuestion
 * are exported in the repo. prompt = kanji with （　）; prompt_hiragana = kana
 * (what the UI renders). answers[i] = accepted variants for the i-th （　）.
 */

import type { KimatsuQuiz } from "./kimatsu-quiz";

export const beginner1ParticleQuiz: KimatsuQuiz = {
  title: "1-2課 助詞 — Particles (Beginner 1 · Lessons 1–2)",
  description:
    "Transcription de la feuille « 1-2課 助詞 » — 18 questions de particules à compléter. Même format que le quiz existant (fill_blank). Réponses à vérifier contre la clé du cours.",
  sections: [
    {
      section_id: "問題1",
      title: "助詞 — Particles",
      autoGraded: true,
      instructions: "（　）にひらがなを書いてください。（助詞）",
      questions: [
        {
          id: 1,
          type: "fill_blank",
          courseRef: "表現1",
          prompt: "日本にはお正月にお年玉をあげる習慣（　）あります。",
          prompt_hiragana: "にほんには おしょうがつに おとしだまを あげる しゅうかん（　）あります。",
          answers: [["が"]],
        },
        {
          id: 2,
          type: "fill_blank",
          courseRef: "表現2",
          prompt: "日本に来て、地震（　）びっくりしました。",
          prompt_hiragana: "にほんに きて、じしん（　）びっくりしました。",
          answers: [["に"]],
        },
        {
          id: 3,
          type: "fill_blank",
          courseRef: "表現3",
          prompt: "私の趣味（　）ついて、話しました。",
          prompt_hiragana: "わたしの しゅみ（　）ついて、はなしました。",
          answers: [["に"]],
        },
        {
          id: 4,
          type: "fill_blank",
          courseRef: "表現5",
          prompt: "明日着ていくシャツ（　）アイロン（　）かけました。",
          prompt_hiragana: "あした きていく シャツ（　）アイロン（　）かけました。",
          answers: [["に"], ["を"]],
        },
        {
          id: 5,
          type: "fill_blank",
          courseRef: "表現5",
          prompt: "部屋（　）掃除機（　）かけました。",
          prompt_hiragana: "へや（　）そうじき（　）かけました。",
          answers: [["に"], ["を"]],
        },
        {
          id: 6,
          type: "fill_blank",
          courseRef: "表現5",
          prompt: "スーツをクリーニング（　）出しました。",
          prompt_hiragana: "スーツを クリーニング（　）だしました。",
          answers: [["に"]],
        },
        {
          id: 7,
          type: "fill_blank",
          courseRef: "表現7",
          prompt: "日本語の他（　）、どんな外国語を勉強しましたか。",
          prompt_hiragana: "にほんごの ほか（　）、どんな がいこくごを べんきょうしましたか。",
          answers: [["に"]],
        },
        {
          id: 8,
          type: "fill_blank",
          courseRef: "表現9",
          prompt: "夏休みに、3泊4日（　）京都を旅行しました。",
          prompt_hiragana: "なつやすみに、さんぱくよっか（　）きょうとを りょこうしました。",
          answers: [["で"]],
        },
        {
          id: 9,
          type: "fill_blank",
          courseRef: "表現10",
          prompt: "京都へ行った時、おみやげ（　）お菓子（　）買いました。",
          prompt_hiragana: "きょうとへ いった とき、おみやげ（　）おかし（　）かいました。",
          answers: [["に"], ["を"]],
        },
        {
          id: 10,
          type: "fill_blank",
          courseRef: "表現12",
          prompt: "この本は私（　）難しすぎます。",
          prompt_hiragana: "この ほんは わたし（　）むずかしすぎます。",
          answers: [["には"]],
        },
        {
          id: 11,
          type: "fill_blank",
          courseRef: "文法8",
          prompt: "家へ帰る前（　）、いつも喫茶店で勉強しています。",
          prompt_hiragana: "いえへ かえる まえ（　）、いつも きっさてんで べんきょうしています。",
          answers: [["に"]],
        },
        {
          id: 12,
          type: "fill_blank",
          courseRef: "文法8",
          prompt: "今いそがしいので、後（　）、電話します。",
          prompt_hiragana: "いま いそがしいので、あと（　）、でんわします。",
          answers: [["で"]],
        },
        {
          id: 13,
          type: "fill_blank",
          courseRef: "文法9",
          prompt: "友達の電話番号（　）書いておいたノートがありません。",
          prompt_hiragana: "ともだちの でんわばんごう（　）かいておいた ノートが ありません。",
          answers: [["を"]],
        },
        {
          id: 14,
          type: "fill_blank",
          courseRef: "文法9",
          prompt: "この本に名前（　）書いてありませんね。",
          prompt_hiragana: "この ほんに なまえ（　）かいてありませんね。",
          answers: [["が"]],
        },
        {
          id: 15,
          type: "fill_blank",
          courseRef: "文法15",
          prompt: "ロシアだけでなくインドに（　）行ったことがあります。",
          prompt_hiragana: "ロシアだけでなく インドに（　）いった ことが あります。",
          answers: [["も"]],
        },
        {
          id: 16,
          type: "fill_blank",
          courseRef: "L1動詞",
          prompt: "東京の地下鉄（　）もう慣れました。",
          prompt_hiragana: "とうきょうの ちかてつ（　）もう なれました。",
          answers: [["に"]],
        },
        {
          id: 17,
          type: "fill_blank",
          courseRef: "L2 する名詞",
          prompt: "昨日は渋谷（　）ブラブラしてから映画を見ました。",
          prompt_hiragana: "きのうは しぶや（　）ブラブラしてから えいがを みました。",
          answers: [["を", "で"]],
        },
        {
          id: 18,
          type: "fill_blank",
          courseRef: "L2 する名詞",
          prompt: "休みの日は家（　）ゴロゴロしていました。",
          prompt_hiragana: "やすみの ひは いえ（　）ゴロゴロしていました。",
          answers: [["で"]],
        },
      ],
    },
  ],
};

export const totalBeginner1ParticleQuestionCount: number =
  beginner1ParticleQuiz.sections.reduce((n, sec) => n + sec.questions.length, 0);
