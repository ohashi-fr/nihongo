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
 * Numbering note: these are course lessons 文法38–51. To avoid colliding
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
// GROUPS (course lessons 38–51)
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
    id: "g-don",
    jpTitle: "じゅじゅの どうし",
    title: "Giving & receiving verbs",
    notions: [
      {
        number: 38,
        courseNumber: 51,
        slug: "giving-receiving",
        sidebarLabel: "Giving and receiving verbs",
        titleJp: "あげる / もらう / くれる",
        titleKanji: "授受の動詞",
        objective:
          "Say who gives to whom — the verb changes with **the direction of the gift** and **the level of politeness**.",
        exampleGloss:
          "“I gave a souvenir to a friend.” / “A friend gave me a sweater.”",
        blocks: [
          {
            type: "sub",
            label: "① あげる — I/someone give to someone (the gift moves outward)",
            blocks: [
              {
                type: "rule",
                lines: ["{{nom:giver}} は {{nom:receiver}} に {{nom:object}} を あげます"],
              },
              {
                type: "table",
                headers: ["Verb", "Register"],
                rows: [
                  ["やる", "toward an inferior (animal, plant, child)"],
                  ["あげる", "neutral / between equals"],
                  ["さしあげる", "polite, toward a superior (客, せんせい)"],
                ],
              },
            ],
          },
          {
            type: "sub",
            label: "② もらう — I/someone receive from someone (the gift comes toward me)",
            blocks: [
              {
                type: "rule",
                lines: ["{{nom:receiver}} は {{nom:giver}} に {{nom:object}} を もらいます"],
              },
              {
                type: "table",
                headers: ["Verb", "Register"],
                rows: [
                  ["もらう", "neutral"],
                  ["いただく", "polite, when receiving from a superior"],
                ],
              },
            ],
          },
          {
            type: "sub",
            label: "③ くれる — someone gives to me (or to my group)",
            blocks: [
              {
                type: "rule",
                lines: ["{{nom:giver}} は （わたし）に {{nom:object}} を くれます"],
              },
              {
                type: "table",
                headers: ["Verb", "Register"],
                rows: [
                  ["くれる", "neutral — the receiver is me / my group"],
                  ["くださる", "polite, when a superior gives to me"],
                ],
              },
            ],
          },
        ],
        attention: {
          label: "Watch out — the key logic",
          items: [
            "**あげる** = the gift moves away from me · **もらう** = I receive (whatever the direction, I'm the receiver) · **くれる** = the gift comes __toward me/my group__ (the subject is the giver).",
            "あげる ↔ くれる difference: “I give to my brother” = あげる, but “my brother gives to me” = **くれる** (never あげる).",
            "Politeness by social position: go up (さしあげる, いただく, くださる) toward a superior, go down (やる) toward an inferior.",
          ],
        },
        examples: [
          { jp: "わたしは ともだちに フランスの おみやげを あげました。", gloss: "① I give" },
          { jp: "おきゃくさまに プレゼントを さしあげます。", gloss: "① polite" },
          { jp: "ちちは まいあさ、いぬに えさを やって います。", gloss: "① toward an inferior" },
          { jp: "あにに あたらしい とけいを もらいました。", gloss: "② I receive" },
          { jp: "せんせいに しゃしんを いただきました。", gloss: "② polite" },
          { jp: "にほんへ くる とき、ともだちが（わたしに）セーターを くれました。", gloss: "③ given to me" },
          { jp: "なかむらさんの おかあさんが にんぎょうを くださいました。", gloss: "③ polite" },
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
  ],
};

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

export const allNotionsL4L5: Notion[] = groupsL4L5.flatMap((g) => g.notions);

/** Look up by the app's global running number (27–38). */
export function getNotionByNumberL4L5(n: number): Notion | undefined {
  return allNotionsL4L5.find((notion) => notion.number === n);
}

/** Look up by the real course lesson number (38–51). */
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
  ageru: "giving-receiving",
  morau: "giving-receiving",
  kureru: "giving-receiving",
};

export function getNotionBySlugL4L5(slug: string): Notion | undefined {
  const resolved = NOTION_SLUG_ALIASES_L4L5[slug] ?? slug;
  return allNotionsL4L5.find((notion) => notion.slug === resolved);
}

export const totalGroupCountL4L5 = groupsL4L5.length;
export const totalNotionCountL4L5 = allNotionsL4L5.length;
