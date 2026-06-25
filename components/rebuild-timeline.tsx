"use client";

import { CheckCircle2, Pencil } from "lucide-react";
import type { LogKind, TimelineItem } from "@/types/rebuild";
import { Section } from "@/components/section";

const toneClasses = {
  gold: "border-champagne/50 bg-champagne/10 text-champagne",
  green: "border-signal/50 bg-signal/10 text-signal",
  ember: "border-ember/50 bg-ember/10 text-ember",
  steel: "border-white/20 bg-white/10 text-white/70",
};

export function RebuildTimeline({
  onEdit,
  timeline,
}: {
  onEdit?: (kind: LogKind, id: string) => void;
  timeline: TimelineItem[];
}) {
  return (
    <Section id="timeline" eyebrow="Identity reps" title="Rebuild Timeline">
      <div className="panel p-4">
        <div className="space-y-3">
          {timeline.map((item) => (
            <article key={item.id} className="relative rounded-2xl border border-white/10 bg-carbon/70 p-4">
              <div className="flex gap-3">
                <div className={`grid size-9 shrink-0 place-items-center rounded-full border ${toneClasses[item.tone]}`}>
                  <CheckCircle2 size={18} strokeWidth={2.2} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/38">{item.date}</p>
                  <h3 className="mt-1 text-base font-semibold text-porcelain">{item.title}</h3>
                  <p className="mt-1 text-sm leading-5 text-white/56">{item.detail}</p>
                </div>
                {item.editable && onEdit ? (
                  <button
                    type="button"
                    onClick={() => onEdit(item.editable!.kind, item.editable!.id)}
                    className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1 rounded-full bg-white/10 px-3 text-xs font-bold text-white/62"
                    aria-label={`Edit ${item.title}`}
                  >
                    <Pencil size={14} strokeWidth={2.2} aria-hidden />
                    Edit
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
