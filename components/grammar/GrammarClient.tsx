"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  ChecklistSection,
  Group,
  SocleSection,
} from "@/content/grammar/grammar-data";
import { getNotionByNumber } from "@/content/grammar/grammar-data";
import GrammarSidebar from "./GrammarSidebar";
import { NotionDetail, SocleDetail, ChecklistDetail } from "./GrammarDetail";

type Props = {
  groups: Group[];
  socle: SocleSection;
  checklist: ChecklistSection;
};

function normalizeId(raw: string | null): string {
  if (!raw) return "socle";
  if (raw === "socle" || raw === "checklist") return raw;
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

  // Keep local state in sync when the URL changes externally (back/forward,
  // or a direct link).
  useEffect(() => {
    setSelectedId(urlId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlId]);

  function handleSelect(id: string) {
    setSelectedId(id);
    setMobileView("detail");
    router.replace(id === "socle" ? "/grammar" : `/grammar?n=${id}`, { scroll: false });
  }

  const detail = (() => {
    if (selectedId === "socle") return <SocleDetail socle={socle} />;
    if (selectedId === "checklist") return <ChecklistDetail checklist={checklist} />;
    const notion = getNotionByNumber(Number(selectedId));
    if (!notion) return <SocleDetail socle={socle} />;
    const group = groups.find((g) => g.notions.some((n) => n.number === notion.number));
    return <NotionDetail notion={notion} groupLabel={group?.title} />;
  })();

  return (
    <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
      {/* Sidebar */}
      <div
        className={`${mobileView === "list" ? "block" : "hidden"} lg:block lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto lg:pr-2`}
      >
        <div className="rounded-2xl bg-white p-3 shadow-card lg:bg-transparent lg:p-0 lg:shadow-none">
          <GrammarSidebar
            groups={groups}
            socle={socle}
            checklist={checklist}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>
      </div>

      {/* Detail */}
      <div className={`${mobileView === "detail" ? "block" : "hidden"} lg:block`}>
        <button
          type="button"
          onClick={() => setMobileView("list")}
          className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-primary lg:hidden"
        >
          ← Back to notions
        </button>

        <div className="rounded-2xl bg-white p-5 shadow-card sm:p-7">{detail}</div>
      </div>
    </div>
  );
}
