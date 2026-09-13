/**
 * Structured transcription of content/grammar/recap-japonais-midterm.html.
 *
 * Framing text (objectives, rules, attention points, group/section titles,
 * example glosses) is in English for the app UI. Japanese content is
 * transcribed verbatim from the course source.
 *
 * Inline markup used in string fields:
 *   **text**              → bold (<b>)
 *   __text__              → underline (<u>)
 *   {{nature:text}}       → word-nature pill (verbe/compteur/nom/adj/naadj)
 *   {{gloss:text}}        → small muted inline gloss
 */

export type WordNature = "verbe" | "compteur" | "nom" | "adj" | "naadj";

export type RichText = string;

export interface TableBlock {
  type: "table";
  label?: string;
  headers: RichText[];
  rows: RichText[][];
}

export interface RuleBlock {
  type: "rule";
  label?: string;
  lines: RichText[];
}

export interface ParagraphBlock {
  type: "paragraph";
  text: RichText;
}

export interface SubNotionBlock {
  type: "sub";
  label: string;
  blocks: ContentBlock[];
}

export type ContentBlock = TableBlock | RuleBlock | ParagraphBlock | SubNotionBlock;

export interface AttentionPoint {
  label: string;
  items: RichText[];
}

export interface ExampleLine {
  jp: RichText;
  gloss: string;
}

export interface Notion {
  number: number;
  courseNumber?: number;
  slug: string;
  sidebarLabel: string;
  titleJp: string;
  titleKanji?: string;
  objective: RichText;
  exampleGloss?: string;
  blocks: ContentBlock[];
  attention: AttentionPoint;
  examples: ExampleLine[];
}

export interface Group {
  id: string;
  jpTitle: string;
  title: string;
  notions: Notion[];
}

export interface SocleSection {
  id: "socle";
  jpTitle: string;
  title: string;
  sidebarLabel: string;
  objective: RichText;
  table: { headers: RichText[]; rows: RichText[][] };
  attention: AttentionPoint;
}

export interface ChecklistSection {
  id: "checklist";
  title: string;
  sidebarLabel: string;
  items: RichText[];
}

// ─────────────────────────────────────────────────────────────────
// SOCLE
// ─────────────────────────────────────────────────────────────────

export const socle: SocleSection = {
  id: "socle",
  jpTitle: "みじかいかたち",
  title: "The base · short form (短い形)",
  sidebarLabel: "The short form — start here",
  objective:
    "Almost every intermediate and advanced grammar pattern builds upon the plain/short form (普通形). Master these 4 conjugations first.",
  table: {
    headers: ["Category", "Present +", "Present −", "Past +", "Past −"],
    rows: [
      ["{{verbe:Verb (u-drop / ru)}}", "のむ", "のまない", "のんだ", "のまなかった"],
      ["{{adj:i-adj}}", "たかい", "たかくない", "たかかった", "たかくなかった"],
      ["{{naadj:na-adj}}", "ひまだ", "ひまじゃない", "ひまだった", "ひまじゃなかった"],
      ["{{nom:Noun}}", "あめだ", "あめじゃない", "あめだった", "あめじゃなかった"],
    ],
  },
  attention: {
    label: "Watch out",
    items: [
      "{{nom:Nouns}} and {{naadj:na-adjectives}} share identical short forms (だ / じゃない / だった / じゃなかった).",
      "Major exception: {{adj:いい}} (good) originates from よい → **よくない / よかった / よくなかった** (never いくない).",
    ],
  },
};

// ─────────────────────────────────────────────────────────────────
// GROUPS
// ─────────────────────────────────────────────────────────────────

export const groups: Group[] = [
  {
    id: "g-certitude",
    jpTitle: "かくしんと いけん",
    title: "Certainty & opinion",
    notions: [
      {
        number: 1,
        slug: "mou-mada",
        sidebarLabel: "Already / not yet",
        titleJp: "もう ／ まだ",
        objective: "State whether an action is completed, still ongoing, or not yet carried out.",
        exampleGloss: "“I've already eaten” / “I haven't eaten yet” / “I still have homework.”",
        blocks: [
          {
            type: "rule",
            label: "Formulas",
            lines: [
              "**もう** + affirmative past = already completed (もう たべました)",
              "**まだ** + 〜ていません = not yet done (まだ たべていません)",
              "**まだ** + affirmative = still in progress / remaining (まだ あります)",
              "**もう** + negative = no longer / none left (もう ありません)",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "To reply “not yet”, say **いいえ、まだです** or **まだ 〜ていません**. Never answer with 〜ませんでした (which means you simply did not do it in the past, losing the “not yet” nuance).",
            "**もう + negative** reverses its meaning to “no longer” or “none left”: もう ありません (there is none left).",
          ],
        },
        examples: [
          {
            jp: "もう ひるごはんを たべましたか。→ はい、もう たべました。／ いいえ、まだです。",
            gloss: "Have you eaten lunch already? → Yes, I've already eaten. / No, not yet.",
          },
          {
            jp: "でんしゃは もう でました。",
            gloss: "The train has already departed.",
          },
          {
            jp: "まだ しゅくだいが あります。",
            gloss: "I still have homework left to do.",
          },
        ],
      },
      {
        number: 2,
        slug: "certainty-degrees",
        sidebarLabel: "Degrees of certainty",
        titleJp: "ぶんまつひょうげん",
        titleKanji: "文末表現",
        objective: "Calibrate and express varying levels of certainty in statements.",
        exampleGloss: "“It's certain (100%)” → “probably (80%)” → “maybe (60%)” → “I don't know whether… (40%)”",
        blocks: [
          {
            type: "table",
            label: "Certainty Scale & Conjunction Rules",
            headers: ["Expression", "Certainty", "Connection Rule"],
            rows: [
              ["です・ます", "100 %", "Polite base form"],
              ["〜と おもいます", "90 %", "Short form (+ だ for noun/na-adj)"],
              ["〜でしょう", "80 %", "Short form (NO だ for noun/na-adj)"],
              ["〜だろうと おもいます", "70 %", "Short form (+ だろう)"],
              ["〜かもしれません", "60 %", "Short form (NO だ for noun/na-adj)"],
              ["〜か〜か わかりません", "50 %", "Short form without だ (choice of 2)"],
              ["〜かどうか わかりません", "40 %", "Short form without だ (whether or not)"],
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "**かもしれません** and **でしょう** attach directly to nouns and na-adjectives **without だ**: あめでしょう (not あめだでしょう), あめかもしれません (not あめだかも).",
            "**〜か〜か** compares two distinct options (Aか Bか). **〜かどうか** assesses a single statement with “whether or not”.",
          ],
        },
        examples: [
          {
            jp: "この みかんは あまいか すっぱいか わかりません。",
            gloss: "I don't know whether this mandarin is sweet or sour.",
          },
          {
            jp: "あしたは あめ かもしれません。",
            gloss: "It might rain tomorrow.",
          },
          {
            jp: "こんしゅうは ひまですが、らいしゅうは いそがしいだろうと おもいます。",
            gloss: "I'm free this week, but I think next week will probably be busy.",
          },
          {
            jp: "あの スーパーは あまり たかくないと おもいます。",
            gloss: "I don't think that supermarket is very expensive.",
          },
        ],
      },
      {
        number: 3,
        slug: "to-omou",
        sidebarLabel: "Giving an opinion (to think)",
        titleJp: "どうし「おもう」",
        titleKanji: "動詞「思う」",
        objective: "Express personal thoughts, opinions, hypotheses, or beliefs.",
        exampleGloss: "“I think he will come” / “I think today is a holiday.”",
        blocks: [
          { type: "rule", label: "Rule", lines: ["[clause in short form] + **と おもいます**"] },
          {
            type: "table",
            headers: ["Word nature", "Short form connection", "Example"],
            rows: [
              ["{{verbe:Verb}}", "Short form directly", "くる → くると おもいます"],
              ["{{adj:i-adj}}", "Keep 〜い", "さむい → さむいと おもいます"],
              ["{{naadj:na-adj}}", "Must retain **だ**", "ひま**だ** → ひまだと おもいます"],
              ["{{nom:Noun}}", "Must retain **だ**", "やすみ**だ** → やすみだと おもいます"],
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Unlike with かもしれません, {{naadj:na-adj}} and {{nom:noun}} **must keep だ** before と: やすみ**だと** おもいます.",
            "In Japanese, to say “I don't think X will happen”, you usually negate the inner predicate rather than 思う: **こない**と おもいます (preferable to くると おもいません).",
          ],
        },
        examples: [
          {
            jp: "あ、きょうは やすみだと おもいますよ。",
            gloss: "Ah, I think today is a day off, you know.",
          },
          {
            jp: "リーさんは きょう くると おもいます。",
            gloss: "I think Mr. Lee will come today.",
          },
          {
            jp: "いいえ、まだ さむいと おもいます。",
            gloss: "No, I think it is still cold.",
          },
        ],
      },
    ],
  },
  {
    id: "g-raison",
    jpTitle: "りゆう",
    title: "Giving a reason",
    notions: [
      {
        number: 4,
        slug: "kara-node",
        sidebarLabel: "Reasons — kara / node",
        titleJp: "から ／ ので",
        objective: "Provide the reason or cause for a situation using the appropriate register and nuance.",
        exampleGloss: "“Since it's raining, I'm staying home.”",
        blocks: [
          {
            type: "sub",
            label: "Sub-point A — から (Subjective, personal, conversational)",
            blocks: [
              {
                type: "rule",
                lines: ["[clause: plain __or__ polite] + **から**、 [result]"],
              },
              {
                type: "paragraph",
                text: "Subjective and personal. Compatible with polite endings before it (あついですから). Can precede requests, suggestions, or direct imperatives. Can finish a reply standalone: 「どうして？」→「さむいからです。」",
              },
            ],
          },
          {
            type: "sub",
            label: "Sub-point B — ので (Objective, polite, softened cause)",
            blocks: [
              {
                type: "rule",
                lines: ["[clause: **short form**] + **ので**、 [result]"],
              },
              {
                type: "table",
                headers: ["Word nature", "Connection before ので"],
                rows: [
                  ["{{verbe:Verb}}", "Short form (くる ので)"],
                  ["{{adj:i-adj}}", "Short form (いたい ので)"],
                  ["{{naadj:na-adj}}", "Takes **な** (すき**な** ので)"],
                  ["{{nom:Noun}}", "Takes **な** (びょうき**な** ので)"],
                ],
              },
            ],
          },
        ],
        attention: {
          label: "Watch out — Common Exam Trap",
          items: [
            "Use **な** before ので, but **だ** before から: すき**な**ので vs すき**だ**から.",
            "ので is much softer and socially polite, making it the ideal choice when asking a favour or making an apology: さむいので、まどを しめて いただけませんか。",
          ],
        },
        examples: [
          {
            jp: "びょうきなので、びょういんへ いきます。",
            gloss: "Because I am sick, I am going to the hospital.",
          },
          {
            jp: "コーヒーが すきなので、よく のみます。",
            gloss: "Since I like coffee, I drink it often.",
          },
          {
            jp: "きのう あめが ふったから、せんたくできませんでした。",
            gloss: "Because it rained yesterday, I couldn't do the laundry.",
          },
          {
            jp: "じかんが ないから、はやく してください。",
            gloss: "We don't have time, so please hurry up.",
          },
        ],
      },
    ],
  },
  {
    id: "g-toki",
    jpTitle: "とき",
    title: "Placing something in time",
    notions: [
      {
        number: 5,
        slug: "toki",
        sidebarLabel: "Time — toki",
        titleJp: "「とき」＋ げんけい／た",
        titleKanji: "時 · 原形／た",
        objective: "Say “when…” while accurately anchoring chronological sequence with relative tenses.",
        exampleGloss: "“When I eat (before eating)” vs “When I have eaten (after eating).”",
        blocks: [
          {
            type: "table",
            label: "Connections before とき",
            headers: ["Category", "Rule", "Example"],
            rows: [
              ["{{nom:Noun}}", "+ **の**", "がくせい**の** とき (when I was a student)"],
              ["{{naadj:na-adj}}", "+ **な**", "ひま**な** とき (when I am free)"],
              ["{{adj:i-adj}}", "as is (keep い)", "あつい とき (when it is hot)"],
              ["{{verbe:Verb}}", "Dictionary form OR た-form", "See sequence rule below"],
            ],
          },
          {
            type: "rule",
            label: "The Golden Rule of Relative Tense before とき",
            lines: [
              "{{verbe:Dictionary form}} + とき → The main clause occurs **before or during** the とき action.",
              "{{verbe:た-form}} + とき → The main clause occurs **after** the とき action is fully completed.",
            ],
          },
          {
            type: "paragraph",
            text: "Notice that the tense of the verb before とき is relative to the main verb, not to the moment of speaking.",
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "{{nom:Noun}} takes **の** ; {{naadj:na-adj}} takes **な**. Never swap them.",
            "とき never takes polite endings (です/ます) before it.",
            "Classic comparison: ごはんを **たべる** とき = before eating (e.g. いただきます) ; ごはんを **たべた** とき = after eating (e.g. ごちそうさま).",
          ],
        },
        examples: [
          {
            jp: "がくせいの とき、えいごを べんきょうしました。",
            gloss: "When I was a student, I studied English.",
          },
          {
            jp: "ひまな ときに テレビを みます。",
            gloss: "When I have free time, I watch TV.",
          },
          {
            jp: "べんきょうする とき、じしょが いります。",
            gloss: "When studying (before/during), I need a dictionary.",
          },
          {
            jp: "にほんへ くる とき、たくさん ほんを もって きました。",
            gloss: "When I came to Japan (before departure / on the way), I brought many books.",
          },
          {
            jp: "くにへ かえった とき、ともだちに あいました。",
            gloss: "When I got back to my country (after arriving), I met my friends.",
          },
        ],
      },
    ],
  },
  {
    id: "g-verbtypes",
    jpTitle: "どうしの タイプ",
    title: "Types of verbs",
    notions: [
      {
        number: 6,
        slug: "verb-types",
        sidebarLabel: "Transitive vs intransitive verbs",
        titleJp: "どうしの タイプ",
        titleKanji: "動詞のタイプ",
        objective: "Select the correct particle and verb pair based on transitive/intransitive syntax.",
        exampleGloss: "“The door opens (by itself)” vs “I open the door.”",
        blocks: [
          {
            type: "table",
            label: "The 3 Primary Structural Types",
            headers: ["Type", "Structure", "Meaning / Usage"],
            rows: [
              [
                "**Type 1** (Intransitive)",
                "{{nom:Noun}} **が** + {{verbe:verb}}",
                "Spontaneous event or state happening on its own",
              ],
              [
                "**Type 2** (Transitive)",
                "{{nom:Noun}} **を** + {{verbe:verb}}",
                "Action performed deliberately by an agent upon an object",
              ],
              [
                "**Type 3** (Ditransitive)",
                "{{nom:Recipient}} **に** + {{nom:Noun}} **を** + {{verbe:verb}}",
                "Action directed toward a recipient (show, teach, give)",
              ],
            ],
          },
          {
            type: "table",
            label: "Crucial Pairs to Memorize",
            headers: ["Intransitive (が)", "Transitive (を)"],
            rows: [
              ["みえます {{gloss:is visible / can be seen}}", "みます {{gloss:to look at / watch}}"],
              ["きこえます {{gloss:is audible / can be heard}}", "ききます {{gloss:to listen to}}"],
              ["つきます {{gloss:turns on}}", "つけます {{gloss:to turn on}}"],
              ["きえます {{gloss:turns off / goes out}}", "けします {{gloss:to turn off}}"],
              ["あきます {{gloss:opens}}", "あけます {{gloss:to open}}"],
              ["しまります {{gloss:closes}}", "しめます {{gloss:to close}}"],
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "**みえます** and **きこえます** express spontaneous sensory perception (natural ability to see/hear without effort). They strictly mark their target with **が**: ふじさん**が** みえます.",
          ],
        },
        examples: [
          {
            jp: "ふじさんが みえます。",
            gloss: "Mt. Fuji is visible. (Type 1 · spontaneous perception)",
          },
          {
            jp: "せんせいが テレビを みます。",
            gloss: "The teacher watches TV. (Type 2 · deliberate action)",
          },
          {
            jp: "せんせいが がくせいに しゃしんを みせます。",
            gloss: "The teacher shows photos to the students. (Type 3 · recipient に)",
          },
        ],
      },
    ],
  },
  {
    id: "g-opposition",
    jpTitle: "ぎゃくせつ",
    title: "Expressing contrast (“but”)",
    notions: [
      {
        number: 7,
        slug: "contrast",
        sidebarLabel: "Expressing contrast (but)",
        titleJp: "でも ／ けれども ／ しかし ／ が",
        objective: "Contrast two opposing ideas while maintaining appropriate sentence boundaries and register.",
        exampleGloss: "“It's delicious, but expensive.”",
        blocks: [
          {
            type: "sub",
            label: "Sub-point A — New Sentence Starters (でも · しかし)",
            blocks: [
              { type: "rule", lines: ["Sentence 1**。** **でも** / **しかし**、 Sentence 2**。**"] },
              {
                type: "paragraph",
                text: "These open a brand-new sentence after a period. **でも** is conversational; **しかし** is formal, literary, or used in speeches.",
              },
            ],
          },
          {
            type: "sub",
            label: "Sub-point B — Conjunction Particles (が · けれども)",
            blocks: [
              { type: "rule", lines: ["Clause 1 **が** / **けれども**、 Clause 2**。**"] },
              {
                type: "paragraph",
                text: "These connect two clauses inside the same sentence. **が** typically follows the polite form (〜ですが); **けれども** (or casual けど) comfortably follows the short form.",
              },
            ],
          },
        ],
        attention: {
          label: "Watch out — Structural Distinction",
          items: [
            "**でも** and **しかし** must begin a **new sentence** after a full stop (。).",
            "**が** and **けれども** are conjunctive particles that connect clauses **within a single sentence**.",
          ],
        },
        examples: [
          {
            jp: "この ほんは おもしろいですが、すこし むずかしいです。",
            gloss: "This book is interesting, but a bit difficult.",
          },
          {
            jp: "かんこくの りょうりですが、あまり からく ありません。",
            gloss: "It is Korean cuisine, but it isn't very spicy.",
          },
          {
            jp: "きのうは あたまが いたかったけれども、やすみませんでした。",
            gloss: "I had a headache yesterday, but I did not take time off.",
          },
          {
            jp: "はるに なりました。でも、あたたかく なりません。",
            gloss: "Spring has arrived. But it hasn't become warm.",
          },
          {
            jp: "にほんの きものは きれいです。しかし、とても たかいです。",
            gloss: "Japanese kimonos are beautiful. However, they are very expensive.",
          },
        ],
      },
    ],
  },
  {
    id: "g-adjlink",
    jpTitle: "けいようしの せつぞく",
    title: "Linking descriptive words",
    notions: [
      {
        number: 8,
        slug: "linking-adjectives",
        sidebarLabel: "Linking two descriptive words",
        titleJp: "けいようし などの せつぞく",
        titleKanji: "形容詞などの接続",
        objective: "Chain two or more adjectives or nouns together smoothly.",
        exampleGloss: "“A cheap and delicious restaurant.”",
        blocks: [
          {
            type: "rule",
            label: "Connection Formulas",
            lines: [
              "{{adj:i-adj}}: Replace final い with **くて** → やすい → やす**くて** おいしい",
              "{{naadj:na-adj}} / {{nom:noun}}: Replace だ with **で** → しずか**で** ひろい",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Irregular: {{adj:いい}} becomes **よくて** (never いくて).",
            "When the compound descriptor modifies a following noun, the last adjective keeps its normal linking form: やすくて きれい**な** シャツ.",
          ],
        },
        examples: [
          {
            jp: "しろくて いい へやです。",
            gloss: "It is a white and nice room.",
          },
          {
            jp: "やすくて きれいな シャツを かいました。",
            gloss: "I bought a cheap and pretty shirt.",
          },
          {
            jp: "げんきで おもしろい がくせいです。",
            gloss: "He is an energetic and entertaining student.",
          },
          {
            jp: "きれいで しずかな こうえんです。",
            gloss: "It is a beautiful and quiet park.",
          },
        ],
      },
    ],
  },
  {
    id: "g-onaji",
    jpTitle: "おなじ",
    title: "Same / different",
    notions: [
      {
        number: 9,
        slug: "same-different",
        sidebarLabel: "Same vs different",
        titleJp: "おなじ",
        titleKanji: "同じ",
        objective: "Express similarity, identical characteristics, or differences between items.",
        exampleGloss: "“A and B have the same birthday” / “A and B are different.”",
        blocks: [
          {
            type: "rule",
            label: "Formulas",
            lines: [
              "A と B は **おなじです** / **おなじじゃ ありません** (A and B are / are not the same)",
              "A と B は **ちがいます** (A and B are different)",
              "おなじ + {{nom:noun}} → おなじ ほん (the same book)",
              "おなじように + {{verbe:verb}} → in the same manner",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "**おなじ** functions grammatically like a na-adjective but **does NOT take な** when modifying a noun directly: ○ おなじ ほん / × おなじ**な** ほん.",
            "“Different” in Japanese is not an adjective; it is the verb **ちがいます** (plain: ちがう).",
          ],
        },
        examples: [
          {
            jp: "たなかさんと マリさんは たんじょうびが おなじです。",
            gloss: "Tanaka-san and Mari-san have the same birthday.",
          },
          {
            jp: "A と B は ちがいます。",
            gloss: "A and B are different.",
          },
          {
            jp: "せんせいと おなじように かいて ください。",
            gloss: "Please write in the same way as the teacher.",
          },
        ],
      },
    ],
  },
  {
    id: "g-permission",
    jpTitle: "きょか",
    title: "Asking for permission",
    notions: [
      {
        number: 10,
        slug: "permission",
        sidebarLabel: "Asking permission",
        titleJp: "〜てもいいですか",
        objective: "Ask for or grant permission, or explain that an action is unnecessary.",
        exampleGloss: "“May I take a photo?” / “You don't need to write.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{verbe:Verb -te}} + **も いいですか** → May I / Is it okay to…?",
              "{{verbe:Verb -nakute}} + **も いいです** → You don't have to / No need to…",
            ],
          },
          {
            type: "paragraph",
            text: "Hierarchy of politeness when requesting permission: 〜てもいいですか (standard polite) → 〜てもかまいませんか (softer) → 〜てもよろしいでしょうか (very formal / business).",
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "The negative form passes through ない → **なくて**: たべない → たべ**なくて**もいいです.",
            "Ensure the て-form is formed accurately: とる → とっ**て** → とっ**ても** (never とっと).",
          ],
        },
        examples: [
          {
            jp: "すみませんが、まどを あけてもいいですか。",
            gloss: "Excuse me, may I open the window?",
          },
          {
            jp: "すみません、ここで しゃしんを とってもいいですか。",
            gloss: "Excuse me, is it okay if I take photos here?",
          },
          {
            jp: "こちらに すわってもよろしいでしょうか。",
            gloss: "May I have your permission to sit here? (Very polite)",
          },
        ],
      },
    ],
  },
  {
    id: "g-choix",
    jpTitle: "それとも",
    title: "Offering a choice",
    notions: [
      {
        number: 11,
        slug: "choice-soretomo",
        sidebarLabel: "Offering a choice",
        titleJp: "せつぞくし「それとも」",
        titleKanji: "接続詞「それとも」",
        objective: "Offer an alternative between two distinct questions.",
        exampleGloss: "“Shall we have dinner, or watch a movie?”",
        blocks: [
          { type: "rule", label: "Rule", lines: ["Question 1 **か。** **それとも** Question 2 **か。**"] },
        ],
        attention: {
          label: "Watch out",
          items: [
            "**それとも** exclusively links **two interrogative sentences**, not individual nouns in a single sentence (use や or か between nouns instead). Both questions retain their question particle か.",
          ],
        },
        examples: [
          {
            jp: "しょくじしましょうか。それとも えいがを みましょうか。",
            gloss: "Shall we have a meal? Or shall we watch a movie?",
          },
          {
            jp: "ジュースが いいですか。それとも コーラが いいですか。",
            gloss: "Would you like juice? Or would you prefer cola?",
          },
          {
            jp: "スーパーで かいますか。それとも コンビニで かいますか。",
            gloss: "Will you buy it at the supermarket? Or at the convenience store?",
          },
        ],
      },
    ],
  },
  {
    id: "g-lieu",
    jpTitle: "ばしょの じょし",
    title: "Place particles",
    notions: [
      {
        number: 12,
        slug: "particles-place",
        sidebarLabel: "Place particles — ni / de / wo",
        titleJp: "かんけいじょし「に・で・を」",
        titleKanji: "関係助詞",
        objective: "Select between に, で, and を depending on the spatial relationship to the action.",
        exampleGloss: "“Enter a place (に) / perform an action in a place (で) / leave a place (を).”",
        blocks: [
          {
            type: "rule",
            label: "The Spatial Trio",
            lines: [
              "{{nom:Place}} **に** はいります / いきます → Point of arrival / entry",
              "{{nom:Place}} **で** かいものします / たべます → Location where dynamic action takes place",
              "{{nom:Place}} **を** でます / はなれます → Point of departure / leaving a space",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "**を** is not just for direct objects; it also marks the **point of origin left behind** (デパートを でます) or motion traversed through (こうえんを さんぽします).",
          ],
        },
        examples: [
          {
            jp: "デパートに はいります。／ デパートで かいものします。／ デパートを でます。",
            gloss: "I enter the department store (に) / shop at the department store (で) / exit the department store (を).",
          },
          {
            jp: "きっさてんに はいります。／ きっさてんで コーヒーを のみます。／ きっさてんを でます。",
            gloss: "I enter the café (に) / drink coffee in the café (で) / leave the café (を).",
          },
        ],
      },
    ],
  },
  {
    id: "g-but",
    jpTitle: "に ＋ ほうこうの どうし",
    title: "Going somewhere to do something",
    notions: [
      {
        number: 13,
        slug: "going-to-do",
        sidebarLabel: "Purpose of a trip",
        titleJp: "「に」＋ ほうこうの どうし",
        titleKanji: "に＋方向の動詞",
        objective: "Express the intended purpose of going, coming, or returning somewhere.",
        exampleGloss: "“I'm going to Shinjuku to eat.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{nom:Place}} へ + {{verbe:verb stem (-masu drop)}} + **に** + いきます／きます／かえります",
              "{{nom:Place}} へ + {{nom:verbal noun}} + **に** + いきます／きます／かえります",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Drop ます from the verb: たべ**ます** → たべ**に** いきます.",
            "For する-actions, either use the noun alone or stem: べんきょう**に** or べんきょう**しに**.",
            "Direct objects remain marked by を ahead of the stem: てがみ**を** だし**に** いきます.",
          ],
        },
        examples: [
          {
            jp: "ゆうびんきょくへ てがみを だしに いきます。",
            gloss: "I'm going to the post office to mail a letter.",
          },
          {
            jp: "おそばを たべに いきましょう。",
            gloss: "Let's go eat some soba.",
          },
          {
            jp: "にほんへ にほんごの べんきょうに きました。",
            gloss: "I came to Japan to study Japanese.",
          },
        ],
      },
    ],
  },
  {
    id: "g-relative",
    jpTitle: "めいしを せつめいする",
    title: "Describing a noun · ability",
    notions: [
      {
        number: 14,
        slug: "describe-noun",
        sidebarLabel: "Building relative clauses",
        titleJp: "どうし ＋ めいし",
        titleKanji: "動詞＋名詞 (proposition relative)",
        objective: "Modify a noun with a descriptive clause placed immediately before it.",
        exampleGloss: "“The book I bought yesterday” / “The person wearing a red shirt.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["[modifying clause in **short form**] + {{nom:noun}} (no particle between them)"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "The subject **inside** the modifying relative clause is marked with **が**, never は: （わたし**が**）かった ほん.",
            "The modifying verb must always be in the **short/plain form** (e.g. かった ほん, never かいました ほん).",
          ],
        },
        examples: [
          {
            jp: "これは、きのう かった ほんです。",
            gloss: "This is the book that I bought yesterday.",
          },
          {
            jp: "リーさんは あかい シャツを きている ひとです。",
            gloss: "Mr. Lee is the person wearing a red shirt.",
          },
          {
            jp: "あした みる えいがは なんですか。",
            gloss: "What is the film that you will watch tomorrow?",
          },
          {
            jp: "けさ みた サッカーの しあいです。",
            gloss: "It is the soccer match that I watched this morning.",
          },
        ],
      },
      {
        number: 15,
        slug: "ability",
        sidebarLabel: "Expressing ability",
        titleJp: "ことが できる",
        objective: "Express the ability or objective possibility to perform an action.",
        exampleGloss: "“I can read kanji” / “I cannot drink alcohol.”",
        blocks: [
          { type: "rule", label: "Rule", lines: ["{{verbe:Dictionary-form verb}} + **ことが できます**"] },
        ],
        attention: {
          label: "Watch out",
          items: [
            "The verb must strictly be in **dictionary form**: よむ ことが できます.",
            "The target of the action retains the direct object marker **を**: かんじ**を** よむ ことが できます.",
            "Do not confuse with **〜た ことが あります**, which describes past personal experience.",
          ],
        },
        examples: [
          {
            jp: "かんじを よむ ことが できます。",
            gloss: "I can read kanji.",
          },
          {
            jp: "おさけを のむ ことが できません。",
            gloss: "I cannot drink alcohol.",
          },
          {
            jp: "にほんりょうりを つくる ことが できますか。→ ええ、できます。",
            gloss: "Can you make Japanese food? → Yes, I can.",
          },
        ],
      },
    ],
  },
  {
    id: "g-existence",
    jpTitle: "そんざいと ばしょ",
    title: "Existence & location",
    notions: [
      {
        number: 16,
        slug: "existence-aru-iru",
        sidebarLabel: "Existence — aru vs iru",
        titleJp: "どうし「ある／いる」",
        titleKanji: "存在",
        objective: "State the location of inanimate vs animate entities.",
        exampleGloss: "“The pen is on the desk” / “Tanaka-san is on the 2nd floor.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{nom:Inanimate thing / plant}} は {{nom:place}} に **あります**",
              "{{nom:Animate person / animal}} は {{nom:place}} に **います**",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Plants take **あります** because they cannot move autonomously.",
            "Honorific equivalent of います for a superior: **いらっしゃいます**.",
          ],
        },
        examples: [
          {
            jp: "ペンは つくえの うえに あります。",
            gloss: "The pen is on top of the desk.",
          },
          {
            jp: "たなかさんは 2かいに います。",
            gloss: "Tanaka-san is on the second floor.",
          },
          {
            jp: "せんせいは きょうしつに いらっしゃいます。",
            gloss: "The teacher is in the classroom. (Honorific)",
          },
        ],
      },
      {
        number: 17,
        slug: "nimo-niwa",
        sidebarLabel: "Place particles — nimo / niwa",
        titleJp: "かんけいじょし ＋ せんたくじょし",
        titleKanji: "に＋も / に＋は",
        objective: "State inclusion across multiple locations (“at X as well as Y”) or highlight contrast between places.",
        exampleGloss: "“There are stores in Shinjuku as well as Ikebukuro” / “Not here, but over there.”",
        blocks: [
          {
            type: "rule",
            label: "Compound Particle Meanings",
            lines: [
              "{{nom:Place}} **にも** … {{nom:Place}} **にも** あります／います → “both here and there as well”",
              "{{nom:Place}} **には** あります／ありません → Topical contrast: “at this specific place, however…”",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "**にも** = に (location) + も (addition: also).",
            "**には** = に (location) + は (contrast/topic). It frequently highlights an opposing negative state elsewhere: たかだのばばに ありませんが、しんじゅく**には** あります.",
          ],
        },
        examples: [
          {
            jp: "デパートは しんじゅくにも いけぶくろにも あります。",
            gloss: "There are department stores in Shinjuku as well as in Ikebukuro.",
          },
          {
            jp: "きょうしつは 1かいにも 2かいにも あります。",
            gloss: "There are classrooms on the 1st floor as well as on the 2nd floor.",
          },
          {
            jp: "デパートは たかだのばばに ありません。しんじゅくには あります。",
            gloss: "There are no department stores in Takadanobaba. In Shinjuku, however, there are.",
          },
          {
            jp: "アメリカにも フランスにも ともだちが います。",
            gloss: "I have friends in America as well as in France.",
          },
        ],
      },
    ],
  },
  {
    id: "g-rang",
    jpTitle: "〜め",
    title: "The Nth (position)",
    notions: [
      {
        number: 18,
        slug: "ordinal-numbers",
        sidebarLabel: "Counting vs ranking",
        titleJp: "じすうし ＋ め",
        titleKanji: "時数詞＋目",
        objective: "Indicate the ordinal position or rank of something in a series.",
        exampleGloss: "“The 3rd building from the corner” / “The 2nd person from the right.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{compteur:counter}} + **目（め）** → ふたつ**め** (2nd)、さんにん**め** (3rd person)"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Without 目 = **cardinal quantity** (ふたつ = two items).",
            "With 目 = **ordinal rank** (ふたつめ = the second item). Often paired with から (starting point): みぎから 3にんめ.",
          ],
        },
        examples: [
          {
            jp: "デパートは かどから 3つめです。",
            gloss: "The department store is the 3rd building from the corner.",
          },
          {
            jp: "みぎから 3にんめが ハンさんです。",
            gloss: "The 3rd person from the right is Han-san.",
          },
          {
            jp: "たかだのばばは、いけぶくろから 2つめです。",
            gloss: "Takadanobaba is the 2nd stop from Ikebukuro.",
          },
        ],
      },
    ],
  },
  {
    id: "g-comparaison",
    jpTitle: "ひかく",
    title: "Comparing",
    notions: [
      {
        number: 19,
        slug: "comparison",
        sidebarLabel: "Making comparisons",
        titleJp: "ひかくの ひょうげん",
        titleKanji: "比較",
        objective: "Compare items: pairwise, superlative, or by stating that one does not match up to another.",
        exampleGloss: "“A is more ~ than B” / “The most ~ in the group” / “Not as ~ as B.”",
        blocks: [
          {
            type: "sub",
            label: "Sub-point A — Pairwise Comparison (Between two items)",
            blocks: [
              {
                type: "rule",
                lines: [
                  "**Question:** A と B と どちらの ほうが [adjective] ですか",
                  "**Answer:** A **より** B **の ほうが** [adjective] です",
                ],
              },
              {
                type: "paragraph",
                text: "**より** attaches to the item that loses / benchmark. **のほうが** attaches to the winner. To choose both: どちらも 〜です.",
              },
            ],
          },
          {
            type: "sub",
            label: "Sub-point B — Superlative (The most within a category)",
            blocks: [
              { type: "rule", lines: ["[category / group] の なか**で** [item] **が いちばん** [adjective] です"] },
              {
                type: "paragraph",
                text: "The question uses なに／だれ／どこ／どれ**が** (never は). The chosen winner takes が.",
              },
            ],
          },
          {
            type: "sub",
            label: "Sub-point C — Inferiority Comparison (Not as much as…)",
            blocks: [
              { type: "rule", lines: ["A は B **ほど** [adjective negative]"] },
              {
                type: "paragraph",
                text: "**ほど** must always be followed by a negative predicate. It means “not to the extent of B”.",
              },
            ],
          },
        ],
        attention: {
          label: "Watch out — 3 Key Words",
          items: [
            "**より** (the benchmark/loser) · **のほうが** (the superior/winner) · **ほど + negative** (not as ~ as).",
          ],
        },
        examples: [
          {
            jp: "うえださんと きむらさんと どちらの ほうが せが たかいですか。→ うえださんより きむらさんの ほうが せが たかいです。",
            gloss: "Between Ueda-san and Kimura-san, who is taller? → Kimura-san is taller than Ueda-san.",
          },
          {
            jp: "くだものの なかで さくらんぼが いちばん すきです。",
            gloss: "Among fruits, I like cherries the most.",
          },
          {
            jp: "にほんで いちばん たかい やまは ふじさんです。",
            gloss: "The highest mountain in Japan is Mt. Fuji.",
          },
          {
            jp: "ラーメンも すきですが、おすしほど じゃ ありません。",
            gloss: "I like ramen too, but not as much as sushi.",
          },
          {
            jp: "しんかんせんは ひこうきほど はやく ありません。",
            gloss: "The Shinkansen is not as fast as an airplane.",
          },
        ],
      },
    ],
  },
  {
    id: "g-sa",
    jpTitle: "〜さ",
    title: "Adjective → noun",
    notions: [
      {
        number: 20,
        slug: "sa-nominalizer",
        sidebarLabel: "Adjective → noun conversion",
        titleJp: "けいようし ＋ さ",
        titleKanji: "形容詞＋さ",
        objective: "Convert an adjective into an objective measurable noun.",
        exampleGloss: "“Height, weight, width, size.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{adj:i-adj}} (drop い) + **さ** → たかい → たか**さ** (height)",
              "{{naadj:na-adj}} (drop な) + **さ** → べんり → べんり**さ** (convenience)",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Focuses on measurable dimensions: たかさ (height), おもさ (weight), ひろさ (spaciousness/area), ながさ (length). Do not confuse with 〜そう (visual appearance).",
          ],
        },
        examples: [
          {
            jp: "へやの ひろさは どのぐらいですか。",
            gloss: "How spacious is the room (what is its surface area)?",
          },
          {
            jp: "スカイツリーの たかさは 634メートルです。",
            gloss: "The height of Tokyo Skytree is 634 meters.",
          },
          {
            jp: "ひこうきに のる ときに かばんの おもさを はかります。",
            gloss: "When boarding an airplane, they measure the weight of the bag.",
          },
        ],
      },
    ],
  },
  {
    id: "g-ordre",
    jpTitle: "こうどうを つなぐ",
    title: "Ordering & linking actions",
    notions: [
      {
        number: 21,
        slug: "sequencing-actions",
        sidebarLabel: "Sequencing actions",
        titleJp: "まず ／ それから",
        objective: "Order a sequential procedure step by step.",
        exampleGloss: "“First…, and after that…”",
        blocks: [
          { type: "rule", label: "Rule", lines: ["**まず**、〜。 **それから**、〜。"] },
        ],
        attention: {
          label: "Watch out",
          items: [
            "**それから** links chronological actions in order. Do not confuse it with **それとも**, which offers a question choice.",
          ],
        },
        examples: [
          {
            jp: "まず、ひらがなを べんきょうします。それから、カタカナを べんきょうします。",
            gloss: "First, I study hiragana. And then, I study katakana.",
          },
          {
            jp: "まず、なまえを いって ください。それから、よんで ください。",
            gloss: "First, please state your name. After that, please read.",
          },
        ],
      },
      {
        number: 22,
        slug: "te-naide",
        sidebarLabel: "Linking actions — te vs naide",
        titleJp: "どうし て、どうし ／ どうし ないで、どうし",
        objective: "Contrast doing an action sequentially vs doing an action without performing another.",
        exampleGloss: "“I return home and eat” vs “I study without watching TV.”",
        blocks: [
          {
            type: "sub",
            label: "Sub-point A — 〜て: Chronological Sequence (Do X, then Y)",
            blocks: [
              {
                type: "rule",
                lines: ["{{verbe:Verb -te}}、 {{verbe:verb}}。 → Sequential actions with the same subject"],
              },
            ],
          },
          {
            type: "sub",
            label: "Sub-point B — 〜ないで: Negative Accompaniment (Do Y without X)",
            blocks: [
              {
                type: "rule",
                lines: ["{{verbe:Verb -naide}}、 {{verbe:verb}}。 → Doing the main action without doing X"],
              },
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "The grammatical tense of the entire sentence is borne strictly by the **final verb**.",
            "Form both precisely: て-form (かえる → かえっ**て**) vs ないで-form (みる → み**ないで**).",
          ],
        },
        examples: [
          {
            jp: "いえへ かえって、ごはんを たべます。",
            gloss: "I go home and then eat a meal.",
          },
          {
            jp: "ともだちに あって、いっしょに しょくじしました。",
            gloss: "I met my friend and then we had a meal together.",
          },
          {
            jp: "テレビを みないで、べんきょうしました。",
            gloss: "I studied without watching TV.",
          },
          {
            jp: "さとうを いれないで、コーヒーを のみます。",
            gloss: "I drink coffee without putting sugar in.",
          },
        ],
      },
    ],
  },
  {
    id: "g-change",
    jpTitle: "なる ／ する",
    title: "Becoming / making",
    notions: [
      {
        number: 23,
        slug: "naru-suru",
        sidebarLabel: "Becoming vs. making",
        titleJp: "なる ／ する",
        objective: "Distinguish between natural transformation (なる) and deliberate causation (する).",
        exampleGloss: "“It is becoming warm” vs “I will make the room clean.”",
        blocks: [
          {
            type: "sub",
            label: "Sub-point A — なる: Becoming (Natural/Spontaneous Change)",
            blocks: [
              {
                type: "rule",
                lines: [
                  "{{adj:i-adj}} → **く** なる → あたたか**く** なります (becomes warm)",
                  "{{naadj:na-adj}} / {{nom:noun}} → **に** なる → しずか**に** なります / せんせい**に** なります",
                  "{{verbe:Potential verb}} + **ように** なる → to come to be able to do",
                ],
              },
            ],
          },
          {
            type: "sub",
            label: "Sub-point B — する: Making / Causing (Deliberate Action)",
            blocks: [
              {
                type: "rule",
                lines: [
                  "{{adj:i-adj}} → **く** する → おおき**く** します (make it bigger)",
                  "{{naadj:na-adj}} / {{nom:noun}} → **に** する → きれい**に** します (clean up)",
                ],
              },
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Adjective transformation is identical for both: i-adj drops い for **く**, na-adj takes **に**.",
            "**なる** = change occurs on its own. **する** = an active agent intentionally enforces the change.",
          ],
        },
        examples: [
          {
            jp: "びょうきでしたが、げんきに なりました。",
            gloss: "I was sick, but I have become healthy / recovered.",
          },
          {
            jp: "もうすぐ あたたかく なります。",
            gloss: "It will become warm soon.",
          },
          {
            jp: "にほんごが すこし わかるように なりました。",
            gloss: "I have come to understand Japanese a little bit.",
          },
          {
            jp: "へやを きれいに します。",
            gloss: "I will make the room clean (clean up).",
          },
          {
            jp: "この スープは ぬるいですね。あたたかく しましょう。",
            gloss: "This soup is lukewarm, isn't it? Let's make it hot.",
          },
        ],
      },
    ],
  },
  {
    id: "g-adverbe",
    jpTitle: "けいようし → ふくし",
    title: "Adjective → adverb",
    notions: [
      {
        number: 24,
        slug: "adjective-adverb",
        sidebarLabel: "Adjective → adverb",
        titleJp: "けいようし ＋ どうし",
        titleKanji: "形容詞＋動詞 (adverbe)",
        objective: "Transform an adjective into an adverb modifying a following verb.",
        exampleGloss: "“Write clearly” / “Sing skillfully.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{adj:i-adj}}: Replace い with **く** + {{verbe:verb}} → おおき**く** かきます (write big)",
              "{{naadj:na-adj}}: Add **に** + {{verbe:verb}} → きれい**に** かきます (write neatly)",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Follows the exact same morphologic shift as なる/する: i-adj → **く** · na-adj → **に**.",
          ],
        },
        examples: [
          {
            jp: "おおきく かいて ください。",
            gloss: "Please write in large letters.",
          },
          {
            jp: "ひらがなを きれいに かきましょう。",
            gloss: "Let's write hiragana neatly.",
          },
          {
            jp: "にほんごの うたを じょうずに うたいたいんです。",
            gloss: "I want to sing Japanese songs skillfully.",
          },
        ],
      },
    ],
  },
  {
    id: "g-sou",
    jpTitle: "〜そう",
    title: "Looking like / seeming",
    notions: [
      {
        number: 25,
        slug: "sou-seeming",
        sidebarLabel: "Looking like / seeming",
        titleJp: "〜そう",
        objective: "State an intuitive visual impression (“it looks like…” / “it seems…”).",
        exampleGloss: "“This cake looks delicious” / “It looks like it will rain.”",
        blocks: [
          {
            type: "sub",
            label: "Sub-point A — Base Form (Conjugation of Appearance)",
            blocks: [
              {
                type: "rule",
                lines: [
                  "{{adj:i-adj}} (drop い) + **そうです** → おいし**そう**です",
                  "{{naadj:na-adj}} (drop な) + **そうです** → げんき**そう**です",
                  "{{verbe:verb stem (-masu drop)}} + **そうです** → ふり**そう**です (looks about to rain)",
                  "Negative of adjectives: 〜く**なさそう**です → たかくなさそうです",
                ],
              },
            ],
          },
          {
            type: "sub",
            label: "Sub-point B — Before a Noun or Verb",
            blocks: [
              {
                type: "rule",
                lines: [
                  "〜**そうな** + {{nom:noun}} → おもしろ**そうな** ほん (an interesting-looking book)",
                  "〜**そうに** + {{verbe:verb}} → おいし**そうに** たべます (eat with relish / seemingly deliciously)",
                ],
              },
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Two essential irregulars: {{adj:いい}} becomes **よさそう** ; {{adj:ない}} becomes **なさそう**.",
            "**Appearance そう** (stem + そう) is fundamentally different from **Hearsay そう** (short form + そうだ, e.g. おいしいそうだ = “I heard it is delicious”).",
          ],
        },
        examples: [
          {
            jp: "この ケーキは おいしそうです。",
            gloss: "This cake looks delicious.",
          },
          {
            jp: "あめが ふりそうです。",
            gloss: "It looks like it is about to rain.",
          },
          {
            jp: "この みせは、あんまり たかくなさそうです。",
            gloss: "This shop doesn't look very expensive.",
          },
          {
            jp: "これは、おもしろそうな ほんですね。",
            gloss: "This looks like an interesting book, doesn't it?",
          },
          {
            jp: "がくせいが たのしそうに はなして います。",
            gloss: "The students are talking happily (looking like they are having fun).",
          },
        ],
      },
    ],
  },
  {
    id: "g-decision",
    jpTitle: "きめる",
    title: "Deciding on something",
    notions: [
      {
        number: 26,
        slug: "decision",
        sidebarLabel: "Deciding on something",
        titleJp: "〜にする ／ 〜ことにする",
        objective: "Express an active choice among items or a conscious personal decision to act.",
        exampleGloss: "“I'll choose coffee” / “I've decided to move house.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{nom:Noun}} + **に します** → Selection among items (コーヒーに します)",
              "{{verbe:Dictionary-form verb}} + **ことに します** → Decision to perform an action (いくことに します)",
              "{{verbe:ない-form verb}} + **ことに します** → Decision NOT to do an action (すわないことに します)",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "**〜にする** for selecting an item (food orders, dates). **〜ことにする** for deciding on an activity.",
            "Nuance contrast: 〜ことに**する** = I actively decide · 〜ことに**なる** (L4/L5 notion 49) = it has been decided by external circumstances or rules.",
          ],
        },
        examples: [
          {
            jp: "コーヒーに します。",
            gloss: "I'll have coffee. (Choosing from a menu)",
          },
          {
            jp: "パーティーは らいしゅうに しましょう。",
            gloss: "Let's settle on next week for the party.",
          },
          {
            jp: "いまの へやは せまいから、ひっこしすることに しました。",
            gloss: "Since my current room is cramped, I decided to move out.",
          },
          {
            jp: "あしたから たばこを すわないことに します。",
            gloss: "Starting tomorrow, I have decided not to smoke.",
          },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// CHECKLIST
// ─────────────────────────────────────────────────────────────────

export const checklist: ChecklistSection = {
  id: "checklist",
  title: "✅ Quick checklist before the exam",
  sidebarLabel: "✅ Quick checklist",
  items: [
    "**だから ↔ なので** — use だ for から, use な for ので (with nouns and na-adjectives).",
    "**Sentence borders**: でも / しかし start a NEW sentence ; が / けれども connect inside ONE sentence.",
    "**とき relative tense**: Verb dict form = main action before/during ; Verb た-form = main action after.",
    "**Noun modifying**: internal subject is marked by **が**, modifying verb must be in **short form**.",
    "**Perception verbs**: {{verbe:みえます・きこえます}} require particle **が** (spontaneous perception).",
    "**Comparison**: **より** (loser/benchmark) / **のほうが** (winner) / **ほど + negative** (not as much).",
    "**Double particles**: **にも** (also at) ↔ **には** (contrastive topic at).",
    "**Adjective shifts**: i-adj → **く**, na-adj → **に** (for なる, する, and adverbs).",
    "**Decision**: **にする** (pick an item) ↔ **ことにする** (decide on an action).",
    "**Look like (〜そう)**: Verb stem / Adj drop い + そう (exceptions: **よさそう**, **なさそう**).",
    "**いい irregulars**: よく / よくない / よかった / よくて / よさそう (never いく…).",
  ],
};

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

export const allNotions: Notion[] = groups.flatMap((g) => g.notions);

export function getNotionByNumber(n: number): Notion | undefined {
  return allNotions.find((notion) => notion.number === n);
}

const NOTION_SLUG_ALIASES: Record<string, string> = {
  superlative: "comparison",
};

export function getNotionBySlug(slug: string): Notion | undefined {
  const resolved = NOTION_SLUG_ALIASES[slug] ?? slug;
  return allNotions.find((notion) => notion.slug === resolved);
}

export const totalGroupCount = groups.length;
export const totalNotionCount = allNotions.length;