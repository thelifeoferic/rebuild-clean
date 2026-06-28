"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { exerciseGuides } from "@/data/exercise-guides";
import { Section } from "@/components/section";
import type { LogKind } from "@/types/rebuild";

const filters = ["All", "Cardio", "Strength", "Machines", "Home", "Recovery"] as const;
type GuideFilter = (typeof filters)[number];

export function ExerciseGuides({
  onOpenLog,
}: {
  onOpenLog?: (kind: LogKind, draft?: Record<string, string>) => void;
}) {
  const [filter, setFilter] = useState<GuideFilter>("All");
  const [query, setQuery] = useState("");
  const visibleGuides = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return exerciseGuides
      .filter((guide) => filter === "All" || guideMatchesFilter(guide, filter))
      .filter((guide) => {
        if (!normalizedQuery) return true;
        return [guide.title, guide.focus, guide.load, ...guide.cues].join(" ").toLowerCase().includes(normalizedQuery);
      });
  }, [filter, query]);

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

        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-bold ${
                filter === item ? "border-champagne bg-champagne text-carbon" : "border-white/10 bg-carbon/70 text-white/62"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <label className="mt-2 flex min-h-11 items-center gap-2 rounded-2xl border border-white/10 bg-carbon px-3 focus-within:border-champagne">
          <Search size={16} className="shrink-0 text-white/36" aria-hidden />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search exercises, cues, equipment..."
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-porcelain outline-none placeholder:text-white/28"
          />
        </label>

        <div className="mt-4 grid gap-3">
          {visibleGuides.map((guide) => {
            const Icon = guide.icon;
            const target = logTargetForGuide(guide.title);
            return (
              <article key={guide.title} className="rounded-2xl bg-white/[0.055] p-4">
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
                    <li key={cue} className="flex gap-2 text-sm leading-5 text-white/58">
                      <span className="mt-[0.46rem] size-1.5 shrink-0 rounded-full bg-champagne" aria-hidden />
                      {cue}
                    </li>
                  ))}
                </ul>
                {onOpenLog ? (
                  <button
                    type="button"
                    onClick={() => onOpenLog(target.kind, target.draft)}
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-champagne px-4 text-sm font-black text-carbon shadow-glow"
                  >
                    Log {target.label}
                  </button>
                ) : null}
              </article>
            );
          })}
          {visibleGuides.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-carbon/70 p-4 text-sm font-semibold text-white/45">
              No guide matched that search. Try a movement, machine, or cue.
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  );
}

function guideMatchesFilter(guide: (typeof exerciseGuides)[number], filter: GuideFilter) {
  const searchable = `${guide.title} ${guide.focus}`.toLowerCase();

  if (filter === "Cardio") return /bike|ladder|swim|stair|row|conditioning|interval/.test(searchable);
  if (filter === "Strength") return /strength|press|squat|curl|deadlift|carry|row|pulldown|leg|bench|sled/.test(searchable);
  if (filter === "Machines") return /stairmaster|row machine|lat pulldown|leg press|shoulder press|air bike/.test(searchable);
  if (filter === "Home") return /push-up|bodyweight|floor|glute|dead bug|band|lunge|home|yoga/.test(searchable);
  if (filter === "Recovery") return /yoga|mobility|swim|recovery|nervous system/.test(searchable);
  return true;
}

function logTargetForGuide(title: string): { draft?: Record<string, string>; kind: LogKind; label: string } {
  const lower = title.toLowerCase();

  if (lower.includes("bike")) return { kind: "bike", label: "bike" };
  if (lower.includes("jacob")) return { kind: "jacobsLadder", label: "ladder" };
  if (lower.includes("push-up")) return { kind: "pushUps", label: "push-ups" };
  if (lower.includes("farmer")) return { kind: "farmerCarries", label: "carry" };
  if (lower.includes("kettlebell")) return { draft: { exercise: "Around-the-worlds" }, kind: "kettlebell", label: "kettlebell" };
  if (lower.includes("dumbbell")) return { draft: { exercise: title }, kind: "dumbbellCurls", label: "dumbbell work" };
  if (lower.includes("swim")) return { kind: "swim", label: "swim" };
  if (lower.includes("yoga")) return { kind: "yoga", label: "yoga" };
  if (/stairmaster|row machine|air bike|elliptical|treadmill/.test(lower)) {
    return {
      draft: {
        category: "Cardio",
        machine: title,
      },
      kind: "machine",
      label: "cardio machine",
    };
  }

  if (/lat pulldown|leg press|shoulder press/.test(lower)) {
    return {
      draft: {
        category: "Strength machine",
        machine: title,
      },
      kind: "machine",
      label: "machine work",
    };
  }

  return { draft: { exercise: title }, kind: "strength", label: "strength" };
}
