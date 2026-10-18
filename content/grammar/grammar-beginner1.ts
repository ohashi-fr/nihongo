/**
 * Structured transcription of Docs.pdf — Beginner 1, Lessons 1–2 (1課・2課).
 * Source: Shinjuku Japanese Language Institute (新宿日本語学校) 文法ノート.
 *
 * Companion to the two existing modules (grammar-data.ts = "Beginner 2 ·
 * Lessons 1–3", grammar-l4l5.ts = "Beginner 2 · Lessons 4–5–6"). This file
 * is its own independent module: "Beginner 1 · Lessons 1–2".
 *
 * Numbering: this is a separate textbook level, so `number` runs 1–11 within
 * this module (NOT continuing the Beginner-2 global count). `courseNumber`
 * holds the real 文法 number (文法1 … 文法11). All slugs are prefixed `b1-`
 * so they never collide with the other modules' slugs. Helpers are suffixed
 * `Beginner1`. Wire this as a third tab with its own helpers, exactly as
 * grammar-l4l5.ts is wired.
 *
 * Framing text (objectives, rules, attention points, group/section titles,
 * example glosses) is in English for the app UI. Japanese content is
 * transcribed from the course source (kana, as in the other modules).
 *
 * Inline markup used in string fields:
 *   **text**              → bold (<b>)
 *   __text__              → underline (<u>)
 *   {{nature:text}}       → word-nature pill (verbe/compteur/nom/adj/naadj)
 *   {{gloss:text}}        → small muted inline gloss
 */

import type { Group, Notion, ChecklistSection } from "./grammar-data";

// ─────────────────────────────────────────────────────────────────
// GROUPS (course lessons 1–2, 文法1–11)
// ─────────────────────────────────────────────────────────────────

export const groupsBeginner1: Group[] = [
  {
    id: "g-b1-offer-advice",
    jpTitle: "もうしで・アドバイス",
    title: "Offering & advising",
    notions: [
      {
        number: 1,
        courseNumber: 1,
        slug: "b1-mashou-ka",
        sidebarLabel: "Offering to help — mashou ka",
        titleJp: "〜ましょうか",
        titleKanji: "申し出",
        objective: "Offer to do something for someone (“Shall I…?”).",
        exampleGloss: "“The luggage looks heavy — shall I carry it?”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{verbe:Verb -masu stem}} + **ましょうか** → もちます → もち**ましょうか**"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Built on the **ます-stem**: てつだい**ます** → てつだい**ましょうか**.",
            "Here **ましょうか** = offering __your__ help to someone. Don't confuse with plain 〜ましょう (“let's”, a shared action).",
            "Typical replies: accept with **たすかります** / ありがとうございます · decline with でも、だいじょうぶです.",
          ],
        },
        examples: [
          {
            jp: "にもつが おもそうですね。もちましょうか。→ ありがとう ございます。たすかります。",
            gloss: "The luggage looks heavy. Shall I carry it? → Thank you, that's a big help.",
          },
          {
            jp: "あしたは じかんが あるから、ひっこしを てつだいましょうか。→ ありがとう ございます。でも、だいじょうぶです。おとうとが てつだって くれますから。",
            gloss: "I have time tomorrow — shall I help you move? → Thanks, but it's fine; my younger brother will help.",
          },
          {
            jp: "さむいですね。まどを しめましょうか。",
            gloss: "It's cold, isn't it? Shall I close the window?",
          },
        ],
      },
      {
        number: 6,
        courseNumber: 6,
        slug: "b1-hou-ga-ii",
        sidebarLabel: "Giving advice — hou ga ii",
        titleJp: "〜た ／ ない ほうが いい",
        objective: "Advise someone to do, or not do, something (“you'd better…”).",
        exampleGloss: "“You'd better quit smoking.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{verbe:Verb た-form}} + **ほうが いい** → やめた ほうが いい {{gloss:you'd better do it}}",
              "{{verbe:Verb ない-form}} + **ほうが いい** → でかけない ほうが いい {{gloss:you'd better not}}",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Positive advice uses the **た-form** (かいた ほうが いい), negative advice uses the **ない-form** (でかけない ほうが いい).",
            "Softens to a suggestion; often paired with a reason in から: たいふうが くる**から**、でかけない ほうが いいですよ。",
          ],
        },
        examples: [
          {
            jp: "たばこを やめた ほうが いいですよ。",
            gloss: "You'd better quit smoking.",
          },
          {
            jp: "かんじを おぼえる ときは、かいた ほうが いいですよ。",
            gloss: "When you memorize kanji, you'd better write them out.",
          },
          {
            jp: "たいふうが くるから、でかけない ほうが いいですよ。",
            gloss: "A typhoon is coming, so you'd better not go out.",
          },
        ],
      },
    ],
  },
  {
    id: "g-b1-must",
    jpTitle: "ぎむ・きんし",
    title: "Obligation & prohibition",
    notions: [
      {
        number: 2,
        courseNumber: 2,
        slug: "b1-nakereba-naranai",
        sidebarLabel: "Must do — nakereba naranai",
        titleJp: "〜なければ ならない",
        titleKanji: "義務・必要",
        objective: "State an obligation or necessity (“must / have to”).",
        exampleGloss: "“I have to stop the car.” / “I must study.”",
        blocks: [
          {
            type: "table",
            label: "Connection",
            headers: ["Category", "Form"],
            rows: [
              ["{{verbe:Verb}}", "ない-stem + **なければ ならない** (いく → いか**なければ ならない**)"],
              ["{{adj:i-adj}}", "く + **なければ ならない** (たかい → たか**くなければ ならない**)"],
              ["{{naadj:na-adj}}", "+ **じゃなければ ならない** (べんり → べんり**じゃなければ ならない**)"],
              ["{{nom:Noun}}", "+ **じゃなければ ならない** (がくせい → がくせい**じゃなければ ならない**)"],
            ],
          },
          {
            type: "rule",
            label: "Casual speech (話し言葉)",
            lines: ["〜なければ → **〜なくちゃ** / **〜なきゃ** → がんばら**なくちゃ** / がんばら**なきゃ**"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Built on the verb **ない-stem**, then swap ない for **なければ ならない**: のま**ない** → のま**なければ ならない**.",
            "The casual contractions **なくちゃ / なきゃ** are very common in speech but stay out of formal writing.",
          ],
        },
        examples: [
          {
            jp: "ここに くるまを とめては いけないので、ほかの ばしょに とめなければ なりません。",
            gloss: "You can't park the car here, so I have to park it somewhere else.",
          },
          {
            jp: "ルールを まもらなければ なりません。",
            gloss: "You have to follow the rules.",
          },
          {
            jp: "あした しけんが あるから、きょうは べんきょうしなければ なりません。",
            gloss: "I have an exam tomorrow, so I have to study today.",
          },
          {
            jp: "がんばらなくちゃ。／ がんばらなきゃ。",
            gloss: "I've gotta give it my all. (casual)",
          },
        ],
      },
      {
        number: 3,
        courseNumber: 3,
        slug: "b1-te-wa-ikenai",
        sidebarLabel: "Must not — te wa ikenai",
        titleJp: "〜ては いけない",
        titleKanji: "禁止",
        objective: "Forbid an action (“you must not…”).",
        exampleGloss: "“You must not play on the road.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{verbe:Verb -te form}} + **は いけない** → あそんで → あそんでは いけない"],
          },
          {
            type: "rule",
            label: "Casual speech (話し言葉)",
            lines: [
              "〜ては いけない → **〜ちゃ だめ** → あそん**じゃ だめ**",
              "〜では いけない → **〜じゃ だめ**",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Built on the **て-form**: あるい**て** → あるい**ては いけません**.",
            "For て-form verbs ending in で, the casual form is **じゃ だめ** (あそんで → あそん**じゃ だめ**).",
            "Opposite of the permission 〜てもいいです (“may I”) — same て-form, different ending.",
          ],
        },
        examples: [
          {
            jp: "ははおや：あぶないから、どうろで あそんじゃ だめよ。",
            gloss: "Mother: It's dangerous, so don't play on the road. (casual)",
          },
          {
            jp: "ここは きけんなので、あるいては いけません。",
            gloss: "It's dangerous here, so you must not walk through.",
          },
          {
            jp: "でんわを しながら、くるまを うんてんしては いけません。",
            gloss: "You must not drive while talking on the phone.",
          },
        ],
      },
    ],
  },
  {
    id: "g-b1-shimau",
    jpTitle: "〜てしまう",
    title: "Regret & completion",
    notions: [
      {
        number: 4,
        courseNumber: 4,
        slug: "b1-te-shimau",
        sidebarLabel: "Regret / completion — te shimau",
        titleJp: "〜てしまう",
        objective: "Mark an action as regrettable (“I went and did it…”) or fully completed (“I did it all”).",
        exampleGloss: "“I broke the pretty plate.” / “I drank it all.”",
        blocks: [
          {
            type: "sub",
            label: "① 残念・後悔 — regret / something unfortunate",
            blocks: [
              {
                type: "rule",
                lines: ["{{verbe:Verb -te form}} + **しまう** → わって → わって**しまいました**"],
              },
              {
                type: "paragraph",
                text: "Adds a nuance of regret or “oops, it happened”: the speaker wishes it hadn't.",
              },
            ],
          },
          {
            type: "sub",
            label: "② 完了 — completion (doing it all / finishing)",
            blocks: [
              {
                type: "rule",
                lines: ["{{verbe:Verb -te form}} + **しまう** → のんで → のんで**しまいました** {{gloss:drank it all}}"],
              },
            ],
          },
          {
            type: "rule",
            label: "Casual speech (話し言葉)",
            lines: [
              "〜てしまう → **〜ちゃう** · 〜でしまう → **〜じゃう**",
              "〜てしまった → **〜ちゃった** · 〜でしまった → **〜じゃった**",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Same form, two readings: **regret** (わってしまった = I broke it, darn) vs **completion** (ぜんぶ のんでしまった = I finished it all). Context decides.",
            "で-ending て-forms contract to じゃう / じゃった: のんで → のん**じゃった**.",
          ],
        },
        examples: [
          {
            jp: "きょうとで かった きれいな おさらを わって しまいました。",
            gloss: "I broke the pretty plate I bought in Kyoto. (① regret)",
          },
          {
            jp: "あ、おさら わっちゃった。",
            gloss: "Ah, I broke the plate. (① regret, casual)",
          },
          {
            jp: "A：あれ、ぎゅうにゅうが ないね。B：ぜんぶ のんじゃったから、あした かってくるね。",
            gloss: "A: Huh, there's no milk. B: I drank it all, so I'll buy some tomorrow. (② completion)",
          },
        ],
      },
    ],
  },
  {
    id: "g-b1-nara-hazu",
    jpTitle: "なら・はず",
    title: "Topic & assumption",
    notions: [
      {
        number: 5,
        courseNumber: 5,
        slug: "b1-nara",
        sidebarLabel: "As for / if it's — nara",
        titleJp: "〜なら",
        objective: "Single out a topic as a premise (“as for X / if it's X, then…”), often picking up what was just said.",
        exampleGloss: "“I can't speak Chinese, but French I can.”",
        blocks: [
          {
            type: "sub",
            label: "① 限定 — narrowing to one topic (noun + なら)",
            blocks: [
              {
                type: "rule",
                lines: ["{{nom:Noun}} + **なら** → フランスご**なら** はなせます {{gloss:French, I can speak}}"],
              },
            ],
          },
          {
            type: "sub",
            label: "② 前の会話を受けて言う — responding to what was just said",
            blocks: [
              {
                type: "rule",
                lines: [
                  "{{verbe:Verb}} / {{adj:i-adj}} (short form) + **なら**",
                  "{{naadj:na-adj}} / {{nom:Noun}} (drop だ) + **なら** → ひま**なら** · たなかさん**なら**",
                ],
              },
              {
                type: "paragraph",
                text: "Picks up the other person's statement and replies on that basis: “(if you mean / if that's the case,) then…”.",
              },
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "な-adj and noun **drop だ** before なら: ひま**なら** (not ひまだなら), たなかさん**なら**.",
            "なら frames a given topic/premise. It is not the general “if” of たら or ば — it reacts to a known situation.",
          ],
        },
        examples: [
          {
            jp: "ちゅうごくごは はなせませんが、フランスごなら はなせます。",
            gloss: "I can't speak Chinese, but if it's French, I can. (① narrowing)",
          },
          {
            jp: "どようびは いけませんが、にちようびなら いけます。",
            gloss: "I can't go on Saturday, but if it's Sunday I can. (① narrowing)",
          },
          {
            jp: "A：たなかせんせいは いらっしゃいますか。B：たなかせんせいなら、おかえりに なりました。",
            gloss: "A: Is Prof. Tanaka here? B: If you mean Prof. Tanaka, he's gone home. (② reply)",
          },
          {
            jp: "A：パソコンを かおうと おもっているんです。B：パソコンを かうなら、あのみせが おすすめですよ。",
            gloss: "A: I'm thinking of buying a PC. B: If you're buying a PC, that shop is a good bet. (② reply)",
          },
          {
            jp: "きょう でかけるなら、うわぎを もって いった ほうが いいですよ。ゆうがたから さむく なるそうだから。",
            gloss: "If you're going out today, you'd better take a jacket — they say it'll get cold from the evening.",
          },
        ],
      },
      {
        number: 7,
        courseNumber: 7,
        slug: "b1-hazu",
        sidebarLabel: "Should be — hazu",
        titleJp: "〜はず",
        objective: "State a logical expectation grounded in evidence (“it should be the case that…”).",
        exampleGloss: "“He lived in America, so he should understand English.”",
        blocks: [
          {
            type: "table",
            label: "Connection before はず",
            headers: ["Category", "Form"],
            rows: [
              ["{{verbe:Verb}}", "short form (わかる はず · いない はず)"],
              ["{{adj:i-adj}}", "short form (あたたかい はず)"],
              ["{{naadj:na-adj}}", "+ **な** (すき**な** はず) · じゃない / だった / じゃなかった + はず"],
              ["{{nom:Noun}}", "+ **の** (やすみ**の** はず) · じゃない / だった / じゃなかった + はず"],
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "な-adj takes **な** and noun takes **の** before はず (すき**な** はず · やすみ**の** はず).",
            "はず = a confident deduction from known facts, not a plain guess. There's a reason behind it (〜から、〜はず).",
          ],
        },
        examples: [
          {
            jp: "なかむらさんは アメリカに すんでいたから、えいごが わかる はずです。",
            gloss: "Nakamura lived in America, so he should understand English.",
          },
          {
            jp: "きむらさんは せんしゅうから おおさかへ いっているから、いま いえに いない はずです。",
            gloss: "Kimura has been in Osaka since last week, so he shouldn't be home now.",
          },
          {
            jp: "チンさんは あまいものが すきな はずです。",
            gloss: "Chin should like sweet things. (na-adj → な はず)",
          },
          {
            jp: "げつようびだから、としょかんは やすみの はずですよ。",
            gloss: "It's Monday, so the library should be closed. (noun → の はず)",
          },
        ],
      },
    ],
  },
  {
    id: "g-b1-time",
    jpTitle: "まえ・あと・じゅんび",
    title: "Before, after & in advance",
    notions: [
      {
        number: 8,
        courseNumber: 8,
        slug: "b1-mae-ni-ato-de",
        sidebarLabel: "Before / after — mae ni / ato de",
        titleJp: "〜前に ／ 〜後で（に）",
        titleKanji: "時数詞",
        objective: "Place one action before or after another in time.",
        exampleGloss: "“Before my friend comes, I clean the room.” / “After eating, take this medicine.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: [
              "{{verbe:Verb dictionary form}} + **まえに** + action → __before__ doing X",
              "{{nom:Noun}} + の + **まえに** → りょこう**の まえに**",
              "{{verbe:Verb た-form}} + **あとで / あとに** + action → __after__ doing X",
              "{{nom:Noun}} + の + **あとで / あとに** → しょくじ**の あとで**",
            ],
          },
          {
            type: "paragraph",
            text: "※ From 初級I: 〜のまえ / 〜のうしろ also mark physical position (えきのまえ = in front of the station). Here まえに / あとで mark time.",
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Before = verb **dictionary form** + まえに (regardless of the sentence's overall tense).",
            "After = verb **た-form** + あとで. The た here is not “past” — it marks completion relative to the main action.",
          ],
        },
        examples: [
          {
            jp: "ともだちが くる まえに、へやを そうじして おきます。",
            gloss: "Before my friend comes, I clean the room (in advance).",
          },
          {
            jp: "りょこうの まえに、ホテルを よやくして おきます。",
            gloss: "Before the trip, I reserve a hotel in advance.",
          },
          {
            jp: "ごはんを たべた あとで、この くすりを のんで ください。",
            gloss: "After eating, please take this medicine.",
          },
          {
            jp: "しけんが おわった あとに、こたえを おもいだしました。",
            gloss: "After the exam ended, I remembered the answer.",
          },
        ],
      },
      {
        number: 9,
        courseNumber: 9,
        slug: "b1-te-oku-te-aru",
        sidebarLabel: "In advance / done state — te oku / te aru",
        titleJp: "〜ておく ／ 〜てある",
        objective: "Do something in advance as preparation (ておく), or describe the resulting state of that preparation (てある).",
        exampleGloss: "“I'll buy the present in advance.” / “The present has (already) been bought.”",
        blocks: [
          {
            type: "sub",
            label: "A — 〜ておく: do X ahead of time (preparation)",
            blocks: [
              {
                type: "rule",
                lines: ["{{nom:Object}} **を** + {{verbe:Verb -te}} + **おく** → かって**おきます** {{gloss:buy it in advance}}"],
              },
            ],
          },
          {
            type: "sub",
            label: "B — 〜てある: X has been done (resulting state)",
            blocks: [
              {
                type: "rule",
                lines: ["{{nom:Object}} **が** + {{verbe:Verb -te}} + **ある** → かって**あります** {{gloss:it has been bought}}"],
              },
            ],
          },
          {
            type: "rule",
            label: "Casual speech (話し言葉)",
            lines: [
              "〜ておく → **〜とく** · 〜でおく → **〜どく**",
              "〜ておいて → **〜といて** · 〜でおいて → **〜どいて**",
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "**を + ておく** = the __action__ of preparing (transitive, you do it). **が + てある** = the __state__ left behind (it stands prepared).",
            "そうじして おきます (I'll clean it, as prep) → そうじして あります (it has been cleaned, and stays so).",
            "Casual: へや、そうじ**しといて** = clean the room (for later), please.",
          ],
        },
        examples: [
          {
            jp: "ともだちが くるから、へやを きれいに して おきます。",
            gloss: "My friend is coming, so I'll tidy the room in advance. (ておく)",
          },
          {
            jp: "へやが そうじして あります。",
            gloss: "The room has been cleaned. (てある · resulting state)",
          },
          {
            jp: "A：はやく ひこうきの よやくを しなければ なりませんね。B：だいじょうぶですよ。もう よやくして あります。せんしゅう よやくして おきましたよ。",
            gloss: "A: We'd better book the flight soon. B: It's fine — it's already booked. I booked it last week.",
          },
          {
            jp: "A：へや、そうじしといて。B：うん、わかった。",
            gloss: "A: Clean the room (for later), ok? B: Yeah, got it. (casual とく)",
          },
        ],
      },
    ],
  },
  {
    id: "g-b1-manner",
    jpTitle: "こうどうの かたち",
    title: "How an action unfolds",
    notions: [
      {
        number: 10,
        courseNumber: 10,
        slug: "b1-nagara",
        sidebarLabel: "Doing two things — nagara",
        titleJp: "〜ながら",
        titleKanji: "時数詞構成語",
        objective: "Do two actions at the same time by the same person (“while…”).",
        exampleGloss: "“I study at university while working part-time.”",
        blocks: [
          {
            type: "rule",
            label: "Rule",
            lines: ["{{verbe:Verb -masu stem}} + **ながら**、 {{verbe:main verb}} → みます → み**ながら**"],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Built on the **ます-stem**: し**ます** → し**ながら**.",
            "The **second** verb is the main / background action; the ながら clause is the simultaneous one: テレビを み**ながら** ごはんを たべる = eat (main) while watching TV.",
            "Same subject for both actions.",
          ],
        },
        examples: [
          {
            jp: "いま、アルバイトを しながら、だいがくで べんきょうして います。",
            gloss: "Right now I'm studying at university while working part-time.",
          },
          {
            jp: "でんわを しながら、くるまを うんてんしては いけません。",
            gloss: "You must not drive while talking on the phone.",
          },
          {
            jp: "スマホを みながら あるいていたら、かいだんから おちて しまいました。",
            gloss: "I was walking while looking at my phone and fell down the stairs.",
          },
        ],
      },
      {
        number: 11,
        courseNumber: 11,
        slug: "b1-bakari",
        sidebarLabel: "Nothing but — bakari",
        titleJp: "〜ばかり",
        titleKanji: "時数詞構成語",
        objective: "Say that someone does nothing but one thing, or has nothing but one kind of thing.",
        exampleGloss: "“My son does nothing but play.” / “He reads nothing but manga.”",
        blocks: [
          {
            type: "sub",
            label: "① 動詞ばかり — doing nothing but X",
            blocks: [
              {
                type: "rule",
                lines: ["{{verbe:Verb -te form}} + **ばかり いる** → あそんで**ばかり いる** {{gloss:does nothing but play}}"],
              },
            ],
          },
          {
            type: "sub",
            label: "② 名詞ばかり — nothing but [noun]",
            blocks: [
              {
                type: "rule",
                lines: ["{{nom:Noun}} + **ばかり** → まんが**ばかり** よむ {{gloss:reads nothing but manga}}"],
              },
            ],
          },
        ],
        attention: {
          label: "Watch out",
          items: [
            "Verb pattern is on the **て-form** + ばかり いる (たべて ばかり いる). Noun pattern is noun + ばかり directly.",
            "ばかり = “only / nothing but”, with a nuance of too much of it (unlike neutral だけ).",
          ],
        },
        examples: [
          {
            jp: "たべて ばかり いたので、ふとって しまいました。",
            gloss: "I did nothing but eat, so I got fat. (① verb)",
          },
          {
            jp: "むすこが あそんで ばかり いて、べんきょうしないので こまります。",
            gloss: "My son does nothing but play and won't study, which is a problem. (① verb)",
          },
          {
            jp: "にくばかり たべないで、やさいも たべて ください。",
            gloss: "Don't eat only meat — eat vegetables too. (② noun)",
          },
          {
            jp: "むすこは まんがばかり よんで います。",
            gloss: "My son reads nothing but manga. (② noun)",
          },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// CHECKLIST (Beginner 1 · L1–2)
// ─────────────────────────────────────────────────────────────────

export const checklistBeginner1: ChecklistSection = {
  id: "checklist",
  title: "✅ Quick checklist — Beginner 1 · Lessons 1–2",
  sidebarLabel: "✅ Quick checklist (B1 · L1–2)",
  items: [
    "**〜ましょうか** = offer your help (ます-stem) ↔ **〜ましょう** = let's (shared action).",
    "**〜なければ ならない** (must): verb ない-stem + なければならない · casual **なくちゃ / なきゃ**.",
    "**〜ては いけない** (must not): て-form + はいけない · casual **ちゃ だめ / じゃ だめ**.",
    "**〜てしまう**: regret (わってしまった) __or__ completion (のんでしまった) · casual **ちゃう / じゃう**.",
    "**〜なら**: な-adj / noun **drop だ** (ひまなら) · reacts to a known topic, not general “if”.",
    "**〜ほうが いい**: positive = **た-form** (かいた) · negative = **ない-form** (でかけない).",
    "**はず** (should be): な-adj + **な**, noun + **の** (すきな はず · やすみの はず) — a deduction with a reason.",
    "**〜まえに** = verb **dict form** (before) ↔ **〜あとで** = verb **た-form** (after).",
    "**を + ておく** (prepare, the action) ↔ **が + てある** (the resulting, standing state) · casual **とく / どく**.",
    "**〜ながら** (ます-stem): two actions at once, the **2nd** verb is the main one.",
    "**〜ばかり**: verb **て-form** + ばかり いる · noun + ばかり — “nothing but”, with a too-much nuance.",
  ],
};

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

export const allNotionsBeginner1: Notion[] = groupsBeginner1.flatMap((g) => g.notions);

/** Look up by this module's running number (1–11). */
export function getNotionByNumberBeginner1(n: number): Notion | undefined {
  return allNotionsBeginner1.find((notion) => notion.number === n);
}

/** Look up by the real 文法 number (1–11). */
export function getNotionByCourseNumberBeginner1(n: number): Notion | undefined {
  return allNotionsBeginner1.find((notion) => notion.courseNumber === n);
}

const NOTION_SLUG_ALIASES_BEGINNER1: Record<string, string> = {
  // 文法4 folds regret + completion into one notion
  "b1-te-shimau-regret": "b1-te-shimau",
  "b1-te-shimau-completion": "b1-te-shimau",
  // 文法9 folds ておく + てある into one notion
  "b1-te-oku": "b1-te-oku-te-aru",
  "b1-te-aru": "b1-te-oku-te-aru",
};

export function getNotionBySlugBeginner1(slug: string): Notion | undefined {
  const resolved = NOTION_SLUG_ALIASES_BEGINNER1[slug] ?? slug;
  return allNotionsBeginner1.find((notion) => notion.slug === resolved);
}

export const totalGroupCountBeginner1 = groupsBeginner1.length;
export const totalNotionCountBeginner1 = allNotionsBeginner1.length;
