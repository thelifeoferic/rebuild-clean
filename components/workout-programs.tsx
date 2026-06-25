"use client";

import { CheckCircle2, ClipboardList, Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { workoutPrograms, type ProgramLocation, type WorkoutProgram } from "@/data/workout-programs";
import { Section } from "@/components/section";
import type { OnboardingProfile } from "@/types/rebuild";

const filters = ["Recommended", "Home", "Gym", "Recovery", "All"] as const;
type ProgramFilter = (typeof filters)[number];
const completedProgramBlocksKey = "rebuild:program-blocks:v1";

export function WorkoutPrograms({ profile }: { profile: OnboardingProfile | null }) {
  const [filter, setFilter] = useState<ProgramFilter>("Recommended");
  const [query, setQuery] = useState("");
  const [completedBlocks, setCompletedBlocks] = useState<Record<string, boolean>>({});
  const [completedLoaded, setCompletedLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(completedProgramBlocksKey);
      if (stored) setCompletedBlocks(JSON.parse(stored) as Record<string, boolean>);
    } catch {
      setCompletedBlocks({});
    } finally {
      setCompletedLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!completedLoaded) return;
    window.localStorage.setItem(completedProgramBlocksKey, JSON.stringify(completedBlocks));
  }, [completedBlocks, completedLoaded]);

  const visiblePrograms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return workoutPrograms
      .filter((program) => {
        if (filter === "All") return true;
        if (filter === "Recommended") return scoreProgram(program, profile) > 2;
        if (filter === "Recovery") return program.location === "Recovery" || program.location === "Pool";
        return program.location === filter;
      })
      .filter((program) => {
        if (!normalizedQuery) return true;
        return [program.title, program.intent, program.location, ...program.focus, ...program.equipment, ...program.blocks]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((a, b) => (filter === "Recommended" ? scoreProgram(b, profile) - scoreProgram(a, profile) : 0));
  }, [filter, profile, query]);

  return (
    <Section id="programs" eyebrow="Expandable library" title="Workout Templates">
      <div className="panel p-4">
        <div className="relative mb-4 min-h-40 overflow-hidden rounded-2xl bg-black">
          <Image
            src="/rebuild-bodyweight.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 448px"
            className="object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="metric-label text-white/60">No confusion</p>
            <p className="mt-1 text-2xl font-semibold text-porcelain">Recommended exercises.</p>
            <p className="mt-1 text-sm font-semibold text-white/55">Check each block off when it is done.</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-bold ${
                filter === item ? "border-champagne bg-champagne text-carbon" : "border-white/10 bg-white/[0.055] text-white/62"
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
            placeholder="Search programs, equipment, focus..."
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-porcelain outline-none placeholder:text-white/28"
          />
        </label>

        <div className="mt-4 space-y-3">
          {visiblePrograms.map((program) => (
            <ProgramCard
              key={program.title}
              completedBlocks={completedBlocks}
              onToggleBlock={(index) => {
                const key = blockKey(program.title, index);
                setCompletedBlocks((current) => ({ ...current, [key]: !current[key] }));
              }}
              program={program}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}

function ProgramCard({
  completedBlocks,
  onToggleBlock,
  program,
}: {
  completedBlocks: Record<string, boolean>;
  onToggleBlock: (index: number) => void;
  program: WorkoutProgram;
}) {
  return (
    <article className="rounded-2xl bg-white/[0.055] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="metric-label">
            {program.location} · {program.time}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-porcelain">{program.title}</h3>
          <p className="mt-1 text-sm leading-5 text-white/50">{program.intent}</p>
        </div>
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-champagne/10 text-champagne">
          <ClipboardList size={18} strokeWidth={2.2} aria-hidden />
        </div>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {program.equipment.slice(0, 4).map((item) => (
          <span key={item} className="rounded-full bg-carbon/70 px-3 py-1 text-xs font-bold text-white/42">
            {item}
          </span>
        ))}
      </div>
      <div className="space-y-2">
        {program.blocks.map((block, index) => {
          const done = Boolean(completedBlocks[blockKey(program.title, index)]);

          return (
            <button
              key={`${program.title}-${block}`}
              type="button"
              onClick={() => onToggleBlock(index)}
              className={`flex w-full gap-3 rounded-xl p-3 text-left transition active:scale-[0.98] ${
                done ? "bg-signal/12" : "bg-carbon/70"
              }`}
            >
              <span
                className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  done ? "bg-signal/20 text-signal" : "bg-champagne/10 text-champagne"
                }`}
              >
                {done ? <CheckCircle2 size={15} strokeWidth={2.4} aria-hidden /> : index + 1}
              </span>
              <p className={`text-sm leading-5 ${done ? "text-white/40 line-through decoration-signal/70" : "text-white/62"}`}>
                {block}
              </p>
            </button>
          );
        })}
      </div>
    </article>
  );
}

function blockKey(programTitle: string, index: number) {
  return `${programTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`;
}

function scoreProgram(program: WorkoutProgram, profile: OnboardingProfile | null) {
  const goals = (profile?.goals?.length ? profile.goals : profile?.goal ? [profile.goal] : []).map(normalize);
  const equipment = (profile?.equipment ?? []).map(normalize);
  let score = 0;

  for (const goal of goals) {
    if (goal.includes("lose") || goal.includes("weight")) score += hasAny(program.focus, ["weight loss", "cardio", "conditioning"]) ? 4 : 0;
    if (goal.includes("strength") || goal.includes("muscle")) score += hasAny(program.focus, ["strength", "muscle"]) ? 4 : 0;
    if (goal.includes("cardio")) score += hasAny(program.focus, ["cardio", "conditioning"]) ? 4 : 0;
    if (goal.includes("smok") || goal.includes("spiral") || goal.includes("discipline")) score += hasAny(program.focus, ["discipline", "behavior"]) ? 3 : 0;
    if (goal.includes("sleep") || goal.includes("stress")) score += hasAny(program.focus, ["recovery", "mobility", "stress", "sleep"]) ? 3 : 0;
  }

  for (const item of program.equipment) {
    const normalized = normalize(item);
    if (normalized === "bodyweight") score += 1;
    if (equipment.some((owned) => owned.includes(normalized) || normalized.includes(owned))) score += 2;
  }

  return score;
}

function hasAny(values: string[], targets: string[]) {
  return targets.some((target) => values.includes(target));
}

function normalize(value: ProgramLocation | string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
