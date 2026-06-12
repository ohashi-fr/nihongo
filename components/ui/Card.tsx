import type { HTMLAttributes } from "react";

/**
 * Generic card surface. Rounded, soft-shadowed, white background.
 * Use this when you want the new design-system look without writing
 * the same `rounded-2xl bg-white shadow-card p-…` over and over.
 */
type Props = HTMLAttributes<HTMLDivElement> & {
  padding?: "none" | "sm" | "md" | "lg";
};

const PAD: Record<NonNullable<Props["padding"]>, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  padding = "md",
  className = "",
  ...rest
}: Props) {
  return (
    <div
      {...rest}
      className={`rounded-2xl bg-white shadow-card ${PAD[padding]} ${className}`}
    />
  );
}
