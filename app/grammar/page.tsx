import { Suspense } from "react";
import type { Metadata } from "next";
import SectionHeader from "@/components/ui/SectionHeader";
import GrammarClient from "@/components/grammar/GrammarClient";
import { groups, socle, checklist } from "@/content/grammar/grammar-data";

export const metadata: Metadata = {
  title: "Grammar — Nihongo",
};

export default function GrammarPage() {
  return (
    <section>
      <SectionHeader
        kicker="Reference"
        title="Grammar"
        subtitle="26 notions from 初級1, grouped by theme — objective, rule, key points, examples."
      />
      <Suspense fallback={null}>
        <GrammarClient groups={groups} socle={socle} checklist={checklist} />
      </Suspense>
    </section>
  );
}
