import { Suspense } from "react";
import type { Metadata } from "next";
import GrammarClient, { type GrammarModule } from "@/components/grammar/GrammarClient";
import { groups, socle, checklist } from "@/content/grammar/grammar-data";
import type { ChecklistSection } from "@/content/grammar/grammar-data";
import { groupsBeginner1, checklistBeginner1 } from "@/content/grammar/grammar-beginner1";
import { groupsBeginner1B, checklistBeginner1B } from "@/content/grammar/grammar-beginner1-part2";
import { groupsL4L5, checklistL4L5 } from "@/content/grammar/grammar-l4l5";

export const metadata: Metadata = {
  title: "Grammar — Nihongo",
};

// 文法1–11 (lessons 1–2) + 文法12–26 (lessons 2–3) share one tab and one checklist.
const checklistBeginner2: ChecklistSection = {
  ...checklistBeginner1,
  title: "✅ Quick checklist — Beginner 2 · Lessons 1–2–3",
  sidebarLabel: "✅ Quick checklist (B2 · L1–3)",
  items: [...checklistBeginner1.items, ...checklistBeginner1B.items],
};

const modules: GrammarModule[] = [
  {
    id: "b1-l1-l2",
    tabLabel: "Beginner 2 · Lessons 1–2–3",
    subtitleLabel: "Beginner 2 · Lessons 1–2–3",
    groups: [...groupsBeginner1, ...groupsBeginner1B],
    checklist: checklistBeginner2,
    numericLinks: false,
    quizzes: ["particles"],
  },
  {
    id: "l1-l3",
    tabLabel: "Beginner 1 · Lessons 1–3",
    subtitleLabel: "Beginner 1 · Lessons 1–3",
    groups,
    socle,
    checklist,
    quizzes: ["mcq", "exam"],
  },
  {
    id: "l4-l5",
    tabLabel: "Beginner 1 · Lessons 4–5–6",
    subtitleLabel: "Beginner 1 · Lessons 4–5–6",
    groups: groupsL4L5,
    checklist: checklistL4L5,
    quizzes: ["training", "challenge", "kimatsu"],
  },
];

export default function GrammarPage() {
  return (
    <section>
      <Suspense fallback={null}>
        <GrammarClient modules={modules} />
      </Suspense>
    </section>
  );
}
