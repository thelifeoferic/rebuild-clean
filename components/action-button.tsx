import { clsx } from "clsx";
import type { ComponentType } from "react";

type ActionButtonProps = {
  label: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number; "aria-hidden"?: boolean }>;
  href?: string;
  variant?: "gold" | "dark" | "green";
};

export function ActionButton({ label, icon: Icon, href, variant = "dark" }: ActionButtonProps) {
  const className = clsx(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition",
    {
      "bg-champagne text-carbon shadow-glow hover:bg-[#f26a4e]": variant === "gold",
      "bg-white/8 text-porcelain hairline hover:bg-white/12": variant === "dark",
      "bg-signal text-carbon hover:bg-white": variant === "green",
    },
  );

  if (href) {
    return (
      <a className={className} href={href} target="_blank" rel="noreferrer">
        <Icon size={17} strokeWidth={2.2} aria-hidden />
        {label}
      </a>
    );
  }

  return (
    <button className={className} type="button">
      <Icon size={17} strokeWidth={2.2} aria-hidden />
      {label}
    </button>
  );
}
