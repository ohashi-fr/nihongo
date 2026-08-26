import { Suspense } from "react";
import type { Metadata } from "next";
import GrammarClient, { type GrammarModule } from "@/components/grammar/GrammarClient";
import { groups, socle, checklist } from "@/content/grammar/grammar-data";
import { groupsL4L5, checklistL4L5 } from "@/content/grammar/grammar-l4l5";

export const metadata: Metadata = {
  title: "Grammar — Nihongo",
};

const modules: GrammarModule[] = [
  {
    id: "l1-l3",
    tabLabel: "Lessons 1–3",
    subtitleLabel: "初級1 (L1–L3)",
    groups,
    socle,
    checklist,
    quizzes: ["mcq", "exam"],
  },
  {
    id: "l4-l5",
    tabLabel: "Lessons 4–5",
    subtitleLabel: "初級1 (L4–L5)",
    groups: groupsL4L5,
    checklist: checklistL4L5,
    quizzes: ["training"],
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
