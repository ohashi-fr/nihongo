import type { ButtonHTMLAttributes } from "react";

/**
 * Single button primitive that maps onto the global `.btn-*` classes
 * defined in `globals.css`. Use it instead of writing
 * `className="btn-primary"` etc., so future restyles can happen here.
 */
export type ButtonVariant = "primary" | "accent" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const VARIANT: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  accent: "btn-accent",
  outline: "btn-outline",
  ghost: "btn-ghost",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "!px-3 !py-1.5 !text-xs",
  md: "",
  lg: "!px-6 !py-3 !text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={`${VARIANT[variant]} ${SIZE[size]} ${className}`}
    />
  );
}
