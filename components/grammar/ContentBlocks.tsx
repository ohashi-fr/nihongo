import type { ContentBlock } from "@/content/grammar/grammar-data";
import RichText from "./RichText";

function BlockLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
      {children}
    </div>
  );
}

function RuleBox({ line }: { line: string }) {
  return (
    <div className="jp mb-1.5 rounded-xl bg-soft px-3.5 py-2.5 text-[15px] leading-relaxed text-ink last:mb-0">
      <RichText text={line} />
    </div>
  );
}

function TableView({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="border-b border-border bg-soft px-3 py-2 text-left text-xs font-semibold text-muted"
              >
                {h ? <RichText text={h} /> : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 1 ? "bg-paper/60" : undefined}>
              {row.map((cell, ci) => (
                <td key={ci} className="jp border-b border-border/70 px-3 py-2 align-top last:border-r-0">
                  <RichText text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        if (block.type === "rule") {
          return (
            <div key={i}>
              {block.label && <BlockLabel>{block.label}</BlockLabel>}
              {block.lines.map((line, li) => (
                <RuleBox key={li} line={line} />
              ))}
            </div>
          );
        }
        if (block.type === "table") {
          return (
            <div key={i}>
              {block.label && <BlockLabel>{block.label}</BlockLabel>}
              <TableView headers={block.headers} rows={block.rows} />
            </div>
          );
        }
        if (block.type === "paragraph") {
          return (
            <p key={i} className="max-w-[65ch] text-sm leading-relaxed text-sumi">
              <RichText text={block.text} />
            </p>
          );
        }
        // sub-notion
        return (
          <div key={i} className="rounded-xl border border-border/70 bg-paper/40 p-4">
            <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-primary-300">
              {block.label}
            </div>
            <ContentBlocks blocks={block.blocks} />
          </div>
        );
      })}
    </div>
  );
}
