import type { WordNature } from "@/content/grammar/grammar-data";

const ITEMS: { nature: WordNature; jp: string; label: string; style: string }[] = [
  { nature: "verbe", jp: "動詞", label: "verb", style: "bg-nature-verbeBg text-nature-verbe" },
  { nature: "compteur", jp: "助数詞", label: "counter", style: "bg-nature-compteurBg text-nature-compteur" },
  { nature: "nom", jp: "名詞", label: "noun", style: "bg-nature-nomBg text-nature-nom" },
  { nature: "adj", jp: "形容詞", label: "i-adjective", style: "bg-nature-adjBg text-nature-adj" },
  { nature: "naadj", jp: "な形容詞", label: "na-adjective", style: "bg-accent-50 text-accent-700" },
];

export default function NatureLegend({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {ITEMS.map((item) => (
        <span
          key={item.nature}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.style}`}
        >
          <span className="jp">{item.jp}</span>
          <span className="opacity-80">{item.label}</span>
        </span>
      ))}
    </div>
  );
}
