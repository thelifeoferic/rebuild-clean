import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  eyebrow?: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

export function Section({ id, eyebrow, title, action, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-5 px-4 py-5">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          {eyebrow ? <p className="metric-label mb-1">{eyebrow}</p> : null}
          <h2 className="text-xl font-semibold text-porcelain">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
