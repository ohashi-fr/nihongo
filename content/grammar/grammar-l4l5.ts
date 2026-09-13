/**
 * Structured transcription of content/grammar/recap-japonais-L4-L5.html.
 *
 * Companion to the L1–L3 file (grammar-data.ts).
 * Covers course lessons 文法38–61 (global notions 27–48).
 *
 * Inline markup used in string fields:
 *   **text**              → bold (<b>)
 *   __text__              → underline (<u>)
 *   {{nature:text}}       → word-nature pill (verbe/compteur/nom/adj/naadj)
 *   {{gloss:text}}        → small muted inline gloss
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
        objective: "Elevate the social standing of the listener or third party by honoring their actions.",
        exampleGloss: "“The teacher has returned home” (said deferentially).",
        blocks: [
          {
            type: "rule",
            label: "Regular Honorific Pattern",
            lines: ["お + {{verbe:-masu stem}} + **に なります** → おかえりに なります"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Strip ます from the stem: かえり**ます** → お + かえり + に なります.",
            "**Respect towards the subject only**: Never use this formula to describe your own actions.",
            "Common verbs with distinct irregular honorific forms bypass this pattern: いる/いく/くる → **いらっしゃる**, みる → **ごらんになる**, いう → **おっしゃる**, たべる/のむ → **めしあがる**.",
          ],
        },
        examples: [
          {
            jp: "せんせいは もう おかえりに なりました。",
            gloss: "The teacher has already gone home. (Respectful)",
          },
          {
            jp: "おたばこを おすいに なりますか。",
            gloss: "Do you smoke? (Respectfully asking a customer or superior)",
          },
          {
            jp: "せんせいが おまちに なって います。",
            gloss: "The teacher is waiting. (Respectful)",
          },
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
        objective: "Express that an expected outcome is slow in coming or resists effort.",
        exampleGloss: "“The bus just won't arrive” / “I can't seem to memorize this kanji.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["**なかなか** + {{verbe:negative verb}} → なかなか きません (hardly comes)"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "In N4 grammar, **なかなか** is almost exclusively paired with a **negative predicate**: “won't easily happen”.",
            "It conveys an unspoken expectation, waiting, or effort: not a plain negation, but “unable to manage despite trying”.",
            "Frequently combined with potential negatives: なかなか おぼえられません (cannot memorize it easily).",
          ],
        },
        examples: [
          {
            jp: "バスが なかなか きません。",
            gloss: "The bus just won't arrive (despite waiting for it).",
          },
          {
            jp: "かんじが なかなか おぼえられません。",
            gloss: "I just can't memorize the kanji (despite trying hard).",
          },
          {
            jp: "ともだちに なかなか あえません。",
            gloss: "I can rarely meet my friends (difficult to arrange a time).",
          },
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
        objective: "Specify frequency over a defined time interval.",
        exampleGloss: "“Once a month” / “Three times a day.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{compteur:Time Period}} **に** {{compteur:Number of Times}} → 1しゅうかん **に** 5かい (5 times a week)"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Strict structural order: **Period first**, followed by particle **に**, then the **count**: [Time] に [Count].",
            "No particle is placed after the counter count: 1にち**に** 3かい (never 3かいを).",
          ],
        },
        examples: [
          {
            jp: "1にちに 3かい しょくじします。",
            gloss: "I eat meals 3 times a day.",
          },
          {
            jp: "1かげつに 1かい、ともだちと いっしょに しょくじします。",
            gloss: "Once a month, I have a meal together with friends.",
          },
          {
            jp: "1しゅうかんに 5かい、がっこうで べんきょうします。",
            gloss: "I study at school 5 days a week.",
          },
        ],
      },
    ],
  },
  {
    id: "g-no",
    jpTitle: "どうしの めいしか",
    title: "Nominalizing a verb",
    notions: [
      {
        number: 30,
        courseNumber: 41,
        slug: "nominalizer-no",
        sidebarLabel: "Turning a clause into a noun",
        titleJp: "どうし の を ／ どうし の が",
        titleKanji: "動詞のを / 動詞のが",
        objective: "Package a full verbal clause into a noun block using の so it can receive grammatical particles.",
        exampleGloss: "“I'm waiting for the taxi to arrive (のを)” / “I like watching sports (のが).”",
        blocks: [
          {
            type: "sub",
            label: "Sub-point A — 〜のを (Clause is the Direct Object)",
            blocks: [
              {
                type: "rule",
                lines: [
                  "[clause in short form] + **のを** + verb (まっています, わすれました, しっています…)",
                ],
              },
              {
                type: "paragraph",
                text: "Used when the entire action is what you wait for, forget, or know about.",
              },
            ],
          },
          {
            type: "sub",
            label: "Sub-point B — 〜のが (Clause is the Subject/Predicate Target)",
            blocks: [
              {
                type: "rule",
                lines: [
                  "[clause in short form] + **のが** + predicate (すきです, じょうずです, はやいです, みえます…)",
                ],
              },
              {
                type: "paragraph",
                text: "Used before evaluative adjectives (like, hate, good at) or involuntary perception verbs (みえる, きこえる).",
              },
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "The verb immediately preceding **の** must be in **short form**: くる**の**を まつ (not きますのを).",
            "**のを** = direct object of an action (forget, wait) · **のが** = target of preferences, skill, or sensory perception.",
          ],
        },
        examples: [
          {
            jp: "タクシーが くるのを まって います。",
            gloss: "I am waiting for the taxi to come.",
          },
          {
            jp: "ともだちに でんわするのを わすれました。",
            gloss: "I forgot to call my friend.",
          },
          {
            jp: "らいしゅう、しけんが あるのを しって いますか。",
            gloss: "Do you know that there is an exam next week?",
          },
          {
            jp: "まどから こどもが あそんでいるのが みえます。",
            gloss: "From the window, I can see the children playing.",
          },
          {
            jp: "スポーツを みるのが すきです。",
            gloss: "I like watching sports.",
          },
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
        objective: "Repurpose interrogatives (だれ, どこ, なに, いつ) into indefinite pronouns or embedded interrogative clauses.",
        exampleGloss: "“Did you go somewhere?” / “I saw no one” / “I know when the test is.”",
        blocks: [
          {
            type: "sub",
            label: "42 · Interrogative + か → Indefinite Positive (“some-…”)",
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
            label: "43 · Interrogative + (particle) + も + Negative → Total Negation (“no-…”)",
            blocks: [
              {
                type: "rule",
                lines: [
                  "だれ**も** いません (nobody) · どこ**へも** いきません (nowhere) · なに**も** たべません (nothing)",
                ],
              },
            ],
          },
          {
            type: "sub",
            label: "46 · Clause with Question Word + のか → Embedded Interrogative",
            blocks: [
              {
                type: "rule",
                lines: [
                  "[question clause in short form] + **のか** + verb (しっています, おしえてください, わかりません)",
                ],
              },
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "**か** = positive indefinite (“did you go somewhere?”). **も + negative** = absolute negation (“went nowhere”).",
            "With **も**, directional/locational particles stay nestled between the interrogative and も: どこ**へも**、だれ**にも**.",
            "For pattern 46: nouns and na-adjectives take **な** before **のか**: いつ ひま**なのか** おしえて ください.",
          ],
        },
        examples: [
          {
            jp: "しゅうまつ、どこか いきましたか。→ ええ、いきました。",
            gloss: "Did you go somewhere over the weekend? → Yes, I did.",
          },
          {
            jp: "けさ、なにか たべましたか。→ ええ、パンを たべました。",
            gloss: "Did you eat something this morning? → Yes, I ate bread.",
          },
          {
            jp: "きょうしつに だれか いますか。→ いいえ、だれも いません。",
            gloss: "Is someone in the classroom? → No, there is no one.",
          },
          {
            jp: "ねぼうしたので、けさは なにも たべて きませんでした。",
            gloss: "Because I overslept, I didn't eat anything this morning before coming.",
          },
          {
            jp: "きのうは だれにも あいませんでした。",
            gloss: "Yesterday, I met with no one.",
          },
          {
            jp: "きんさんは いつ テストが あるのか しって いますか。",
            gloss: "Does Kin-san know when the test is?",
          },
          {
            jp: "いつ ひまなのか おしえて ください。",
            gloss: "Please tell me when you will be free.",
          },
          {
            jp: "ひこうきは なんじなのか、ききましたか。",
            gloss: "Did you ask what time the airplane departs?",
          },
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
        objective: "Correctly navigate the inverted negative responses to “already?” and “still?”.",
        exampleGloss: "“Have you decided already? — Not yet” / “Are there any left? — None left.”",
        blocks: [
          {
            type: "sub",
            label: "Pattern ①: Question with もう (“Already?”)",
            blocks: [
              {
                type: "rule",
                lines: [
                  "Q: もう 〜ましたか (Did you already...?)",
                  "A+: はい、**もう** 〜ました (Yes, already)",
                  "A−: いいえ、**まだ** 〜ていません (No, not yet)",
                ],
              },
            ],
          },
          {
            type: "sub",
            label: "Pattern ②: Question with まだ (“Still ongoing / remaining?”)",
            blocks: [
              {
                type: "rule",
                lines: [
                  "Q: まだ 〜ていますか (Are you still...?)",
                  "A+: はい、**まだ** 〜ています (Yes, still)",
                  "A−: いいえ、**もう** 〜ていません／〜ません (No, no longer / none left)",
                ],
              },
            ],
          },
        ],
        attention: {
          label: "Watch out — The Answer Flip",
          items: [
            "Asking with **もう** flips to **まだ** in negative answers: “Haven't finished yet” = まだ 〜ていません.",
            "Asking with **まだ** flips to **もう** in negative answers: “No longer the case” = もう 〜ていません / もう ありません.",
          ],
        },
        examples: [
          {
            jp: "もう プレゼントを きめましたか。→ いいえ、まだ きめて いないんです。",
            gloss: "Have you decided on the gift already? → No, I haven't decided yet.",
          },
          {
            jp: "きのう もらった おかしは、まだ のこって いますか。→ いいえ、もう のこって いません。",
            gloss: "Are the sweets we received yesterday still on the table? → No, there are none left on it.",
          },
          {
            jp: "きょうしつに まだ がくせいが いますか。→ いいえ、もう いません。かえりましたよ。",
            gloss: "Are students still in the classroom? → No, there are no longer any. They went home.",
          },
          {
            jp: "ごごは はれると いって いましたが、まだ あめが ふって いますよ。",
            gloss: "They said it would clear up in the afternoon, but it is still raining, you know.",
          },
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
        objective: "Embed a yes/no indirect question into a larger sentence.",
        exampleGloss: "“I don't know whether or not the answer is correct.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["[clause in short form without だ] + **かどうか** + verb (わかりません, ききました, しりません)"],
          },
          {
            type: "table",
            headers: ["Category", "Connection Form before かどうか"],
            rows: [
              ["{{verbe:Verb}}", "Short form directly (いる かどうか)"],
              ["{{adj:i-adj}}", "Keep 〜い (ただしい かどうか)"],
              ["{{naadj:na-adj}}", "**Drop だ** (ひま かどうか)"],
              ["{{nom:Noun}}", "**Drop だ** (がくせい かどうか)"],
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "**〜かどうか** is for a single binary proposition (“whether or not”). In contrast, **〜か〜か** provides two named choices (みかんは あまいか すっぱいか).",
            "Nouns and na-adjectives **drop だ** before かどうか: ひまかどうか (never ひまだかどうか).",
          ],
        },
        examples: [
          {
            jp: "やまださんが まだ きょうしつに いるかどうか、みて きましょう。",
            gloss: "Let's go see whether or not Yamada-san is still in the classroom.",
          },
          {
            jp: "こたえが あって いるかどうか ききました。",
            gloss: "I asked whether or not the answer was correct.",
          },
          {
            jp: "らいしゅうの きんようび、テストが あるかどうか わかりません。",
            gloss: "I don't know whether or not there is a test next Friday.",
          },
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
        objective: "Specify the social unit or number of participants carrying out an action.",
        exampleGloss: "“I live alone” / “We traveled as a family.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{compteur:Group count}} / かぞく / みんな / じぶん + **で** + {{verbe:verb}}"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Here **で** marks the social framing/condition: ひとり**で** (by oneself), ふたり**で** (as a pair), みんな**で** (all together), じぶん**で** (by oneself / unaided).",
            "Distinct from the で of place or vehicle/means.",
          ],
        },
        examples: [
          {
            jp: "1ねんに 1かい、かぞくで りょこうします。",
            gloss: "Once a year, we travel together as a family.",
          },
          {
            jp: "いま、マンションに ひとりで すんで います。",
            gloss: "Right now, I am living alone in an apartment.",
          },
          {
            jp: "なつやすみに みんなで りょこうへ いきませんか。",
            gloss: "Shall we all go on a trip together during the summer vacation?",
          },
          {
            jp: "この りょうりは ぜんぶ じぶんで つくりました。",
            gloss: "I made all of this food completely by myself.",
          },
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
        objective: "Join two full sentences to add further information (“and also”) or subsequent actions (“and then”).",
        exampleGloss: "“The apartment is close to the station, and on top of that the rent is low.”",
        blocks: [
          { type: "rule", label: "Rule", lines: ["Sentence 1**。** **そして**、 Sentence 2**。**"] },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Two distinct functions: **① Additional property** (“and in addition…”) · **② Chronological sequence** (“and after that…”).",
            "**そして** links two complete sentences separated by a full stop, whereas the verb **て-form** links clauses within a single sentence.",
          ],
        },
        examples: [
          {
            jp: "きょうだいは あにと あね、そして いもうとが います。",
            gloss: "As for siblings, I have an older brother, an older sister, and also a younger sister. (Addition)",
          },
          {
            jp: "へやは えきから ちかくて べんりで、そして やちんが やすい ところが いいです。",
            gloss: "A room close to the station, convenient, and furthermore with cheap rent is ideal. (Addition)",
          },
          {
            jp: "きのうは ともだちと しぶやで あいました。そして えいがを みました。",
            gloss: "Yesterday I met a friend in Shibuya. And then we watched a movie. (Sequence)",
          },
          {
            jp: "まず、カードを いれて ください。そして、きんがくに タッチして、おかねを いれて ください。",
            gloss: "First, insert your card. And then, touch the amount and insert the cash. (Sequence)",
          },
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
        objective: "Emphasize that the totality of a small counted group is included without exception (“both”, “all three”).",
        exampleGloss: "“Both of them are university students.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{compteur:counter}} + **とも** → ふたり**とも** (both people)、さんさつ**とも** (all 3 books)"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "**とも** means “every single one of the N items mentioned” (reserved for small, precise numbers: 2, 3, 4).",
            "Attaches directly to the counter word matching the entity: people (ふたりとも), volumes (さんさつとも), objects (ふたつとも).",
          ],
        },
        examples: [
          {
            jp: "あにが ふたり います。ふたりとも だいがくせいです。",
            gloss: "I have two older brothers. Both of them are university students.",
          },
          {
            jp: "つくえの うえに ある ほんは、さんさつとも えいごの ほんです。",
            gloss: "The books on the desk are all three of them English books.",
          },
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
        objective: "Express the desire to possess a concrete object or acquire a relationship.",
        exampleGloss: "“I want a new bag” (≠ “I want to buy a bag”).",
        blocks: [
          { type: "rule", label: "Rule", lines: ["わたしは {{nom:object}} **が ほしいです**"] },
        ],
        attention: {
          label: "Watch out",
          items: [
            "The desired entity takes particle **が**, not を: くるま**が** ほしいです.",
            "**ほしい** conjugates purely like an **i-adjective**: ほしくない, ほしかった.",
            "Desiring an **object** → **ほしい** · Desiring to do an **action** → **〜たい**: かばん**が ほしい** vs かばんを **かいたい**.",
            "To express someone else's desire, add hearsay or indirect markers: たなかさんは カメラを **ほしがっています** / **ほしいそうです**.",
          ],
        },
        examples: [
          {
            jp: "あたらしい かばんが ほしいです。",
            gloss: "I want a new bag.",
          },
          {
            jp: "にほんじんの ともだちが ほしいです。",
            gloss: "I want Japanese friends.",
          },
          {
            jp: "ともだちと あう じかんが ほしいです。",
            gloss: "I want time to meet my friends.",
          },
          {
            jp: "たなかさんは カメラが ほしいそうです。",
            gloss: "I hear that Tanaka-san wants a camera. (Desire of a 3rd party)",
          },
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
        number: 38,
        courseNumber: 51,
        slug: "giving-receiving-objects",
        sidebarLabel: "Give & receive — ageru / morau / kureru",
        titleJp: "あげる ／ もらう ／ くれる",
        objective: "Master the 3 spatial vectors of giving and receiving tangible objects.",
        exampleGloss: "“I gave my friend a gift” / “My teacher gave me a book.”",
        blocks: [
          {
            type: "sub",
            label: "Vector A — あげる: Giving Outward (Me / In-group → Others)",
            blocks: [
              {
                type: "rule",
                lines: [
                  "[giver] は [receiver] **に** [object] を **あげます**",
                  "Polite up: **さしあげます** (to a superior) · Down: **やります** (plants, pets, juniors)",
                ],
              },
            ],
          },
          {
            type: "sub",
            label: "Vector B — もらう: Receiving (Receiver ← Giver)",
            blocks: [
              {
                type: "rule",
                lines: [
                  "[receiver] は [giver] **に / から** [object] を **もらいます**",
                  "Humble equivalent: **いただきます** (received from a superior)",
                ],
              },
            ],
          },
        ],
        attention: {
          label: "Watch out — The Crucial Difference",
          items: [
            "**あげる vs くれる**: Both translate to “give”, but **くれる** is strictly used when the gift moves **inward toward ME or my in-group family**: ははが (わたしに) とけいを くれました.",
            "Giver takes **が** with くれる: せんせい**が** じしょを くださいました.",
          ],
        },
        examples: [
          {
            jp: "わたしは ともだちに チョコレートを あげました。",
            gloss: "I gave chocolate to my friend.",
          },
          {
            jp: "せんせいに おみやげを さしあげました。",
            gloss: "I presented a souvenir to my teacher. (Humble upward)",
          },
          {
            jp: "たんじょうびに ともだちに プレゼントを もらいました。",
            gloss: "I received a present from my friend on my birthday.",
          },
          {
            jp: "せんせいに ほんを いただきました。",
            gloss: "I received a book from my teacher. (Humble upward)",
          },
          {
            jp: "ちちが わたしに とけいを くれました。",
            gloss: "My father gave me a watch. (Inward to me)",
          },
          {
            jp: "せんせいが わたしに じしょを くださいました。",
            gloss: "The teacher kindly gave me a dictionary. (Honorific inward to me)",
          },
        ],
      },
      {
        number: 39,
        courseNumber: 52,
        slug: "favors-te-verbs",
        sidebarLabel: "Favors — te-ageru / te-morau / te-kureru",
        titleJp: "〜てあげる ／ 〜てもらう ／ 〜てくれる",
        objective: "Express the granting, receiving, or benefiting from actions performed as favors.",
        exampleGloss: "“I cooked for my friend” / “The teacher kindly checked my essay.”",
        blocks: [
          {
            type: "sub",
            label: "Vector A — 〜てあげる: Doing a Favour Outward",
            blocks: [
              {
                type: "rule",
                lines: [
                  "[giver] は [receiver] に {{verbe:V -te}} + **あげます**",
                  "Upward: **〜てさしあげます** · Downward: **〜てやります**",
                ],
              },
            ],
          },
          {
            type: "sub",
            label: "Vector B — 〜てもらう: Receiving the Benefit of an Action",
            blocks: [
              {
                type: "rule",
                lines: [
                  "[beneficiary] は [giver] に {{verbe:V -te}} + **もらいます**",
                  "Upward: **〜ていただきます** (humbly received from a superior)",
                ],
              },
            ],
          },
          {
            type: "sub",
            label: "Vector C — 〜てくれる: Someone Doing a Favour for Me",
            blocks: [
              {
                type: "rule",
                lines: [
                  "[giver] が （わたしに） {{verbe:V -te}} + **くれます**",
                  "Upward: **〜てくださいます** (superior doing a favour for me)",
                ],
              },
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Social rule: Offering **〜てあげましょうか** directly to a superior can sound patronizing (“shall I do you a favor?”). Prefer polite neutral forms or 〜てさしあげます.",
            "With **〜てくれる**, the person who did the kind deed is marked with **が**, and わたしに is usually omitted.",
          ],
        },
        examples: [
          {
            jp: "わたしは ともだちに りょうりを つくって あげました。",
            gloss: "I cooked a meal for my friend.",
          },
          {
            jp: "こどもの とき、よく おとうとに べんきょうを おしえて あげました。",
            gloss: "When I was a child, I often helped my younger brother with his studies.",
          },
          {
            jp: "せんせいに さくぶんを なおして いただきました。",
            gloss: "I had my essay kindly corrected by my teacher.",
          },
          {
            jp: "ともだちに やすくて おいしい レストランを おしえて もらいました。",
            gloss: "I had my friend recommend a cheap and delicious restaurant to me.",
          },
          {
            jp: "ははが この ワンピースを つくって くれました。",
            gloss: "My mother made this dress for me.",
          },
          {
            jp: "せんせいが たいしかんの でんわばんごうを しらべて くださいました。",
            gloss: "The teacher kindly looked up the embassy's phone number for me.",
          },
        ],
      },
      {
        number: 40,
        courseNumber: 54,
        slug: "requests-te-moraemasenka",
        sidebarLabel: "Polite requests — te-moraemasen ka",
        titleJp: "〜て もらえませんか",
        objective: "Politely request someone to do something, matching the formality to the relationship.",
        exampleGloss: "“Could you please lend me a hand?”",
        blocks: [
          {
            type: "rule",
            label: "Scale of Request Formulas",
            lines: [
              "Casual: {{verbe:V -te}} + **くれない？** / **もらえない？**",
              "Polite: {{verbe:V -te}} + **くれませんか** / **もらえませんか**",
              "Very polite (business): {{verbe:V -te}} + **いただけませんか** / **くださいませんか**",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "**もらえる / いただける** are potential forms of もらう/いただく (“could I receive the favor of…”), which inherently sounds more modest and polite than requesting directly with くれる.",
          ],
        },
        examples: [
          {
            jp: "すみませんが、ちょっと てつだって もらえませんか。→ ええ、いいですよ。",
            gloss: "Excuse me, could you give me a hand for a moment? → Yes, sure.",
          },
          {
            jp: "せんせい、さくぶんを かいたので、みて いただけませんか。→ ええ、いいですよ。",
            gloss: "Professor, I wrote an essay, would you be so kind as to look it over? → Yes, gladly.",
          },
          {
            jp: "そこの ほん、とって もらえない。→ これ？",
            gloss: "Could you pass me that book over there? (Casual) → This one?",
          },
          {
            jp: "ちょっと、ぎゅうにゅう かってきて くれない。→ いいよ。",
            gloss: "Hey, could you buy some milk and bring it back? (Casual) → Sure thing.",
          },
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
        number: 41,
        courseNumber: 53,
        slug: "verb-kata",
        sidebarLabel: "How to do something — kata",
        titleJp: "どうし ＋ 方（かた）",
        titleKanji: "動詞ます＋方",
        objective: "Turn a verb into a noun signifying the method or way of executing that action.",
        exampleGloss: "“How to use this machine” / “How to study kanji.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{verbe:V -masu stem}} + **かた（方）** → つかいます → つかい**かた** (how to use)",
              "{{nom:Noun}} + の + **しかた** → べんきょう**の しかた** (how to study)",
              "Destination + への + **いきかた** → えきへの いきかた (the way to the station)",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Drop ます and suffix かた: よみ**ます** → よみ**かた**.",
            "For する compound verbs, use **の しかた**: べんきょう**の しかた** (never べんきょうかた).",
            "Kanji 方 is read **かた** in this pattern (not ほう).",
          ],
        },
        examples: [
          {
            jp: "コピーきの つかいかたを しって いますか。",
            gloss: "Do you know how to use this photocopier?",
          },
          {
            jp: "ともだちに かんじの べんきょうの しかたを おしえて ください。",
            gloss: "Please tell your friend how to study kanji.",
          },
          {
            jp: "えきへの いきかたが わかりません。",
            gloss: "I don't know the way to the station.",
          },
          {
            jp: "この ゲーム、おもしろそうだね。やりかた、おしえて。",
            gloss: "This game looks fun, doesn't it? Show me how to play. (Casual)",
          },
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
        number: 42,
        courseNumber: 55,
        slug: "volitional-form",
        sidebarLabel: "Volitional form — let's / I intend to",
        titleJp: "いこうけい",
        titleKanji: "意向形",
        objective: "Construct the volitional form to make casual invitations (“let's”) or state intentions (“I'm planning to…”).",
        exampleGloss: "“What shall we eat?” / “I'm thinking of returning to my home country.”",
        blocks: [
          {
            type: "table",
            label: "Building the Volitional Form (意向形)",
            headers: ["Verb Group", "Transformation Rule", "Example"],
            rows: [
              ["**Group 1** (u-verbs)", "final -u → -o sound + **う**", "かく → か**こう** · かえる → かえ**ろう**"],
              ["**Group 2** (ru-verbs)", "drop る + **よう**", "たべる → たべ**よう** · みる → み**よう**"],
              ["**Group 3** (Irregular)", "Memorize", "くる → **こよう** · する → **しよう**"],
            ],
          },
          {
            type: "sub",
            label: "Sub-point A — Casual Invitations (Short Form of 〜ましょう)",
            blocks: [
              {
                type: "rule",
                lines: [
                  "{{verbe:Volitional form}} + **か** → なにを たべ**ようか** (What shall we eat?)",
                  "Negative question with 〜**ない？** also invites: いっしょに いか**ない？** (Won't you come with me?)",
                ],
              },
            ],
          },
          {
            type: "sub",
            label: "Sub-point B — Stating an Intention",
            blocks: [
              {
                type: "rule",
                lines: ["{{verbe:Volitional form}} + **と おもっています / と おもいます** → I am planning/thinking to…"],
              },
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "**Intention** = Volitional form + とおもう (かえ**ろう**と おもいます = I plan to return).",
            "**Supposition** = Dictionary short form + とおもう (かえ**る**と おもいます = I think he will return). Don't mix them up!",
          ],
        },
        examples: [
          {
            jp: "ごはん、たべに いかない？ → うん、いいよ。",
            gloss: "Shall we go get something to eat? (Casual invitation) → Yeah, sounds good.",
          },
          {
            jp: "なにを たべようか。 → そうだね、ピザは どう？",
            gloss: "What shall we eat? (Volitional) → Let's see, how about pizza?",
          },
          {
            jp: "なつやすみに くにへ かえろうと おもいます。",
            gloss: "I am thinking of returning to my home country during summer vacation.",
          },
          {
            jp: "ははの たんじょうびに スカーフを あげようと おもっています。",
            gloss: "I'm intending to give my mother a scarf for her birthday.",
          },
          {
            jp: "あしたは あめが ふると おもいます。",
            gloss: "I think it will rain tomorrow. (Prediction with dictionary form)",
          },
        ],
      },
      {
        number: 43,
        courseNumber: 57,
        slug: "intention-tsumori",
        sidebarLabel: "Intentions & plans — tsumori",
        titleJp: "〜つもり",
        objective: "State a firm, premeditated intention or settled plan.",
        exampleGloss: "“I plan to go skiing in Hokkaido.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{verbe:V dictionary form}} + **つもりです** → intend/plan to do",
              "{{verbe:V ない-form}} + **つもりです** → intend NOT to do",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Affirmative: dictionary form + つもり. Negative: **ない-form** + つもり (かえ**らない** つもりです).",
            "**つもり** represents a firm, decided personal intention, whereas **〜ようとおもう** is a softer, tentative thought.",
          ],
        },
        examples: [
          {
            jp: "ことしの ふゆは ほっかいどうへ スキーに いく つもりです。",
            gloss: "This winter, I plan to go skiing in Hokkaido.",
          },
          {
            jp: "らいねん そつぎょうしますが、くにへは かえらない つもりです。",
            gloss: "I graduate next year, but I plan not to return to my home country.",
          },
          {
            jp: "リーさんは、あしたから きょうとへ いく つもりだそうです。",
            gloss: "I heard that Lee-san plans to go to Kyoto starting tomorrow.",
          },
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
        number: 44,
        courseNumber: 56,
        slug: "conditional-tara",
        sidebarLabel: "Conditional — tara",
        titleJp: "〜たら",
        objective: "Express “if” or “once/when” using the past short form + ら.",
        exampleGloss: "“Once I graduate…” / “If you don't understand, please ask.”",
        blocks: [
          {
            type: "rule",
            label: "Conjugation Rule",
            lines: [
              "[Verb / Adj / Noun in **plain past form** (た / かった / だった)] + **ら**",
              "たべる → たべ**たら** · たかい → たかかっ**たら** · ひま → ひまだっ**たら** · あめ → あめだっ**たら**",
            ],
          },
          {
            type: "sub",
            label: "Sub-point A — Sequence Conditional: “Once A happens, then B”",
            blocks: [
              { type: "rule", lines: ["A**たら**、B → As soon as A is realized, B takes place"] },
            ],
          },
          {
            type: "sub",
            label: "Sub-point B — Hypothetical Conditional: “If A happens, then B”",
            blocks: [
              { type: "rule", lines: ["**もし** A**たら**、B → If A were to happen (hypothetical), B"] },
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Always construct upon the **plain past** base + ら.",
            "Adding **もし** at the start clearly signals a hypothetical or counterfactual scenario.",
          ],
        },
        examples: [
          {
            jp: "だいがくを そつぎょうしたら、にほんの かいしゃに はいりたいと おもいます。",
            gloss: "Once I graduate from university, I would like to join a Japanese company.",
          },
          {
            jp: "ほんを よんだら、かして くれませんか。",
            gloss: "Once you have read the book, could you please lend it to me?",
          },
          {
            jp: "この ドラマが おわったら、しゅくだいを するよ。",
            gloss: "When this TV drama finishes, I'll do my homework.",
          },
          {
            jp: "わからなかったら、きいて ください。",
            gloss: "If you don't understand, please ask.",
          },
          {
            jp: "もし タイムマシーンが あったら、どの じだいに いって みたいですか。",
            gloss: "If you had a time machine, which era would you like to visit?",
          },
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
        number: 45,
        courseNumber: 58,
        slug: "listing-tari",
        sidebarLabel: "Listing actions — tari tari",
        titleJp: "〜たり 〜たり 〜",
        objective: "List representative actions among others (“doing things like X and Y”).",
        exampleGloss: "“On weekends I watch TV, listen to music, and so on.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{verbe:V た-form}} + **り**、 {{verbe:V た-form}} + **り します**"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Built on the **た-form**: みる → み**たり**, きく → きい**たり**. The entire sentence is closed with **する** in the desired tense.",
            "Indicates an **incomplete list** of examples (unlike the て-form which lists all actions in strict chronological order).",
            "Can also express alternating repetitive actions: ついたり きえたり します (flickering on and off).",
          ],
        },
        examples: [
          {
            jp: "やすみの ひは テレビを みたり、おんがくを きいたり して います。",
            gloss: "On days off, I do things like watching TV and listening to music.",
          },
          {
            jp: "じゅぎょうちゅうは たべたり のんだり しないで ください。",
            gloss: "Please do not do things like eating or drinking during class.",
          },
          {
            jp: "でんきが ついたり きえたり して いるから、でんきゅうを とりかえましょう。",
            gloss: "The light keeps flickering on and off, so let's replace the light bulb.",
          },
          {
            jp: "チャンさんは さくぶんを かいたり けしたり して、なんども なおして います。",
            gloss: "Chang-san is writing and erasing his essay, revising it repeatedly.",
          },
        ],
      },
      {
        number: 46,
        courseNumber: 60,
        slug: "sequence-te-kara",
        sidebarLabel: "After doing — te kara",
        titleJp: "〜てから",
        objective: "Emphasize that the second action begins only after the first action has fully completed.",
        exampleGloss: "“Only after finishing my homework will I play games.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{verbe:V -te form}} + **から**、 [action 2] → After doing X, …"],
          },
          {
            type: "paragraph",
            text: "This temporal から follows the **て-form** (sequence). It must not be confused with the causal から (reason) which follows the plain/polite sentence.",
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "**〜てから** guarantees that Action 1 is completely finished before Action 2 starts: chronological sequence is emphasized.",
            "Compare: りょこうする**から** (because I will travel) vs りょこうし**てから** (after travelling).",
          ],
        },
        examples: [
          {
            jp: "きょうは かいものしてから、いえへ かえります。",
            gloss: "Today, after doing the shopping, I will return home.",
          },
          {
            jp: "じゅぎょうが おわってから、しょくじ しませんか。",
            gloss: "After class finishes, wouldn't you like to have a meal?",
          },
          {
            jp: "いつも にっきを かいてから、ねます。",
            gloss: "I always go to sleep after writing in my diary.",
          },
          {
            jp: "おゆが わいてから、やさいを いれて ください。",
            gloss: "After the water has boiled, please put in the vegetables.",
          },
        ],
      },
      {
        number: 47,
        courseNumber: 61,
        slug: "start-hajimeru",
        sidebarLabel: "Starting an action — hajimeru",
        titleJp: "〜はじめる",
        titleKanji: "〜始める",
        objective: "Form compound verbs to express the initiation or onset of an action.",
        exampleGloss: "“It started to rain” / “I started learning Japanese last year.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{verbe:V -masu stem}} + **はじめます（始める）** → to start doing…"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Attaches to the **ます-stem**: ふり**ます** → ふり**はじめます** · ならいます → ならい**はじめます**.",
            "Directly pairs with the opposite compound ending: **〜おわる** (to finish doing).",
          ],
        },
        examples: [
          {
            jp: "あめが ふりはじめました。",
            gloss: "It started to rain.",
          },
          {
            jp: "きょねんから にほんごを べんきょうしはじめました。",
            gloss: "I started studying Japanese last year.",
          },
          {
            jp: "3さいから ピアノを ならいはじめました。",
            gloss: "I started learning piano from the age of 3.",
          },
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
        number: 48,
        courseNumber: 59,
        slug: "decided-koto-ni-naru",
        sidebarLabel: "It's been decided — koto ni naru",
        titleJp: "〜ことになる",
        objective: "State that a decision or policy was determined by external rules, organizations, or circumstances.",
        exampleGloss: "“It has been decided that I will transfer to the Kobe branch next month.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{verbe:V dictionary form / ない-form}} + **ことに なりました / に なっている**"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "**ことになる** = decided by circumstances, rules, or third parties ↔ **ことにする** = personal decision made by the speaker (notion 26).",
            "Japanese speakers often describe their own decisions using ことになりました to sound modest and avoid sounding overly direct.",
          ],
        },
        examples: [
          {
            jp: "らいげつ こうべへ しゅっちょうする ことに なりました。",
            gloss: "It has been decided that I will go on a business trip to Kobe next month.",
          },
          {
            jp: "タンさんが きこくするので、そうべつかいを する ことに なりました。",
            gloss: "Since Tan-san is returning home, it was arranged that we will hold a farewell party.",
          },
          {
            jp: "ともだちの けっこんしきで、うたを うたう ことに なりました。",
            gloss: "It was arranged that I would sing a song at my friend's wedding.",
          },
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
    "**なかなか** pairs with a **negative predicate**: “can't seem to / slow to”.",
    "**Frequency**: [Period] **に** [Count] (1しゅうかんに 5かい).",
    "**Nominalizing**: の**を** (direct object: wait, forget) / の**が** (perception & adjectives: like, see).",
    "**Indefinite interrogatives**: + **か** (somewhere) ↔ + **も + neg** (nowhere) ↔ + **のか** (embedded WH-question).",
    "**Answer flip**: Q with もう → A−: **まだ〜ていません** · Q with まだ → A−: **もう〜ていません** (none left).",
    "**〜かどうか**: binary “whether or not” · {{naadj:na-adj}} and {{nom:noun}} drop だ before it.",
    "**Condition で**: ひとり**で**, じぶん**で** indicates the unit performing the action.",
    "**Giving/Receiving vectors**: あげる (outward) · もらう (received from) · くれる (directed inward to me).",
    "**Request hierarchy**: 〜てくれない (casual) → 〜てくれませんか (polite) → 〜てもらえませんか (very polite) → 〜ていただけませんか (business).",
    "**かた（方）**: ます-stem + かた (how to) · する-verb + **の しかた**.",
    "**Intention vs Supposition**: Volitional + とおもう = intention ↔ Dict form + とおもう = supposition.",
    "**Plan strength**: **つもり** (firm settled plan) vs **〜ようとおもう** (softer intention).",
    "**〜たら**: Plain past + ら · **もし** introduces a hypothetical.",
    "**〜たり〜たり します**: non-exhaustive list of actions based on the た-form.",
    "**〜てから**: strictly sequence (“after doing X”) ↔ causal reason **〜から**.",
    "**Decision**: **ことになる** (external decision/rule) ↔ **ことにする** (personal decision).",
  ],
};

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

export const allNotionsL4L5: Notion[] = groupsL4L5.flatMap((g) => g.notions);

export function getNotionByNumberL4L5(n: number): Notion | undefined {
  return allNotionsL4L5.find((notion) => notion.number === n);
}

export function getNotionByCourseNumber(n: number): Notion | undefined {
  return allNotionsL4L5.find((notion) => notion.courseNumber === n);
}

const NOTION_SLUG_ALIASES_L4L5: Record<string, string> = {
  "question-word-ka": "question-word-ka-mo-noka",
  "question-word-mo": "question-word-ka-mo-noka",
  "question-word-noka": "question-word-ka-mo-noka",
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