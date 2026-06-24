import { ClipboardList } from "lucide-react";
import { workoutPrograms } from "@/data/workout-programs";
import { Section } from "@/components/section";

export function WorkoutPrograms() {
  return (
    <Section id="programs" eyebrow="Decision support" title="Workout Templates">
      <div className="panel p-4">
        <div className="space-y-3">
          {workoutPrograms.map((program) => (
            <article key={program.title} className="rounded-2xl bg-white/[0.055] p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="metric-label">{program.time}</p>
                  <h3 className="mt-1 text-lg font-semibold text-porcelain">{program.title}</h3>
                  <p className="mt-1 text-sm leading-5 text-white/50">{program.intent}</p>
                </div>
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-champagne/10 text-champagne">
                  <ClipboardList size={18} strokeWidth={2.2} aria-hidden />
                </div>
              </div>
              <div className="space-y-2">
                {program.blocks.map((block, index) => (
                  <div key={block} className="flex gap-3 rounded-xl bg-carbon/70 p-3">
                    <span className="text-xs font-bold text-champagne">{index + 1}</span>
                    <p className="text-sm leading-5 text-white/62">{block}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
