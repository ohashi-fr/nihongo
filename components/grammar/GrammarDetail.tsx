import type {
  ChecklistSection,
  Notion,
  SocleSection,
} from "@/content/grammar/grammar-data";
import RichText from "./RichText";
import ContentBlocks from "./ContentBlocks";
import NatureLegend from "./NatureLegend";

function AttentionBox({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  return (
    <div className="mt-6 rounded-xl border-l-4 border-accent-500 bg-accent-50 px-4 py-3.5">
      <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-accent-700">
        {label}
      </div>
      {items.length === 1 ? (
        <p className="jp text-sm leading-relaxed text-primary-900">
          <RichText text={items[0]} />
        </p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="jp flex gap-2 text-sm leading-relaxed text-primary-900">
              <span className="mt-0.5 text-accent-700">•</span>
              <RichText text={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ExamplesList({
  examples,
}: {
  examples: { jp: string; gloss?: string }[];
}) {
  return (
    <div className="mt-6">
      <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
        Examples
      </div>
      <ul className="space-y-2">
        {examples.map((ex, i) => (
          <li key={i} className="flex gap-2 text-[15px] leading-relaxed">
            <span className="mt-0.5 shrink-0 font-bold text-primary">›</span>
            <span className="jp text-ink">
              <RichText text={ex.jp} />
              {ex.gloss && <span className="ml-2 text-[13px] text-muted">{ex.gloss}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NotionDetail({
  notion,
  groupLabel,
}: {
  notion: Notion;
  groupLabel?: string;
}) {
  return (
    <article className="max-w-3xl">
      {groupLabel && (
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-accent-700">
          {groupLabel}
        </div>
      )}
      <h2 className="flex flex-wrap items-baseline gap-2.5 text-xl font-bold text-ink sm:text-2xl">
        <span className="text-sm font-bold text-muted">{notion.number}</span>
        <span className="jp">{notion.titleJp}</span>
        {notion.titleKanji && (
          <span className="jp text-sm font-medium text-muted">{notion.titleKanji}</span>
        )}
      </h2>
      <p className="mt-2.5 max-w-[65ch] text-sm italic leading-relaxed text-sumi">
        <RichText text={notion.objective} />
        {notion.exampleGloss && (
          <span className="mt-1 block not-italic text-muted">{notion.exampleGloss}</span>
        )}
      </p>

      <div className="mt-5">
        <ContentBlocks blocks={notion.blocks} />
      </div>

      <AttentionBox label={notion.attention.label} items={notion.attention.items} />
      <ExamplesList examples={notion.examples} />
    </article>
  );
}

export function SocleDetail({ socle }: { socle: SocleSection }) {
  return (
    <article className="max-w-3xl">
      <h2 className="flex flex-wrap items-baseline gap-2.5 text-xl font-bold text-ink sm:text-2xl">
        <span className="jp">{socle.jpTitle}</span>
        <span className="text-sm font-medium text-muted">{socle.title}</span>
      </h2>
      <p className="mt-2.5 max-w-[65ch] text-sm italic leading-relaxed text-sumi">
        <RichText text={socle.objective} />
      </p>

      <div className="mt-4 rounded-xl bg-soft p-3.5">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
          Word-nature colors used throughout
        </div>
        <NatureLegend />
      </div>

      <div className="mt-5">
        <ContentBlocks
          blocks={[{ type: "table", headers: socle.table.headers, rows: socle.table.rows }]}
        />
      </div>
      <AttentionBox label={socle.attention.label} items={socle.attention.items} />
    </article>
  );
}

export function ChecklistDetail({ checklist }: { checklist: ChecklistSection }) {
  return (
    <article className="max-w-3xl rounded-2xl bg-primary px-5 py-6 text-white sm:px-7 sm:py-7">
      <h2 className="text-xl font-bold sm:text-2xl">{checklist.title}</h2>
      <ol className="mt-4 space-y-2.5 [&_strong]:text-white">
        {checklist.items.map((item, i) => (
          <li key={i} className="jp flex gap-2.5 text-[15px] leading-relaxed text-primary-100">
            <span className="shrink-0 font-bold text-accent-300">{i + 1}.</span>
            <RichText text={item} />
          </li>
        ))}
      </ol>
    </article>
  );
}
