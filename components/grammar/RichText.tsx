import type { WordNature } from "@/content/grammar/grammar-data";

/**
 * Renders the inline markup used throughout content/grammar/grammar-data.ts:
 *
 *   **text**              → bold
 *   __text__               → underline
 *   {{nature:text}}        → word-nature pastel pill
 *   {{gloss:text}}         → small muted inline gloss
 *
 * See the header comment in grammar-data.ts for the full spec.
 */

const NATURE_PILL_STYLE: Record<WordNature, string> = {
  verbe: "bg-nature-verbeBg text-nature-verbe",
  compteur: "bg-nature-compteurBg text-nature-compteur",
  nom: "bg-nature-nomBg text-nature-nom",
  adj: "bg-nature-adjBg text-nature-adj",
  naadj: "bg-accent-50 text-accent-700",
};

const TOKEN_RE =
  /\{\{(verbe|compteur|nom|adj|naadj|gloss):(.*?)\}\}|\*\*(.*?)\*\*|__(.*?)__/g;

function renderNodes(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  TOKEN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TOKEN_RE.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const [, nature, natureContent, boldContent, underlineContent] = match;
    if (nature) {
      if (nature === "gloss") {
        nodes.push(
          <span key={key++} className="ml-1 text-[0.85em] text-muted">
            {natureContent}
          </span>
        );
      } else {
        nodes.push(
          <span
            key={key++}
            className={`inline-block whitespace-nowrap rounded px-1.5 py-0.5 text-[0.85em] font-semibold ${NATURE_PILL_STYLE[nature as WordNature]}`}
          >
            {natureContent}
          </span>
        );
      }
    } else if (boldContent !== undefined) {
      nodes.push(
        <strong key={key++} className="font-semibold text-ink">
          {boldContent}
        </strong>
      );
    } else if (underlineContent !== undefined) {
      nodes.push(<u key={key++}>{underlineContent}</u>);
    }
    lastIndex = TOKEN_RE.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export default function RichText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return <span className={className}>{renderNodes(text)}</span>;
}
