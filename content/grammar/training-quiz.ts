/**
 * JLPT L4–L5 "Training quiz" (クイズ②前 復習プリント) for the Grammar module.
 * Sibling of the Mock-exam data; same spirit, but the review sheet mixes
 * several question formats, so this file adds a few fields the mock exam
 * didn't need:
 *   • section.type       — which renderer/validation a section uses:
 *       "fill_blank"      → kana-matching, identical to ExamQuestion. 問題2/3/6
 *                           run on the current ExamQuiz renderer UNCHANGED.
 *       "multiple_choice" → 問題1/4. Render `options` as buttons; the pick is
 *                           checked against `answers[0]` (option text). No typing.
 *       "free_production" → 問題5 (あげる/もらう/くれる). Depends on a picture,
 *                           so `scene` describes it in text. Phrasing varies —
 *                           grade leniently or reveal `answers[0]` as a model.
 *   • question.options / options_hiragana — choices for multiple_choice.
 *   • question.scene     — illustration text for free_production.
 *
 * `answers` semantics:
 *   fill_blank      → answers[i] = accepted variants (kana + kanji) for the i-th （　）.
 *   multiple_choice → single blank; answers[0] = correct option(s) from `options`.
 *   free_production → answers[0] = reference model sentence(s).
 *
 * ⚠️ The source sheet was BLANK — no answer key. The `answers` are filled in
 * from grammar. 問題1→5 are solid; DOUBLE-CHECK 問題6 (keigo) against the class
 * key: いらっしゃってください / おすいになります / おかきになりました etc. each have
 * equally valid alternatives, listed as extra variants where relevant.
 */

export type TrainingSectionType = "multiple_choice" | "fill_blank" | "free_production";

export interface TrainingQuestion {
  id: number;
  /** Sentence with one or more blanks （　）, kanji form. */
  prompt: string;
  /** Same sentence in kana — what the UI renders. */
  prompt_hiragana: string;
  /** Hint form to transform, or null for particle/choice questions. */
  base_word?: string | null;
  base_word_hiragana?: string | null;
  /** multiple_choice only: the choices, in order. */
  options?: string[];
  /** multiple_choice only: kana reading of each option, when it contains kanji. */
  options_hiragana?: string[];
  /** free_production only: text description of the illustration. */
  scene?: string;
  /** See "answers semantics" in the file header. */
  answers: string[][];
  grammar_reference: string;
}

export interface TrainingExample {
  prompt: string;
  prompt_hiragana: string;
  base_word?: string | null;
  base_word_hiragana?: string | null;
  options?: string[];
  options_hiragana?: string[];
  answers: string[][];
}

export interface TrainingSection {
  section_id: string;
  title: string;
  skill: string;
  type: TrainingSectionType;
  instructions: string;
  example?: TrainingExample;
  questions: TrainingQuestion[];
}

export interface TrainingExam {
  title: string;
  sections: TrainingSection[];
}

export const trainingQuiz: TrainingExam =
{
  "title": "クイズ②前 復習プリント（L4–L5）",
  "sections": [
    {
      "section_id": "問題1",
      "title": "助詞・接続詞",
      "skill": "particles_choice",
      "type": "multiple_choice",
      "instructions": "正しい助詞、接続詞を選んでください。",
      "example": {
        "prompt": "チンさん（　）学生です。",
        "prompt_hiragana": "チンさん（　）がくせいです。",
        "options": [
          "は",
          "と",
          "に",
          "の"
        ],
        "answers": [
          [
            "は"
          ]
        ]
      },
      "questions": [
        {
          "id": 1,
          "prompt": "明日は雨だ（　）思います。",
          "prompt_hiragana": "あしたは あめだ（　）おもいます。",
          "options": [
            "が",
            "は",
            "と",
            "も"
          ],
          "answers": [
            [
              "と"
            ]
          ],
          "grammar_reference": "L1-1/L1-4, 4"
        },
        {
          "id": 2,
          "prompt": "一週間（　）一回、ジョギングします。",
          "prompt_hiragana": "いっしゅうかん（　）いっかい、ジョギングします。",
          "options": [
            "に",
            "で",
            "が",
            "を"
          ],
          "answers": [
            [
              "に"
            ]
          ],
          "grammar_reference": "L4-4, 40"
        },
        {
          "id": 3,
          "prompt": "いつも一人（　）ご飯を食べています。",
          "prompt_hiragana": "いつも ひとり（　）ごはんを たべています。",
          "options": [
            "を",
            "で",
            "も",
            "が"
          ],
          "answers": [
            [
              "で"
            ]
          ],
          "grammar_reference": "L5-1, 47"
        },
        {
          "id": 4,
          "prompt": "私は父に目（　）似ています。",
          "prompt_hiragana": "わたしは ちちに め（　）にています。",
          "options": [
            "と",
            "を",
            "が",
            "に"
          ],
          "answers": [
            [
              "が"
            ]
          ],
          "grammar_reference": "L5-1表現"
        },
        {
          "id": 5,
          "prompt": "誕生日に新しいスマホ（　）ほしいです。",
          "prompt_hiragana": "たんじょうびに あたらしい スマホ（　）ほしいです。",
          "options": [
            "は",
            "を",
            "に",
            "が"
          ],
          "answers": [
            [
              "が"
            ]
          ],
          "grammar_reference": "L5-2, 50"
        },
        {
          "id": 6,
          "prompt": "私は妹と仲（　）いいから、いつも一緒に旅行しています。",
          "prompt_hiragana": "わたしは いもうとと なか（　）いいから、いつも いっしょに りょこうしています。",
          "options": [
            "が",
            "と",
            "で",
            "も"
          ],
          "answers": [
            [
              "が"
            ]
          ],
          "grammar_reference": "L5-1表現"
        }
      ]
    },
    {
      "section_id": "問題2",
      "title": "動詞",
      "skill": "verb_conjugation",
      "type": "fill_blank",
      "instructions": "動詞の問題です。正しい形にしてください。ひらがなで書いてください。",
      "example": {
        "prompt": "昨日、映画を（　）。",
        "prompt_hiragana": "きのう、えいがを（　）。",
        "base_word": "見ます",
        "base_word_hiragana": "みます",
        "answers": [
          [
            "みました"
          ]
        ]
      },
      "questions": [
        {
          "id": 1,
          "prompt": "料理がなかなか（　）。",
          "prompt_hiragana": "りょうりが なかなか（　）。",
          "base_word": "来ます",
          "base_word_hiragana": "きます",
          "answers": [
            [
              "こない",
              "きません"
            ]
          ],
          "grammar_reference": "L4-2, 39"
        },
        {
          "id": 2,
          "prompt": "毎日（　）ことにします。",
          "prompt_hiragana": "まいにち（　）ことにします。",
          "base_word": "走ります",
          "base_word_hiragana": "はしります",
          "answers": [
            [
              "はしる",
              "走る"
            ]
          ],
          "grammar_reference": "L4-1, 37"
        },
        {
          "id": 3,
          "prompt": "昨日は、どこへも（　）。",
          "prompt_hiragana": "きのうは、どこへも（　）。",
          "base_word": "行きます",
          "base_word_hiragana": "いきます",
          "answers": [
            [
              "いきませんでした",
              "いかなかった"
            ]
          ],
          "grammar_reference": "L4-6, 43"
        },
        {
          "id": 4,
          "prompt": "趣味は映画を（　）ことです。",
          "prompt_hiragana": "しゅみは えいがを（　）ことです。",
          "base_word": "見ます",
          "base_word_hiragana": "みます",
          "answers": [
            [
              "みる",
              "見る"
            ]
          ],
          "grammar_reference": "L4-4表現"
        },
        {
          "id": 5,
          "prompt": "明日、漢字のテストが（　）のを知っていますか。",
          "prompt_hiragana": "あした、かんじの テストが（　）のを しっていますか。",
          "base_word": "あります",
          "base_word_hiragana": "あります",
          "answers": [
            [
              "ある"
            ]
          ],
          "grammar_reference": "L4-4, 41"
        }
      ]
    },
    {
      "section_id": "問題3",
      "title": "名詞、形容詞、な形容詞",
      "skill": "adjectives_nouns",
      "type": "fill_blank",
      "instructions": "名詞、形容詞、な形容詞の問題です。正しい形にしてひらがなで書いてください。",
      "example": {
        "prompt": "これは（　）シャツです。",
        "prompt_hiragana": "これは（　）シャツです。",
        "base_word": "新しいです",
        "base_word_hiragana": "あたらしいです",
        "answers": [
          [
            "あたらしい"
          ]
        ]
      },
      "questions": [
        {
          "id": 1,
          "prompt": "山田さんが（　）歩いています。",
          "prompt_hiragana": "やまださんが（　）あるいています。",
          "base_word": "さびしいです+そうです",
          "base_word_hiragana": "さびしいです+そうです",
          "answers": [
            [
              "さびしそうに"
            ]
          ],
          "grammar_reference": "L3-4, 35"
        },
        {
          "id": 2,
          "prompt": "見てください。（　）コートですね。",
          "prompt_hiragana": "みてください。（　）コートですね。",
          "base_word": "高いです+そうです",
          "base_word_hiragana": "たかいです+そうです",
          "answers": [
            [
              "たかそうな",
              "高そうな"
            ]
          ],
          "grammar_reference": "L3-4, 35"
        },
        {
          "id": 3,
          "prompt": "昨日は病気でしたが、今日は（　）なりました。",
          "prompt_hiragana": "きのうは びょうきでしたが、きょうは（　）なりました。",
          "base_word": "元気です",
          "base_word_hiragana": "げんきです",
          "answers": [
            [
              "げんきに",
              "元気に"
            ]
          ],
          "grammar_reference": "L3-2, 31"
        }
      ]
    },
    {
      "section_id": "問題4",
      "title": "文法（記号選択）",
      "skill": "grammar_choice",
      "type": "multiple_choice",
      "instructions": "正しいものを一つ選んで、記号を書いてください。",
      "example": {
        "prompt": "昨日、（　）を食べました。",
        "prompt_hiragana": "きのう、（　）を たべました。",
        "options": [
          "パン",
          "ペン",
          "ジュース",
          "ノート"
        ],
        "answers": [
          [
            "パン"
          ]
        ]
      },
      "questions": [
        {
          "id": 1,
          "prompt": "今朝、（　）食べましたか。",
          "prompt_hiragana": "けさ、（　）たべましたか。",
          "options": [
            "何が",
            "何に",
            "何と",
            "何か"
          ],
          "options_hiragana": [
            "なにが",
            "なにに",
            "なにと",
            "なにか"
          ],
          "answers": [
            [
              "何か"
            ]
          ],
          "grammar_reference": "L4-6, 42"
        },
        {
          "id": 2,
          "prompt": "となりの教室で学生が話している（　）聞こえます。",
          "prompt_hiragana": "となりの きょうしつで がくせいが はなしている（　）きこえます。",
          "options": [
            "のが",
            "ので",
            "のを",
            "の"
          ],
          "answers": [
            [
              "のが"
            ]
          ],
          "grammar_reference": "L4-4, 41"
        },
        {
          "id": 3,
          "prompt": "もう6時です。（　）。",
          "prompt_hiragana": "もう ろくじです。（　）。",
          "options": [
            "暗くなりました",
            "暗くしました",
            "暗くてなりました",
            "暗くてしました"
          ],
          "options_hiragana": [
            "くらくなりました",
            "くらくしました",
            "くらくてなりました",
            "くらくてしました"
          ],
          "answers": [
            [
              "暗くなりました"
            ]
          ],
          "grammar_reference": "L3-2, 31"
        },
        {
          "id": 4,
          "prompt": "次のテストがいつある（　）知っていますか。",
          "prompt_hiragana": "つぎの テストが いつある（　）しっていますか。",
          "options": [
            "かどうか",
            "のを",
            "のか",
            "のが"
          ],
          "answers": [
            [
              "のか"
            ]
          ],
          "grammar_reference": "L4-7, 46"
        }
      ]
    },
    {
      "section_id": "問題5",
      "title": "あげる・もらう・くれる",
      "skill": "giving_receiving",
      "type": "free_production",
      "instructions": "あげる、もらう、くれるを使って全部ひらがなで（カタカナの言葉はカタカナで）書いてください。",
      "questions": [
        {
          "id": 1,
          "prompt": "やまださんは（　）。",
          "prompt_hiragana": "やまださんは（　）。",
          "scene": "山田さんが木村さんに指輪（ゆびわ）をあげている。木村さんが「ありがとうございます」と言っている。",
          "answers": [
            [
              "きむらさんにゆびわをあげました"
            ]
          ],
          "grammar_reference": "L5-2, 51"
        },
        {
          "id": 2,
          "prompt": "きむらさんは（　）。",
          "prompt_hiragana": "きむらさんは（　）。",
          "scene": "山田さんが木村さんに指輪（ゆびわ）をあげている。木村さんが「ありがとうございます」と言っている。",
          "answers": [
            [
              "やまださんにゆびわをもらいました"
            ]
          ],
          "grammar_reference": "L5-2, 51"
        },
        {
          "id": 3,
          "prompt": "わたしは（　）。",
          "prompt_hiragana": "わたしは（　）。",
          "scene": "木村さんがわたしに写真（しゃしん）をあげている。わたしが「ありがとうございます」と言っている。",
          "answers": [
            [
              "きむらさんにしゃしんをもらいました"
            ]
          ],
          "grammar_reference": "L5-2, 51 / L5-3, 51"
        },
        {
          "id": 4,
          "prompt": "きむらさんが（　）。",
          "prompt_hiragana": "きむらさんが（　）。",
          "scene": "木村さんがわたしに写真（しゃしん）をあげている。わたしが「ありがとうございます」と言っている。",
          "answers": [
            [
              "しゃしんをくれました",
              "わたしにしゃしんをくれました"
            ]
          ],
          "grammar_reference": "L5-2, 51 / L5-3, 51"
        },
        {
          "id": 5,
          "prompt": "母が（　）んです。",
          "prompt_hiragana": "ははが（　）んです。",
          "scene": "母がわたしにかばんをくれた。友達が「すてきなかばんですね。どうしたんですか」と聞いている。",
          "answers": [
            [
              "くれた"
            ]
          ],
          "grammar_reference": "L5-3, 51"
        },
        {
          "id": 6,
          "prompt": "母に（　）んです。",
          "prompt_hiragana": "ははに（　）んです。",
          "scene": "母がわたしにかばんをくれた。友達が「すてきなかばんですね。どうしたんですか」と聞いている。",
          "answers": [
            [
              "もらった"
            ]
          ],
          "grammar_reference": "L5-2, 51"
        }
      ]
    },
    {
      "section_id": "問題6",
      "title": "うち・そと（敬語）",
      "skill": "keigo_uchi_soto",
      "type": "fill_blank",
      "instructions": "うち・そと（うちよそ）の形で書いてください。〔うち＝謙譲／そと＝尊敬〕",
      "example": {
        "prompt": "（　）はどこですか。",
        "prompt_hiragana": "（　）はどこですか。",
        "base_word": "家",
        "base_word_hiragana": "いえ",
        "answers": [
          [
            "おたく"
          ]
        ]
      },
      "questions": [
        {
          "id": 1,
          "prompt": "中村：山田さんが作ったケーキをもう（　）か。（そと）",
          "prompt_hiragana": "なかむら：やまださんが つくった ケーキを もう（　）か。（そと）",
          "base_word": "食べます",
          "base_word_hiragana": "たべます",
          "answers": [
            [
              "めしあがりました"
            ]
          ],
          "grammar_reference": "L4-2, 38"
        },
        {
          "id": 2,
          "prompt": "田中：はい、（　）。（うち）",
          "prompt_hiragana": "たなか：はい、（　）。（うち）",
          "base_word": "食べます",
          "base_word_hiragana": "たべます",
          "answers": [
            [
              "いただきました"
            ]
          ],
          "grammar_reference": "L4-2, 38"
        },
        {
          "id": 3,
          "prompt": "はじめまして。チンと（　）。（うち）",
          "prompt_hiragana": "はじめまして。チンと（　）。（うち）",
          "base_word": "言います",
          "base_word_hiragana": "いいます",
          "answers": [
            [
              "もうします",
              "申します"
            ]
          ],
          "grammar_reference": "L4-2, 38"
        },
        {
          "id": 4,
          "prompt": "中国から（　）。（うち）",
          "prompt_hiragana": "ちゅうごくから（　）。（うち）",
          "base_word": "来ます",
          "base_word_hiragana": "きます",
          "answers": [
            [
              "まいりました",
              "参りました"
            ]
          ],
          "grammar_reference": "L4-2, 38"
        },
        {
          "id": 5,
          "prompt": "ご家族と一緒に（　）。（そと）",
          "prompt_hiragana": "ごかぞくと いっしょに（　）。（そと）",
          "base_word": "来てください",
          "base_word_hiragana": "きてください",
          "answers": [
            [
              "いらっしゃってください",
              "いらしてください",
              "おいでください"
            ]
          ],
          "grammar_reference": "L4-2, 38"
        },
        {
          "id": 6,
          "prompt": "どうぞ、（　）。（そと）",
          "prompt_hiragana": "どうぞ、（　）。（そと）",
          "base_word": "食べてください",
          "base_word_hiragana": "たべてください",
          "answers": [
            [
              "めしあがってください"
            ]
          ],
          "grammar_reference": "L4-2, 38"
        },
        {
          "id": 7,
          "prompt": "おたばこを（　）か。（そと）",
          "prompt_hiragana": "おたばこを（　）か。（そと）",
          "base_word": "吸います",
          "base_word_hiragana": "すいます",
          "answers": [
            [
              "おすいになります",
              "すわれます"
            ]
          ],
          "grammar_reference": "L4-2, 38"
        },
        {
          "id": 8,
          "prompt": "この絵は社長が（　）。（そと）",
          "prompt_hiragana": "このえは しゃちょうが（　）。（そと）",
          "base_word": "かきます",
          "base_word_hiragana": "かきます",
          "answers": [
            [
              "おかきになりました",
              "かかれました"
            ]
          ],
          "grammar_reference": "L4-2, 38"
        }
      ]
    }
  ]
};

/**
 * 問題6 (keigo / うち・そと) is excluded from the live quiz for now — its
 * answers still need to be checked against the class key (see the ⚠️
 * header above), and keigo itself is being handled separately. This is
 * what the Training quiz UI actually plays; swap back to `trainingQuiz`
 * once 問題6 is verified.
 */
export const trainingQuizLive: TrainingExam = {
  ...trainingQuiz,
  sections: trainingQuiz.sections.filter((s) => s.skill !== "keigo_uchi_soto"),
};

export const totalTrainingQuestionCount: number = trainingQuizLive.sections.reduce(
  (n, sec) => n + sec.questions.length,
  0
);
