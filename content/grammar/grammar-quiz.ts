/**
 * Multiple-choice questions for the Grammar quiz (/grammar → "Test
 * yourself"). Each question is tied to a notion via `notion`, which
 * must match a `slug` in content/grammar/grammar-data.ts (see
 * `getNotionBySlug`) so "Review this notion" can link back to the
 * matching reference lesson.
 *
 * Content only — validated by hand, not generated at runtime. Do not
 * alter the Japanese question/choice/answer strings; if in doubt,
 * check with whoever supplied this set.
 */

export interface GrammarQuizQuestion {
  /** Ties the question to a grammar notion slug (see grammar-data.ts). */
  notion: string;
  /** Human label for the notion, used in the pre-quiz scope picker. */
  notion_label: string;
  /** Japanese sentence with a blank (____). */
  question: string;
  /** English gloss of the sentence. */
  sentence_gloss: string;
  /** Exactly 4 options. */
  choices: string[];
  /** The correct option — must be one of `choices`. */
  answer: string;
  /** Shown as feedback after the user answers. */
  explanation: string;
}

export const grammarQuizQuestions: GrammarQuizQuestion[] = [
  {
    "notion": "mou-mada",
    "notion_label": "もう / まだ (already / not yet)",
    "question": "「もう ひるごはんを たべましたか。」 — いいえ、____。",
    "sentence_gloss": "\"Have you eaten lunch yet?\" — No, ____.",
    "choices": ["まだです", "もうです", "たべませんでした", "まだたべます"],
    "answer": "まだです",
    "explanation": "The natural answer for 'not yet' is まだです (or 〜ていません). Never use 〜ませんでした, which means 'didn't do it' (a completed past negative), not 'haven't done it yet'."
  },
  {
    "notion": "mou-mada",
    "notion_label": "もう / まだ (already / not yet)",
    "question": "この みせには、その ほんは ____ ありません。",
    "sentence_gloss": "This shop has ____ that book (none left).",
    "choices": ["もう", "まだ", "もうすぐ", "まだまだ"],
    "answer": "もう",
    "explanation": "もう + negative means 'no longer / none left'. まだ + negative would mean 'not yet'. Here the sense is 'there are no more', so もう ありません."
  },
  {
    "notion": "mou-mada",
    "notion_label": "もう / まだ (already / not yet)",
    "question": "____ しゅくだいが あります。まだ おわって いません。",
    "sentence_gloss": "I ____ have homework. It's not finished.",
    "choices": ["まだ", "もう", "もうすぐ", "まだです"],
    "answer": "まだ",
    "explanation": "まだ + affirmative means 'still'. もう would mean 'already', which contradicts 'not finished'."
  },

  {
    "notion": "to-omou",
    "notion_label": "と おもいます (giving an opinion)",
    "question": "あの スーパーは あまり たかく ____ と おもいます。",
    "sentence_gloss": "I think that supermarket isn't very expensive.",
    "choices": ["ない", "ないだ", "ありません", "なくて"],
    "answer": "ない",
    "explanation": "と おもいます follows the SHORT form. The short negative of たかい is たかくない. Polite forms (ありません) never go before と."
  },
  {
    "notion": "to-omou",
    "notion_label": "と おもいます (giving an opinion)",
    "question": "きょうは やすみ ____ と おもいますよ。",
    "sentence_gloss": "I think today is a day off.",
    "choices": ["だ", "な", "の", "─ (rien)"],
    "answer": "だ",
    "explanation": "Nouns (and な-adjectives) keep だ before と: やすみだ と おもいます. Dropping だ (× やすみと おもいます) is wrong."
  },
  {
    "notion": "to-omou",
    "notion_label": "と おもいます (giving an opinion)",
    "question": "リーさんは きょう ____ と おもいます。",
    "sentence_gloss": "I think Lee won't come today.",
    "choices": ["こない", "くる", "きません", "こなくて"],
    "answer": "こない",
    "explanation": "To say 'I think NOT', you negate the inner verb: こない と おもいます — not くる と おもいません. Japanese puts the negation inside the quoted thought."
  },

  {
    "notion": "kara-node",
    "notion_label": "から / ので (reasons)",
    "question": "びょうき ____ ので、びょういんへ いきます。",
    "sentence_gloss": "Because I'm sick, I'm going to the hospital.",
    "choices": ["な", "だ", "の", "─ (rien)"],
    "answer": "な",
    "explanation": "This is THE trap. Before ので, nouns and な-adjectives take な: びょうきなので. (But before から they take だ: びょうきだから.)"
  },
  {
    "notion": "kara-node",
    "notion_label": "から / ので (reasons)",
    "question": "あめ ____ から、せんたく できませんでした。",
    "sentence_gloss": "Because it rained, I couldn't do laundry.",
    "choices": ["だ", "な", "の", "だった"],
    "answer": "だった",
    "explanation": "Past reason: あめだった から. から attaches to the plain form, and here the rain is in the past. な is only for ので, not から. (だ alone would be non-past, which clashes with できませんでした.)"
  },
  {
    "notion": "kara-node",
    "notion_label": "から / ので (reasons)",
    "question": "さむい ____、まどを しめて いただけませんか。",
    "sentence_gloss": "Since it's cold, could you close the window?",
    "choices": ["ので", "だから", "なので", "からだ"],
    "answer": "ので",
    "explanation": "ので is softer and more polite, ideal before a request. い-adjectives attach directly: さむいので. だから is too blunt for a polite request, and なので is only for nouns/な-adj."
  },

  {
    "notion": "toki",
    "notion_label": "とき (situating in time)",
    "question": "がくせい ____ とき、えいごを べんきょうしました。",
    "sentence_gloss": "When I was a student, I studied English.",
    "choices": ["の", "な", "だ", "─ (rien)"],
    "answer": "の",
    "explanation": "Noun + とき takes の: がくせいのとき. (な is for な-adjectives: ひまなとき.) Don't confuse the two."
  },
  {
    "notion": "toki",
    "notion_label": "とき (situating in time)",
    "question": "にほんへ ____ とき、たくさん ほんを もって きました。",
    "sentence_gloss": "When coming to Japan, I brought many books (bought before departure).",
    "choices": ["くる", "きた", "きて", "きます"],
    "answer": "くる",
    "explanation": "Dictionary form + とき = the action happens BEFORE the main verb. くるとき = 'when (about to) come' → so the books were bought before departure. きたとき would mean after arriving."
  },
  {
    "notion": "toki",
    "notion_label": "とき (situating in time)",
    "question": "くにへ ____ とき、ともだちに あいました。",
    "sentence_gloss": "When I returned to my country, I met friends (after arriving).",
    "choices": ["かえった", "かえる", "かえって", "かえります"],
    "answer": "かえった",
    "explanation": "た form + とき = the action happens AFTER completing it. かえったとき = 'when I had returned' → friends were met after arriving."
  },

  {
    "notion": "verb-types",
    "notion_label": "動詞のタイプ (spontaneous perception vs transitive)",
    "question": "あ、あそこに ふじさん ____ みえますよ。",
    "sentence_gloss": "Ah, Mount Fuji can be seen over there.",
    "choices": ["が", "を", "に", "で"],
    "answer": "が",
    "explanation": "みえます expresses spontaneous perception ('can be seen / is visible') and marks its subject with が, unlike direct-action verbs which use を."
  },

  {
    "notion": "contrast",
    "notion_label": "でも / が / けれども (contrast)",
    "question": "この ほんは おもしろいです____、すこし むずかしいです。",
    "sentence_gloss": "This book is interesting, but a little difficult.",
    "choices": ["が", "でも", "しかし", "から"],
    "answer": "が",
    "explanation": "が links two clauses INSIDE one sentence and follows the polite form (おもしろいですが). でも and しかし start a NEW sentence (after a period), so they can't join mid-sentence here."
  },
  {
    "notion": "contrast",
    "notion_label": "でも / が / けれども (contrast)",
    "question": "はるに なりました。____、あたたかく なりません。",
    "sentence_gloss": "Spring has come. But it isn't getting warm.",
    "choices": ["でも", "が", "けれども", "ので"],
    "answer": "でも",
    "explanation": "After a full stop, you start a new sentence with でも (or しかし). が and けれども join clauses within a single sentence, so they can't follow a period."
  },
  {
    "notion": "contrast",
    "notion_label": "でも / が / けれども (contrast)",
    "question": "きのうは あたまが いたかった____、やすみませんでした。",
    "sentence_gloss": "Yesterday my head hurt, but I didn't rest.",
    "choices": ["けれども", "が", "でも", "しかし"],
    "answer": "けれども",
    "explanation": "けれども joins clauses within one sentence and follows the SHORT form (いたかった けれども). が would need the polite form before it (いたかったですが). でも/しかし start new sentences."
  },

  {
    "notion": "linking-adjectives",
    "notion_label": "linking descriptive words (くて / で)",
    "question": "この へやは しろ____ いい へやです。",
    "sentence_gloss": "This room is white and nice.",
    "choices": ["くて", "で", "て", "いで"],
    "answer": "くて",
    "explanation": "い-adjectives link with くて: しろい → しろくて. で is for nouns and な-adjectives."
  },
  {
    "notion": "linking-adjectives",
    "notion_label": "linking descriptive words (くて / で)",
    "question": "げんき____ おもしろい がくせいです。",
    "sentence_gloss": "A lively and interesting student.",
    "choices": ["で", "くて", "て", "だで"],
    "answer": "で",
    "explanation": "な-adjectives (げんき) link with で: げんきで. い-adjectives would use くて."
  },
  {
    "notion": "linking-adjectives",
    "notion_label": "linking descriptive words (くて / で)",
    "question": "この りょうりは ____、やすいです。",
    "sentence_gloss": "This dish is good and cheap.",
    "choices": ["で", "いくて", "いいくて", "よくて"],
    "answer": "よくて",
    "explanation": "いい is irregular: its te-form (linking form) shifts to よくて (never いくて or いいくて)."
  },

  {
    "notion": "same-different",
    "notion_label": "おなじ (same / different)",
    "question": "たなかさんと マリさんは たんじょうびが ____。",
    "sentence_gloss": "Tanaka and Mari have the same birthday.",
    "choices": ["おなじです", "おなじなです", "ちがいです", "おなじだです"],
    "answer": "おなじです",
    "explanation": "おなじ behaves like a な-adjective but is irregular: it does NOT take な, and 'same' is simply おなじです."
  },
  {
    "notion": "same-different",
    "notion_label": "おなじ (same / different)",
    "question": "わたしと あなたの いけんは ____。",
    "sentence_gloss": "My opinion and yours are different.",
    "choices": ["ちがいます", "ちがいです", "おなじじゃない", "ちがうです"],
    "answer": "ちがいます",
    "explanation": "'Different' is not an adjective but the VERB ちがいます. ちがいです / ちがうです are wrong constructions."
  },
  {
    "notion": "same-different",
    "notion_label": "おなじ (same / different)",
    "question": "せんせいと ____ ように かいて ください。",
    "sentence_gloss": "Please write the same way as the teacher.",
    "choices": ["おなじ", "おなじな", "おなじの", "ちがう"],
    "answer": "おなじ",
    "explanation": "おなじ never takes な, even before ように: おなじように. (× おなじなように.)"
  },

  {
    "notion": "permission",
    "notion_label": "〜てもいい (permission)",
    "question": "しゃしんを ____ もいいですか。",
    "sentence_gloss": "May I take a photo?",
    "choices": ["とって", "とっと", "とりて", "とった"],
    "answer": "とって",
    "explanation": "Permission uses the て-form + もいいですか. とる → とって (× とっと, × とりて). Building the て-form correctly is the key."
  },
  {
    "notion": "permission",
    "notion_label": "〜てもいい (permission)",
    "question": "あした ____ もいいです。",
    "sentence_gloss": "You don't have to come tomorrow.",
    "choices": ["こなくて", "こないで", "こなくても", "きなくて"],
    "answer": "こなくて",
    "explanation": "'Don't need to' uses the ない-form → なくて + もいいです: こない → こなくて. くる is irregular (こない, not きない)."
  },

  {
    "notion": "choice-soretomo",
    "notion_label": "それとも (offering a choice)",
    "question": "コーヒーに しますか、____ おちゃに しますか。",
    "sentence_gloss": "Will you have coffee, or tea?",
    "choices": ["それとも", "でも", "そして", "けれども"],
    "answer": "それとも",
    "explanation": "それとも presents an alternative between two questions ('or'). そして means 'and then'; でも/けれども express contrast, not choice."
  },
  {
    "notion": "choice-soretomo",
    "notion_label": "それとも (offering a choice)",
    "question": "でんしゃで いきますか。____、バスで いきますか。",
    "sentence_gloss": "Will you go by train? Or by bus?",
    "choices": ["それとも", "そして", "だから", "でも"],
    "answer": "それとも",
    "explanation": "Two separate questions offering options → それとも. だから (so/therefore) and そして (and then) don't fit a choice."
  },

  {
    "notion": "particles-place",
    "notion_label": "particle choice (に・で・を)",
    "question": "こうえん ____ さんぽします。",
    "sentence_gloss": "I take a walk in the park.",
    "choices": ["を", "に", "で", "へ"],
    "answer": "を",
    "explanation": "With movement verbs like さんぽする / あるく, を marks the space traversed: こうえんを さんぽします. で would mark the location of a punctual action, not a path."
  },
  {
    "notion": "particles-place",
    "notion_label": "particle choice (に・で・を)",
    "question": "としょかん ____ ほんを よみます。",
    "sentence_gloss": "I read books at the library.",
    "choices": ["で", "に", "を", "へ"],
    "answer": "で",
    "explanation": "で marks the place where an action is performed: としょかんで よみます. に would mark existence/destination, not the site of an activity."
  },
  {
    "notion": "particles-place",
    "notion_label": "particle choice (に・で・を)",
    "question": "いす ____ すわって ください。",
    "sentence_gloss": "Please sit on the chair.",
    "choices": ["に", "で", "を", "へ"],
    "answer": "に",
    "explanation": "すわる takes に for the point/place one settles onto: いすにすわる. で would wrongly imply an activity done at a location."
  },

  {
    "notion": "going-to-do",
    "notion_label": "〜に いきます (going somewhere to do something)",
    "question": "レストランへ ____ に いきます。",
    "sentence_gloss": "I'm going to the restaurant to eat.",
    "choices": ["たべ", "たべる", "たべて", "たべます"],
    "answer": "たべ",
    "explanation": "Purpose uses the verb-stem (verb without ます) + に: たべます → たべ → たべに いきます."
  },
  {
    "notion": "going-to-do",
    "notion_label": "〜に いきます (going somewhere to do something)",
    "question": "としょかんへ ほんを ____ に いきます。",
    "sentence_gloss": "I'm going to the library to borrow a book.",
    "choices": ["かり", "かりる", "かりて", "かります"],
    "answer": "かり",
    "explanation": "かります → stem かり + に いきます. The stem is the ます-form minus ます."
  },
  {
    "notion": "going-to-do",
    "notion_label": "〜に いきます (going somewhere to do something)",
    "question": "デパートへ かいもの ____ いきます。",
    "sentence_gloss": "I'm going to the department store to shop.",
    "choices": ["に", "を", "で", "へ"],
    "answer": "に",
    "explanation": "With する-nouns, purpose is marked by に directly on the noun: かいものに いきます (or かいものしに いきます). を/で don't mark purpose."
  },

  {
    "notion": "describe-noun",
    "notion_label": "relative clauses (describing a noun)",
    "question": "きのう ____ ほんは おもしろかったです。",
    "sentence_gloss": "The book I read yesterday was interesting.",
    "choices": ["よんだ", "よみました", "よむの", "よんで"],
    "answer": "よんだ",
    "explanation": "A relative clause modifying a noun uses the SHORT form: よんだ ほん. Polite forms (よみました) don't go inside a relative clause before the noun."
  },
  {
    "notion": "describe-noun",
    "notion_label": "relative clauses (describing a noun)",
    "question": "せが ____ ひとは だれですか。",
    "sentence_gloss": "Who is the tall person?",
    "choices": ["たかい", "たかいの", "たかくて", "たかいです"],
    "answer": "たかい",
    "explanation": "い-adjective directly modifies the noun in short form: せが たかい ひと. です is dropped inside the modifying clause."
  },
  {
    "notion": "describe-noun",
    "notion_label": "relative clauses (describing a noun)",
    "question": "ちちが ____ りょうりは とても おいしいです。",
    "sentence_gloss": "The dish my father makes is very delicious.",
    "choices": ["つくる", "つくります", "つくって", "つくるの"],
    "answer": "つくる",
    "explanation": "A relative clause modifying a noun uses the SHORT form directly: つくる りょうり. Polite forms (つくります) never appear inside the clause before the noun."
  },

  {
    "notion": "ability",
    "notion_label": "ことができる (expressing ability)",
    "question": "わたしは にほんごを はなす ____ が できます。",
    "sentence_gloss": "I can speak Japanese.",
    "choices": ["こと", "の", "もの", "ため"],
    "answer": "こと",
    "explanation": "Ability structure: [dictionary verb] + ことが できます. はなす ことが できます."
  },
  {
    "notion": "ability",
    "notion_label": "ことができる (expressing ability)",
    "question": "ここで しゃしんを ____ ことが できますか。",
    "sentence_gloss": "Can I take photos here?",
    "choices": ["とる", "とって", "とった", "とり"],
    "answer": "とる",
    "explanation": "ことができる takes the DICTIONARY form before こと: とる ことが できます (not the て-form or stem)."
  },
  {
    "notion": "ability",
    "notion_label": "たことがある (experience) vs ことができる (ability)",
    "question": "にほんへ ____ ことが あります。",
    "sentence_gloss": "I have been to Japan (experience).",
    "choices": ["いった", "いく", "いって", "いき"],
    "answer": "いった",
    "explanation": "Experience uses た-form + ことが あります: いった ことが あります. Don't confuse with ability (dictionary + ことが できます)."
  },

  {
    "notion": "nimo-niwa",
    "notion_label": "にも / には",
    "question": "きのうは としょかんへ いきました。こうえん____ いきました。",
    "sentence_gloss": "Yesterday I went to the library. I went to the park too.",
    "choices": ["にも", "には", "でも", "からも"],
    "answer": "にも",
    "explanation": "にも adds 'also / too' to a place or destination: こうえんにも いきました. には would mark contrast/topic, not addition."
  },
  {
    "notion": "nimo-niwa",
    "notion_label": "にも / には",
    "question": "この へや ____ まどが ありませんが、となりの へやには あります。",
    "sentence_gloss": "This room has no window, but the next room does.",
    "choices": ["には", "にも", "では", "からは"],
    "answer": "には",
    "explanation": "には marks contrast/topic on a place: この へやには〜。となりの へやには〜. にも ('also') wouldn't fit a contrast."
  },

  {
    "notion": "ordinal-numbers",
    "notion_label": "〜目 (ordinal numbers)",
    "question": "デパートは かどから 3つ____ です。",
    "sentence_gloss": "The department store is the 3rd one from the corner.",
    "choices": ["め", "ばん", "つ", "にん"],
    "answer": "め",
    "explanation": "Attaching 〜目（め） to a counter turns a count into an ordinal rank/position (e.g. 3つめ = the 3rd one)."
  },

  {
    "notion": "comparison",
    "notion_label": "comparisons (より / のほうが / ほど)",
    "question": "でんしゃは バス ____ はやいです。",
    "sentence_gloss": "The train is faster than the bus.",
    "choices": ["より", "のほうが", "ほど", "から"],
    "answer": "より",
    "explanation": "より marks the thing being surpassed ('than'): バスより はやい. のほうが marks the winner, not the loser."
  },
  {
    "notion": "comparison",
    "notion_label": "comparisons (より / のほうが / ほど)",
    "question": "でんしゃ ____ はやいです。",
    "sentence_gloss": "The train is the faster one.",
    "choices": ["のほうが", "より", "ほど", "だけ"],
    "answer": "のほうが",
    "explanation": "のほうが marks the item that wins the comparison: でんしゃのほうが はやい. より marks the one that loses."
  },
  {
    "notion": "comparison",
    "notion_label": "comparisons (より / のほうが / ほど)",
    "question": "バスは でんしゃ ____ はやくないです。",
    "sentence_gloss": "The bus is not as fast as the train.",
    "choices": ["ほど", "より", "のほうが", "くらい"],
    "answer": "ほど",
    "explanation": "ほど + negative = 'not as ... as': でんしゃほど はやくない. This structure requires the negative."
  },
  {
    "notion": "superlative",
    "notion_label": "一番 (superlative)",
    "question": "くだものの なか____ さくらんぼが いちばん すきです。",
    "sentence_gloss": "Among fruits, I like cherries the most.",
    "choices": ["で", "に", "を", "から"],
    "answer": "で",
    "explanation": "The superlative scope/category is marked by [Category] の なかで (or [Group] で): くだものの なかで いちばん."
  },

  {
    "notion": "sa-nominalizer",
    "notion_label": "〜さ (adjective → noun)",
    "question": "この やまの ____ は 3776メートルです。",
    "sentence_gloss": "This mountain's height is 3776 m.",
    "choices": ["たかさ", "たかい", "たかく", "たかいの"],
    "answer": "たかさ",
    "explanation": "〜さ turns an adjective into a noun expressing degree: たかい → たかさ ('height')."
  },
  {
    "notion": "sa-nominalizer",
    "notion_label": "〜さ (adjective → noun)",
    "question": "この もんだいの ____ が わかりません。",
    "sentence_gloss": "I don't understand the difficulty of this problem.",
    "choices": ["むずかしさ", "むずかしい", "むずかしくて", "むずかしいこと"],
    "answer": "むずかしさ",
    "explanation": "むずかしい → むずかしさ ('difficulty'). Drop い, add さ."
  },

  {
    "notion": "naru-suru",
    "notion_label": "なる / する (become / make)",
    "question": "もうすぐ あたたか____ なります。",
    "sentence_gloss": "It will become warm soon.",
    "choices": ["く", "に", "で", "だ"],
    "answer": "く",
    "explanation": "い-adjectives become adverbial with く before なる: あたたかい → あたたかく なります."
  },
  {
    "notion": "naru-suru",
    "notion_label": "なる / する (become / make)",
    "question": "びょうきでしたが、げんき____ なりました。",
    "sentence_gloss": "I was sick, but I got better.",
    "choices": ["に", "く", "で", "だ"],
    "answer": "に",
    "explanation": "な-adjectives (and nouns) take に before なる: げんきに なりました. い-adjectives would take く."
  },
  {
    "notion": "naru-suru",
    "notion_label": "なる / する (become / make)",
    "question": "へやを きれい____ します。",
    "sentence_gloss": "I'll make the room clean.",
    "choices": ["に", "く", "で", "な"],
    "answer": "に",
    "explanation": "する 'to make (something) X' uses the same shift: な-adj → に. きれいに します. (Contrast: なる = becomes on its own; する = I make it so.)"
  },
  {
    "notion": "naru-suru",
    "notion_label": "なる / する (become / make)",
    "question": "にほんごが わかる____ なりました。",
    "sentence_gloss": "I've come to understand Japanese.",
    "choices": ["ように", "くに", "に", "こと"],
    "answer": "ように",
    "explanation": "[potential/dictionary verb] + ように なる = 'come to be able to': わかるように なりました. Expresses a gradual change in ability."
  },

  {
    "notion": "decision",
    "notion_label": "にする (decision/choice)",
    "question": "「レストランで なにを たべますか。」 — 「わたしは ハンバーグ____ します。」",
    "sentence_gloss": "\"What will you eat at the restaurant?\" — \"I'll go with the hamburger.\"",
    "choices": ["に", "を", "で", "が"],
    "answer": "に",
    "explanation": "[Noun] + に します is used when ordering or selecting an item from choices ('I choose / I will go with...')."
  },

  {
    "notion": "adjective-adverb",
    "notion_label": "adjective → adverb",
    "question": "ひらがなを ____ かきましょう。",
    "sentence_gloss": "Let's write hiragana neatly.",
    "choices": ["きれいに", "きれいく", "きれいで", "きれいな"],
    "answer": "きれいに",
    "explanation": "な-adjective → adverb with に: きれいに かく. (Same rule as なる/する: な-adj → に.)"
  },
  {
    "notion": "adjective-adverb",
    "notion_label": "adjective → adverb",
    "question": "じを ____ かいて ください。",
    "sentence_gloss": "Please write big.",
    "choices": ["おおきく", "おおきに", "おおきくて", "おおきいに"],
    "answer": "おおきく",
    "explanation": "い-adjective → adverb with く: おおきい → おおきく かく. (い-adj → く, mirroring the なる rule.)"
  },

  {
    "notion": "sou-seeming",
    "notion_label": "〜そう (looks like / seeming)",
    "question": "この ケーキは ____ です。",
    "sentence_gloss": "This cake looks delicious.",
    "choices": ["おいしそう", "おいしいそう", "おいしくそう", "おいしなそう"],
    "answer": "おいしそう",
    "explanation": "Appearance 〜そう: drop the final い of an い-adjective → おいしい → おいしそう. (おいしいそう would be hearsay 'I heard it's tasty', a different meaning.)"
  },
  {
    "notion": "sou-seeming",
    "notion_label": "〜そう (looks like / seeming)",
    "question": "あめが ____ です。",
    "sentence_gloss": "It looks like it's going to rain.",
    "choices": ["ふりそう", "ふるそう", "ふってそう", "ふりそうだそう"],
    "answer": "ふりそう",
    "explanation": "Appearance 〜そう with verbs uses the stem (ます-form minus ます): ふります → ふり → ふりそう. ふるそう would be hearsay ('I hear it will rain')."
  },
  {
    "notion": "sou-seeming",
    "notion_label": "〜そう (looks like / seeming)",
    "question": "これは ____ ほんですね。",
    "sentence_gloss": "This looks like an interesting book.",
    "choices": ["おもしろそうな", "おもしろそうに", "おもしろいそうな", "おもしろそう"],
    "answer": "おもしろそうな",
    "explanation": "そう before a NOUN takes な: おもしろそうな ほん. (Before a verb it would be そうに: おいしそうに たべる.)"
  }
];
