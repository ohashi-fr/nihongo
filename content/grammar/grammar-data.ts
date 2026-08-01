/**
 * Structured transcription of content/grammar/recap-japonais-midterm.html.
 *
 * The source HTML is French. All *framing* text below (objectives, rules,
 * attention points, group/section titles, example glosses) has been
 * translated to English for the app UI. Japanese content — example
 * sentences, forms, and table entries — is transcribed verbatim from the
 * source and must never be altered, paraphrased, or "improved". If in
 * doubt about a Japanese string, check recap-japonais-midterm.html.
 *
 * Inline markup used in string fields (parsed by
 * components/grammar/RichText.tsx):
 *
 *   **text**              → bold (<b>)
 *   __text__               → underline (<u>)
 *   {{nature:text}}        → word-nature pill (verbe/compteur/nom/adj/naadj)
 *   {{gloss:text}}         → small muted inline gloss (the HTML's `.t` tag
 *                            used inside table cells / rule lines)
 *
 * A `rule` block's `lines` array is one entry per original
 * `<div class="rule">` — each line renders as its own boxed formula,
 * matching the source (some notions stack 2–3 rule boxes under one
 * label).
 */

export type WordNature = "verbe" | "compteur" | "nom" | "adj" | "naadj";

/** Plain string containing the inline markup described above. */
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
  /** Short English gloss, when the source HTML gave one via `.t`. */
  gloss?: string;
}

export interface Notion {
  number: number;
  /** Short, plain-English topic label for the sidebar (not in the source HTML). */
  sidebarLabel: string;
  titleJp: string;
  titleKanji?: string;
  objective: RichText;
  /** Short English gloss illustrating the objective. */
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
    "Almost every notion builds on the short form. Master this first.",
  table: {
    headers: ["", "Present +", "Present −", "Past +", "Past −"],
    rows: [
      ["{{verbe:Verb}}", "のむ", "のまない", "のんだ", "のまなかった"],
      ["{{adj:i-adj}}", "たかい", "たかくない", "たかかった", "たかくなかった"],
      ["{{naadj:na-adj}}", "ひまだ", "ひまじゃない", "ひまだった", "ひまじゃなかった"],
      ["{{nom:Noun}}", "あめだ", "あめじゃない", "あめだった", "あめじゃなかった"],
    ],
  },
  attention: {
    label: "Watch out",
    items: [
      "Exception: {{adj:いい}} → よくない / よかった / よくなかった (never いくない).",
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
        sidebarLabel: "Already / not yet",
        titleJp: "もう ／ まだ",
        objective: "Say whether something is already done or not yet done.",
        exampleGloss: "“I've already eaten” / “I haven't eaten yet.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "**もう** + affirmative (past) = already · **まだ** + 〜ていません = not yet · **まだ** + affirmative = still",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "The answer “not yet” = **いいえ、まだです** or 〜ていません — never 〜ませんでした.",
            "もう + negative changes the meaning: もう ありません = there are **none left**.",
          ],
        },
        examples: [
          { jp: "もう ひるごはんを たべましたか。→ はい、もう たべました。／ いいえ、まだです。" },
          { jp: "でんしゃは もう でました。" },
          { jp: "まだ しゅくだいが あります。", gloss: "I still have homework" },
        ],
      },
      {
        number: 2,
        sidebarLabel: "Degrees of certainty",
        titleJp: "ぶんまつひょうげん",
        titleKanji: "文末表現",
        objective: "Calibrate how sure you are of what you're saying.",
        exampleGloss: "“It's certain” → “it's maybe” → “I don't know if…”",
        blocks: [
          {
            type: "table",
            label: "Rule · certainty scale",
            headers: ["Expression", "Certainty"],
            rows: [
              ["です・ます", "100 %"],
              ["〜と おもいます", "90 %"],
              ["〜でしょう", "80 %"],
              ["〜だろうと おもいます", "70 %"],
              ["〜かもしれません", "60 %"],
              ["〜か〜か わかりません", "50 %"],
              ["〜かどうか わかりません", "40 %"],
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "These forms follow the **short form**: さむいと おもいます、あめでしょう.",
            "**〜か〜か** = “whether X or Y” (2 named options); **〜かどうか** = “whether or not” (a single thing).",
            "かもしれません attaches without だ: あめ**かもしれません** (not あめだかも).",
          ],
        },
        examples: [
          { jp: "この みかんは あまいか すっぱいか わかりません。" },
          { jp: "あしたは あめ かもしれません。" },
          { jp: "こんしゅうは ひまですが、らいしゅうは いそがしいだろうと おもいます。" },
          { jp: "あの スーパーは あまり たかくないと おもいます。" },
        ],
      },
      {
        number: 3,
        sidebarLabel: "Giving an opinion (to think)",
        titleJp: "どうし「おもう」",
        titleKanji: "動詞「思う」",
        objective: "Give your opinion or a supposition.",
        exampleGloss: "“I think he'll come.”",
        blocks: [
          { type: "rule", label: "Rule", lines: ["[short form] + **と おもいます**"] },
          {
            type: "table",
            headers: ["Before と", "Form"],
            rows: [
              ["{{verbe:Verb}}", "くる → くると おもいます"],
              ["{{adj:i-adj}}", "さむい → さむいと おもいます"],
              ["{{naadj:na-adj}}", "ひま**だ** → ひまだと おもいます"],
              ["{{nom:Noun}}", "やすみ**だ** → やすみだと おもいます"],
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "{{naadj:na-adj}} and {{nom:noun}} keep **だ** before と (not ひまと おもいます).",
            "To say “I think NOT”, negate the inner verb: こない**と** おもいます (rather than こると おもいません).",
          ],
        },
        examples: [
          { jp: "あ、きょうは やすみだと おもいますよ。" },
          { jp: "リーさんは きょう くると おもいます。" },
          { jp: "いいえ、まだ さむいと おもいます。" },
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
        sidebarLabel: "Reasons — kara / node",
        titleJp: "から ／ ので",
        objective:
          "Explain the cause of something. Two variants depending on tone.",
        exampleGloss: "“Since it's raining, I'm not going out.”",
        blocks: [
          {
            type: "sub",
            label: "Sub-point A — から (subjective, spoken)",
            blocks: [
              {
                type: "rule",
                lines: ["[reason, polite __or__ short form] **から**、[result]"],
              },
              {
                type: "paragraph",
                text:
                  "Direct, personal tone. Accepts です／ます before it (あついですから). Can end a reply on its own: 「どうして？」→「さむいからです。」",
              },
            ],
          },
          {
            type: "sub",
            label: "Sub-point B — ので (softer, polite, objective)",
            blocks: [
              {
                type: "rule",
                lines: ["[reason, **short form**] **ので**、[result]"],
              },
              {
                type: "table",
                headers: ["Before ので", "Form"],
                rows: [
                  ["{{verbe:Verb}}", "くる ので"],
                  ["{{adj:i-adj}}", "いたい ので"],
                  ["{{naadj:na-adj}}", "すき**な** ので"],
                  ["{{nom:Noun}}", "びょうき**な** ので"],
                ],
              },
            ],
          },
        ],
        attention: {
          label: "Watch out — the trap",
          items: [
            "**な** before ので, but **だ** before から. For {{naadj:na-adj}} and {{nom:noun}}: すき**な**ので / あめ**だ**から.",
            "ので is more polite → ideal for a request: さむいので、まどを しめて いただけませんか。",
          ],
        },
        examples: [
          { jp: "びょうきなので、びょういんへ いきます。" },
          { jp: "コーヒーが すきなので、よく のみます。" },
          { jp: "きのう あめが ふったから、せんたくできませんでした。" },
          { jp: "じかんが ないから、はやく してください。" },
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
        sidebarLabel: "Time — toki",
        titleJp: "「とき」＋ げんけい／た",
        titleKanji: "時 · 原形／た",
        objective:
          "Say “when…” and, above all, **at what point** the action happens relative to the verb's tense.",
        exampleGloss: "“When I drink coffee, I add sugar.”",
        blocks: [
          {
            type: "table",
            label: "Rule — what goes before とき",
            headers: ["Before とき", "Form"],
            rows: [
              ["{{nom:Noun}}", "+ **の** → がくせいの とき"],
              ["{{naadj:na-adj}}", "+ **な** → ひまな とき"],
              ["{{adj:i-adj}}", "as is → あつい とき"],
              ["{{verbe:Verb}}", "dictionary form or た (see below)"],
            ],
          },
          {
            type: "rule",
            label: "Rule — verb: dictionary form vs た (the heart of this notion)",
            lines: [
              "{{verbe:Dictionary-form verb}} + とき → the main action happens **before / while**",
              "{{verbe:た-form verb}} + とき → the main action happens **after** the とき action is finished",
            ],
          },
          {
            type: "paragraph",
            text:
              "In other words: the tense before とき doesn't depend on “when it really happens”, but on **the order of the two actions** relative to each other.",
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "{{nom:Noun}} + とき = **の** ; {{naadj:na-adj}} + とき = **な**. Don't swap them.",
            "とき never takes です／ます／ません before it.",
            "ごはんを **たべる** とき = before eating (いただきます) ; ごはんを **たべた** とき = after eating (ごちそうさま).",
          ],
        },
        examples: [
          { jp: "がくせいの とき、えいごを べんきょうしました。" },
          { jp: "ひまな ときに テレビを みます。" },
          { jp: "べんきょうする とき、じしょが いります。" },
          { jp: "にほんへ くる とき、たくさん ほんを もって きました。", gloss: "brought before coming" },
          { jp: "くにへ かえった とき、ともだちに あいました。", gloss: "seen after getting home" },
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
        sidebarLabel: "Transitive vs intransitive verbs",
        titleJp: "どうしの タイプ",
        titleKanji: "動詞のタイプ",
        objective: "Choose the right particle based on the verb's structure.",
        exampleGloss: "“The door opens” (by itself) vs “I open the door.”",
        blocks: [
          {
            type: "table",
            label: "Rule — 3 types",
            headers: ["Type", "Structure", "Meaning"],
            rows: [
              [
                "**Type 1**",
                "{{nom:Noun}} が + {{verbe:verb}}",
                "an action that happens by itself (intransitive)",
              ],
              [
                "**Type 2**",
                "{{nom:Noun}} を + {{verbe:verb}}",
                "an action done by someone (transitive)",
              ],
              [
                "**Type 3**",
                "{{nom:Noun}} に + {{nom:Noun}} を + {{verbe:verb}}",
                "an action with a recipient (give/show to someone)",
              ],
            ],
          },
          {
            type: "table",
            label: "Intransitive / transitive pairs to memorize",
            headers: ["Type 1 · intransitive (が)", "Type 2 · transitive (を)"],
            rows: [
              ["みえます {{gloss:can be seen}}", "みます {{gloss:to watch}}"],
              ["きこえます {{gloss:can be heard}}", "ききます {{gloss:to listen}}"],
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
            "{{verbe:みえます}} / {{verbe:きこえます}} = involuntary perception, always **が**: ふじさん**が** みえます。",
          ],
        },
        examples: [
          { jp: "ふじさんが みえます。", gloss: "Type 1" },
          { jp: "せんせいが テレビを みます。", gloss: "Type 2" },
          { jp: "せんせいが がくせいに しゃしんを みせます。", gloss: "Type 3" },
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
        sidebarLabel: "Expressing contrast (but)",
        titleJp: "でも ／ けれども ／ しかし ／ が",
        objective:
          "Link two opposing ideas. The choice depends on **where** the “but” sits and the register.",
        exampleGloss: "“It's good, but a bit expensive.”",
        blocks: [
          {
            type: "sub",
            label: "Sub-point A — new sentence (でも · しかし)",
            blocks: [
              { type: "rule", lines: ["Sentence 1**。** **でも** / **しかし**、 Sentence 2**。**"] },
              {
                type: "paragraph",
                text:
                  "Formality: **でも** (casual) → **しかし** (formal/written). Goes at the start, after a full stop.",
              },
            ],
          },
          {
            type: "sub",
            label: "Sub-point B — same sentence (が · けれども)",
            blocks: [
              { type: "rule", lines: ["Clause 1 **が** / **けれども**、 clause 2**。**"] },
              {
                type: "paragraph",
                text:
                  "**が** follows the polite form (〜です**が**); **けれども** follows the short form.",
              },
            ],
          },
        ],
        attention: {
          label: "Watch out — the exam trap",
          items: [
            "**でも・しかし** open a **NEW sentence** · **が・けれども** connect within **ONE** sentence.",
          ],
        },
        examples: [
          { jp: "この ほんは おもしろいです**が**、すこし むずかしいです。" },
          { jp: "かんこくの りょうりです**が**、あまり からく ありません。" },
          { jp: "きのうは あたまが いたかった**けれども**、やすみませんでした。" },
          { jp: "はるに なりました。**でも**、あたたかく なりません。" },
          { jp: "にほんの きものは きれいです。**しかし**、とても たかいです。" },
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
        sidebarLabel: "Linking two descriptive words",
        titleJp: "けいようし などの せつぞく",
        titleKanji: "形容詞などの接続",
        objective: "Link two descriptive words before a noun.",
        exampleGloss: "“A cheap, good restaurant.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{adj:i-adj}}: い → **くて** → やすくて おいしい",
              "{{naadj:na-adj}} / {{nom:noun}}: **で** → しずかで おおきい",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "{{adj:いい}} → **よくて** (not いくて).",
            "{{naadj:na-adj}} keeps its な before the final noun: やすくて きれい**な** シャツ.",
          ],
        },
        examples: [
          { jp: "しろくて いい へやです。" },
          { jp: "やすくて きれいな シャツを かいました。" },
          { jp: "げんきで おもしろい がくせいです。" },
          { jp: "きれいで しずかな こうえんです。" },
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
        sidebarLabel: "Same vs different",
        titleJp: "おなじ",
        titleKanji: "同じ",
        objective: "Say that two things are alike or different.",
        exampleGloss: "“A and B have the same birthday.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "A と B は **おなじです** / **おなじじゃ ありません** · A と B は **ちがいます**",
              "おなじ + {{nom:noun}} (おなじ ほん) · おなじように + {{verbe:verb}}",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "おなじ is a {{naadj:na-adj}} but **does NOT take な** before a noun: ○ おなじ ほん / × おなじ**な** ほん.",
            "“different” isn't an adjective but the {{verbe:verb}} ちがいます.",
          ],
        },
        examples: [
          { jp: "たなかさんと マリさんは たんじょうびが おなじです。" },
          { jp: "A と B は ちがいます。" },
          { jp: "せんせいと おなじように かいて ください。" },
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
        sidebarLabel: "Asking permission",
        titleJp: "〜てもいいですか",
        objective: "Ask for or give permission, and say “no need to”.",
        exampleGloss: "“May I take a photo?”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{verbe:Verb -te}} + も いいですか → may I?",
              "{{verbe:Verb -nakute}} + も いいです → no need to",
            ],
          },
          {
            type: "paragraph",
            text:
              "Rising register: 〜てもいいですか → 〜てもかまいませんか → 〜てもよろしいでしょうか.",
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "The negative goes through the ない form → なくて: たべ**なくて**もいいです.",
            "Build the て form carefully: とる → とっ**て** → とっ**ても** (not とっと).",
          ],
        },
        examples: [
          { jp: "すみませんが、まどを あけてもいいですか。" },
          { jp: "すみません、ここで しゃしんを とってもいいですか。" },
          { jp: "こちらに すわってもよろしいでしょうか。" },
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
        sidebarLabel: "Offering a choice",
        titleJp: "せつぞくし「それとも」",
        titleKanji: "接続詞「それとも」",
        objective: "Offer a choice between two questions.",
        exampleGloss: "“Shall we eat, or go to the cinema?”",
        blocks: [
          { type: "rule", label: "Rule", lines: ["〜ますか／ですか。 **それとも** 〜ますか／ですか。"] },
        ],
        attention: {
          label: "Watch out",
          items: [
            "それとも links **two questions**, not two nouns in a statement (use や／か for that). Each part keeps its own か.",
          ],
        },
        examples: [
          { jp: "しょくじしましょうか。それとも えいがを みましょうか。" },
          { jp: "ジュースが いいですか。それとも コーラが いいですか。" },
          { jp: "スーパーで かいますか。それとも コンビニで かいますか。" },
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
        sidebarLabel: "Place particles — ni / de / wo",
        titleJp: "かんけいじょし「に・で・を」",
        titleKanji: "関係助詞",
        objective:
          "Choose に / で / を around a place based on its relation to the action.",
        exampleGloss: "“Enter a place / act within a place / leave a place.”",
        blocks: [
          {
            type: "rule",
            label: "Rule — the trio for one place",
            lines: [
              "{{nom:Place}} **に** はいります → enter",
              "{{nom:Place}} **で** 〜します → act within",
              "{{nom:Place}} **を** でます → leave",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: ["を also marks **leaving** (でます), not just the direct object."],
        },
        examples: [
          { jp: "デパート**に** はいります。／ デパート**で** かいものします。／ デパート**を** でます。" },
          { jp: "きっさてん**に** はいります。／ きっさてん**で** コーヒーを のみます。／ きっさてん**を** でます。" },
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
        sidebarLabel: "Going somewhere to do something",
        titleJp: "「に」＋ ほうこうの どうし",
        titleKanji: "に＋方向の動詞",
        objective: "Express the purpose of a trip.",
        exampleGloss: "“I'm going to Shinjuku to eat.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{nom:Place}} へ + {{verbe:verb without ます}} + に + いきます／きます／かえります",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Drop ます: たべ**ます** → たべ**に**.",
            "する-nouns: だし**に** / べんきょう**に** or べんきょうし**に**.",
            "The object stays before the stem: てがみ**を** だし**に** いきます.",
          ],
        },
        examples: [
          { jp: "ゆうびんきょくへ てがみを だしに いきます。" },
          { jp: "おそばを たべに いきましょう。" },
          { jp: "にほんへ にほんごの べんきょうに きました。" },
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
        sidebarLabel: "Describing a noun (relative clauses)",
        titleJp: "どうし ＋ めいし",
        titleKanji: "動詞＋名詞 (proposition relative)",
        objective: "Describe a noun with a whole clause placed **before** it.",
        exampleGloss: "“The book I bought yesterday.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["[clause in **short form**] + {{nom:noun}} — no particle between the two"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "The **internal** subject of the description takes **が**, not は: （わたし**が**）かった ほん.",
            "{{verbe:Verb}} in short form: かった (not かいました) before the noun.",
          ],
        },
        examples: [
          { jp: "これは、きのう かった ほんです。" },
          { jp: "リーさんは あかい シャツを きている ひとです。" },
          { jp: "あした みる えいがは なんですか。" },
          { jp: "けさ みた サッカーの しあいです。" },
        ],
      },
      {
        number: 15,
        sidebarLabel: "Expressing ability",
        titleJp: "ことが できる",
        objective: "Express an ability or a possibility (formal register).",
        exampleGloss: "“I can read kanji.”",
        blocks: [
          { type: "rule", label: "Rule", lines: ["{{verbe:Dictionary-form verb}} + ことが できます"] },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Verb in **dictionary form**: のむ ことが できます (not のみます ことが).",
            "The object keeps **を**: かんじ**を** よむ ことが できます.",
            "Don't confuse with 〜た ことが あります (past experience).",
          ],
        },
        examples: [
          { jp: "かんじを よむ ことが できます。" },
          { jp: "おさけを のむ ことが できません。" },
          { jp: "にほんりょうりを つくる ことが できますか。→ ええ、できます。" },
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
        sidebarLabel: "Existence — aru vs iru",
        titleJp: "どうし「ある／いる」",
        titleKanji: "存在",
        objective: "Say where a thing or a person is.",
        exampleGloss: "“The pen is on the desk.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{nom:Thing / plant}} は {{nom:place}} に **あります**",
              "{{nom:Person / animal}} は {{nom:place}} に **います**",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: ["あります = inanimate · います = living. Honorific of います: いらっしゃいます."],
        },
        examples: [
          { jp: "ペンは つくえの うえに あります。" },
          { jp: "たなかさんは 2かいに います。" },
          { jp: "せんせいは きょうしつに いらっしゃいます。" },
        ],
      },
      {
        number: 17,
        sidebarLabel: "Place particles — nimo / niwa",
        titleJp: "かんけいじょし ＋ せんたくじょし",
        titleKanji: "に＋も / に＋は",
        objective: "Say “at X too, and at Y too”, or contrast two places.",
        exampleGloss:
          "“There are department stores in Shinjuku as well as Ikebukuro.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{nom:Place}} **にも** … {{nom:Place}} **にも** あります／います → “at one as well as the other”",
              "{{nom:Place}} **には** ありません → contrast: “at that particular place, though, there aren't any”",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "**にも** = に (place) + も (also) · **には** = に + は (contrast). The も / は is what changes the whole meaning.",
          ],
        },
        examples: [
          { jp: "デパートは しんじゅくにも いけぶくろにも あります。", gloss: "at both places" },
          { jp: "きょうしつは 1かいにも 2かいにも あります。" },
          { jp: "デパートは たかだのばばに ありません。しんじゅく**には** あります。", gloss: "in Shinjuku, though, yes" },
          { jp: "アメリカにも フランスにも ともだちが います。" },
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
        sidebarLabel: "Counting vs ranking",
        titleJp: "じすうし ＋ め",
        titleKanji: "時数詞＋目",
        objective: "Say the position of something within a series.",
        exampleGloss: "“The 3rd person from the right.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{compteur:counter}} + **目（め）** → 2つめ、3にんめ、3つめ"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Without 目 = you're **counting** (ふたつ = two). With 目 = you're **ranking** (ふたつめ = the second one). Often paired with から for the starting point.",
          ],
        },
        examples: [
          { jp: "デパートは かどから 3つめです。" },
          { jp: "みぎから 3にんめが ハンさんです。" },
          { jp: "たかだのばばは、いけぶくろから 2つめです。" },
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
        sidebarLabel: "Making comparisons",
        titleJp: "ひかくの ひょうげん",
        titleKanji: "比較",
        objective:
          "Compare things: between two, at an extreme, or “not as much as”.",
        exampleGloss: "“I prefer fish to meat.”",
        blocks: [
          {
            type: "sub",
            label: "Sub-point A — comparing two things",
            blocks: [
              {
                type: "rule",
                lines: [
                  "**Q:** A と B と どちらの ほうが 〜ですか",
                  "**A:** A **より** B **の ほうが** 〜です",
                ],
              },
              {
                type: "paragraph",
                text: "より attaches to the thing that **loses**. どちらも 〜です = “both of them”.",
              },
            ],
          },
          {
            type: "sub",
            label: "Sub-point B — superlative (the most…)",
            blocks: [
              { type: "rule", lines: ["[group]の なか**で** 〜**が いちばん** 〜です"] },
              {
                type: "paragraph",
                text:
                  "The question uses なに／だれ／どれ**が** (never は). The chosen item takes が.",
              },
            ],
          },
          {
            type: "sub",
            label: "Sub-point C — not as much as",
            blocks: [
              { type: "rule", lines: ["A も 〜ですが、 B **ほど じゃありません**"] },
              {
                type: "paragraph",
                text: "ほど is **always** followed by a negative. Never ほどです.",
              },
            ],
          },
        ],
        attention: {
          label: "Watch out — the 3 key words",
          items: [
            "**より** (the loser) · **のほうが** (the winner) · **ほど + negative** (not at that level).",
          ],
        },
        examples: [
          {
            jp: "うえださんと きむらさんと どちらの ほうが せが たかいですか。→ うえださんより きむらさんの ほうが せが たかいです。",
          },
          { jp: "くだものの なかで さくらんぼが いちばん すきです。" },
          { jp: "にほんで いちばん たかい やまは ふじさんです。" },
          { jp: "ラーメンも すきですが、おすしほど じゃ ありません。" },
          { jp: "しんかんせんは ひこうきほど はやく ありません。" },
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
        sidebarLabel: "Adjective → noun (~sa)",
        titleJp: "けいようし ＋ さ",
        titleKanji: "形容詞＋さ",
        objective: "Turn an adjective into a noun of measurement.",
        exampleGloss: "“The height, weight, size of…”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{adj:i-adj}} (drop い) / {{naadj:na-adj}} + **さ** → たかい → たかさ"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Mostly for measurements: たかさ (height), おもさ (weight), ひろさ (area), ながさ (length). Don't confuse with 〜そう (appearance).",
          ],
        },
        examples: [
          { jp: "へやの ひろさは どのぐらいですか。" },
          { jp: "スカイツリーの たかさは 634メートルです。" },
          { jp: "ひこうきに のる ときに かばんの おもさを はかります。" },
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
        sidebarLabel: "Sequencing actions",
        titleJp: "まず ／ それから",
        objective: "Order a sequence of steps.",
        exampleGloss: "“First…, then…”",
        blocks: [
          { type: "rule", label: "Rule", lines: ["**まず**、〜。 **それから**、〜。"] },
        ],
        attention: {
          label: "Watch out",
          items: ["それから links actions in sequence (≠ それとも, which offers a choice)."],
        },
        examples: [
          { jp: "まず、ひらがなを べんきょうします。それから、カタカナを べんきょうします。" },
          { jp: "まず、なまえを いって ください。それから、よんで ください。" },
        ],
      },
      {
        number: 22,
        sidebarLabel: "Linking actions — te vs naide",
        titleJp: "どうし て、どうし ／ どうし ないで、どうし",
        objective:
          "Two linked actions: one **then** the other, or one **without** the other. Opposite meanings, easy to mix up.",
        exampleGloss:
          "“I go home and eat” vs “I study without watching TV.”",
        blocks: [
          {
            type: "sub",
            label: "Sub-point A — て: do X, then Y",
            blocks: [
              {
                type: "rule",
                lines: ["{{verbe:Verb -te}}、 {{verbe:verb}}。 → actions in sequence, same subject"],
              },
            ],
          },
          {
            type: "sub",
            label: "Sub-point B — ないで: do Y without doing X",
            blocks: [
              {
                type: "rule",
                lines: ["{{verbe:Verb -naide}}、 {{verbe:verb}}。 → “without / instead of”"],
              },
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "The tense is carried by the **last** verb.",
            "Master the て form (かえる → かえって) and the ない form (みる → みないで).",
          ],
        },
        examples: [
          { jp: "いえへ かえって、ごはんを たべます。", gloss: "then" },
          { jp: "ともだちに あって、いっしょに しょくじしました。", gloss: "then" },
          { jp: "テレビを みないで、べんきょうしました。", gloss: "without" },
          { jp: "さとうを いれないで、コーヒーを のみます。", gloss: "without" },
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
        sidebarLabel: "Becoming vs making — naru / suru",
        titleJp: "なる ／ する — changement d'état",
        objective:
          "A change that **happens to something** (なる, it becomes) or is **caused** (する, I make it). Same mechanism, active vs passive.",
        exampleGloss: "“It's getting warmer” vs “I'm warming up the soup.”",
        blocks: [
          {
            type: "sub",
            label: "Sub-point A — なる: becoming (happens on its own)",
            blocks: [
              {
                type: "rule",
                lines: [
                  "{{adj:i-adj}} → **く** なる → あたたかく なります",
                  "{{naadj:na-adj}} / {{nom:noun}} → **に** なる → しずかに / しゃちょうに なります",
                  "{{verbe:Potential verb}} + **ように** なる → coming to be able to: たべられるように なりました",
                ],
              },
            ],
          },
          {
            type: "sub",
            label: "Sub-point B — する: making (deliberate)",
            blocks: [
              {
                type: "rule",
                lines: [
                  "{{adj:i-adj}} → **く** する → おおきく します",
                  "{{naadj:na-adj}} → **に** する → しずかに します",
                ],
              },
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Same shift for both: {{adj:i-adj}} → **く** · {{naadj:na-adj}} → **に**.",
            "**なる** = it becomes that way on its own · **する** = I make it that way on purpose.",
            "〜ようになる = gradually gaining an ability.",
          ],
        },
        examples: [
          { jp: "びょうきでしたが、げんきに なりました。", gloss: "became" },
          { jp: "もうすぐ あたたかく なります。", gloss: "becoming" },
          { jp: "にほんごが すこし わかるように なりました。", gloss: "I've come to understand" },
          { jp: "へやを きれいに します。", gloss: "I'm making it" },
          { jp: "この スープは ぬるいですね。あたたかく しましょう。", gloss: "let's make it hot" },
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
        sidebarLabel: "Adjective → adverb",
        titleJp: "けいようし ＋ どうし",
        titleKanji: "形容詞＋動詞 (adverbe)",
        objective: "Turn an adjective into an adverb to modify a verb.",
        exampleGloss: "“Write big.” / “Write neatly.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{adj:i-adj}}: い → **く** + {{verbe:verb}} → おおきく かきます",
              "{{naadj:na-adj}}: + **に** + {{verbe:verb}} → きれいに かきます",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: ["Same logic as “becoming / making”: {{adj:i-adj}} → く · {{naadj:na-adj}} → に."],
        },
        examples: [
          { jp: "おおきく かいて ください。" },
          { jp: "ひらがなを きれいに かきましょう。" },
          { jp: "にほんごの うたを じょうずに うたいたいんです。" },
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
        sidebarLabel: "Looking like / seeming — ~sou",
        titleJp: "〜そう — apparence",
        objective: "Say that something **looks like** it is… (visual impression).",
        exampleGloss: "“This cake looks good.”",
        blocks: [
          {
            type: "sub",
            label: "Sub-point A — base form",
            blocks: [
              {
                type: "rule",
                lines: [
                  "{{adj:i-adj}} (drop い) + そうです → おいしそうです",
                  "{{verbe:verb without ます}} + そうです → ふりそうです {{gloss:looks like it's going to rain}}",
                  "negative: 〜く**なさ**そうです → たかくなさそうです",
                ],
              },
            ],
          },
          {
            type: "sub",
            label: "Sub-point B — before a noun / a verb",
            blocks: [
              {
                type: "rule",
                lines: [
                  "〜**そうな** + {{nom:noun}} → おもしろそうな ほん",
                  "〜**そうに** + {{verbe:verb}} → おいしそうに たべます",
                ],
              },
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Exceptions: {{adj:いい}} → よさそう · ない → なさそう.",
            "そう of **appearance** (-masu stem / adj without い) ≠ そう of **hearsay** (short form + そうだ: びょうきだったそうです = “I heard that…”).",
            "Before a noun → そう**な** · before a verb → そう**に**.",
          ],
        },
        examples: [
          { jp: "この ケーキは おいしそうです。" },
          { jp: "あめが ふりそうです。" },
          { jp: "この みせは、あんまり たかくなさそうです。" },
          { jp: "これは、おもしろそうな ほんですね。" },
          { jp: "がくせいが たのしそうに はなして います。" },
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
        sidebarLabel: "Deciding on something",
        titleJp: "〜にする ／ 〜ことにする",
        objective: "Express a choice or a decision.",
        exampleGloss: "“I'll have a coffee.” / “I've decided to move.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{nom:Noun}} / {{compteur:counter}} + **に します** → コーヒーに します {{gloss:choice}}",
              "{{verbe:Dictionary-form / negative verb}} + こと + **に します** → いくことにします {{gloss:decision to act}}",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "〜にする for a **choice** (menu, date) · 〜ことにする for **deciding on an action**.",
            "Negative: 〜ない**ことにします** (I decide not to…).",
            "Nuance: 〜ことに**する** = I decide · 〜ことに**なる** = it's been decided (by outside circumstances).",
          ],
        },
        examples: [
          { jp: "コーヒーに します。" },
          { jp: "パーティーは らいしゅうに しましょう。" },
          { jp: "いまの へやは せまいから、ひっこしすることに しました。" },
          { jp: "あしたから たばこを すわないことに します。" },
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
    "**だから ↔ なので** — だ for から, な for ので.",
    "**でも・しかし = new sentence** / **が・けれども = same sentence**.",
    "**とき**: {{nom:noun}}+の, {{naadj:na-adj}}+な · dictionary-form verb (before) vs た (after).",
    "**ことができます** (ability, dictionary-form verb + を) ↔ **たことがあります** (experience).",
    "{{verbe:みえます・きこえます}} → particle **が** (involuntary perception).",
    "Relative clauses: internal subject in **が**, verb in short form.",
    "Comparison: **より** (the loser) / **のほうが** (the winner) / **ほど + negative**.",
    "**にも** (also) ↔ **には** (contrast).",
    "Change: {{adj:i-adj}} → **く**, {{naadj:na-adj}} → **に** (なる / する / adverb).",
    "**なる** (happens on its own) ↔ **する** (deliberate) ↔ **にする** (decision).",
    "**そう** appearance (-masu stem / adj without い) ↔ **そう** hearsay (short form + だそう).",
    "{{adj:いい}} → **よくて / よくない / よさそう** (never いく…).",
    "Permission: とる → とっ**て** → とっ**ても** (not とっと).",
    "**目**: without = counting · with = ranking (the Nth).",
  ],
};

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

export const allNotions: Notion[] = groups.flatMap((g) => g.notions);

export function getNotionByNumber(n: number): Notion | undefined {
  return allNotions.find((notion) => notion.number === n);
}

export const totalGroupCount = groups.length;
export const totalNotionCount = allNotions.length;
