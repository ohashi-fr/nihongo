/**
 * Structured transcription of content/grammar/recap-japonais-L4-L5.html.
 *
 * Companion to the L1–L3 file (grammar-data.ts). Same shape and same
 * rules: all *framing* text (objectives, rules, attention points,
 * group/section titles, example glosses) is in English for the app UI.
 * Japanese content — example sentences, forms, and table entries — is
 * transcribed verbatim from the source and must never be altered,
 * paraphrased, or "improved". If in doubt about a Japanese string, check
 * recap-japonais-L4-L5.html.
 *
 * Numbering note: these are course lessons 文法38–61. To avoid colliding
 * with the L1–L3 file (which uses number 1–26), the `number` field here
 * continues the app's running order at 27. The real course lesson number
 * lives in `courseNumber` and in each `sidebarLabel`. Prefer `slug` for
 * any external linking — it is stable regardless of ordering.
 *
 * Inline markup used in string fields (parsed by
 * components/grammar/RichText.tsx):
 *
 *   **text**              → bold (<b>)
 *   __text__               → underline (<u>)
 *   {{nature:text}}        → word-nature pill (verbe/compteur/nom/adj/naadj)
 *   {{gloss:text}}         → small muted inline gloss
 *
 * A `rule` block's `lines` array is one entry per boxed formula.
 */

import type { Group, Notion, ChecklistSection } from "./grammar-data";

// ─────────────────────────────────────────────────────────────────
// GROUPS (course lessons 38–61)
// ─────────────────────────────────────────────────────────────────

export const groupsL4L5: Group[] = [
  {
    id: "g-keigo",
    jpTitle: "そんけいご",
    title: "Respectful keigo",
    notions: [
      {
        number: 27,
        courseNumber: 38,
        slug: "keigo-o-ni-naru",
        sidebarLabel: "Respectful keigo — o~ni naru",
        titleJp: "お ＋ どうし ＋ になる",
        titleKanji: "お動詞になる",
        objective:
          "Raise the subject by speaking of **their** actions with respect (honorific language).",
        exampleGloss: "“The teacher has gone home” (said deferentially).",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["お + {{verbe:-masu stem}} + に なります → おかえりに なります"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Drop ます from the stem: かえり**ます** → お + かえり + に なる.",
            "Marks respect toward **the subject** (the teacher, the customer) — never for talking about yourself.",
            "Some verbs have a special honorific form outside this pattern (e.g. いる → いらっしゃる, みる → ごらんになる).",
          ],
        },
        examples: [
          { jp: "せんせいは もう おかえりに なりました。" },
          { jp: "おたばこを おすいに なりますか。" },
          { jp: "せんせいが おまちに なって います。" },
        ],
      },
    ],
  },
  {
    id: "g-nakanaka",
    jpTitle: "なかなか〜ません",
    title: "It just won't happen",
    notions: [
      {
        number: 28,
        courseNumber: 39,
        slug: "nakanaka",
        sidebarLabel: "Won't happen despite effort",
        titleJp: "なかなか 〜ません",
        objective:
          "Say that an expected thing is **slow to happen** or **won't happen despite effort**.",
        exampleGloss: "“The bus just won't come (while I'm waiting).”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["なかなか + {{verbe:negative verb}} → なかなか きません"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Here なかなか is **almost always used with a negative**: “it won't come / it won't happen”.",
            "It implies waiting or effort: not just “no”, but “can't manage to…”.",
            "Often with Type 1 (intransitive) verbs: なかなか あきません (it won't open).",
          ],
        },
        examples: [
          { jp: "バスが なかなか きません。" },
          { jp: "かんじが なかなか おぼえられません。" },
          { jp: "ともだちに なかなか あえません。" },
        ],
      },
    ],
  },
  {
    id: "g-frequence",
    jpTitle: "ひんど",
    title: "Expressing frequency",
    notions: [
      {
        number: 29,
        courseNumber: 40,
        slug: "frequency",
        sidebarLabel: "Frequency — times per period",
        titleJp: "じすうし に じすうし",
        titleKanji: "時数詞に時数詞",
        objective: "Say how many times over a period (frequency).",
        exampleGloss: "“Once a month.” / “Five days a week.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{compteur:period}} に {{compteur:number of times}} → 1しゅうかん に 5かい"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Order: **the period first**, then the count → “X に Y” = “Y times per X”.",
            "The に is the key particle linking the two counters.",
          ],
        },
        examples: [
          { jp: "1にちに 3かい しょくじします。", gloss: "3 meals a day" },
          { jp: "1かげつに 1かい、ともだちと いっしょに しょくじします。" },
          { jp: "1しゅうかんに 5か、がっこうで べんきょうします。" },
        ],
      },
    ],
  },
  {
    id: "g-no",
    jpTitle: "の で なめいしか",
    title: "Nominalizing a verb",
    notions: [
      {
        number: 30,
        courseNumber: 41,
        slug: "nominalizer-no",
        sidebarLabel: "Turning a clause into a noun",
        titleJp: "どうし の を ／ どうし の が",
        titleKanji: "動詞のを / 動詞のが",
        objective:
          "Turn a whole clause into an “object block” with の, so it can sit inside another sentence.",
        exampleGloss:
          "“I'm waiting for the taxi to arrive.” / “I like watching children play.”",
        blocks: [
          {
            type: "sub",
            label: "Sub-point A — 〜のを (the block is the object)",
            blocks: [
              {
                type: "rule",
                lines: [
                  "[{{verbe:clause, short form}}] + の + **を** + verb (まっています, しっています, わすれました…)",
                ],
              },
            ],
          },
          {
            type: "sub",
            label: "Sub-point B — 〜のが (the block is the subject)",
            blocks: [
              {
                type: "rule",
                lines: [
                  "[{{verbe:clause, short form}}] + の + **が** + verb (みえます, すきです, きこえます…)",
                ],
              },
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "の turns a whole clause into a **noun** you can manipulate.",
            "の**を** before verbs that take an object (wait, forget, know) ; の**が** before verbs of perception / preference (see, hear, like).",
            "The inner verb stays in **short form**: くる の / あそんでいる の.",
          ],
        },
        examples: [
          { jp: "タクシーが くるのを まって います。", gloss: "I'm waiting for the taxi to come" },
          { jp: "ともだちに でんわするのを わすれました。", gloss: "I forgot to call" },
          { jp: "らいしゅう、しけんが あるのを しって いますか。" },
          { jp: "まどから こどもが あそんでいるのが みえます。", gloss: "I can see the children playing" },
          { jp: "スポーツを みるのが すきです。" },
        ],
      },
    ],
  },
  {
    id: "g-gimon",
    jpTitle: "ぎもんし ＋ か／も／のか",
    title: "Indefinite question words",
    notions: [
      {
        number: 31,
        courseNumber: 42,
        slug: "question-word-ka-mo-noka",
        sidebarLabel: "Someone / no one / not sure",
        titleJp: "ぎもんし ＋ か ／ も ／ のか",
        objective:
          "Use a question word (だれ, どこ, なに, いつ) not to ask, but to mean “someone / no one / (I don't know) who”.",
        exampleGloss: "“Did you go somewhere?” / “I saw no one.”",
        blocks: [
          {
            type: "sub",
            label: "42 · question word + か → “some… / a certain…” (positive indefinite)",
            blocks: [
              {
                type: "rule",
                lines: [
                  "どこ**か** (somewhere) · だれ**か** (someone) · なに**か** (something) · いつ**か** (someday)",
                ],
              },
            ],
          },
          {
            type: "sub",
            label: "43 · question word + も + 〜ない → “no…” (total negative)",
            blocks: [
              {
                type: "rule",
                lines: [
                  "だれ**も** いません (no one) · どこ**へも** いきません (nowhere) · なに**も** たべません (nothing)",
                ],
              },
            ],
          },
          {
            type: "sub",
            label: "46 · question word + 〜のか → a question embedded in a sentence",
            blocks: [
              {
                type: "rule",
                lines: [
                  "[clause with a question word, {{verbe:short form}}] + **のか** + verb (しっています, おしえてください, わかりません…)",
                ],
              },
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "**か** = there is something/someone (positive). **も + negative** = there is nothing/no one (negative).",
            "**か / も** act on a single **word**, but **のか** embeds a whole **clause** — it's not just a longer か.",
            "With も, you often insert the place/direction particle: どこ**へも**、だれ**にも**.",
            "46: 〜のか embeds a question (“know / ask / explain __when/who/where__…”). Noun/na-adj take **な** before のか: ひま**な**のか、なんじ**な**のか.",
          ],
        },
        examples: [
          { jp: "しゅうまつ、どこか いきましたか。→ ええ、いきました。", gloss: "42 · somewhere" },
          { jp: "けさ、なにか たべましたか。→ ええ、パンを たべました。", gloss: "42" },
          { jp: "きょうしつに だれか いますか。→ いいえ、だれも いません。", gloss: "43 · no one" },
          { jp: "ねぼうしたので、けさは なにも たべて きませんでした。", gloss: "43 · nothing" },
          { jp: "きのうは だれにも あいませんでした。", gloss: "43 · no one (with に)" },
          { jp: "きんさんは いつ テストが あるのか しって いますか。", gloss: "46 · know when" },
          { jp: "いつ ひまなのか おしえて ください。", gloss: "46 · な before のか" },
          { jp: "ひこうきは なんじなのか、ききましたか。", gloss: "46" },
        ],
      },
    ],
  },
  {
    id: "g-mou2",
    jpTitle: "もう ／ まだ ②",
    title: "Already / not yet — deeper",
    notions: [
      {
        number: 32,
        courseNumber: 44,
        slug: "mou-mada-2",
        sidebarLabel: "Not yet / no longer",
        titleJp: "もう ／ まだ ②",
        objective:
          "Answer “is it already done?” or “is it still the case?” — and especially the flip when you answer in the negative.",
        exampleGloss:
          "“Have you decided yet? — No, not yet.” / “Any left? — No, none left.”",
        blocks: [
          {
            type: "sub",
            label: "① Question with もう (“already?”)",
            blocks: [
              {
                type: "rule",
                lines: [
                  "Q: もう 〜ましたか → A+: ええ、もう 〜ました · A−: いいえ、**まだ** 〜ていません",
                ],
              },
            ],
          },
          {
            type: "sub",
            label: "② Question with まだ (“still?”)",
            blocks: [
              {
                type: "rule",
                lines: [
                  "Q: まだ 〜ていますか → A+: ええ、まだ 〜ています · A−: いいえ、**もう** 〜ていません／〜ません",
                ],
              },
            ],
          },
        ],
        attention: {
          label: "Watch out — the flip",
          items: [
            "Question with **もう** → negative answer with **まだ〜ていません** (“not done yet”).",
            "Question with **まだ** → negative answer with **もう〜ていません** (“no longer the case / none left”).",
            "This is where the “none left” meaning appears: もう のって いません、もう いません、もう ありません.",
          ],
        },
        examples: [
          { jp: "もう プレゼントを きめましたか。→ いいえ、まだ きめて いないんです。", gloss: "not decided yet" },
          { jp: "きのう もらった おかしは、まだ のって いますか。→ いいえ、もう のって いません。", gloss: "none left" },
          { jp: "きょうしつに まだ がくせいが いますか。→ いいえ、もう いません。かえりましたよ。" },
          { jp: "ごごは はれると いって いましたが、まだ あめが ふって いますよ。", gloss: "まだ = still ongoing" },
        ],
      },
    ],
  },
  {
    id: "g-kadouka",
    jpTitle: "〜かどうか",
    title: "Whether or not",
    notions: [
      {
        number: 33,
        courseNumber: 45,
        slug: "kadouka",
        sidebarLabel: "Whether or not",
        titleJp: "ぶんまつひょうげん「〜かどうか」",
        titleKanji: "文末表現③",
        objective: "Embed a yes/no question (“whether or not…”) inside a sentence.",
        exampleGloss: "“I don't know whether the answer is right.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "[{{verbe:short form}}] + **かどうか** + verb (わかりません, ききました, しりません…)",
            ],
          },
          {
            type: "table",
            headers: ["Before かどうか", "Form"],
            rows: [
              ["{{verbe:Verb}} / {{adj:i-adj}}", "short form as is → いる / ただしい"],
              ["{{naadj:na-adj}} / {{nom:noun}}", "without だ → ひま / がくせい (or じゃない / だった…)"],
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "〜かどうか = “whether __or not__”: a single uncertain thing (≠ 〜か〜か, which compares two named options).",
            "{{naadj:na-adj}} and {{nom:noun}} drop だ before かどうか.",
          ],
        },
        examples: [
          { jp: "やまださんが まだ きょうしつに いるかどうか、みて きましょう。" },
          { jp: "こたえが あって いるかどうか ききました。" },
          { jp: "らいしゅうの きんようび、テストが あるかどうか わかりません。" },
        ],
      },
    ],
  },
  {
    id: "g-avec",
    jpTitle: "〜で ＋ どうし",
    title: "Doing an action with / by oneself",
    notions: [
      {
        number: 34,
        courseNumber: 47,
        slug: "with-de",
        sidebarLabel: "Alone vs. with others",
        titleJp: "ひとりで / かぞくで / じぶんで ＋ どうし",
        objective:
          "Specify how many people, or alone, you do the action with.",
        exampleGloss: "“I live alone.” / “I did it all myself.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{compteur:number of people}} / かぞく / みんな / じぶん + **で** + {{verbe:verb}}",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "で = “with … (people)” or “by oneself”: ひとり**で** (alone), ふたり**で** (as a pair), じぶん**で** (oneself).",
            "Don't confuse it with the で of place or means.",
          ],
        },
        examples: [
          { jp: "1ねんに 1かい、かぞくで りょこうします。" },
          { jp: "いま、マンションに ひとりで すんで います。" },
          { jp: "なつやすみに みんなで りょこうへ いきませんか。" },
          { jp: "この りょうりは ぜんぶ じぶんで つくりました。" },
        ],
      },
    ],
  },
  {
    id: "g-soshite",
    jpTitle: "そして",
    title: "And / and then",
    notions: [
      {
        number: 35,
        courseNumber: 48,
        slug: "soshite",
        sidebarLabel: "Linking two sentences",
        titleJp: "せつぞくし「そして」",
        titleKanji: "接続詞",
        objective:
          "Link two sentences: add information (“and also”) or a following action (“and then”).",
        exampleGloss: "“It's near the station, and on top of that the rent is low.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["Sentence 1**。** **そして**、 Sentence 2**。**"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Two uses: **①** addition (“and also”: two qualities, two people) · **②** sequence (“and then”: two actions).",
            "そして links two full sentences (≠ て, which links within one sentence).",
          ],
        },
        examples: [
          { jp: "きょうだいは あにと あね、そして いもうとが います。", gloss: "① addition" },
          { jp: "へやは えきから ちかくて べんりで、そして やちんが やすい ところが いいです。", gloss: "①" },
          { jp: "きのうは ともだちと しぶやで あいました。そして えいがを みました。", gloss: "② sequence" },
          { jp: "まず、カードを いれて ください。そして、きんがくに タッチして、おかねを いれて ください。", gloss: "②" },
        ],
      },
    ],
  },
  {
    id: "g-tomo",
    jpTitle: "じすうし ＋ とも",
    title: "All of them (small number)",
    notions: [
      {
        number: 36,
        courseNumber: 49,
        slug: "tomo-all",
        sidebarLabel: "All of a small, counted group",
        titleJp: "じすうし ＋ とも",
        titleKanji: "時数詞＋とも",
        objective:
          "Say “both / all three”, the whole of a small counted group.",
        exampleGloss: "“They're both students.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{compteur:counter for people / objects}} + **とも** → ふたり**とも**、さんさつ**とも**",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "とも = “all N without exception” (for a small, specific number).",
            "Attaches to the counter matching the items: people (ふたりとも), books (さんさつとも), objects…",
          ],
        },
        examples: [
          { jp: "あにが ふたり います。ふたりとも だいがくせいです。" },
          { jp: "つくえの うえに ある ほんは、さんさつとも えいごの ほんです。" },
        ],
      },
    ],
  },
  {
    id: "g-hoshii",
    jpTitle: "ほしい",
    title: "Wanting (an object)",
    notions: [
      {
        number: 37,
        courseNumber: 50,
        slug: "hoshii",
        sidebarLabel: "Wanting an object",
        titleJp: "ほしい",
        objective:
          "Express desire for an **object** (≠ 〜たい, which expresses desire to do an action).",
        exampleGloss: "“I want a new bag.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["わたしは {{nom:object}} **が** ほしいです"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "The desired object takes **が**, not を: かばん**が** ほしいです.",
            "ほしい conjugates like an {{adj:i-adj}} (ほしくない, ほしかった).",
            "Object → **ほしい** · action → **〜たい**: あたらしい かばん**が ほしい** vs すし**が たべたい** (never ほしい for an action).",
            "To talk about **someone else's** wish, add そう / と いっています: ほしい**そうです** (I hear they want it).",
          ],
        },
        examples: [
          { jp: "あたらしい かばんが ほしいです。" },
          { jp: "にほんじんの ともだちが ほしいです。" },
          { jp: "ともだちと あう じかんが ほしいです。" },
          { jp: "たなかさんは カメラが ほしいそうです。", gloss: "someone else's wish" },
        ],
      },
    ],
  },
  {
    id: "g-favors",
    jpTitle: "やりもらい",
    title: "Give, receive & favours",
    notions: [
      {
        number: 39,
        courseNumber: 51,
        slug: "giving-receiving-objects",
        sidebarLabel: "Give & receive — ageru / morau / kureru",
        titleJp: "あげる ／ もらう ／ くれる",
        objective:
          "Give and receive things — the base giving-and-receiving verbs (notion 52 adds the て-form for favours).",
        exampleGloss: "“I gave my friend chocolate” / “my teacher gave me a book.”",
        blocks: [
          {
            type: "sub",
            label: "Sub-point A — あげる: I give (outward)",
            blocks: [
              {
                type: "rule",
                lines: [
                  "[giver] は [receiver] に [object] を **あげます** → give outward (me / in-group → others)",
                  "polite up: + **さしあげます** (to a superior) · down: + **やります** (juniors, plants, pets)",
                ],
              },
            ],
          },
          {
            type: "sub",
            label: "Sub-point B — もらう: I receive",
            blocks: [
              {
                type: "rule",
                lines: [
                  "[receiver] は [giver] に [object] を **もらいます** → receive (に or から for the source)",
                  "humble: + **いただきます** (from a superior)",
                ],
              },
            ],
          },
          {
            type: "sub",
            label: "Sub-point C — くれる: someone gives to me",
            blocks: [
              {
                type: "rule",
                lines: [
                  "[giver] が （わたしに） [object] を **くれます** → given toward me / my in-group",
                  "honorific: + **くださいます** (from a superior)",
                ],
              },
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "**あげる** vs **くれる**: both mean “give”, but くれる only when the receiver is **me / my in-group**: ちちが とけいを **くれました**。",
            "Particles: あげる → recipient に · もらう → source に or から · くれる → giver **が**.",
            "Status forms: **さしあげる / いただく / くださる** (up) · **やる** (down, incl. plants & pets).",
          ],
        },
        examples: [
          { jp: "わたしは ともだちに チョコレートを あげました。", gloss: "ageru — I gave" },
          { jp: "せんせいに おみやげを さしあげました。", gloss: "sashiageru (up)" },
          { jp: "たんじょうびに ともだちに プレゼントを もらいました。", gloss: "morau — I received" },
          { jp: "せんせいに ほんを いただきました。", gloss: "itadaku (up)" },
          { jp: "ちちが わたしに とけいを くれました。", gloss: "kureru — given to me" },
          { jp: "せんせいが わたしに じしょを くださいました。", gloss: "kudasaru (honorific)" },
        ],
      },
      {
        number: 40,
        courseNumber: 52,
        slug: "favors-te-verbs",
        sidebarLabel: "Favors — te-ageru / te-morau / te-kureru",
        titleJp: "〜てあげる ／ 〜てもらう ／ 〜てくれる",
        objective:
          "Talk about doing something for someone, or having something done for you — the て-form of the giving-and-receiving verbs.",
        exampleGloss: "“I helped my friend” / “the teacher fixed it for me.”",
        blocks: [
          {
            type: "sub",
            label: "Sub-point A — 〜てあげる: you do it for someone else",
            blocks: [
              {
                type: "rule",
                lines: [
                  "[giver] は [receiver] に [object] を {{verbe:V-te}} + **あげます** → a favour outward",
                  "polite up: + **さしあげます** (to a superior) · down: + **やります** (juniors, plants, pets)",
                ],
              },
            ],
          },
          {
            type: "sub",
            label: "Sub-point B — 〜てもらう: you receive the favour",
            blocks: [
              {
                type: "rule",
                lines: [
                  "[receiver] は [giver] に {{verbe:V-te}} + **もらいます** → receive a favour",
                  "humble: + **いただきます** (from a superior)",
                ],
              },
            ],
          },
          {
            type: "sub",
            label: "Sub-point C — 〜てくれる: someone does it for you",
            blocks: [
              {
                type: "rule",
                lines: [
                  "[giver] が （わたしに） {{verbe:V-te}} + **くれます** → a favour toward me / my in-group",
                  "honorific: + **くださいます** (from a superior)",
                ],
              },
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Direction is everything: **あげる** = I do it for someone else · **くれる** = someone does it for me.",
            "Status forms: **さしあげる / いただく / くださる** for people above you; **やる** for juniors, plants, animals.",
            "With くれる the giver takes **が**, and わたしに is usually dropped: せんせい**が** おしえて くれました。",
            "〜てあげる can sound patronising toward a superior — prefer 〜てさしあげる or rephrase.",
          ],
        },
        examples: [
          { jp: "わたしは ともだちに りょうりを つくって あげました。", gloss: "ageru — did it for a friend" },
          { jp: "こどもの とき、よく おとうとに べんきょうを おしえて あげました。", gloss: "ageru" },
          { jp: "せんせいに さくぶんを なおして いただきました。", gloss: "itadaku — received the favour" },
          { jp: "ともだちに やすくて おいしい レストランを おしえて もらいました。", gloss: "morau" },
          { jp: "ははが この ワンピースを つくって くれました。", gloss: "kureru — done for me" },
          { jp: "せんせいが たいしかんの でんわばんごうを しらべて くださいました。", gloss: "kudasaru (honorific)" },
        ],
      },
      {
        number: 41,
        courseNumber: 54,
        slug: "requests-te-moraemasenka",
        sidebarLabel: "Polite requests — te-moraemasen ka",
        titleJp: "〜て もらえませんか",
        objective: "Ask someone to do something for you, from casual to very polite.",
        exampleGloss: "“Could you help me for a moment?”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{verbe:V-te}} + **もらえませんか / いただけませんか** → could you (do me the favour of) …?",
              "{{verbe:V-te}} + **くれませんか / くださいませんか** → won't you …?",
            ],
          },
          {
            type: "paragraph",
            text:
              "Rising politeness: 〜て**くれませんか** → 〜て**もらえませんか** → 〜て**いただけませんか** (most polite). Casual: 〜て**くれない** / 〜て**もらえない**.",
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "もらえる / いただける are **potential** forms (“can I receive”) → softer and more polite than plain くれる.",
            "Build the て-form first, then add the ending.",
          ],
        },
        examples: [
          { jp: "すみませんが、ちょっと てつだって もらえませんか。→ ええ、いいですよ。", gloss: "polite" },
          { jp: "せんせい、さくぶんを かいたので、みて いただけませんか。→ ええ、いいですよ。", gloss: "most polite" },
          { jp: "そこの ほん、とって もらえない。→ これ？", gloss: "casual" },
          { jp: "ちょっと、ぎゅうにゅう かってきて くれない。→ いいよ。", gloss: "casual" },
        ],
      },
    ],
  },
  {
    id: "g-method",
    jpTitle: "やり方",
    title: "Explaining how to do something",
    notions: [
      {
        number: 42,
        courseNumber: 53,
        slug: "verb-kata",
        sidebarLabel: "How to do something — kata",
        titleJp: "どうし ＋ 方（かた）",
        titleKanji: "動詞ます＋方",
        objective: "Turn a verb into “the way of doing it” — how to do something.",
        exampleGloss: "“Do you know how to use this?”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{verbe:V -masu stem}} + **かた（方）** → つかいます → つかい**かた** {{gloss:how to use}}",
              "{{nom:する-noun}} → 〜**の しかた** → べんきょう**の しかた** {{gloss:how to study}}",
              "{{nom:place}} へ **の** いきかた（行き方） {{gloss:the way to a place}}",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Drop ます, add かた: よみ**ます** → よみ**かた**.",
            "する-nouns take **の**: べんきょう**の しかた** (not べんきょうかた).",
            "方 is read **かた** here, not ほう.",
          ],
        },
        examples: [
          { jp: "コピーきの つかいかたを しって いますか。", gloss: "how to use" },
          { jp: "ともだちに かんじの べんきょうの しかたを おしえて ください。" },
          { jp: "えきへの いきかたが わかりません。", gloss: "the way to the station" },
          { jp: "この ゲーム、おもしろそうだね。やりかた、おしえて。", gloss: "casual" },
        ],
      },
    ],
  },
  {
    id: "g-volition",
    jpTitle: "いこう・つもり",
    title: "Volition, intention & plans",
    notions: [
      {
        number: 43,
        courseNumber: 55,
        slug: "volitional-form",
        sidebarLabel: "Volitional form — let's / I intend to",
        titleJp: "いこうけい",
        titleKanji: "意向形",
        objective:
          "Build the volitional form and use it to invite (“let's”) or to state an intention (“I'm thinking of…”).",
        exampleGloss: "“What shall we eat?” / “I'm thinking of going home.”",
        blocks: [
          {
            type: "table",
            label: "Rule — building the volitional (意向形)",
            headers: ["Group", "Rule", "Example"],
            rows: [
              ["**I** (う-verbs)", "final -u → -o + **う**", "かく → か**こう** · かえる → かえ**ろう**"],
              ["**II** (る-verbs)", "drop る + **よう**", "たべる → たべ**よう** · みる → み**よう**"],
              ["**III** (irregular)", "—", "くる → **こよう** · する → **しよう**"],
            ],
          },
          {
            type: "sub",
            label: "Sub-point A — casual invitation (short 〜ましょう)",
            blocks: [
              {
                type: "rule",
                lines: [
                  "{{verbe:volitional}} + **か** → なにを たべ**ようか** {{gloss:what shall we eat?}}",
                  "casual 〜**ない？** also invites → いっしょに いか**ない？** {{gloss:shall we go?}}",
                ],
              },
            ],
          },
          {
            type: "sub",
            label: "Sub-point B — stating your intention",
            blocks: [
              {
                type: "rule",
                lines: ["{{verbe:volitional}} + **と おもっています** → …しようと おもっています {{gloss:I'm thinking of…}}"],
              },
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "**Intention** = volitional + とおもう (かえ**ろう**と おもいます) · **supposition** = short form + とおもう (かえ**る**と おもいます, notion 3). Don't mix them.",
            "つもり (notion 57) is a firmer, settled plan; 〜ようとおもう is a softer intention.",
          ],
        },
        examples: [
          { jp: "ごはん、たべに いかない？ → うん、いいよ。", gloss: "casual invite" },
          { jp: "なにを たべようか。 → そうだね、ピザは どう？", gloss: "volitional question" },
          { jp: "なつやすみに くにへ かえろうと おもいます。", gloss: "intention" },
          { jp: "ははの たんじょうびに スカーフを あげようと おもっています。", gloss: "intention" },
          { jp: "あしたは あめが ふると おもいます。", gloss: "supposition (short form)" },
        ],
      },
      {
        number: 44,
        courseNumber: 57,
        slug: "intention-tsumori",
        sidebarLabel: "Intentions & plans — tsumori",
        titleJp: "〜つもり",
        objective: "State a firm intention or plan.",
        exampleGloss: "“I plan to go skiing in Hokkaido.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{verbe:V dictionary form}} + **つもりです** → intend to",
              "{{verbe:V ない-form}} + **つもりです** → intend not to",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Dictionary form for the positive, **ない**-form for the negative: かえ**らない** つもりです。",
            "つもり = a **settled, premeditated** plan — firmer than 〜ようとおもう (notion 55).",
          ],
        },
        examples: [
          { jp: "ことしの ふゆは ほっかいどうへ スキーに いく つもりです。" },
          { jp: "らいねん そつぎょうしますが、くにへは かえらない つもりです。", gloss: "negative intention" },
          { jp: "リーさんは、あしたから きょうとへ いく つもりだそうです。", gloss: "reported plan" },
        ],
      },
    ],
  },
  {
    id: "g-conditional",
    jpTitle: "じょうけん「たら」",
    title: "Conditionals",
    notions: [
      {
        number: 45,
        courseNumber: 56,
        slug: "conditional-tara",
        sidebarLabel: "Conditional — tara",
        titleJp: "〜たら",
        objective: "Say “if” or “once” — a conditional built on the plain-past form.",
        exampleGloss: "“Once I graduate, …” / “If you don't understand, ask.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "[V / adj / noun in **plain past** (た・かった・だった)] + **ら**",
              "たべる → たべ**たら** · たかい → たかかっ**たら** · ひま → ひまだっ**たら** · あめ → あめだっ**たら**",
            ],
          },
          {
            type: "sub",
            label: "Sub-point A — AたらB: once A, then B",
            blocks: [
              { type: "rule", lines: ["A**たら**、B → B happens once A is done (sequence)"] },
            ],
          },
          {
            type: "sub",
            label: "Sub-point B — (もし) 〜たら: a hypothetical “if”",
            blocks: [
              { type: "rule", lines: ["**もし** A**たら**、B → if A were to happen, B"] },
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Always the **plain past** + ら (た / かった / だった).",
            "**もし** at the front flags a hypothetical / unlikely condition.",
          ],
        },
        examples: [
          { jp: "だいがくを そつぎょうしたら、にほんの かいしゃに はいりたいと おもいます。", gloss: "once I graduate" },
          { jp: "ほんを よんだら、かして くれませんか。", gloss: "once you've read it" },
          { jp: "この ドラマが おわったら、しゅくだいを するよ。", gloss: "once it ends" },
          { jp: "わからなかったら、きいて ください。", gloss: "if…" },
          { jp: "もし タイムマシーンが あったら、どの じだいに いって みたいですか。", gloss: "hypothetical" },
        ],
      },
    ],
  },
  {
    id: "g-actions2",
    jpTitle: "こうどうの かたち",
    title: "Structuring actions",
    notions: [
      {
        number: 46,
        courseNumber: 58,
        slug: "listing-tari",
        sidebarLabel: "Listing actions — tari tari",
        titleJp: "〜たり 〜たり 〜",
        objective: "List a few representative actions — “do things like X and Y”.",
        exampleGloss: "“On my days off I watch TV, listen to music, and so on.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{verbe:V た-form}} + **り**、 {{verbe:V た-form}} + **り** します"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Built on the **た-form** (かく → かい**たり**); the sentence closes with **する** in the right tense.",
            "A **non-exhaustive** list — “things like X and Y” (≠ て, which lists actions in strict order).",
            "Can also show alternating / repeated states: ついたり きえたり (on and off).",
          ],
        },
        examples: [
          { jp: "やすみの ひは テレビを みたり、おんがくを きいたり して います。", gloss: "things like…" },
          { jp: "じゅぎょうちゅうは たべたり のんだり しないで ください。" },
          { jp: "でんきが ついたり きえたり して いるから、でんきゅうを とりかえましょう。", gloss: "on and off" },
          { jp: "チャンさんは さくぶんを かいたり けしたり して、なんども なおして います。" },
        ],
      },
      {
        number: 47,
        courseNumber: 60,
        slug: "sequence-te-kara",
        sidebarLabel: "After doing — te kara",
        titleJp: "〜てから",
        objective: "Do the second action only after the first one is finished (“after ~ing”).",
        exampleGloss: "“After I finish shopping, I'll go home.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{verbe:V-te}} + **から**、[next action] → after doing X, …"],
          },
          {
            type: "paragraph",
            text:
              "A different から from the reason **から** (notion 4): here it follows the **て-form** and marks a time sequence; the reason から follows a plain / polite clause and means “because”.",
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "〜てから = strictly **after** the first action finishes — order matters more than a plain て.",
            "Don't confuse with reason から: りょこうする**から** (because) vs りょこうし**てから** (after travelling).",
          ],
        },
        examples: [
          { jp: "きょうは かいものしてから、いえへ かえります。", gloss: "after shopping" },
          { jp: "じゅぎょうが おわってから、しょくじ しませんか。" },
          { jp: "いつも にっきを かいてから、ねます。" },
          { jp: "おゆが わいてから、やさいを いれて ください。", gloss: "after it boils" },
        ],
      },
      {
        number: 48,
        courseNumber: 61,
        slug: "start-hajimeru",
        sidebarLabel: "Starting an action — hajimeru",
        titleJp: "〜はじめる",
        titleKanji: "〜始める",
        objective: "Say that an action starts — verb stem + 始める.",
        exampleGloss: "“It started to rain.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{verbe:V -masu stem}} + **はじめます（始める）** → start doing"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Built on the **ますstem**: ふり**ます** → ふり**はじめます** · よみ**ます** → よみ**はじめます**.",
            "Pairs with 〜おわる (finish doing).",
          ],
        },
        examples: [
          { jp: "あめが ふりはじめました。", gloss: "it started to rain" },
          { jp: "きょねんから にほんごを べんきょうしはじめました。" },
          { jp: "3さいから ピアノを ならいはじめました。" },
        ],
      },
    ],
  },
  {
    id: "g-decided",
    jpTitle: "きまる",
    title: "Something gets decided",
    notions: [
      {
        number: 49,
        courseNumber: 59,
        slug: "decided-koto-ni-naru",
        sidebarLabel: "It's been decided — koto ni naru",
        titleJp: "〜ことになる",
        objective:
          "Say that something has been decided — by circumstances rather than by your own choice.",
        exampleGloss: "“It's been decided I'll go to Kobe next month.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{verbe:V dictionary form}} + **ことに なりました** → it has been decided that …"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "ことに**なる** = decided by circumstances / others ↔ ことに**する** = you decide it yourself (notion 26).",
            "Often used for your own choices too, to sound softer / more modest.",
          ],
        },
        examples: [
          { jp: "らいげつ こうべへ しゅっちょうする ことに なりました。", gloss: "it's been decided" },
          { jp: "タンさんが きこくするので、そうべつかいを する ことに なりました。" },
          { jp: "ともだちの けっこんしきで、うたを うたう ことに なりました。" },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// CHECKLIST (L4/L5)
// ─────────────────────────────────────────────────────────────────

export const checklistL4L5: ChecklistSection = {
  id: "checklist",
  title: "✅ Quick checklist — L4/L5",
  sidebarLabel: "✅ Quick checklist (L4/L5)",
  items: [
    "**お〜になる**: respect toward the subject (teacher, customer), never for yourself.",
    "**なかなか** goes with a **negative**: “can't manage to / slow to”.",
    "Frequency: **period に count** (1しゅうかんに 5か).",
    "Nominalizing: の**を** (object: wait, forget) / の**が** (perception: see, like).",
    "Question word + **か** (someone) ↔ + **も + negative** (no one) ↔ + **のか** (embedded question).",
    "**もう/まだ ②**: question with もう → answer まだ〜ていません · question with まだ → answer **もう〜ていません** (“none left”).",
    "**〜かどうか** = “whether or not” · {{naadj:na-adj}}/{{nom:noun}} drop だ before it.",
    "**で** = with N people / by oneself (ひとりで, じぶんで) — not the で of place.",
    "**そして** links two sentences (addition or sequence).",
    "**とも** = all N (ふたりとも), attached to the counter.",
    "**ほしい**: object in **が**, conjugates like an {{adj:i-adj}} · desire to act = 〜たい.",
    "Giving: **あげる** (moves away from me) / **もらう** (I receive) / **くれる** (comes toward me). “My brother gives to me” = **くれる**, never あげる.",
    "Politeness of giving: さしあげる・いただく・くださる (toward a superior) · やる (toward an inferior).",
    "**やりもらい**: **あげる** (me → others) · **もらう** (I receive) · **くれる** (others → me). Add て for the favour version.",
    "Keigo of やりもらい: **さしあげる / いただく / くださる** (up) · **やる** (down, plants & pets).",
    "Requests rise: 〜て**くれませんか** → 〜て**もらえませんか** → 〜て**いただけませんか**.",
    "**かた（方）**: どうします+かた (how to) · する-noun + **の しかた** · ばしょへの **いきかた**.",
    "**意向形** + か = let's · + **とおもう** = intention ↔ short form + とおもう = supposition (notion 3).",
    "**つもり** = settled plan (dict / **ない**-form) ↔ 〜ようとおもう = softer intention.",
    "**〜たら** = plain past (た / かった / だった) + ら · **もし** flags a hypothetical.",
    "**〜たり〜たり する** = a few example actions (non-exhaustive), on the た-form.",
    "**〜てから** (after ~ing, sequence) ↔ reason **〜から** (because).",
    "**ことになる** (decided for you) ↔ **ことにする** (you decide, notion 26).",
    "**〜はじめる** (start doing) = ますstem + 始める.",
  ],
};

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

export const allNotionsL4L5: Notion[] = groupsL4L5.flatMap((g) => g.notions);

/** Look up by the app's global running number (27–49). */
export function getNotionByNumberL4L5(n: number): Notion | undefined {
  return allNotionsL4L5.find((notion) => notion.number === n);
}

/** Look up by the real course lesson number (38–61). */
export function getNotionByCourseNumber(n: number): Notion | undefined {
  return allNotionsL4L5.find((notion) => notion.courseNumber === n);
}

// Some course lessons are folded into a single grouped notion here, so a
// finer-grained key still resolves to the notion that covers it. Mirrors
// the alias approach in the L1–L3 file.
const NOTION_SLUG_ALIASES_L4L5: Record<string, string> = {
  // lessons 42 / 43 / 46 are combined into one notion
  "question-word-ka": "question-word-ka-mo-noka",
  "question-word-mo": "question-word-ka-mo-noka",
  "question-word-noka": "question-word-ka-mo-noka",
  // the three giving/receiving directions live in one notion
  ageru: "giving-receiving-objects",
  morau: "giving-receiving-objects",
  kureru: "giving-receiving-objects",
};

export function getNotionBySlugL4L5(slug: string): Notion | undefined {
  const resolved = NOTION_SLUG_ALIASES_L4L5[slug] ?? slug;
  return allNotionsL4L5.find((notion) => notion.slug === resolved);
}

export const totalGroupCountL4L5 = groupsL4L5.length;
export const totalNotionCountL4L5 = allNotionsL4L5.length;
