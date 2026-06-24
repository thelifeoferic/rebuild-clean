import Image from "next/image";
import { exerciseGuides } from "@/data/exercise-guides";
import { Section } from "@/components/section";

export function ExerciseGuides() {
  return (
    <Section id="exercise-guides" eyebrow="Execution" title="Exercise Guides">
      <div className="panel p-4">
        <div className="relative mb-4 min-h-36 overflow-hidden rounded-2xl bg-black">
          <Image
            src="/rebuild-kettlebell-pushup.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 448px"
            className="object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="metric-label text-white/60">Form before load</p>
            <p className="mt-1 text-xl font-semibold text-porcelain">Make reps count.</p>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {exerciseGuides.map((guide) => {
            const Icon = guide.icon;
            return (
              <article key={guide.title} className="min-w-[78%] rounded-2xl bg-white/[0.055] p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="metric-label">{guide.focus}</p>
                    <h3 className="mt-1 text-lg font-semibold text-porcelain">{guide.title}</h3>
                  </div>
                  <div className="grid size-11 place-items-center rounded-full bg-champagne/10 text-champagne">
                    <Icon size={19} strokeWidth={2.2} aria-hidden />
                  </div>
                </div>
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-champagne">{guide.load}</p>
                <ul className="space-y-2">
                  {guide.cues.map((cue) => (
                    <li key={cue} className="text-sm leading-5 text-white/58">
                      {cue}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
