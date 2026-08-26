"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  ChecklistSection,
  Group,
  Notion,
  SocleSection,
} from "@/content/grammar/grammar-data";
import { grammarQuizQuestions } from "@/content/grammar/grammar-quiz";
import { examQuiz, totalExamBlankCount } from "@/content/grammar/exam-quiz";
import { trainingQuizLive, totalTrainingQuestionCount } from "@/content/grammar/training-quiz";
import SectionHeader from "@/components/ui/SectionHeader";
import GrammarModuleTabs from "./GrammarModuleTabs";
import GrammarSidebar from "./GrammarSidebar";
import QuizChooser from "./QuizChooser";
import GrammarQuiz from "./GrammarQuiz";
import ExamQuiz, { TRAINING_SECTION_LABELS } from "./ExamQuiz";
import { NotionDetail, SocleDetail, ChecklistDetail } from "./GrammarDetail";

/** One level of the Grammar page (e.g. 初級1 · L1–L3). */
export interface GrammarModule {
  id: string;
  /** Shown on the tab itself. */
  tabLabel: string;
  /** Shown in the dynamic page subtitle, e.g. "初級1 (L1–L3)". */
  subtitleLabel: string;
  groups: Group[];
  checklist: ChecklistSection;
  /** Only the first module currently has a "short form" primer. */
  socle?: SocleSection;
  /** Which "Test yourself" quizzes this module offers, and in what
   * order they're shown. Omit/empty to hide "Test yourself" entirely
   * for this module. */
  quizzes?: QuizType[];
}

type QuizType = "mcq" | "exam" | "training";

type Props = {
  modules: GrammarModule[];
};

const QUIZ_IDS = new Set(["quiz", "quiz-mcq", "quiz-exam", "quiz-training"]);
const QUIZ_ID_TYPE: Record<string, QuizType> = {
  "quiz-mcq": "mcq",
  "quiz-exam": "exam",
  "quiz-training": "training",
};

function flatten(groups: Group[]): Notion[] {
  return groups.flatMap((g) => g.notions);
}

function findByNumber(modules: GrammarModule[], n: number) {
  for (const m of modules) {
    const notion = flatten(m.groups).find((notion) => notion.number === n);
    if (notion) return { module: m, notion };
  }
  return null;
}

function findBySlug(modules: GrammarModule[], slug: string) {
  for (const m of modules) {
    const notion = flatten(m.groups).find((notion) => notion.slug === slug);
    if (notion) return { module: m, notion };
  }
  return null;
}

function defaultSelectedId(module: GrammarModule): string {
  if (module.socle) return "socle";
  const first = flatten(module.groups)[0];
  return first ? first.slug : "checklist";
}

/**
 * Resolves the active module + selected id from the URL. `n` accepts a
 * special id, a notion slug, or (for backward compatibility with old
 * links) a bare running number — in which case the module is inferred
 * from whichever module actually owns that number, ignoring `m`.
 */
function resolveState(modules: GrammarModule[], searchParams: URLSearchParams) {
  const rawN = searchParams.get("n");
  const rawM = searchParams.get("m");
  const moduleFromM = modules.find((m) => m.id === rawM);

  if (rawN && QUIZ_IDS.has(rawN)) {
    // For a specific quiz id, only a module that actually offers that
    // quiz type qualifies; for the generic chooser ("quiz"), any module
    // with at least one quiz does.
    const type = QUIZ_ID_TYPE[rawN];
    const offers = (m: GrammarModule) =>
      type ? (m.quizzes?.includes(type) ?? false) : (m.quizzes?.length ?? 0) > 0;
    const active =
      (moduleFromM && offers(moduleFromM) ? moduleFromM : undefined) ??
      modules.find(offers) ??
      modules[0];
    return { module: active, selectedId: rawN };
  }

  if (rawN === "checklist") {
    const active = moduleFromM ?? modules[0];
    return { module: active, selectedId: "checklist" };
  }

  if (rawN === "socle") {
    const active = moduleFromM ?? modules[0];
    return { module: active, selectedId: active.socle ? "socle" : defaultSelectedId(active) };
  }

  if (rawN) {
    const found = /^\d+$/.test(rawN)
      ? findByNumber(modules, Number(rawN))
      : findBySlug(modules, rawN);
    if (found) return { module: found.module, selectedId: found.notion.slug };
  }

  const active = moduleFromM ?? modules[0];
  return { module: active, selectedId: defaultSelectedId(active) };
}

export default function GrammarClient({ modules }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = useMemo(() => resolveState(modules, searchParams), []); // eslint-disable-line react-hooks/exhaustive-deps

  const [activeModuleId, setActiveModuleId] = useState(initial.module.id);
  const [selectedId, setSelectedId] = useState(initial.selectedId);
  const [mobileView, setMobileView] = useState<"list" | "detail">(
    searchParams.get("n") ? "detail" : "list"
  );
  const detailRef = useRef<HTMLDivElement>(null);

  const activeModule = modules.find((m) => m.id === activeModuleId) ?? modules[0];

  // Keep local state in sync when the URL changes externally (back/forward,
  // or a direct link).
  useEffect(() => {
    const next = resolveState(modules, searchParams);
    setActiveModuleId(next.module.id);
    setSelectedId(next.selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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

  function buildUrl(moduleId: string, id: string): string {
    const module = modules.find((m) => m.id === moduleId) ?? modules[0];
    const params = new URLSearchParams();
    if (moduleId !== modules[0].id) params.set("m", moduleId);
    if (id !== defaultSelectedId(module)) params.set("n", id);
    const qs = params.toString();
    return qs ? `/grammar?${qs}` : "/grammar";
  }

  function handleSelect(id: string) {
    setSelectedId(id);
    setMobileView("detail");
    router.replace(buildUrl(activeModuleId, id), { scroll: false });
    scrollDetailToTop();
  }

  function handleModuleChange(moduleId: string) {
    if (moduleId === activeModuleId) return;
    const module = modules.find((m) => m.id === moduleId);
    if (!module) return;
    const id = defaultSelectedId(module);
    setActiveModuleId(moduleId);
    setSelectedId(id);
    setMobileView("list");
    router.replace(buildUrl(moduleId, id), { scroll: false });
  }

  function handleBack() {
    setMobileView("list");
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }

  const notionCount = flatten(activeModule.groups).length;

  const detail = (() => {
    if (selectedId === "socle" && activeModule.socle) {
      return <SocleDetail socle={activeModule.socle} />;
    }
    if (selectedId === "checklist") {
      return <ChecklistDetail checklist={activeModule.checklist} />;
    }
    if (selectedId === "quiz") {
      const offered = activeModule.quizzes ?? [];
      return (
        <QuizChooser
          onSelectMcq={offered.includes("mcq") ? () => handleSelect("quiz-mcq") : undefined}
          onSelectExam={offered.includes("exam") ? () => handleSelect("quiz-exam") : undefined}
          onSelectTraining={offered.includes("training") ? () => handleSelect("quiz-training") : undefined}
          mcqQuestionCount={grammarQuizQuestions.length}
          examBlankCount={totalExamBlankCount}
          examSectionCount={examQuiz.sections.length}
          trainingQuestionCount={totalTrainingQuestionCount}
          trainingSectionCount={trainingQuizLive.sections.length}
        />
      );
    }
    if (selectedId === "quiz-mcq") {
      return (
        <GrammarQuiz
          questions={grammarQuizQuestions}
          onExit={() => handleSelect(defaultSelectedId(activeModule))}
          scrollToTop={scrollDetailToTop}
        />
      );
    }
    if (selectedId === "quiz-exam") {
      return (
        <ExamQuiz
          exam={examQuiz}
          onExit={() => handleSelect(defaultSelectedId(activeModule))}
          scrollToTop={scrollDetailToTop}
        />
      );
    }
    if (selectedId === "quiz-training") {
      return (
        <ExamQuiz
          exam={trainingQuizLive}
          quizName="Training quiz"
          sectionLabels={TRAINING_SECTION_LABELS}
          referenceToNotion={{}}
          onExit={() => handleSelect(defaultSelectedId(activeModule))}
          scrollToTop={scrollDetailToTop}
        />
      );
    }
    const notion = flatten(activeModule.groups).find((n) => n.slug === selectedId);
    if (!notion) {
      return activeModule.socle ? (
        <SocleDetail socle={activeModule.socle} />
      ) : (
        <ChecklistDetail checklist={activeModule.checklist} />
      );
    }
    const group = activeModule.groups.find((g) => g.notions.some((n) => n.slug === notion.slug));
    return <NotionDetail notion={notion} groupLabel={group?.title} />;
  })();

  return (
    <div>
      <SectionHeader
        kicker="Reference"
        title="Grammar"
        subtitle={`${notionCount} notions from ${activeModule.subtitleLabel}, grouped by theme — objective, rule, key points, examples.`}
      />

      {modules.length > 1 && (
        <div className="mb-6">
          <GrammarModuleTabs
            tabs={modules.map((m) => ({ id: m.id, label: m.tabLabel }))}
            activeId={activeModuleId}
            onChange={handleModuleChange}
          />
        </div>
      )}

      <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-8">
        {/* Sidebar */}
        <div
          className={`${mobileView === "list" ? "block" : "hidden"} lg:block lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto lg:pr-2`}
        >
          <GrammarSidebar
            groups={activeModule.groups}
            socle={activeModule.socle}
            checklist={activeModule.checklist}
            quizzes={activeModule.quizzes ?? []}
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
    </div>
  );
}
