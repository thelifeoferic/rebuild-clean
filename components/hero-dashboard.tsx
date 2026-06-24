"use client";

import { Bike, Headphones, RefreshCw, Scale, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { tidalPlaylistUrl } from "@/data/mock-data";
import { NutritionTracker } from "@/components/nutrition-tracker";
import { TodayPlan } from "@/components/today-plan";
import type { AppView, LogKind, OnboardingProfile, RebuildData } from "@/types/rebuild";
import { getTodaysBikeMinutes, getWeightChangeFromLast } from "@/lib/rebuild-data";
import { formatMinutes, formatWeight } from "@/lib/metrics";

const quotes = [
  {
    line: "You are in danger of living a life so comfortable and soft, that you will die without ever realizing your true potential.",
    source: "David Goggins",
  },
  { line: "No one is going to come help you. No one's coming to save you.", source: "David Goggins" },
  { line: "The most important conversations you'll ever have are the ones you'll have with yourself.", source: "David Goggins" },
  { line: "We're either getting better or we're getting worse.", source: "David Goggins" },
  { line: "I don't stop when I'm tired. I stop when I'm done.", source: "David Goggins" },
  {
    line: "Pain unlocks a secret doorway in the mind, one that leads to both peak performance, and beautiful silence.",
    source: "David Goggins",
  },
  { line: "Analyze your schedule, kill your empty habits, burn out the bullshit, and see what's left.", source: "David Goggins" },
  { line: "Take care of your body. It's the only place you have to live.", source: "Jim Rohn" },
  { line: "Look in the mirror. That's your competition.", source: "John Assaraf" },
  { line: "We are what we repeatedly do. Excellence then is not an act, but a habit.", source: "Aristotle" },
  {
    line: "No matter how many mistakes you make or how slow you progress, you are still way ahead of everyone who isn't trying.",
    source: "Tony Robbins",
  },
];

export function HeroDashboard({
  data,
  onNavigate,
  onOpenLog,
  profile,
}: {
  data: RebuildData;
  onNavigate: (view: AppView) => void;
  onOpenLog: (kind: LogKind) => void;
  profile: OnboardingProfile | null;
}) {
  const todayWeight = data.weights[0]?.weight ?? 0;
  const weightChange = getWeightChangeFromLast(data);
  const weightDetail = data.weights.length > 1 ? `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} lb` : "weigh-in";
  const todaysBikeMinutes = getTodaysBikeMinutes(data);
  const firstName = profile?.firstName?.trim();
  const [quoteIndex, setQuoteIndex] = useState(() => new Date().getMinutes() % quotes.length);
  const quote = quotes[quoteIndex];
  const hasLogs =
    data.weights.length +
      data.bikeSessions.length +
      data.pushUpSessions.length +
      data.behaviorWins.length +
      data.meals.length >
    0;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setQuoteIndex((current) => (current + 1) % quotes.length);
    }, 12000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="px-4 pb-4 pt-5">
      <div className="relative min-h-[360px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-black shadow-panel">
        <Image
          src="/rebuild-bike-room.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 448px"
          className="object-cover object-[52%_40%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.40),rgba(0,0,0,0.20)_34%,rgba(0,0,0,0.90))]" />
        <div className="relative flex min-h-[360px] flex-col justify-between p-5">
          <div>
            <div className="w-40 overflow-hidden rounded-xl border border-white/10 bg-black/70 backdrop-blur">
              <Image
                src="/rebuild-logo.png"
                alt="REBUILD. Better every day."
                width={1774}
                height={887}
                priority
                className="aspect-[2.4/1] w-full object-cover object-center"
              />
            </div>
          </div>

          <div>
            <p className="metric-label text-white/60">{firstName ? `Hi, ${firstName}` : "Today"}</p>
            <h2 className="mt-2 text-3xl font-semibold leading-none text-porcelain">
              {hasLogs ? "Next rep." : "Blank slate."}
            </h2>
            <p className="mt-2 max-w-[18rem] text-sm leading-5 text-white/68">
              {hasLogs
                ? "Log the next action and let the numbers stay honest."
                : "Start with one clean entry when tomorrow begins."}
            </p>

            <div className="mt-5 grid gap-2">
              <button
                type="button"
                onClick={() => onNavigate("log")}
                className="min-h-12 rounded-2xl bg-champagne px-4 text-base font-bold text-carbon shadow-glow"
              >
                Log workout
              </button>
              <a
                href={tidalPlaylistUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-signal px-3 text-sm font-bold text-carbon"
              >
                <Headphones size={17} strokeWidth={2.2} aria-hidden />
                Start TIDAL playlist
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="metric-label">Operating thought</p>
          <button
            type="button"
            onClick={() => setQuoteIndex((current) => (current + 1) % quotes.length)}
            className="grid size-8 place-items-center rounded-full bg-white/10 text-white/62"
            aria-label="Show next quote"
          >
            <RefreshCw size={14} strokeWidth={2.2} aria-hidden />
          </button>
        </div>
        <p className="text-lg font-semibold leading-snug text-porcelain">
          <span aria-hidden>&ldquo;</span>
          {quote.line}
          <span aria-hidden>&rdquo;</span>
        </p>
        <p className="mt-2 text-sm font-semibold text-champagne">{quote.source}</p>
      </div>

      {profile?.why ? (
        <div className="mt-3 rounded-2xl border border-white/10 bg-carbon/70 p-4">
          <p className="metric-label mb-2">Why</p>
          <p className="text-sm leading-5 text-white/62">{profile.why}</p>
        </div>
      ) : null}

      <TodayPlan data={data} onOpenLog={onOpenLog} />
      <NutritionTracker data={data} onOpenLog={onOpenLog} profile={profile} />

      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniStat label="Weight" value={data.weights.length ? formatWeight(todayWeight) : "--"} detail={weightDetail} icon={Scale} />
        <MiniStat label="Bike" value={formatMinutes(todaysBikeMinutes)} icon={Bike} />
        <MiniStat label="Wins" value={`${data.behaviorWins.length}`} icon={ShieldCheck} />
      </div>
    </section>
  );
}

function MiniStat({
  icon: Icon,
  label,
  detail,
  value,
}: {
  icon: typeof Scale;
  label: string;
  detail?: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
      <Icon className="mb-2 text-champagne" size={17} strokeWidth={2.1} aria-hidden />
      <p className="metric-label">{label}</p>
      <p className="mt-1 text-base font-semibold text-porcelain">{value}</p>
      {detail ? <p className="mt-1 text-xs font-semibold text-white/35">{detail}</p> : null}
    </div>
  );
}
