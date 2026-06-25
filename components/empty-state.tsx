import type { ComponentType } from "react";

type EmptyStateProps = {
  action?: {
    label: string;
    onClick: () => void;
  };
  detail: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number; "aria-hidden"?: boolean }>;
  title: string;
};

export function EmptyState({ action, detail, icon: Icon, title }: EmptyStateProps) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5 text-center shadow-panel">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-champagne/10 text-champagne">
        <Icon size={21} strokeWidth={2.2} aria-hidden />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-porcelain">{title}</h3>
      <p className="mx-auto mt-2 max-w-[18rem] text-sm leading-5 text-white/50">{detail}</p>
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-2xl bg-champagne px-4 text-sm font-bold text-carbon"
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );
}
