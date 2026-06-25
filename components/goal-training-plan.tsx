"use client";

import { Bike, CheckCircle2, Dumbbell, Flame, Sparkles, Waves } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { workoutPrograms, type WorkoutProgram } from "@/data/workout-programs";
import { Section } from "@/components/section";
import type { LogKind, OnboardingProfile, RebuildData } from "@/types/rebuild";
import { getTodaysBikeMinutes, getTodaysPushUps } from "@/lib/rebuild-data";

type GoalTrainingPlanProps = {
  data: RebuildData;
  onOpenLog: (kind: LogKind) => void;
  profile: OnboardingProfile | null;
};

const todayProgramBlocksKey = "rebuild:today-program-blocks:v1";

export function GoalTrainingPlan({ data, onOpenLog, profile }: GoalTrainingPlanProps) {
  const recommendations = useMemo(() => getRecommendedPrograms(profile), [profile]);
  const [completedBlocks, setCompletedBlocks] = useState<Record<string, boolean>>({});
  const [completedLoaded, setCompletedLoaded] = useState(false);
  const primary = recommendations[0];
  const primaryLog = logKindFor(primary);
  const goals = profile?.goals?.length ? profile.goals : profile?.goal ? [profile.goal] : ["Rebuild discipline"];
  const equipment = profile?.equipment?.length ? profile.equipment.slice(0, 4).join(", ") : "bodyweight, bike, dumbbells";
  const storageKey = `${todayProgramBlocksKey}:${new Date().toISOString().slice(0, 10)}`;
  const totalBlocks = recommendations.reduce((sum, program) => sum + program.blocks.length, 0);
  const doneBlocks = recommendations.reduce(
    (sum, program) => sum + program.blocks.filter((_, index) => completedBlocks[blockKey(program.title, index)]).length,
    0,
  );
  const completedSomething =
    getTodaysBikeMinutes(data) > 0 ||
    getTodaysPushUps(data) > 0 ||
    data.strengthAccessorySessions.some((entry) => entry.date === "Today") ||
    data.kettlebellSessions.some((entry) => entry.date === "Today") ||
    data.swimSessions.some((entry) => entry.date === "Today") ||
    data.yogaSessions.some((entry) => entry.date === "Today");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) setCompletedBlocks(JSON.parse(stored) as Record<string, boolean>);
    } catch {
      setCompletedBlocks({});
    } finally {
      setCompletedLoaded(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!completedLoaded) return;
    window.localStorage.setItem(storageKey, JSON.stringify(completedBlocks));
  }, [completedBlocks, completedLoaded, storageKey]);

  function toggleBlock(program: WorkoutProgram, index: number) {
    const key = blockKey(program.title, index);
    setCompletedBlocks((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <Section id="goal-training" eyebrow="Recommended today" title="Train for your goals">
      <div className="panel overflow-hidden">
        <div className="bg-[linear-gradient(135deg,rgba(232,91,62,0.24),rgba(246,243,237,0.08)_52%,rgba(8,9,10,0.96))] p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="metric-label">Operating mode</p>
              <h3 className="mt-1 text-2xl font-semibold leading-tight text-porcelain">
                {completedSomething ? "Build on today's proof." : "Start with the highest-return block."}
              </h3>
              <p className="mt-2 text-sm font-bold text-champagne">{doneBlocks}/{totalBlocks} blocks checked off</p>
            </div>
            <div className="grid size-11 shrink-0 place-items-center rounded-full bg-champagne/15 text-champagne">
              <Sparkles size={19} strokeWidth={2.2} aria-hidden />
            </div>
          </div>
          <p className="text-sm leading-5 text-white/58">
            Goals: {goals.slice(0, 3).join(", ")}. Available tools: {equipment}. REBUILD is ranking sessions that match both.
          </p>
          <button
            type="button"
            onClick={() => onOpenLog(primaryLog)}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-champagne px-4 text-sm font-bold text-carbon shadow-glow"
          >
            Log the recommended work
          </button>
        </div>

        <div className="space-y-3 p-4">
          {recommendations.map((program, index) => (
            <article key={program.title} className="rounded-2xl bg-white/[0.055] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="metric-label">
                    {index === 0 ? "Best fit" : program.location} · {program.time}
                  </p>
                  <h4 className="mt-1 text-lg font-semibold text-porcelain">{program.title}</h4>
                  <p className="mt-1 text-sm leading-5 text-white/50">{program.intent}</p>
                </div>
                <ProgramIcon program={program} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {program.focus.slice(0, 3).map((focus) => (
                  <span key={focus} className="rounded-full bg-carbon/80 px-3 py-1 text-xs font-bold capitalize text-white/45">
                    {focus}
                  </span>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                {program.blocks.map((block, blockIndex) => {
                  const done = Boolean(completedBlocks[blockKey(program.title, blockIndex)]);

                  return (
                    <button
                      key={`${program.title}-${block}`}
                      type="button"
                      onClick={() => toggleBlock(program, blockIndex)}
                      className={`flex w-full items-start gap-3 rounded-2xl p-3 text-left transition active:scale-[0.98] ${
                        done ? "bg-signal/12" : "bg-carbon/70"
                      }`}
                    >
                      <span
                        className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-black ${
                          done ? "bg-signal/20 text-signal" : "bg-champagne/10 text-champagne"
                        }`}
                      >
                        {done ? <CheckCircle2 size={16} strokeWidth={2.4} aria-hidden /> : blockIndex + 1}
                      </span>
                      <span className={`text-sm leading-5 ${done ? "text-white/40 line-through decoration-signal/70" : "text-white/62"}`}>
                        {block}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => onOpenLog(logKindFor(program))}
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-white/10 px-4 text-sm font-bold text-porcelain"
              >
                Log {logLabelFor(program)}
              </button>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}

function ProgramIcon({ program }: { program: WorkoutProgram }) {
  const Icon =
    program.location === "Pool" ? Waves : program.focus.includes("cardio") ? Bike : program.focus.includes("recovery") ? Flame : Dumbbell;

  return (
    <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-champagne">
      <Icon size={18} strokeWidth={2.2} aria-hidden />
    </div>
  );
}

function getRecommendedPrograms(profile: OnboardingProfile | null) {
  return workoutPrograms
    .map((program) => ({ program, score: scoreProgram(program, profile) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.program);
}

function scoreProgram(program: WorkoutProgram, profile: OnboardingProfile | null) {
  const goals = (profile?.goals?.length ? profile.goals : profile?.goal ? [profile.goal] : []).map(normalize);
  const equipment = (profile?.equipment ?? []).map(normalize);
  let score = 0;

  if (!goals.length) score += program.focus.includes("discipline") ? 2 : 0;

  for (const goal of goals) {
    if (goal.includes("lose") || goal.includes("weight")) score += hasFocus(program, ["weight loss", "cardio", "conditioning"]) ? 4 : 0;
    if (goal.includes("strength") || goal.includes("muscle")) score += hasFocus(program, ["strength", "muscle"]) ? 4 : 0;
    if (goal.includes("cardio")) score += hasFocus(program, ["cardio", "conditioning"]) ? 4 : 0;
    if (goal.includes("smok") || goal.includes("spiral") || goal.includes("discipline")) {
      score += hasFocus(program, ["discipline", "behavior", "conditioning"]) ? 3 : 0;
    }
    if (goal.includes("sleep") || goal.includes("stress")) score += hasFocus(program, ["recovery", "mobility", "stress", "sleep"]) ? 3 : 0;
    if (goal.includes("eat")) score += hasFocus(program, ["weight loss", "discipline"]) ? 1 : 0;
  }

  if (!equipment.length && program.equipment.some((item) => normalize(item) === "bodyweight")) score += 2;

  for (const item of program.equipment) {
    const normalized = normalize(item);
    if (normalized === "bodyweight") score += 1;
    if (equipment.some((owned) => owned.includes(normalized) || normalized.includes(owned))) score += 2;
  }

  if (program.location === "Home") score += 1;
  return score;
}

function hasFocus(program: WorkoutProgram, targets: string[]) {
  return targets.some((target) => program.focus.includes(target));
}

function logKindFor(program: WorkoutProgram): LogKind {
  if (program.location === "Pool") return "swim";
  if (program.focus.includes("recovery") || program.focus.includes("mobility")) return "yoga";
  if (program.equipment.some((item) => item.toLowerCase().includes("kettlebell"))) return "kettlebell";
  if (program.focus.includes("strength") || program.focus.includes("muscle")) return "strength";
  return "bike";
}

function logLabelFor(program: WorkoutProgram) {
  const kind = logKindFor(program);
  if (kind === "swim") return "swim";
  if (kind === "yoga") return "yoga";
  if (kind === "kettlebell") return "kettlebell";
  if (kind === "strength") return "strength";
  return "bike";
}

function blockKey(programTitle: string, index: number) {
  return `${programTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
