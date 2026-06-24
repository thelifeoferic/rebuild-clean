import { CheckCircle2 } from "lucide-react";
import type { TimelineItem } from "@/types/rebuild";
import { Section } from "@/components/section";

const toneClasses = {
  gold: "border-champagne/50 bg-champagne/10 text-champagne",
  green: "border-signal/50 bg-signal/10 text-signal",
  ember: "border-ember/50 bg-ember/10 text-ember",
  steel: "border-white/20 bg-white/10 text-white/70",
};

export function RebuildTimeline({ timeline }: { timeline: TimelineItem[] }) {
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
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/38">{item.date}</p>
                  <h3 className="mt-1 text-base font-semibold text-porcelain">{item.title}</h3>
                  <p className="mt-1 text-sm leading-5 text-white/56">{item.detail}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
