"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  ChecklistSection,
  Group,
  SocleSection,
} from "@/content/grammar/grammar-data";
import { getNotionByNumber } from "@/content/grammar/grammar-data";
import { grammarQuizQuestions } from "@/content/grammar/grammar-quiz";
import GrammarSidebar from "./GrammarSidebar";
import GrammarQuiz from "./GrammarQuiz";
import { NotionDetail, SocleDetail, ChecklistDetail } from "./GrammarDetail";

type Props = {
  groups: Group[];
  socle: SocleSection;
  checklist: ChecklistSection;
};

function normalizeId(raw: string | null): string {
  if (!raw) return "socle";
  if (raw === "socle" || raw === "checklist" || raw === "quiz") return raw;
  const n = Number(raw);
  return getNotionByNumber(n) ? String(n) : "socle";
}

export default function GrammarClient({ groups, socle, checklist }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlId = normalizeId(searchParams.get("n"));

  const [selectedId, setSelectedId] = useState(urlId);
  const [mobileView, setMobileView] = useState<"list" | "detail">(
    searchParams.get("n") ? "detail" : "list"
  );
  const detailRef = useRef<HTMLDivElement>(null);

  // Keep local state in sync when the URL changes externally (back/forward,
  // or a direct link).
  useEffect(() => {
    setSelectedId(urlId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlId]);

  // The list → detail swap happens in place (no route change), so the
  // browser won't scroll for us — do it manually so new content opens at
  // the top instead of wherever the previous screen had been scrolled to.
  // On desktop the detail pane scrolls internally; on mobile the whole
  // window does. Also handed to GrammarQuiz so its own phase changes
  // (setup → playing → results) reset scroll the same way.
  function scrollDetailToTop() {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    } else {
      detailRef.current?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }

  function handleSelect(id: string) {
    setSelectedId(id);
    setMobileView("detail");
    router.replace(id === "socle" ? "/grammar" : `/grammar?n=${id}`, { scroll: false });
    scrollDetailToTop();
  }

  function handleBack() {
    setMobileView("list");
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }

  const detail = (() => {
    if (selectedId === "socle") return <SocleDetail socle={socle} />;
    if (selectedId === "checklist") return <ChecklistDetail checklist={checklist} />;
    if (selectedId === "quiz") {
      return (
        <GrammarQuiz
          questions={grammarQuizQuestions}
          onExit={() => handleSelect("socle")}
          scrollToTop={scrollDetailToTop}
        />
      );
    }
    const notion = getNotionByNumber(Number(selectedId));
    if (!notion) return <SocleDetail socle={socle} />;
    const group = groups.find((g) => g.notions.some((n) => n.number === notion.number));
    return <NotionDetail notion={notion} groupLabel={group?.title} />;
  })();

  return (
    <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-8">
      {/* Sidebar */}
      <div
        className={`${mobileView === "list" ? "block" : "hidden"} lg:block lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto lg:pr-2`}
      >
        <GrammarSidebar
          groups={groups}
          socle={socle}
          checklist={checklist}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      </div>

      {/* Detail */}
      <div className={`${mobileView === "detail" ? "block" : "hidden"} lg:block`}>
        <button
          type="button"
          onClick={handleBack}
          className="mb-4 inline-flex items-center text-sm font-medium text-muted transition hover:text-primary lg:hidden"
        >
          ← Back to notions
        </button>

        <div
          ref={detailRef}
          className="rounded-2xl bg-white p-6 shadow-card sm:p-8 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto"
        >
          {detail}
        </div>
      </div>
    </div>
  );
}
