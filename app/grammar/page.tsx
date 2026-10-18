import { Suspense } from "react";
import type { Metadata } from "next";
import GrammarClient, { type GrammarModule } from "@/components/grammar/GrammarClient";
import { groups, socle, checklist } from "@/content/grammar/grammar-data";
import { groupsBeginner1, checklistBeginner1 } from "@/content/grammar/grammar-beginner1";
import { groupsL4L5, checklistL4L5 } from "@/content/grammar/grammar-l4l5";

export const metadata: Metadata = {
  title: "Grammar — Nihongo",
};

const modules: GrammarModule[] = [
  {
    id: "b1-l1-l2",
    tabLabel: "Beginner 1 · Lessons 1–2",
    subtitleLabel: "Beginner 1 · Lessons 1–2",
    groups: groupsBeginner1,
    checklist: checklistBeginner1,
    numericLinks: false,
  },
  {
    id: "l1-l3",
    tabLabel: "Beginner 2 · Lessons 1–3",
    subtitleLabel: "Beginner 2 · Lessons 1–3",
    groups,
    socle,
    checklist,
    quizzes: ["mcq", "exam"],
  },
  {
    id: "l4-l5",
    tabLabel: "Beginner 2 · Lessons 4–5–6",
    subtitleLabel: "Beginner 2 · Lessons 4–5–6",
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
