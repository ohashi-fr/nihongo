/**
 * JLPT N5 mock exam (中間テスト練習問題) for the Grammar module's
 * fill-in-the-blank quiz ("Mock exam · N5").
 *
 * Content only — not generated at runtime. Do not alter the Japanese
 * prompt/answer strings; if in doubt, check with whoever supplied this
 * set.
 *
 * Matching: each blank in `prompt` (marked `（　）`) has an ordered
 * `answers[i]` entry — an array of accepted variants (kana + kanji
 * spellings). The user types hiragana, so validation normalizes the
 * input and compares it against whichever variant(s) in `answers[i]`
 * contain no kanji (see `getKanaVariants` in ExamQuiz.tsx). Kanji
 * variants exist purely as the reference/display form, never as
 * something the user is expected to type.
 *
 * `prompt`/`base_word` are the kanji forms, kept for a possible future
 * kanji-display toggle but currently unused by the UI, which reads
 * `prompt_hiragana`/`base_word_hiragana` instead — beginners can't
 * reliably read the kanji versions.
 */

export interface ExamQuestion {
  id: number;
  /** Japanese sentence with one or more blanks marked （　）, kanji form. */
  prompt: string;
  /** Same sentence fully in kana — what the UI actually renders. */
  prompt_hiragana: string;
  /** Hint form to transform (e.g. "行きます"), or null for particle questions. */
  base_word: string | null;
  /** Kana reading of `base_word` — what the UI actually renders as the hint. */
  base_word_hiragana?: string | null;
  /** answers[i] = accepted variants for the i-th （　） blank, in order. */
  answers: string[][];
  /** Course grammar-point code (e.g. "L2-3文17"), shown as a reference. */
  grammar_reference: string;
}

export interface ExamExample {
  prompt: string;
  prompt_hiragana: string;
  base_word?: string | null;
  base_word_hiragana?: string | null;
  answers: string[][];
}

export interface ExamSection {
  section_id: string;
  title: string;
  skill: string;
  instructions: string;
  example: ExamExample;
  questions: ExamQuestion[];
}

export interface Exam {
  title: string;
  sections: ExamSection[];
}

export const examQuiz: Exam =
{
  "title": "中間テスト練習問題",
  "sections": [
    {
      "section_id": "問題1",
      "title": "助詞",
      "skill": "particles",
      "instructions": "助詞を書く問題です。",
      "example": {
        "prompt": "パン（　）食べました。",
        "answers": [
          [
            "を"
          ]
        ],
        "prompt_hiragana": "パン（　）たべました。"
      },
      "questions": [
        {
          "id": 1,
          "prompt": "富士山（　）見えます。",
          "base_word": null,
          "answers": [
            [
              "が"
            ]
          ],
          "grammar_reference": "L1-5文9",
          "prompt_hiragana": "ふじさん（　）みえます。"
        },
        {
          "id": 2,
          "prompt": "田中さんがテレビ（　）見ています。",
          "base_word": null,
          "answers": [
            [
              "を"
            ]
          ],
          "grammar_reference": "L1-5文9",
          "prompt_hiragana": "たなかさんが テレビ（　）みています。"
        },
        {
          "id": 3,
          "prompt": "私（　）友達（　）旅行の写真（　）見せました。",
          "base_word": null,
          "answers": [
            [
              "は"
            ],
            [
              "に"
            ],
            [
              "を"
            ]
          ],
          "grammar_reference": "L1-5文9",
          "prompt_hiragana": "わたし（　）ともだち（　）りょこうの しゃしん（　）みせました。"
        },
        {
          "id": 4,
          "prompt": "となりの部屋から、子供の声（　）聞こえます。",
          "base_word": null,
          "answers": [
            [
              "が"
            ]
          ],
          "grammar_reference": "L1-5文9",
          "prompt_hiragana": "となりの へやから、こどもの こえ（　）きこえます。"
        },
        {
          "id": 5,
          "prompt": "姉が隣の部屋で音楽（　）聞いています。",
          "base_word": null,
          "answers": [
            [
              "を"
            ]
          ],
          "grammar_reference": "L1-5文9",
          "prompt_hiragana": "あねが となりの へやで おんがく（　）きいています。"
        },
        {
          "id": 6,
          "prompt": "マイさん（　）ジョンさん（　）歳（　）同じです。",
          "base_word": null,
          "answers": [
            [
              "と"
            ],
            [
              "は"
            ],
            [
              "が"
            ]
          ],
          "grammar_reference": "L2-2表現",
          "prompt_hiragana": "マイさん（　）ジョンさん（　）とし（　）おなじです。"
        },
        {
          "id": 7,
          "prompt": "ぼうし（　）かぶります。",
          "base_word": null,
          "answers": [
            [
              "を"
            ]
          ],
          "grammar_reference": "L2-2動詞",
          "prompt_hiragana": "ぼうし（　）かぶります。"
        },
        {
          "id": 8,
          "prompt": "暑いから、喫茶店（　）入りましょう。",
          "base_word": null,
          "answers": [
            [
              "に"
            ]
          ],
          "grammar_reference": "L2-3文16",
          "prompt_hiragana": "あついから、きっさてん（　）はいりましょう。"
        },
        {
          "id": 9,
          "prompt": "喫茶店（　）ケーキを食べます。",
          "base_word": null,
          "answers": [
            [
              "で"
            ]
          ],
          "grammar_reference": "L2-3文16",
          "prompt_hiragana": "きっさてん（　）ケーキを たべます。"
        },
        {
          "id": 10,
          "prompt": "もう夜の9時だから、喫茶店（　）出ましょう。",
          "base_word": null,
          "answers": [
            [
              "を"
            ]
          ],
          "grammar_reference": "L2-3文16",
          "prompt_hiragana": "もう よるの 9じだから、きっさてん（　）でましょう。"
        },
        {
          "id": 11,
          "prompt": "友達は日本（　）います。外国（　）（　）います。",
          "base_word": null,
          "answers": [
            [
              "に"
            ],
            [
              "に"
            ],
            [
              "も"
            ]
          ],
          "grammar_reference": "L2-5文21",
          "prompt_hiragana": "ともだちは にほん（　）います。がいこく（　）（　）います。"
        },
        {
          "id": 12,
          "prompt": "ATMはコンビニにあります。学校に（　）ありません。",
          "base_word": null,
          "answers": [
            [
              "は"
            ]
          ],
          "grammar_reference": "L2-5文21",
          "prompt_hiragana": "ATMは コンビニに あります。がっこうに（　）ありません。"
        },
        {
          "id": 13,
          "prompt": "鳥が空（　）飛んでいます。",
          "base_word": null,
          "answers": [
            [
              "を"
            ]
          ],
          "grammar_reference": "L2-6文22",
          "prompt_hiragana": "とりが そら（　）とんでいます。"
        },
        {
          "id": 14,
          "prompt": "リーさん（　）オウさん（　）どちらの方が背が高いですか。",
          "base_word": null,
          "answers": [
            [
              "と"
            ],
            [
              "と"
            ]
          ],
          "grammar_reference": "L2-7文24",
          "prompt_hiragana": "リーさん（　）オウさん（　）どちらの ほうが せが たかいですか。"
        },
        {
          "id": 15,
          "prompt": "果物の中（　）いちごが一番好きです。",
          "base_word": null,
          "answers": [
            [
              "で"
            ]
          ],
          "grammar_reference": "L2-7文25",
          "prompt_hiragana": "くだものの なか（　）いちごが いちばん すきです。"
        },
        {
          "id": 16,
          "prompt": "高田馬場（　）にぎやかですが、新宿ほどじゃありません。",
          "base_word": null,
          "answers": [
            [
              "も"
            ]
          ],
          "grammar_reference": "L2-7文26",
          "prompt_hiragana": "たかだのばば（　）にぎやかですが、しんじゅくほどじゃありません。"
        },
        {
          "id": 17,
          "prompt": "妹は医者（　）なりました。",
          "base_word": null,
          "answers": [
            [
              "に"
            ]
          ],
          "grammar_reference": "L3-2文31",
          "prompt_hiragana": "いもうとは いしゃ（　）なりました。"
        },
        {
          "id": 18,
          "prompt": "おなか（　）すいています。",
          "base_word": null,
          "answers": [
            [
              "が"
            ]
          ],
          "grammar_reference": "L3-5表現",
          "prompt_hiragana": "おなか（　）すいています。"
        },
        {
          "id": 19,
          "prompt": "風邪（　）ひきました。",
          "base_word": null,
          "answers": [
            [
              "を"
            ]
          ],
          "grammar_reference": "L3-5表現",
          "prompt_hiragana": "かぜ（　）ひきました。"
        }
      ]
    },
    {
      "section_id": "問題2",
      "title": "動詞",
      "skill": "verb_conjugation",
      "instructions": "動詞を書く文法の問題です。",
      "example": {
        "prompt": "昨日、パンを（　）。",
        "base_word": "食べる",
        "answers": [
          [
            "食べた",
            "たべた"
          ]
        ],
        "prompt_hiragana": "きのう、パンを（　）。"
      },
      "questions": [
        {
          "id": 1,
          "prompt": "北海道へ（　）ことがありません。",
          "base_word": "行きます",
          "answers": [
            [
              "いった",
              "行った"
            ]
          ],
          "grammar_reference": "L1-1",
          "prompt_hiragana": "ほっかいどうへ（　）ことが ありません。",
          "base_word_hiragana": "いきます"
        },
        {
          "id": 2,
          "prompt": "北海道へ（　）みたいです。",
          "base_word": "行きます",
          "answers": [
            [
              "いって",
              "行って"
            ]
          ],
          "grammar_reference": "L1-2文3",
          "prompt_hiragana": "ほっかいどうへ（　）みたいです。",
          "base_word_hiragana": "いきます"
        },
        {
          "id": 3,
          "prompt": "マリさんは、お刺身が好きじゃないそうなので、（　）と思います。",
          "base_word": "食べます",
          "answers": [
            [
              "たべない",
              "食べない"
            ]
          ],
          "grammar_reference": "L1-2文4",
          "prompt_hiragana": "マリさんは、おさしみが すきじゃないそうなので、（　）と おもいます。",
          "base_word_hiragana": "たべます"
        },
        {
          "id": 4,
          "prompt": "雨が（　）から、サッカーできませんでした。",
          "base_word": "降ります",
          "answers": [
            [
              "ふりました",
              "降りました",
              "ふった",
              "降った"
            ]
          ],
          "grammar_reference": "L1-3文5",
          "prompt_hiragana": "あめが（　）から、サッカーできませんでした。",
          "base_word_hiragana": "ふります"
        },
        {
          "id": 5,
          "prompt": "昨日、友達が（　）ので、一緒に食事しました。",
          "base_word": "来ます",
          "answers": [
            [
              "きた",
              "来た"
            ]
          ],
          "grammar_reference": "L1-3文6",
          "prompt_hiragana": "きのう、ともだちが（　）ので、いっしょに しょくじしました。",
          "base_word_hiragana": "きます"
        },
        {
          "id": 6,
          "prompt": "沖縄へ（　）時、いつも飛行機に乗ります。",
          "base_word": "行きます",
          "answers": [
            [
              "いく",
              "行く"
            ]
          ],
          "grammar_reference": "L1-4文8",
          "prompt_hiragana": "おきなわへ（　）とき、いつも ひこうきに のります。",
          "base_word_hiragana": "いきます"
        },
        {
          "id": 7,
          "prompt": "沖縄へ（　）時、海で泳ぎました。",
          "base_word": "行きます",
          "answers": [
            [
              "いった",
              "行った"
            ]
          ],
          "grammar_reference": "L1-4文8",
          "prompt_hiragana": "おきなわへ（　）とき、うみで およぎました。",
          "base_word_hiragana": "いきます"
        },
        {
          "id": 8,
          "prompt": "暑いから、エアコンを（　）もいいですか。",
          "base_word": "つけます",
          "answers": [
            [
              "つけて",
              "付けて"
            ]
          ],
          "grammar_reference": "L2-2文14",
          "prompt_hiragana": "あついから、エアコンを（　）もいいですか。",
          "base_word_hiragana": "つけます"
        },
        {
          "id": 9,
          "prompt": "図書館へ本を（　）に行きます。",
          "base_word": "借ります",
          "answers": [
            [
              "かり",
              "借り"
            ]
          ],
          "grammar_reference": "L2-3文17",
          "prompt_hiragana": "としょかんへ ほんを（　）に いきます。",
          "base_word_hiragana": "かります"
        },
        {
          "id": 10,
          "prompt": "昨日（　）映画は面白かったです。",
          "base_word": "見ます",
          "answers": [
            [
              "みた",
              "見た"
            ]
          ],
          "grammar_reference": "L2-4文18",
          "prompt_hiragana": "きのう（　）えいがは おもしろかったです。",
          "base_word_hiragana": "みます"
        },
        {
          "id": 11,
          "prompt": "あの、青いシャツを（　）人は誰ですか。",
          "base_word": "着ています",
          "answers": [
            [
              "きている",
              "着ている"
            ]
          ],
          "grammar_reference": "L2-4文18",
          "prompt_hiragana": "あの、あおい シャツを（　）ひとは だれですか。",
          "base_word_hiragana": "きています"
        },
        {
          "id": 12,
          "prompt": "漢字を（　）ことができますか。",
          "base_word": "読みます",
          "answers": [
            [
              "よむ",
              "読む"
            ]
          ],
          "grammar_reference": "L2-4文19",
          "prompt_hiragana": "かんじを（　）ことが できますか。",
          "base_word_hiragana": "よみます"
        },
        {
          "id": 13,
          "prompt": "お風呂に（　）、寝ます。",
          "base_word": "入ります",
          "answers": [
            [
              "はいって",
              "入って"
            ]
          ],
          "grammar_reference": "L3-1文29",
          "prompt_hiragana": "おふろに（　）、ねます。",
          "base_word_hiragana": "はいります"
        },
        {
          "id": 14,
          "prompt": "風邪を引いたから、（　）、寝ました。",
          "base_word": "勉強します",
          "answers": [
            [
              "べんきょうしないで",
              "勉強しないで"
            ]
          ],
          "grammar_reference": "L3-1文30",
          "prompt_hiragana": "かぜを ひいたから、（　）、ねました。",
          "base_word_hiragana": "べんきょうします"
        },
        {
          "id": 15,
          "prompt": "朝に（　）と、明るくなります。",
          "base_word": "なります",
          "answers": [
            [
              "なる"
            ]
          ],
          "grammar_reference": "L3-3文33",
          "prompt_hiragana": "あさに（　）と、あかるく なります。",
          "base_word_hiragana": "なります"
        },
        {
          "id": 16,
          "prompt": "空を見てください。雨が（　）そうです。",
          "base_word": "降ります",
          "answers": [
            [
              "ふり",
              "降り"
            ]
          ],
          "grammar_reference": "L3-4文34",
          "prompt_hiragana": "そらを みてください。あめが（　）そうです。",
          "base_word_hiragana": "ふります"
        },
        {
          "id": 17,
          "prompt": "A: どうしたんですか。 B: 熱が（　）んです。",
          "base_word": "あります",
          "answers": [
            [
              "ある"
            ]
          ],
          "grammar_reference": "L3-5表現",
          "prompt_hiragana": "A: どうしたんですか。 B: ねつが（　）んです。",
          "base_word_hiragana": "あります"
        },
        {
          "id": 18,
          "prompt": "2年勉強したから、日本語が（　）ようになりました。",
          "base_word": "話せます",
          "answers": [
            [
              "はなせる",
              "話せる",
              "はなせるように",
              "話せるように"
            ]
          ],
          "grammar_reference": "L3-2文31",
          "prompt_hiragana": "2ねん べんきょうしたから、にほんごが（　）ように なりました。",
          "base_word_hiragana": "はなせます"
        }
      ]
    },
    {
      "section_id": "問題3",
      "title": "形容詞、な形容詞、名詞",
      "skill": "adjectives_nouns",
      "instructions": "形容詞、な形容詞、名詞を書く文法の問題です。",
      "example": {
        "prompt": "これは（　）パンです。",
        "base_word": "おいしいです",
        "answers": [
          [
            "おいしい"
          ]
        ],
        "prompt_hiragana": "これは（　）パンです。"
      },
      "questions": [
        {
          "id": 1,
          "prompt": "田中さんはたぶん（　）と思います。",
          "base_word": "忙しいです",
          "answers": [
            [
              "いそがしい",
              "忙しい"
            ]
          ],
          "grammar_reference": "L1-2文4",
          "prompt_hiragana": "たなかさんは たぶん（　）と おもいます。",
          "base_word_hiragana": "いそがしいです"
        },
        {
          "id": 2,
          "prompt": "明日はたぶん（　）と思います。",
          "base_word": "暇です",
          "answers": [
            [
              "ひまだ",
              "暇だ"
            ]
          ],
          "grammar_reference": "L1-2文4",
          "prompt_hiragana": "あしたは たぶん（　）と おもいます。",
          "base_word_hiragana": "ひまです"
        },
        {
          "id": 3,
          "prompt": "漢字テストは（　）と思います。",
          "base_word": "明日です",
          "answers": [
            [
              "あしただ",
              "明日だ"
            ]
          ],
          "grammar_reference": "L1-2文4",
          "prompt_hiragana": "かんじテストは（　）と おもいます。",
          "base_word_hiragana": "あしたです"
        },
        {
          "id": 4,
          "prompt": "昨日は（　）から、掃除できませんでした。",
          "base_word": "忙しいです",
          "answers": [
            [
              "いそがしかった",
              "忙しかった"
            ]
          ],
          "grammar_reference": "L1-3文5",
          "prompt_hiragana": "きのうは（　）から、そうじできませんでした。",
          "base_word_hiragana": "いそがしいです"
        },
        {
          "id": 5,
          "prompt": "（　）から、このアプリをみんな使っています。",
          "base_word": "便利です",
          "answers": [
            [
              "べんりだ",
              "便利だ"
            ]
          ],
          "grammar_reference": "L1-3文5",
          "prompt_hiragana": "（　）から、この アプリを みんな つかっています。",
          "base_word_hiragana": "べんりです"
        },
        {
          "id": 6,
          "prompt": "昨日は（　）から、パーティーへ行けませんでした。",
          "base_word": "風邪です",
          "answers": [
            [
              "かぜだった",
              "風邪だった"
            ]
          ],
          "grammar_reference": "L1-3文5",
          "prompt_hiragana": "きのうは（　）から、パーティーへ いけませんでした。",
          "base_word_hiragana": "かぜです"
        },
        {
          "id": 7,
          "prompt": "昨日は（　）ので、プールへ行きました。",
          "base_word": "暑いです",
          "answers": [
            [
              "あつかった",
              "暑かった"
            ]
          ],
          "grammar_reference": "L1-3文6",
          "prompt_hiragana": "きのうは（　）ので、プールへ いきました。",
          "base_word_hiragana": "あついです"
        },
        {
          "id": 8,
          "prompt": "来週の日曜日、（　）ので、遊びませんか。",
          "base_word": "暇です",
          "answers": [
            [
              "ひまな",
              "暇な"
            ]
          ],
          "grammar_reference": "L1-3文6",
          "prompt_hiragana": "らいしゅうの にちようび、（　）ので、あそびませんか。",
          "base_word_hiragana": "ひまです"
        },
        {
          "id": 9,
          "prompt": "テストは（　）ので、今晩勉強します。",
          "base_word": "明日です",
          "answers": [
            [
              "あしたな",
              "明日な"
            ]
          ],
          "grammar_reference": "L1-3文6",
          "prompt_hiragana": "テストは（　）ので、こんばん べんきょうします。",
          "base_word_hiragana": "あしたです"
        },
        {
          "id": 10,
          "prompt": "（　）時、セーターを着ます。",
          "base_word": "寒いです",
          "answers": [
            [
              "さむい",
              "寒い"
            ]
          ],
          "grammar_reference": "L1-4文7",
          "prompt_hiragana": "（　）とき、セーターを きます。",
          "base_word_hiragana": "さむいです"
        },
        {
          "id": 11,
          "prompt": "（　）時、よく映画を見ます。",
          "base_word": "暇です",
          "answers": [
            [
              "ひまな",
              "暇な"
            ]
          ],
          "grammar_reference": "L1-4文7",
          "prompt_hiragana": "（　）とき、よく えいがを みます。",
          "base_word_hiragana": "ひまです"
        },
        {
          "id": 12,
          "prompt": "（　）時、英語を勉強しました。",
          "base_word": "中学生です",
          "answers": [
            [
              "ちゅうがくせいの",
              "中学生の"
            ]
          ],
          "grammar_reference": "L1-4文7",
          "prompt_hiragana": "（　）とき、えいごを べんきょうしました。",
          "base_word_hiragana": "ちゅうがくせいです"
        },
        {
          "id": 13,
          "prompt": "山田さんは（　）人です。",
          "base_word": "やさしいです+いいです",
          "answers": [
            [
              "やさしくていい",
              "優しくていい"
            ]
          ],
          "grammar_reference": "L2-1文12",
          "prompt_hiragana": "やまださんは（　）ひとです。",
          "base_word_hiragana": "やさしいです+いいです"
        },
        {
          "id": 14,
          "prompt": "新宿駅は（　）駅です。",
          "base_word": "おおきいです+にぎやかです",
          "answers": [
            [
              "おおきくてにぎやかな",
              "大きくてにぎやかな"
            ]
          ],
          "grammar_reference": "L2-1文12",
          "prompt_hiragana": "しんじゅくえきは（　）えきです。",
          "base_word_hiragana": "おおきいです+にぎやかです"
        },
        {
          "id": 15,
          "prompt": "（　）公園へ行きました。",
          "base_word": "きれいです+ひろいです",
          "answers": [
            [
              "きれいでひろい",
              "きれいで広い"
            ]
          ],
          "grammar_reference": "L2-1文12",
          "prompt_hiragana": "（　）こうえんへ いきました。",
          "base_word_hiragana": "きれいです+ひろいです"
        },
        {
          "id": 16,
          "prompt": "山本さんは（　）人です。",
          "base_word": "元気です+にぎやかです",
          "answers": [
            [
              "げんきでにぎやかな",
              "元気でにぎやかな"
            ]
          ],
          "grammar_reference": "L2-1文12",
          "prompt_hiragana": "やまもとさんは（　）ひとです。",
          "base_word_hiragana": "げんきです+にぎやかです"
        },
        {
          "id": 17,
          "prompt": "コーヒーと紅茶は（　）値段です。",
          "base_word": "同じです",
          "answers": [
            [
              "おなじ",
              "同じ"
            ]
          ],
          "grammar_reference": "L2-2文13",
          "prompt_hiragana": "コーヒーと こうちゃは（　）ねだんです。",
          "base_word_hiragana": "おなじです"
        },
        {
          "id": 18,
          "prompt": "先生と（　）ように話してください。",
          "base_word": "同じです",
          "answers": [
            [
              "おなじ",
              "同じ"
            ]
          ],
          "grammar_reference": "L2-2文13",
          "prompt_hiragana": "せんせいと（　）ように はなしてください。",
          "base_word_hiragana": "おなじです"
        },
        {
          "id": 19,
          "prompt": "明日は旅行に行くから、（　）起きます。",
          "base_word": "早いです",
          "answers": [
            [
              "はやく",
              "早く"
            ]
          ],
          "grammar_reference": "L3-3文32",
          "prompt_hiragana": "あしたは りょこうに いくから、（　）おきます。",
          "base_word_hiragana": "はやいです"
        },
        {
          "id": 20,
          "prompt": "私の町は不便でしたが、今は（　）なりました。",
          "base_word": "便利です",
          "answers": [
            [
              "べんりに",
              "便利に"
            ]
          ],
          "grammar_reference": "L3-2文31",
          "prompt_hiragana": "わたしの まちは ふべんでしたが、いまは（　）なりました。",
          "base_word_hiragana": "べんりです"
        },
        {
          "id": 21,
          "prompt": "見てください。このケーキは（　）そうですね。",
          "base_word": "おいしいです",
          "answers": [
            [
              "おいし"
            ]
          ],
          "grammar_reference": "L3-4文34",
          "prompt_hiragana": "みてください。この ケーキは（　）そうですね。",
          "base_word_hiragana": "おいしいです"
        },
        {
          "id": 22,
          "prompt": "昨日山田さんに会いました。とても（　）そうでした。",
          "base_word": "元気です",
          "answers": [
            [
              "げんき",
              "元気"
            ]
          ],
          "grammar_reference": "L3-4文34",
          "prompt_hiragana": "きのう やまださんに あいました。とても（　）そうでした。",
          "base_word_hiragana": "げんきです"
        },
        {
          "id": 23,
          "prompt": "（　）スープですね。",
          "base_word": "辛いです+そうです",
          "answers": [
            [
              "からそうな",
              "辛そうな"
            ]
          ],
          "grammar_reference": "L3-4文35",
          "prompt_hiragana": "（　）スープですね。",
          "base_word_hiragana": "からいです+そうです"
        },
        {
          "id": 24,
          "prompt": "（　）赤ちゃんですね。",
          "base_word": "元気です+そうです",
          "answers": [
            [
              "げんきそうな",
              "元気そうな"
            ]
          ],
          "grammar_reference": "L3-4文35",
          "prompt_hiragana": "（　）あかちゃんですね。",
          "base_word_hiragana": "げんきです+そうです"
        }
      ]
    }
  ]
};

export const totalExamQuestionCount: number = examQuiz.sections.reduce(
  (n, sec) => n + sec.questions.length,
  0
);

export const totalExamBlankCount: number = examQuiz.sections.reduce(
  (n, sec) => n + sec.questions.reduce((m, q) => m + q.answers.length, 0),
  0
);
