"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import GrammarModuleTabs from "@/components/grammar/GrammarModuleTabs";
import KanjiGrid, { type KanjiGridGroup } from "@/components/KanjiGrid";

export type KanjiLevelRow = {
  id: string;
  name: string;
  order_index: number;
  is_exam: boolean;
  /** Number of cards the level owns (0 for virtual aggregate levels). */
  cardCount: number;
};

export type { KanjiGridGroup };

type Props = {
  levels: KanjiLevelRow[];
  groups: KanjiGridGroup[];
};

const TABS = [
  { id: "study", label: "Study" },
  { id: "all", label: "All kanji" },
];

function tabFromParams(params: URLSearchParams) {
  return params.get("tab") === "all" ? "all" : "study";
}

export default function KanjiHomeClient({ levels, groups }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(() => tabFromParams(searchParams));

  // Back/forward or a direct link.
  useEffect(() => {
    setTab(tabFromParams(searchParams));
  }, [searchParams]);

  function handleTabChange(id: string) {
    setTab(id);
    router.replace(id === "all" ? "/modules/kanji?tab=all" : "/modules/kanji", {
      scroll: false,
    });
  }

  return (
    <div>
      <div className="mt-6">
        <GrammarModuleTabs
          tabs={TABS}
          activeId={tab}
          onChange={handleTabChange}
          ariaLabel="Kanji views"
        />
      </div>

      <div role="tabpanel" aria-label={tab === "all" ? "All kanji" : "Study"} className="mt-6">
        {tab === "all" ? <KanjiGrid groups={groups} /> : <StudyList levels={levels} />}
      </div>
    </div>
  );
}

// ─── Study tab: the deck list ────────────────────────────────────────

function StudyList({ levels }: { levels: KanjiLevelRow[] }) {
  if (levels.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-white/50 p-8 text-center text-muted">
        No levels yet — run <code>seed_kanji.sql</code>.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-white">
      {levels.map((lv) => {
        const exam = lv.is_exam;
        const aggregate = lv.name === "All kanji - Review";
        return (
          <li key={lv.id}>
            <Link
              href={`/modules/kanji/${lv.id}`}
              className={`flex items-center justify-between px-5 py-4 transition ${
                exam
                  ? "border-l-4 border-l-accent bg-accent/[0.04] hover:bg-accent/[0.08]"
                  : aggregate
                    ? "border-l-4 border-l-[#2563eb] bg-[#2563eb]/[0.05] hover:bg-[#2563eb]/[0.1]"
                    : "hover:bg-soft"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted">
                  {String(lv.order_index ?? 0).padStart(2, "0")}
                </span>
                <span
                  className={`font-medium ${
                    exam ? "text-accent" : aggregate ? "text-[#2563eb]" : ""
                  }`}
                >
                  {lv.name}
                </span>
                {exam ? (
                  <span className="inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
                    Exam
                  </span>
                ) : aggregate ? (
                  <span className="inline-flex items-center rounded-full border border-[#2563eb]/40 bg-[#2563eb]/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#2563eb]">
                    All
                  </span>
                ) : null}
              </div>
              <div className="text-sm text-muted">
                {exam
                  ? "20 random questions"
                  : aggregate
                    ? "All kanji combined"
                    : `${lv.cardCount} kanji`}{" "}
                →
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
