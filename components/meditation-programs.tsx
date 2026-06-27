"use client";

import { Brain, CheckCircle2, Moon, Sparkles, Wind } from "lucide-react";
import Image from "next/image";
import { Section } from "@/components/section";
import type { LogKind } from "@/types/rebuild";

type MeditationRoutine = {
  title: string;
  duration: string;
  intent: string;
  replacement: string;
  steps: string[];
  icon: typeof Wind;
};

const routines: MeditationRoutine[] = [
  {
    title: "Three-minute interrupt",
    duration: "3 min",
    intent: "Use this when pressure is high and the next move matters.",
    replacement: "Meditation",
    icon: Brain,
    steps: ["Sit down before acting", "Breathe through the nose", "Name the trigger once", "Choose the next clean action"],
  },
  {
    title: "Box breathing reset",
    duration: "5 min",
    intent: "Lower the noise before a workout, meal, text, or decision.",
    replacement: "Box breathing",
    icon: Wind,
    steps: ["Inhale for four", "Hold for four", "Exhale for four", "Hold for four"],
  },
  {
    title: "Post-workout downshift",
    duration: "8 min",
    intent: "Let the session land instead of rushing into the next stimulus.",
    replacement: "Post-workout meditation",
    icon: Sparkles,
    steps: ["Slow walk for one minute", "Long exhales", "Scan jaw, shoulders, hands", "Log the work"],
  },
  {
    title: "Sleep bridge",
    duration: "10 min",
    intent: "Close the day cleanly and protect tomorrow morning.",
    replacement: "Sleep meditation",
    icon: Moon,
    steps: ["Phone down", "Dark room", "Exhale longer than inhale", "Repeat the next right move"],
  },
];

export function MeditationPrograms({ onOpenLog }: { onOpenLog: (kind: LogKind, draft?: Record<string, string>) => void }) {
  return (
    <Section id="meditation" eyebrow="Nervous system" title="Meditation">
      <div className="panel overflow-hidden">
        <div className="relative min-h-44 bg-black">
          <Image
            src="/rebuild-yoga-light.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 448px"
            className="object-cover object-center opacity-72"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/30 to-black/10" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="metric-label text-white/60">Pattern work</p>
            <p className="mt-1 text-3xl font-black uppercase leading-none text-porcelain">Build the pause.</p>
            <p className="mt-2 text-sm font-semibold leading-5 text-white/58">Short sessions that make the next choice easier.</p>
          </div>
        </div>

        <div className="grid gap-3 p-4">
          {routines.map((routine) => {
            const Icon = routine.icon;

            return (
              <article key={routine.title} className="rounded-2xl bg-white/[0.055] p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="metric-label">{routine.duration}</p>
                    <h3 className="mt-1 text-lg font-semibold text-porcelain">{routine.title}</h3>
                    <p className="mt-1 text-sm leading-5 text-white/50">{routine.intent}</p>
                  </div>
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-ember/14 text-ember">
                    <Icon size={18} strokeWidth={2.2} aria-hidden />
                  </div>
                </div>

                <div className="space-y-2">
                  {routine.steps.map((step) => (
                    <div key={step} className="flex items-center gap-2 rounded-xl bg-carbon/70 px-3 py-2">
                      <CheckCircle2 size={15} className="shrink-0 text-champagne" strokeWidth={2.2} aria-hidden />
                      <span className="text-sm font-semibold leading-5 text-white/60">{step}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => onOpenLog("mood", { label: routine.replacement, reason: "stress" })}
                  className="mt-3 min-h-11 w-full rounded-2xl bg-champagne px-4 text-sm font-black text-carbon active:scale-[0.97]"
                >
                  Log meditation
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
