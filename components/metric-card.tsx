import type { ComponentType } from "react";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number; "aria-hidden"?: boolean }>;
  tone?: "gold" | "green" | "ember" | "steel";
};

const toneClasses = {
  gold: "text-champagne bg-champagne/10",
  green: "text-signal bg-signal/10",
  ember: "text-ember bg-ember/10",
  steel: "app-icon-soft",
};

export function MetricCard({ label, value, detail, icon: Icon, tone = "steel" }: MetricCardProps) {
  return (
    <article className="panel min-h-[10.5rem] p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="metric-label">{label}</p>
        <span className={`grid size-9 place-items-center rounded-full ${toneClasses[tone]}`}>
          <Icon size={18} strokeWidth={2.2} aria-hidden />
        </span>
      </div>
      <p className="metric-value">{value}</p>
      <p className="app-subtle mt-1 text-sm leading-5">{detail}</p>
    </article>
  );
}
