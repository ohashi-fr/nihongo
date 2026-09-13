/**
 * L4–L5 Challenge Quiz — companion to grammar-l4l5.ts, rendered by
 * components/grammar/ChallengeQuiz.tsx.
 *
 * Scope: the DENSE / trap-heavy L4–L5 notions only (keigo, giving &
 * receiving, volitional, 〜たら, 〜ことになる, のを/のが, か/も/のか, もう/まだ②,
 * etc.). Easy notions (なかなか, frequency, 〜とも, そして, 〜始める) are
 * omitted on purpose — this is a challenge, not a drill.
 *
 * Two question types, mixed within a section (unlike training-quiz.ts,
 * where `type` is per-section):
 *   • "fill_blank"      — user types the answer in HIRAGANA; validated
 *                          with the same kana matcher as the other quizzes
 *                          (isBlankCorrect / getKanaVariants in ExamQuiz.tsx).
 *   • "multiple_choice" — render `options` as buttons; correct = the
 *                          picked option equals answers[0][0].
 *
 * `answers` semantics:
 *   fill_blank      → answers[i] = accepted variants for the i-th （　） blank.
 *   multiple_choice → answers[0] = the correct option (verbatim from `options`).
 *
 * Linking: every question carries `notionSlug` — resolved via
 * getNotionBySlugL4L5() for the "review this notion" link. `courseRef`
 * (e.g. "文法52") is a display label.
 *
 * Japanese is written in KANA (hiragana + katakana, spaced), matching the
 * grammar module's beginner style. `（　）` marks each blank.
 */

export type ChallengeQuestionType = "fill_blank" | "multiple_choice";

export interface ChallengeQuestion {
  id: number;
  notionSlug: string; // → getNotionBySlugL4L5(notionSlug)
  courseRef: string; // display label, e.g. "文法52"
  type: ChallengeQuestionType;
  prompt: string; // kana, with （　） blank(s)
  base_word?: string; // fill_blank hint (dictionary form, kana)
  options?: string[]; // multiple_choice choices
  answers: string[][]; // see "answers semantics" above
}

export interface ChallengeSection {
  id: string;
  title: string;
  notionSlugs: string[];
  questions: ChallengeQuestion[];
}

export interface ChallengeExam {
  title: string;
  description: string;
  sections: ChallengeSection[];
}

export const challengeQuiz: ChallengeExam = {
  title: "L4–L5 チャレンジ・クイズ (Challenge quiz)",
  description:
    "A challenge quiz over the densest L4–L5 grammar (課38–61). Trivial notions (なかなか, frequency, とも, そして, 始める) are intentionally omitted.",
  sections: [
    {
      id: "s-keigo-yarimorai",
      title: "敬語・やりもらい — Keigo & giving / receiving",
      notionSlugs: [
        "keigo-o-ni-naru",
        "giving-receiving-objects",
        "favors-te-verbs",
        "requests-te-moraemasenka",
      ],
      questions: [
        {
          id: 1,
          notionSlug: "keigo-o-ni-naru",
          courseRef: "文法38",
          type: "fill_blank",
          prompt: "せんせいは もう （　）。",
          base_word: "かえる",
          answers: [["おかえりに なりました", "おかえりになりました"]],
        },
        {
          id: 2,
          notionSlug: "keigo-o-ni-naru",
          courseRef: "文法38",
          type: "multiple_choice",
          prompt: "せんせいは もう ひるごはんを （　）か。",
          options: ["おたべに なりました", "めしあがりました", "いただきました", "たべられました"],
          answers: [["めしあがりました"]],
        },
        {
          id: 3,
          notionSlug: "keigo-o-ni-naru",
          courseRef: "文法38",
          type: "multiple_choice",
          prompt: "しゃちょうは あした こちらへ （　）。",
          options: ["いらっしゃいます", "まいります", "きます", "おきに なります"],
          answers: [["いらっしゃいます"]],
        },
        {
          id: 4,
          notionSlug: "giving-receiving-objects",
          courseRef: "文法51",
          type: "multiple_choice",
          prompt: "ちちが わたしに とけいを （　）。",
          options: ["くれました", "あげました", "もらいました", "やりました"],
          answers: [["くれました"]],
        },
        {
          id: 5,
          notionSlug: "giving-receiving-objects",
          courseRef: "文法51",
          type: "multiple_choice",
          prompt: "わたしは せんせいに おみやげを （　）。",
          options: ["さしあげました", "くださいました", "いただきました", "くれました"],
          answers: [["さしあげました"]],
        },
        {
          id: 6,
          notionSlug: "giving-receiving-objects",
          courseRef: "文法51",
          type: "multiple_choice",
          prompt: "せんせいが わたしに じしょを （　）。",
          options: ["くださいました", "いただきました", "さしあげました", "もらいました"],
          answers: [["くださいました"]],
        },
        {
          id: 7,
          notionSlug: "favors-te-verbs",
          courseRef: "文法52",
          type: "multiple_choice",
          prompt: "ともだちが えきまで おくって （　）。",
          options: ["くれました", "あげました", "もらいました", "やりました"],
          answers: [["くれました"]],
        },
        {
          id: 8,
          notionSlug: "favors-te-verbs",
          courseRef: "文法52",
          type: "fill_blank",
          prompt: "わたしは おばあさんの にもつを もって （　）。",
          base_word: "あげる",
          answers: [["あげました"]],
        },
        {
          id: 9,
          notionSlug: "favors-te-verbs",
          courseRef: "文法52",
          type: "multiple_choice",
          prompt: "せんせいに さくぶんを なおして （　）。",
          options: ["いただきました", "くださいました", "さしあげました", "あげました"],
          answers: [["いただきました"]],
        },
        {
          id: 10,
          notionSlug: "requests-te-moraemasenka",
          courseRef: "文法54",
          type: "multiple_choice",
          prompt: "せんせいに ものを たのむ とき、いちばん ていねいなのは？",
          options: ["てつだって くれない？", "てつだって くれませんか", "てつだって もらえませんか", "てつだって いただけませんか"],
          answers: [["てつだって いただけませんか"]],
        },
      ],
    },
    {
      id: "s-no-gimon",
      title: "の・ぎもんし — Nominalizing & question words",
      notionSlugs: ["nominalizer-no", "question-word-ka-mo-noka", "kadouka"],
      questions: [
        {
          id: 11,
          notionSlug: "nominalizer-no",
          courseRef: "文法41",
          type: "multiple_choice",
          prompt: "タクシーが くる（　）まって います。",
          options: ["のを", "のが", "のに", "こと"],
          answers: [["のを"]],
        },
        {
          id: 12,
          notionSlug: "nominalizer-no",
          courseRef: "文法41",
          type: "multiple_choice",
          prompt: "まどから こどもが あそんで いる（　）みえます。",
          options: ["のが", "のを", "のに", "のか"],
          answers: [["のが"]],
        },
        {
          id: 13,
          notionSlug: "nominalizer-no",
          courseRef: "文法41",
          type: "multiple_choice",
          prompt: "ともだちに でんわする（　）わすれました。",
          options: ["のを", "のが", "のは", "こと"],
          answers: [["のを"]],
        },
        {
          id: 14,
          notionSlug: "question-word-ka-mo-noka",
          courseRef: "文法42",
          type: "multiple_choice",
          prompt: "しゅうまつ、（　）いきましたか。→ ええ、いきました。",
          options: ["どこか", "どこも", "どこへも", "どこ"],
          answers: [["どこか"]],
        },
        {
          id: 15,
          notionSlug: "question-word-ka-mo-noka",
          courseRef: "文法42",
          type: "fill_blank",
          prompt: "きょうしつに だれか いますか。→ いいえ、（　）いません。",
          answers: [["だれも"]],
        },
        {
          id: 16,
          notionSlug: "question-word-ka-mo-noka",
          courseRef: "文法42",
          type: "multiple_choice",
          prompt: "テストが いつ ある（　）しって いますか。",
          options: ["のか", "かどうか", "のを", "こと"],
          answers: [["のか"]],
        },
        {
          id: 17,
          notionSlug: "question-word-ka-mo-noka",
          courseRef: "文法42",
          type: "fill_blank",
          prompt: "リーさんが いつ ひま（　）、おしえて ください。",
          base_word: "ひま",
          answers: [["なのか"]],
        },
        {
          id: 18,
          notionSlug: "kadouka",
          courseRef: "文法45",
          type: "multiple_choice",
          prompt: "テストが ある（　）、まだ わかりません。",
          options: ["かどうか", "のか", "か", "こと"],
          answers: [["かどうか"]],
        },
      ],
    },
    {
      id: "s-ikou-tsumori-koto",
      title: "意向・つもり・こと — Volition, intention & decisions",
      notionSlugs: ["volitional-form", "intention-tsumori", "decided-koto-ni-naru"],
      questions: [
        {
          id: 19,
          notionSlug: "volitional-form",
          courseRef: "文法55",
          type: "fill_blank",
          prompt: "この ほんを かって、いえで （　）と おもいます。",
          base_word: "よむ",
          answers: [["よもう"]],
        },
        {
          id: 20,
          notionSlug: "volitional-form",
          courseRef: "文法55",
          type: "fill_blank",
          prompt: "あした はやく （　）と おもって います。",
          base_word: "おきる",
          answers: [["おきよう"]],
        },
        {
          id: 21,
          notionSlug: "volitional-form",
          courseRef: "文法55",
          type: "fill_blank",
          prompt: "しゅうまつ、いっしょに テニスを （　）よ。",
          base_word: "する",
          answers: [["しよう"]],
        },
        {
          id: 22,
          notionSlug: "volitional-form",
          courseRef: "文法55",
          type: "multiple_choice",
          prompt: "リーさんは あした （　）と おもいます。",
          options: ["くる", "こよう", "きよう", "こない"],
          answers: [["くる"]],
        },
        {
          id: 23,
          notionSlug: "intention-tsumori",
          courseRef: "文法57",
          type: "multiple_choice",
          prompt: "らいねん、くにへ （　）つもりです。〔かえらない いし〕",
          options: ["かえらない", "かえる", "かえって", "かえりたい"],
          answers: [["かえらない"]],
        },
        {
          id: 24,
          notionSlug: "decided-koto-ni-naru",
          courseRef: "文法59",
          type: "multiple_choice",
          prompt: "かいしゃの めいれいで、こうべへ いく こと（　）。",
          options: ["に なりました", "に しました", "が なりました", "を しました"],
          answers: [["に なりました"]],
        },
        {
          id: 25,
          notionSlug: "decided-koto-ni-naru",
          courseRef: "文法59",
          type: "multiple_choice",
          prompt: "けんこうの ために、たばこを やめる こと（　）。〔じぶんで きめた〕",
          options: ["に しました", "に なりました", "を します", "が なりました"],
          answers: [["に しました"]],
        },
        {
          id: 26,
          notionSlug: "decided-koto-ni-naru",
          courseRef: "文法59",
          type: "fill_blank",
          prompt: "らいげつ、こうべへ しゅっちょうする こと（　）。〔きまった〕",
          base_word: "なる",
          answers: [["に なりました", "になりました"]],
        },
      ],
    },
    {
      id: "s-joken-setsuzoku",
      title: "条件・接続 — Conditionals & linking actions",
      notionSlugs: ["conditional-tara", "listing-tari", "sequence-te-kara"],
      questions: [
        {
          id: 27,
          notionSlug: "conditional-tara",
          courseRef: "文法56",
          type: "fill_blank",
          prompt: "だいがくを （　）、はたらきたいです。",
          base_word: "そつぎょうする",
          answers: [["そつぎょうしたら"]],
        },
        {
          id: 28,
          notionSlug: "conditional-tara",
          courseRef: "文法56",
          type: "fill_blank",
          prompt: "もし （　）、まどを あけて ください。",
          base_word: "あつい",
          answers: [["あつかったら"]],
        },
        {
          id: 29,
          notionSlug: "conditional-tara",
          courseRef: "文法56",
          type: "fill_blank",
          prompt: "あした もし （　）、あそびに いきませんか。",
          base_word: "ひま",
          answers: [["ひまだったら"]],
        },
        {
          id: 30,
          notionSlug: "listing-tari",
          courseRef: "文法58",
          type: "fill_blank",
          prompt: "やすみの ひは、テレビを （　）、おんがくを きいたり します。",
          base_word: "みる",
          answers: [["みたり"]],
        },
        {
          id: 31,
          notionSlug: "listing-tari",
          courseRef: "文法58",
          type: "fill_blank",
          prompt: "パーティーで、うたを うたったり、（　）しました。",
          base_word: "おどる",
          answers: [["おどったり"]],
        },
        {
          id: 32,
          notionSlug: "sequence-te-kara",
          courseRef: "文法60",
          type: "fill_blank",
          prompt: "ごはんを （　）から、はを みがきます。",
          base_word: "たべる",
          answers: [["たべて"]],
        },
        {
          id: 33,
          notionSlug: "sequence-te-kara",
          courseRef: "文法60",
          type: "multiple_choice",
          prompt: "おふろに （　）から、ねます。〔じゅんばん：おふろ→ねる〕",
          options: ["はいって", "はいる", "はいった", "はいらない"],
          answers: [["はいって"]],
        },
      ],
    },
    {
      id: "s-other-traps",
      title: "その他の重要ポイント — Other key traps",
      notionSlugs: ["mou-mada-2", "hoshii", "verb-kata"],
      questions: [
        {
          id: 34,
          notionSlug: "mou-mada-2",
          courseRef: "文法44",
          type: "multiple_choice",
          prompt: "もう しゅくだいを しましたか。→ いいえ、（　）。",
          options: ["まだ して いません", "もう して いません", "しませんでした", "して います"],
          answers: [["まだ して いません"]],
        },
        {
          id: 35,
          notionSlug: "mou-mada-2",
          courseRef: "文法44",
          type: "multiple_choice",
          prompt: "まだ あめが ふって いますか。→ いいえ、（　）。",
          options: ["もう ふって いません", "まだ ふって いません", "ふりませんでした", "もう ふります"],
          answers: [["もう ふって いません"]],
        },
        {
          id: 36,
          notionSlug: "hoshii",
          courseRef: "文法50",
          type: "multiple_choice",
          prompt: "あたらしい スマホ（　）ほしいです。",
          options: ["が", "を", "に", "は"],
          answers: [["が"]],
        },
        {
          id: 37,
          notionSlug: "hoshii",
          courseRef: "文法50",
          type: "multiple_choice",
          prompt: "おなかが すきました。なにか （　）です。",
          options: ["たべたい", "ほしい", "たべもの", "たべる"],
          answers: [["たべたい"]],
        },
        {
          id: 38,
          notionSlug: "verb-kata",
          courseRef: "文法53",
          type: "fill_blank",
          prompt: "この かんじの （　）を おしえて ください。",
          base_word: "よむ",
          answers: [["よみかた"]],
        },
        {
          id: 39,
          notionSlug: "verb-kata",
          courseRef: "文法53",
          type: "multiple_choice",
          prompt: "にほんごの べんきょう（　）が わかりません。",
          options: ["の しかた", "しかた", "かた", "の かた"],
          answers: [["の しかた"]],
        },
      ],
    },
  ],
};

export const totalChallengeQuestionCount: number = challengeQuiz.sections.reduce(
  (n, sec) => n + sec.questions.length,
  0
);
