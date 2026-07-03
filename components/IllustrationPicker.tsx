"use client";

import Image from "next/image";
import { DECK_ILLUSTRATIONS } from "@/lib/deckIllustrations";

/**
 * Grid picker used inside the deck create / edit modals. A single
 * illustration is selected at a time; the caller controls state via
 * `value` + `onChange`. The grid is intentionally short (2-4 rows on
 * mobile) so the modal doesn't scroll away from the primary CTA.
 */

type Props = {
  value: string;
  onChange: (file: string) => void;
};

export default function IllustrationPicker({ value, onChange }: Props) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
        Illustration
      </div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-7">
        {DECK_ILLUSTRATIONS.map((ill) => {
          const selected = ill.file === value;
          return (
            <button
              key={ill.file}
              type="button"
              onClick={() => onChange(ill.file)}
              aria-label={ill.label}
              title={ill.label}
              aria-pressed={selected}
              className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border transition ${
                selected
                  ? "border-accent bg-accent/10 shadow-glow"
                  : "border-border bg-white hover:border-primary/40 hover:bg-soft/60"
              }`}
            >
              <Image
                src={`/icons/${ill.file}`}
                alt=""
                width={72}
                height={72}
                className="h-full w-full object-contain p-1.5"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
