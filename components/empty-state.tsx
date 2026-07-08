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
    <div className="app-card rounded-[1.5rem] p-5 text-center">
      <div className="app-icon-soft mx-auto grid size-12 place-items-center rounded-full">
        <Icon size={21} strokeWidth={2.2} aria-hidden />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[rgb(var(--text-primary))]">{title}</h3>
      <p className="app-secondary mx-auto mt-2 max-w-[18rem] text-sm leading-5">{detail}</p>
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="app-primary-action mt-4 inline-flex min-h-11 items-center justify-center rounded-2xl px-4 text-sm font-bold"
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );
}
