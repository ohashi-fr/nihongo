/**
 * Illustration library for custom decks. The four illustrations used
 * by the seeded modules and Favorites blocks (bonsai, bridge, lantern,
 * ramen) are intentionally NOT in this list — those are locked to
 * their respective modules so decks can't hijack them and blur the
 * visual identity of the seeded content.
 */

export type DeckIllustration = {
  /** Filename in /public/icons/. Stored in `custom_decks.illustration`. */
  file: string;
  /** Short human label used in the picker UI. */
  label: string;
};

export const DECK_ILLUSTRATIONS: DeckIllustration[] = [
  { file: "zen-garden.png",     label: "Zen garden" },
  { file: "stone-lantern.png",  label: "Stone lantern" },
  { file: "lotus-pond.png",     label: "Lotus pond" },
  { file: "bamboo-fountain.png",label: "Bamboo fountain" },
  { file: "buddha.png",         label: "Buddha" },
  { file: "temple-bell.png",    label: "Temple bell" },
  { file: "gold-bell.png",      label: "Gold bell" },
  { file: "maple-leaves.png",   label: "Maple leaves" },
  { file: "topiary-garden.png", label: "Topiary garden" },
  { file: "bento.png",          label: "Bento" },
  { file: "nigiri-tuna.png",    label: "Tuna nigiri" },
  { file: "ebi-nigiri.png",     label: "Shrimp nigiri" },
  { file: "katana.png",         label: "Katana" },
  { file: "geta.png",           label: "Geta sandal" },
];

/** Default cover art for a brand-new deck. */
export const DEFAULT_DECK_ILLUSTRATION = "zen-garden.png";

const KNOWN = new Set(DECK_ILLUSTRATIONS.map((i) => i.file));

/**
 * Fall back to the default if the stored filename doesn't match one
 * of the library entries — protects the UI from broken image tags if
 * a deck's `illustration` was set to a value that no longer exists.
 */
export function safeIllustration(file: string | null | undefined): string {
  if (file && KNOWN.has(file)) return file;
  return DEFAULT_DECK_ILLUSTRATION;
}

/** Absolute URL for use in `<Image src={…}>`. */
export function illustrationUrl(file: string | null | undefined): string {
  return `/icons/${safeIllustration(file)}`;
}
