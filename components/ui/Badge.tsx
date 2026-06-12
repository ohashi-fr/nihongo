import type { HTMLAttributes } from "react";

export type BadgeTone = "default" | "accent" | "success";

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const TONE: Record<BadgeTone, string> = {
  default: "badge",
  accent: "badge-accent",
  success: "badge-success",
};

export default function Badge({
  tone = "default",
  className = "",
  ...rest
}: Props) {
  return <span {...rest} className={`${TONE[tone]} ${className}`} />;
}
