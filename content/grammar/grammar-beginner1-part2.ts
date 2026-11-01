/**
 * 初級2 文法12–26 — continuation of grammar-beginner1.ts.
 * Source: Shinjuku Japanese Language Institute (新宿日本語学校) 文法ノート
 * (Cours_JP.pdf). Covers the rest of 課2 (文法12–19) and 課3 up to the
 * でも/けれど concessive (文法20–26). 文法1–11 live in grammar-beginner1.ts.
 *
 * `number` = `courseNumber` = the 文法 number (12–26), continuing 1–11 from
 * grammar-beginner1.ts. Slugs prefixed `b1b-`, helpers suffixed `Beginner1B`,
 * so nothing collides with the other modules. app/grammar/page.tsx merges
 * both files into the single "Beginner 2 · Lessons 1–2–3" tab.
 *
 * Framing text (objectives, rules, attention, titles, glosses) in English.
 * Japanese transcribed from the course (kana, as in the other modules).
 *
 * Inline markup: **bold** · __underline__ · {{nature:text}} pill
 * (verbe/compteur/nom/adj/naadj) · {{gloss:text}}.
 *
 * Note: 文法18 and 文法22 had blank example slots in the workbook; those were
 * supplemented with standard N4 examples (marked by their simplicity).
 * Not included: 文法27 〜らしい (comes just after でも/けれど) — ask to add it.
 */

import type { Group, Notion, ChecklistSection } from "./grammar-data";

export const groupsBeginner1B: Group[] = [
  {
    id: "g-b1b-chuu",
    jpTitle: "〜中（じゅう／ちゅう）",
    title: "Throughout & in progress — 中",
    notions: [
      {
        number: 12,
        courseNumber: 12,
        slug: "b1b-chuu-juu",
        sidebarLabel: "All ~ long — jisūshi + 中 (じゅう)",
        titleJp: "じすうし ＋ 中（じゅう）",
        titleKanji: "時数詞＋中",
        objective: "Say something lasts through a whole stretch of time (“all day / all year long”).",
        exampleGloss: "“It snows there all year round.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{compteur:time span}} + **中（じゅう）** → いちにち**じゅう**、いちねん**じゅう**"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "With a time span, 中 is read **じゅう**: いちにちじゅう (all day), いちねんじゅう (all year), ひとばんじゅう (all night).",
            "Same kanji 中, different reading from する名詞+中 (**ちゅう** = in progress) — see next.",
          ],
        },
        examples: [
          { jp: "あの やまの うえには いちねんじゅう、ゆきが あります。", gloss: "There's snow on that mountain all year round." },
          { jp: "きのうは いちにちじゅう、ずっと あめが ふっていました。", gloss: "It rained all day yesterday." },
          { jp: "しんぱいな ことが あって、ゆうべは ひとばんじゅう ねられませんでした。", gloss: "I was worried, so I couldn't sleep all night." },
        ],
      },
      {
        number: 14,
        courseNumber: 14,
        slug: "b1b-chuu-chuu",
        sidebarLabel: "In the middle of — suru-noun + 中 (ちゅう)",
        titleJp: "する名詞 ＋ 中（ちゅう）",
        titleKanji: "する名詞＋中",
        objective: "Say an action or state is currently going on (“in a meeting”, “under construction”).",
        exampleGloss: "“He's in a meeting right now.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{nom:suru-noun}} + **中（ちゅう）** + です／だから／なので → かいぎ**ちゅう**です"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "With a する-noun, 中 is read **ちゅう**: かいぎちゅう, しょくじちゅう, こうじちゅう, じゅんびちゅう, こしょうちゅう.",
            "Pair it with 時数詞+中 (**じゅう** = throughout): same kanji, the reading tells you which meaning.",
          ],
        },
        examples: [
          { jp: "しょくじちゅうに ともだちから でんわが きました。", gloss: "A friend called during the meal." },
          { jp: "レストランへ いきましたが、じゅんびちゅうで はいれませんでした。", gloss: "I went to the restaurant but couldn't go in — it was getting ready." },
          { jp: "A：たなかさんは いらっしゃいますか。 B：いま、かいぎちゅうです。", gloss: "Is Tanaka here? — He's in a meeting now." },
          { jp: "あの みちは こうじちゅうだから、とおれないはずだよ。", gloss: "That road is under construction, so you shouldn't be able to get through." },
        ],
      },
    ],
  },
  {
    id: "g-b1b-cond",
    jpTitle: "じょうけん「ば・と」",
    title: "Conditionals — ば / と",
    notions: [
      {
        number: 13,
        courseNumber: 13,
        slug: "b1b-ba",
        sidebarLabel: "If — the ば-form",
        titleJp: "〜ば",
        objective: "Express a condition: “if X (then Y).” Often for general truths, advice, hypotheticals.",
        exampleGloss: "“If you take the medicine, your cold heals faster.”",
        blocks: [
          {
            type: "table",
            label: "Making the ば-form",
            headers: ["Category", "Rule"],
            rows: [
              ["{{verbe:Verb I}}", "final -u sound → -e sound + **ば** (かく → か**けば**, かえる → かえ**れば**)"],
              ["{{verbe:Verb II}}", "drop る + **れば** (たべる → たべ**れば**, みる → み**れば**)"],
              ["{{verbe:Verb III}}", "くる → くれば · する → すれば"],
              ["{{verbe:negative}}", "ない → **なければ** (のまない → のま**なければ**)"],
              ["{{adj:i-adj}}", "drop い + **ければ** / **くなければ** (たかい → たか**ければ**)"],
              ["{{naadj:na-adj}} / {{nom:noun}}", "+ **ならば** / **じゃなければ** (げんき → げんき**ならば**)"],
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "ば puts the weight on the **condition** (“if only X…”). Good for general facts, advice and hypotheticals.",
            "Four conditionals to keep apart: **ば** (if, general) · **と** (whenever → automatic result) · **たら** (once/if, concrete) · **なら** (as for, reacting to a topic).",
          ],
        },
        examples: [
          { jp: "たくさん かんじを かけば おぼえられます。", gloss: "If you write lots of kanji, you can memorize them." },
          { jp: "あまいものを たべなければ やせられます。", gloss: "If you don't eat sweets, you can lose weight." },
          { jp: "いっしょうけんめい べんきょうすれば、しけんに ごうかくできますよ。", gloss: "If you study hard, you can pass the exam." },
          { jp: "くすりを のめば、はやく かぜが なおります。", gloss: "If you take the medicine, your cold heals faster." },
          { jp: "もう すこし やすければ、かえます。", gloss: "If it were a bit cheaper, I could buy it." },
        ],
      },
      {
        number: 20,
        courseNumber: 20,
        slug: "b1b-to",
        sidebarLabel: "Whenever / automatic result — と",
        titleJp: "〜と",
        objective: "“Whenever X, Y (inevitably) happens” — natural results, habits, and giving directions.",
        exampleGloss: "“When spring comes, the cherry blossoms bloom.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["[{{verbe:verb}} / {{adj:i-adj}} short form · {{naadj:na-adj}}／{{nom:noun}} + だ] + **と**、〜。"],
          },
          {
            type: "sub",
            label: "Use — giving directions",
            blocks: [
              {
                type: "rule",
                lines: ["〜て、{{verbe:verb dict}} + **と**、[place] に [thing] が あります → “go X and Y is there”"],
              },
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "と = an **automatic / inevitable** result (natural law, machines, habits, directions), not a choice.",
            "The result clause can't be a request, command or volition (そうしよう, 〜てください) — use たら for those.",
          ],
        },
        examples: [
          { jp: "はるに なると、さくらが さきます。", gloss: "When spring comes, the cherry blossoms bloom." },
          { jp: "あついと、アイスクリームが たべたくなります。", gloss: "When it's hot, I feel like eating ice cream." },
          { jp: "ボタンを おすと、みずが ながれます。", gloss: "When you press the button, the water flows." },
          { jp: "おみせは ばしょが ふべんだと、きゃくが きません。", gloss: "If a shop's location is inconvenient, customers don't come." },
          { jp: "ふたつめの かどを みぎに まがって、すこし いくと、こうえんが あります。", gloss: "Turn right at the second corner, go a bit, and there's a park. (directions)" },
        ],
      },
    ],
  },
  {
    id: "g-b1b-add",
    jpTitle: "つけたし・りゆうの れつきょ",
    title: "Adding & listing",
    notions: [
      {
        number: 15,
        courseNumber: 15,
        slug: "b1b-dakedenaku",
        sidebarLabel: "Not only… but also",
        titleJp: "〜だけでなく〜も〜",
        objective: "Say “not only X but also Y.”",
        exampleGloss: "“Not only children but also adults like Disneyland.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{nom:noun}} + だけ + **ではなく／じゃなく** + {{nom:noun}} + **も**〜"],
          },
        ],
        attention: {
          label: "Watch out",
          items: ["ではなく (written/polite) ↔ じゃなく (casual). The second item is marked with **も** (“also”)."],
        },
        examples: [
          { jp: "ディズニーランドは こどもだけではなく、おとなも すきです。", gloss: "Not only children but also adults like Disneyland." },
          { jp: "やまもとさんは えいごだけじゃなく、スペインごも じょうずだそうです。", gloss: "Yamamoto is good at not only English but also Spanish." },
          { jp: "かまくらは どにちだけでなく、へいじつも こんでいます。", gloss: "Kamakura is crowded not only on weekends but on weekdays too." },
        ],
      },
      {
        number: 17,
        courseNumber: 17,
        slug: "b1b-shi",
        sidebarLabel: "Listing reasons — し〜し〜から",
        titleJp: "〜し、（それに）〜から〜",
        objective: "Pile up several reasons or qualities (“it's X, and Y, and on top of that Z, so…”).",
        exampleGloss: "“It's cramped, far from the station, and there are no shops, so it's inconvenient.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["[short form] **し**、[short form] **し**、（それに）〜**から** → stacking reasons, often closed with から"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "し connects reasons/qualities and implies “and there's more like this”.",
            "{{naadj:na-adj}} and {{nom:noun}} keep **だ** before し (ふべん**だ**し).",
          ],
        },
        examples: [
          { jp: "A：わたしの アパートは ふべんなんですよ。 B：どうしてですか。 A：せまいし、えきから とおいし、それに そばに おみせが ないから ふべんなんですよ。", gloss: "My apartment is inconvenient — it's cramped, far from the station, and there are no shops nearby." },
          { jp: "バスは いつも こむし、りょうきんは たかいし、それに じかんが かかるから、じてんしゃで きます。", gloss: "The bus is always crowded, the fare is high, and it takes time, so I come by bike." },
          { jp: "きょうは さむいし、あめは ふっているし、それに おかねも ないから、いえで テレビでも みていますよ。", gloss: "It's cold, it's raining, and I have no money, so I'll just watch TV at home." },
        ],
      },
    ],
  },
  {
    id: "g-b1b-koto",
    jpTitle: "〜こともある",
    title: "Sometimes / it happens",
    notions: [
      {
        number: 16,
        courseNumber: 16,
        slug: "b1b-kotomoaru",
        sidebarLabel: "Sometimes — こともある",
        titleJp: "〜こともある ／ 〜ないこともある",
        objective: "Note an occasional exception to a usual pattern (“usually X, but sometimes Y too”).",
        exampleGloss: "“I usually take the bus, but sometimes I walk too.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{verbe:verb short form}} + **ことも ある** → あるく **こともあります**"],
          },
        ],
        attention: {
          label: "Watch out",
          items: ["Pattern: いつも〜が、たまに／ときどき 〜**こともある** — a rare deviation from the norm, affirmative or negative."],
        },
        examples: [
          { jp: "いつも えきまで バスで いきますが、たまに あるく こともあります。", gloss: "I usually take the bus to the station, but sometimes I walk too." },
          { jp: "いつも じゅういちじごろ ねますが、もうすこし おそく ねる こともあります。", gloss: "I usually sleep around 11, but sometimes I sleep a little later." },
          { jp: "なかむらさんは いつも じむしょに いますが、たまに いない こともあります。", gloss: "Nakamura is usually at the office, but sometimes he isn't." },
        ],
      },
    ],
  },
  {
    id: "g-b1b-stem",
    jpTitle: "〜やすい／にくい・〜すぎる",
    title: "Easy, hard & too much",
    notions: [
      {
        number: 18,
        courseNumber: 18,
        slug: "b1b-yasui-nikui",
        sidebarLabel: "Easy / hard to do — yasui / nikui",
        titleJp: "〜やすい ／ 〜にくい",
        objective: "Say an action is easy or hard to do.",
        exampleGloss: "“This pen is easy to write with.” / “This medicine is hard to swallow.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{verbe:verb ます-stem}} + **やすい** (easy to) / **にくい** (hard to) → たべ**やすい**、よみ**にくい**"],
          },
        ],
        attention: {
          label: "Watch out",
          items: ["The result behaves like an {{adj:i-adj}}: わかりやす**く**、たべやす**くて**."],
        },
        examples: [
          { jp: "せんせいが わかりやすく おしえてくださいました。", gloss: "The teacher explained it in an easy-to-understand way." },
          { jp: "この ペンは かきやすいです。", gloss: "This pen is easy to write with." },
          { jp: "この くすりは にがくて、のみにくいです。", gloss: "This medicine is bitter and hard to swallow." },
        ],
      },
      {
        number: 19,
        courseNumber: 19,
        slug: "b1b-sugiru",
        sidebarLabel: "Too much — sugiru",
        titleJp: "〜すぎる",
        objective: "Say something is beyond the right amount (“too…”).",
        exampleGloss: "“I put in too much salt and it got too salty.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{verbe:verb ます-stem}} + **すぎる** → たべ**すぎる**",
              "{{adj:i-adj}} (drop い) + **すぎる** → たか**すぎる** · {{naadj:na-adj}} + **すぎる** → かんたん**すぎる**",
              "{{nom:noun form}}: ます-stem + **すぎ** → たべ**すぎ**",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "すぎる = past the right amount, almost always a **negative** nuance.",
            "Exceptions: {{adj:いい}} → **よすぎる** · ない → **なさすぎる**.",
          ],
        },
        examples: [
          { jp: "りょうりに しおを いれすぎて、しおからくなって しまいました。", gloss: "I put too much salt in the dish and it got too salty." },
          { jp: "カラオケで うたいすぎて、のどが いたいんです。", gloss: "I sang too much at karaoke and my throat hurts." },
          { jp: "きのうの テストは むずかしすぎて、ぜんぜん わかりませんでした。", gloss: "Yesterday's test was too hard; I understood nothing." },
          { jp: "このゲームは かんたんすぎるので、おもしろくありません。", gloss: "This game is too easy, so it's not fun." },
          { jp: "ケーキを いつつも たべたんですか。それは たべすぎですよ。", gloss: "You ate five cakes? That's eating too much. (noun すぎ)" },
        ],
      },
    ],
  },
  {
    id: "g-b1b-tokoro",
    jpTitle: "〜ところ",
    title: "About to / in the middle / just did",
    notions: [
      {
        number: 21,
        courseNumber: 21,
        slug: "b1b-tokoro",
        sidebarLabel: "Verb phase — tokoro",
        titleJp: "〜ところ",
        objective: "Pin an action to a moment: about to do it, in the middle of it, or just finished it.",
        exampleGloss: "“I'm in the middle of frying tempura.” / “I just got here.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{verbe:verb dict}} + **ところ** → about to do it (before)",
              "{{verbe:verb ている}} + **ところ** → in the middle of doing it",
              "{{verbe:verb た}} + **ところ** → just did it (after)",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Casual: 〜ところ → **〜とこ** (いま きた とこ).",
            "Often + だから／なので／んです to explain the situation.",
          ],
        },
        examples: [
          { jp: "これから べんきょうする ところなんです。", gloss: "I'm just about to study. (before)" },
          { jp: "A：おかあさん、ちょっと きて。 B：ちょっと まって、てんぷらを あげている ところだから。", gloss: "Mom, come here. — Wait, I'm in the middle of frying tempura. (-ing)" },
          { jp: "A：おくれて すみません。 B：だいじょうぶですよ。わたしも いま、きた ところですから。", gloss: "Sorry I'm late. — It's fine, I just got here too. (after)" },
          { jp: "A：おくれて ごめん。 B：ぼくも いま きた とこ。", gloss: "Sorry I'm late. — I just got here too. (casual)" },
        ],
      },
    ],
  },
  {
    id: "g-b1b-reason-te",
    jpTitle: "りゆうの〜て",
    title: "Reason with the て-form",
    notions: [
      {
        number: 22,
        courseNumber: 22,
        slug: "b1b-riyuu-te",
        sidebarLabel: "Cause with the て-form",
        titleJp: "りゆうの 〜て",
        titleKanji: "理由の〜て",
        objective: "Give a cause with the て-form, where the result is a feeling or an uncontrolled state.",
        exampleGloss: "“It's too hot (so) I can't drink it.” / “The trains stopped because of snow.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{adj:i-adj}} → **くて** + [result] → あつ**くて** のめません",
              "{{verbe:verb て}} / {{nom:noun}} + **で** + [result] → ゆき**で** でんしゃが とまりました",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "The result is a **feeling / state / impossibility** you don't control (surprised, can't do it, stopped).",
            "Unlike から, the second clause **can't** be a request or command — use から for those.",
          ],
        },
        examples: [
          { jp: "あつくて、のめません。", gloss: "It's too hot, so I can't drink it." },
          { jp: "ゆきで でんしゃが とまりました。", gloss: "The trains stopped because of the snow." },
          { jp: "しあいに まけて、くやしいです。", gloss: "We lost the match, and it's frustrating." },
          { jp: "ニュースを きいて、びっくりしました。", gloss: "I heard the news and was surprised." },
        ],
      },
    ],
  },
  {
    id: "g-b1b-like",
    jpTitle: "〜よう／みたい",
    title: "Looking like — よう / みたい",
    notions: [
      {
        number: 23,
        courseNumber: 23,
        slug: "b1b-you",
        sidebarLabel: "Like / as — you I",
        titleJp: "〜よう（I）",
        titleKanji: "よう",
        objective: "Compare: something is “like / as” something else — resemblance, or giving an example.",
        exampleGloss: "“We get along, just like brothers.” / “I want to be good at Japanese like Ryu.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{nom:noun}} + の + **ようだ** / **ような** + {{nom:noun}} / **ように** + {{verbe:verb}}"],
          },
          {
            type: "sub",
            label: "① まるで — resemblance (“just like”)",
            blocks: [{ type: "rule", lines: ["まるで {{nom:noun}}の**ようだ** → きょうだいの**ようです**"] }],
          },
          {
            type: "sub",
            label: "② たとえば — giving an example (“such as / like”)",
            blocks: [{ type: "rule", lines: ["{{nom:noun}}の**ような** {{nom:noun}} → スパイの**ような** ひと"] }],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Formal register; attaches to a noun with **の**. Casual equivalent = **みたい** (next).",
            "ようだ (sentence end) · ような + noun · ように + verb.",
          ],
        },
        examples: [
          { jp: "わたしと リュウさんは なかが よくて、まるで きょうだいのようです。", gloss: "Ryu and I get along — just like brothers. (①)" },
          { jp: "なかむらさんは とても やさしくて、ははのような ひとです。", gloss: "Nakamura is very kind, a mother-like person. (①)" },
          { jp: "この がっこうでは、まいにち やまのように しゅくだいが でます。", gloss: "At this school, homework piles up like a mountain every day. (①)" },
          { jp: "にんじゃは スパイのような ひとです。", gloss: "A ninja is a person like a spy. (②)" },
          { jp: "リュウさんのように にほんごが じょうずに なりたいです。", gloss: "I want to get good at Japanese, like Ryu. (②)" },
        ],
      },
      {
        number: 24,
        courseNumber: 24,
        slug: "b1b-mitai",
        sidebarLabel: "Like (casual) — mitai",
        titleJp: "〜みたい",
        objective: "Casual “like” — the everyday version of ようI.",
        exampleGloss: "“This cat is cute. Like a stuffed toy.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{nom:noun}} + **みたいだ** / **みたいな** + {{nom:noun}} / **みたいに** + {{verbe:verb}}"],
          },
        ],
        attention: {
          label: "Watch out",
          items: ["Casual version of よう; attaches **straight to the plain noun** (no の): ぬいぐるみ**みたい**."],
        },
        examples: [
          { jp: "この ねこ かわいい。ぬいぐるみみたい。", gloss: "This cat is cute. Like a stuffed toy. (①)" },
          { jp: "マリさん、うたが じょうずですね。まるで かしゅみたい。", gloss: "Mari, you sing well — just like a singer. (①)" },
          { jp: "おきなわは ハワイみたいな ところです。", gloss: "Okinawa is a place like Hawaii. (②)" },
          { jp: "かみがたは この しゃしんみたいに してください。", gloss: "Please make my hair like this photo. (②)" },
        ],
      },
    ],
  },
  {
    id: "g-b1b-temo",
    jpTitle: "〜ても（でも・けれど）",
    title: "Even if / no matter — ても",
    notions: [
      {
        number: 25,
        courseNumber: 25,
        slug: "b1b-temo",
        sidebarLabel: "Even if — temo (demo / keredo)",
        titleJp: "〜ても",
        objective: "“Even if X, (still) Y.” — the でも／けれど (despite / even if) point.",
        exampleGloss: "“Even if I go back home, I'll keep studying Japanese.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{verbe:verb て}} + **も** / なくて + **も**",
              "{{adj:i-adj}} くて + **も** / くなくて + **も**",
              "{{naadj:na-adj}} / {{nom:noun}} で + **も** / じゃなくて + **も**",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "〜ても = **“even if / even though”** (a suffix on the verb/adj).",
            "Don't mix it up with the sentence-opener **でも** (“but / however”) you already know — different grammar, similar look.",
          ],
        },
        examples: [
          { jp: "くにへ かえっても、にほんごの べんきょうを つづけようと おもっています。", gloss: "Even if I go back to my country, I plan to keep studying Japanese." },
          { jp: "たかくても、かいたいんです。", gloss: "Even if it's expensive, I want to buy it." },
          { jp: "A：あした、あめが ふったら、しあいは ちゅうしですか。 B：いいえ、あめが ふっても、します。", gloss: "If it rains tomorrow, is the match cancelled? — No, even if it rains, we'll play." },
        ],
      },
      {
        number: 26,
        courseNumber: 26,
        slug: "b1b-gimonshi-temo",
        sidebarLabel: "No matter what / where — question word + temo",
        titleJp: "ぎもんし ＋ 〜ても",
        titleKanji: "疑問詞＋ても",
        objective: "“No matter what / where / how much…” — a question word with 〜ても.",
        exampleGloss: "“Wherever you go in Kyoto, there are temples.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{nom:question word}} + 〜**ても** → なにを たべ**ても**、どこへ いっ**ても**、いくら 〜**ても**"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Question word + ても = **“no matter …”**: なに→whatever, どこ→wherever, だれ→whoever, いくら→no matter how much.",
            "Related to なんでも / どこでも (anything / anywhere).",
          ],
        },
        examples: [
          { jp: "きょうとは どこへ いっても、おてらが あります。", gloss: "No matter where you go in Kyoto, there are temples." },
          { jp: "なにを たべても、おいしいです。", gloss: "Whatever I eat, it's delicious." },
          { jp: "いくら べんきょうしても、なかなか おぼえられません。", gloss: "No matter how much I study, I just can't memorize it." },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// CHECKLIST
// ─────────────────────────────────────────────────────────────────

export const checklistBeginner1B: ChecklistSection = {
  id: "checklist",
  title: "✅ Quick checklist — 文法12–26",
  sidebarLabel: "✅ Quick checklist (文法12–26)",
  items: [
    "**中**: time span → **じゅう** (いちにちじゅう, all day) · する-noun → **ちゅう** (かいぎちゅう, in a meeting).",
    "**ば**: Verb I -u→-e+ば · い-adj drop い+ければ · na-adj/noun + ならば.",
    "**と** = automatic result / directions — no request or command in the result clause (use たら for those).",
    "4 conditionals: **ば** (general if) · **と** (whenever→result) · **たら** (concrete) · **なら** (as for).",
    "**だけでなく〜も** = not only… but also · **〜し〜し〜から** = stacking reasons (na-adj/noun keep だ before し).",
    "**〜こともある** = usually…, but sometimes… (occasional exception).",
    "**やすい / にくい** (ます-stem) behave like い-adjectives · **すぎる** = too much (いい→よすぎる, ない→なさすぎる).",
    "**ところ**: dict = about to · ている = in the middle · た = just did (casual とこ).",
    "**理由の〜て**: cause → feeling/state you don't control; no request in the result (unlike から).",
    "**よう** (formal, noun+の) ↔ **みたい** (casual, plain noun): ① まるで (just like) · ② たとえば (such as).",
    "**〜ても** = even if (suffix) ≠ **でも** sentence-opener (but) · question word + ても = no matter….",
  ],
};

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

export const allNotionsBeginner1B: Notion[] = groupsBeginner1B.flatMap((g) => g.notions);

/** Look up by 文法 number (12–26). */
export function getNotionByCourseNumberBeginner1B(n: number): Notion | undefined {
  return allNotionsBeginner1B.find((notion) => notion.courseNumber === n);
}

const NOTION_SLUG_ALIASES_BEGINNER1B: Record<string, string> = {
  // 中 is split by reading into two notions
  "b1b-chuu": "b1b-chuu-chuu",
  // よう / みたい pair
  "b1b-like": "b1b-you",
  // concessive ても pair
  "b1b-even-if": "b1b-temo",
};

export function getNotionBySlugBeginner1B(slug: string): Notion | undefined {
  const resolved = NOTION_SLUG_ALIASES_BEGINNER1B[slug] ?? slug;
  return allNotionsBeginner1B.find((notion) => notion.slug === resolved);
}

export const totalGroupCountBeginner1B = groupsBeginner1B.length;
export const totalNotionCountBeginner1B = allNotionsBeginner1B.length;
