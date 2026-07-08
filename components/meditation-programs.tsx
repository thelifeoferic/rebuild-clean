"use client";

import { BookOpen, Brain, CheckCircle2, ExternalLink, Footprints, Headphones, HeartPulse, Moon, PlayCircle, ShieldCheck, Sparkles, TimerReset, Wind } from "lucide-react";
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
    title: "Urge wave",
    duration: "6 min",
    intent: "For cravings, loops, scrolling, food impulses, or a message you should not send yet.",
    replacement: "Urge surfing",
    icon: HeartPulse,
    steps: ["Notice where the urge lives in the body", "Rate it from one to ten", "Watch it rise and fall", "Do one replacement action"],
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
  {
    title: "Walking reset",
    duration: "10 min",
    intent: "Move the body without making it a workout. Good for anger, boredom, or rumination.",
    replacement: "Walking meditation",
    icon: Footprints,
    steps: ["Walk without music for two minutes", "Name five things you see", "Relax the jaw", "Return with one next action"],
  },
];

const replacementActions = [
  "Meditated",
  "Walked",
  "Went to the gym",
  "Called a friend",
  "Journaled",
  "Early bedtime",
  "Stayed present",
  "Healthy meal",
];

const videoLinks = [
  {
    title: "Three-minute breathing space",
    detail: "A short pause before a choice.",
    href: "https://www.youtube.com/results?search_query=3+minute+breathing+space+meditation",
  },
  {
    title: "Urge surfing practice",
    detail: "Watch a craving move instead of obeying it.",
    href: "https://www.youtube.com/results?search_query=urge+surfing+guided+meditation",
  },
  {
    title: "Box breathing",
    detail: "Simple breath cadence for pressure and focus.",
    href: "https://www.youtube.com/results?search_query=box+breathing+5+minute+guided",
  },
  {
    title: "NSDR reset",
    detail: "A deeper nervous-system downshift.",
    href: "https://www.youtube.com/results?search_query=10+minute+NSDR+guided+meditation",
  },
  {
    title: "Body scan",
    detail: "Awareness training without forcing calm.",
    href: "https://www.youtube.com/results?search_query=body+scan+meditation+jon+kabat+zinn",
  },
];

const audiobookLinks = [
  {
    title: "Atomic Habits",
    author: "James Clear",
    detail: "Identity change, systems, and small repeatable proof.",
    href: "https://www.audible.com/search?keywords=Atomic+Habits+James+Clear",
  },
  {
    title: "Dopamine Nation",
    author: "Anna Lembke",
    detail: "A practical lens on craving, balance, and recovery.",
    href: "https://www.audible.com/search?keywords=Dopamine+Nation+Anna+Lembke",
  },
  {
    title: "The Power of Habit",
    author: "Charles Duhigg",
    detail: "Cue, routine, reward. Useful language for loop-breaking.",
    href: "https://www.audible.com/search?keywords=The+Power+of+Habit+Charles+Duhigg",
  },
  {
    title: "In the Realm of Hungry Ghosts",
    author: "Gabor Mate",
    detail: "Compassionate addiction work without shame.",
    href: "https://www.audible.com/search?keywords=In+the+Realm+of+Hungry+Ghosts+Gabor+Mate",
  },
  {
    title: "Breath",
    author: "James Nestor",
    detail: "Why the way you breathe changes how you feel.",
    href: "https://www.audible.com/search?keywords=Breath+James+Nestor",
  },
];

export function MeditationPrograms({ onOpenLog }: { onOpenLog: (kind: LogKind, draft?: Record<string, string>) => void }) {
  return (
    <Section id="meditation" eyebrow="Nervous system" title="Meditation">
      <div className="panel overflow-hidden">
        <div className="relative min-h-[18rem] bg-black">
          <Image
            src="/rebuild-yoga-light.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 448px"
            className="object-cover object-center opacity-82"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.32)_42%,rgba(0,0,0,0.92)_100%)]" />
          <div className="absolute bottom-5 left-5 right-5">
            <p className="metric-label text-white/60">Reset work</p>
            <p className="mt-1 font-display text-5xl font-black uppercase leading-[0.9] text-porcelain">Build the pause.</p>
            <p className="mt-3 text-sm font-semibold leading-5 text-white/68">Meditation here is practical: create space between the trigger and the next move.</p>
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
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-champagne/10 text-champagne">
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
                  onClick={() => onOpenLog("mood", { label: routine.replacement, reason: "habit" })}
                  className="app-primary-action mt-3 min-h-11 w-full rounded-2xl px-4 text-sm font-black active:scale-[0.97]"
                >
                  Log meditation
                </button>
              </article>
            );
          })}

          <article className="rounded-[1.35rem] border border-white/10 bg-carbon/80 p-4">
            <div className="mb-4 flex items-start gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-full bg-champagne/10 text-champagne">
                <ShieldCheck size={19} strokeWidth={2.2} aria-hidden />
              </div>
              <div>
                <p className="metric-label">Private habit-loop work</p>
                <h3 className="mt-1 text-xl font-semibold text-porcelain">Interrupt the loop. Log the replacement.</h3>
                <p className="mt-2 text-sm leading-5 text-white/54">
                  REBUILD can support work around alcohol, marijuana, nicotine, pornography, social media, video games, emotional eating, shopping, gambling, or anything else you are rebuilding around. The main timeline focuses on the replacement action, not the old loop.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {replacementActions.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onOpenLog("mood", { label, reason: "habit" })}
                  className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.055] px-3 text-sm font-bold leading-tight text-porcelain active:scale-[0.98]"
                >
                  {label}
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-champagne/10 text-champagne">
                <TimerReset size={18} strokeWidth={2.2} aria-hidden />
              </div>
              <div>
                <p className="metric-label">Pressure protocol</p>
                <h3 className="mt-1 text-lg font-semibold text-porcelain">When the urge is active</h3>
              </div>
            </div>
            <div className="grid gap-2">
              {["Delay for 90 seconds before acting.", "Name the trigger without debating it.", "Change location: stand, walk, shower, or leave the room.", "Pick one replacement action and log it."].map((step, index) => (
                <div key={step} className="flex gap-3 rounded-2xl bg-carbon/70 p-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-champagne/12 text-xs font-black text-champagne">{index + 1}</span>
                  <p className="text-sm font-semibold leading-5 text-white/62">{step}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-champagne/10 text-champagne">
                <PlayCircle size={18} strokeWidth={2.2} aria-hidden />
              </div>
              <div>
                <p className="metric-label">YouTube practice links</p>
                <h3 className="mt-1 text-lg font-semibold text-porcelain">Guided sessions</h3>
              </div>
            </div>
            <div className="grid gap-2">
              {videoLinks.map((link) => (
                <a
                  key={link.title}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-16 items-center justify-between gap-3 rounded-2xl bg-carbon/70 px-3 py-2 active:scale-[0.98]"
                >
                  <span>
                    <span className="block text-sm font-black text-porcelain">{link.title}</span>
                    <span className="mt-1 block text-xs font-semibold leading-4 text-white/45">{link.detail}</span>
                  </span>
                  <ExternalLink size={16} className="shrink-0 text-champagne" strokeWidth={2.2} aria-hidden />
                </a>
              ))}
            </div>
          </article>

          <article className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-champagne/10 text-champagne">
                <Headphones size={18} strokeWidth={2.2} aria-hidden />
              </div>
              <div>
                <p className="metric-label">Audiobook shelf</p>
                <h3 className="mt-1 text-lg font-semibold text-porcelain">For the rebuild between workouts</h3>
              </div>
            </div>
            <div className="grid gap-2">
              {audiobookLinks.map((book) => (
                <a
                  key={book.title}
                  href={book.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-carbon/70 p-3 active:scale-[0.98]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span>
                      <span className="block text-sm font-black text-porcelain">{book.title}</span>
                      <span className="mt-1 block text-xs font-bold uppercase tracking-[0.12em] text-champagne">{book.author}</span>
                    </span>
                    <BookOpen size={16} className="shrink-0 text-white/45" strokeWidth={2.2} aria-hidden />
                  </div>
                  <span className="mt-2 block text-xs font-semibold leading-4 text-white/45">{book.detail}</span>
                </a>
              ))}
            </div>
          </article>
        </div>
      </div>
    </Section>
  );
}
