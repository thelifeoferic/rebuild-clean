"use client";

import { Bike, Dumbbell, Headphones, RefreshCw, Scale, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { tidalPlaylistUrl } from "@/data/mock-data";
import { LoginPanel } from "@/components/login-panel";
import { NutritionTracker } from "@/components/nutrition-tracker";
import { RebuildWordmark } from "@/components/rebuild-wordmark";
import { TodayPlan } from "@/components/today-plan";
import type { AppView, LogKind, OnboardingProfile, RebuildData } from "@/types/rebuild";
import { getTodaysBikeMinutes, getWeightChangeFromLast } from "@/lib/rebuild-data";
import { formatMinutes, formatWeight } from "@/lib/metrics";

const quotes = [
  {
    line: "You are in danger of living a life so comfortable and soft, that you will die without ever realizing your true potential.",
    source: "David Goggins",
    style: "goggins",
  },
  { line: "No one is going to come help you. No one's coming to save you.", source: "David Goggins", style: "goggins" },
  { line: "The most important conversations you'll ever have are the ones you'll have with yourself.", source: "David Goggins", style: "goggins" },
  { line: "We're either getting better or we're getting worse.", source: "David Goggins", style: "goggins" },
  { line: "I don't stop when I'm tired. I stop when I'm done.", source: "David Goggins", style: "goggins" },
  {
    line: "Pain unlocks a secret doorway in the mind, one that leads to both peak performance, and beautiful silence.",
    source: "David Goggins",
    style: "goggins",
  },
  { line: "Analyze your schedule, kill your empty habits, burn out the bullshit, and see what's left.", source: "David Goggins", style: "goggins" },
  { line: "Take care of your body. It's the only place you have to live.", source: "Jim Rohn", style: "calm" },
  { line: "Look in the mirror. That's your competition.", source: "John Assaraf", style: "athlete" },
  { line: "We are what we repeatedly do. Excellence then is not an act, but a habit.", source: "Aristotle", style: "calm" },
  {
    line: "No matter how many mistakes you make or how slow you progress, you are still way ahead of everyone who isn't trying.",
    source: "Tony Robbins",
    style: "calm",
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
  const activeQuotes = getQuotesForStyle(profile?.quoteStyle);
  const [quoteIndex, setQuoteIndex] = useState(() => randomQuoteIndex(quotes.length));
  const quote = activeQuotes[quoteIndex % activeQuotes.length];
  const recommendation = getHomeRecommendation(profile, data);
  const hasLogs =
    data.weights.length +
      data.bikeSessions.length +
      data.pushUpSessions.length +
      data.behaviorWins.length +
      data.meals.length >
    0;

  useEffect(() => {
    if (profile?.quoteStyle === "none") return;

    const timer = window.setInterval(() => {
      setQuoteIndex((current) => randomQuoteIndex(activeQuotes.length, current));
    }, 12000);

    return () => window.clearInterval(timer);
  }, [activeQuotes.length, profile?.quoteStyle]);

  useEffect(() => {
    setQuoteIndex(randomQuoteIndex(activeQuotes.length));
  }, [activeQuotes.length, profile?.quoteStyle]);

  return (
    <section className="px-4 pb-4 pt-5">
      <div className="relative min-h-[360px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-black shadow-panel">
        <Image
          src={homeHeroImage(profile)}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 448px"
          className="object-cover object-[52%_40%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.62),rgba(0,0,0,0.38)_34%,rgba(0,0,0,0.96))]" />
        <div className="relative flex min-h-[360px] flex-col justify-between p-5">
          <div>
            <RebuildWordmark className="mx-auto drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)]" />
          </div>

          <div className="-mx-1 rounded-[1.5rem] bg-black/52 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-[2px]">
            <p className="metric-label text-white/78">{firstName ? `Hi, ${firstName}` : "Today"}</p>
            <h2 className="mt-2 font-display text-5xl font-black uppercase leading-[0.88] tracking-normal text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.8)]">
              {hasLogs ? "Next rep." : "Blank slate."}
            </h2>
            <p className="mt-3 max-w-[18rem] text-sm font-semibold leading-5 text-white/82">
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

      <LoginPanel className="mt-4" compact />

      {profile?.quoteStyle !== "none" ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="metric-label">Operating thought</p>
            <button
              type="button"
              onClick={() => setQuoteIndex((current) => randomQuoteIndex(activeQuotes.length, current))}
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
      ) : null}

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045]">
        <div className="relative min-h-32 bg-black">
          <Image
            src={recommendation.image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 448px"
            className="object-cover object-center opacity-72"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="metric-label text-white/62">{recommendation.eyebrow}</p>
            <h3 className="mt-1 text-xl font-semibold text-white">{recommendation.title}</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="mb-3 flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-champagne/10 text-champagne">
              <Sparkles size={18} strokeWidth={2.2} aria-hidden />
            </div>
            <div>
              <p className="text-sm leading-5 text-white/55">{recommendation.detail}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-white/38">
                {profile?.preferredTrainingMinutes ?? 25} min · {profile?.defaultLocation ?? "gym"} · {profile?.coachingTone ?? "calm"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenLog(recommendation.logKind)}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-champagne px-3 text-sm font-bold text-carbon"
          >
            <Dumbbell size={17} strokeWidth={2.2} aria-hidden />
            Log this action
          </button>
        </div>
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

function getQuotesForStyle(style: OnboardingProfile["quoteStyle"]) {
  if (style === "none") return [quotes[0]];
  if (!style || style === "goggins") return quotes.filter((quote) => quote.style === "goggins");
  if (style === "athlete") return quotes.filter((quote) => quote.style === "athlete" || quote.style === "calm");
  return quotes.filter((quote) => quote.style === style);
}

function randomQuoteIndex(length: number, current?: number) {
  if (length <= 1) return 0;
  let next = Math.floor(Math.random() * length);
  if (typeof current === "number") {
    while (next === current % length) next = Math.floor(Math.random() * length);
  }
  return next;
}

function homeHeroImage(profile: OnboardingProfile | null) {
  if (profile?.defaultLocation === "pool") return "/rebuild-swim-lane.jpg";
  if (profile?.defaultLocation === "home") return "/rebuild-yoga-light.jpg";
  if (profile?.defaultLocation === "travel") return "/rebuild-kettlebell-outdoor.jpg";
  return "/rebuild-leg-press-top.jpg";
}

function getHomeRecommendation(profile: OnboardingProfile | null, data: RebuildData) {
  const goals = (profile?.goals ?? [profile?.goal ?? "Rebuild discipline"]).join(" ").toLowerCase();
  const minutes = profile?.preferredTrainingMinutes ?? 25;
  const location = profile?.defaultLocation ?? "gym";
  const tone = profile?.coachingTone ?? "calm";

  if (goals.includes("eat") || goals.includes("weight")) {
    return {
      detail: tone === "intense" ? "Protein first. Log the next meal before the day gets blurry." : "Anchor the day with protein and keep calories visible.",
      eyebrow: "Personalized next move",
      image: "/rebuild-nutrition.jpg",
      logKind: "meal" as LogKind,
      title: "Fuel checkpoint",
    };
  }

  if (goals.includes("stress") || goals.includes("sleep") || location === "home") {
    return {
      detail: `${minutes} minutes of low-friction movement: yoga, mobility, or a quiet circuit. Keep the promise without forcing the mood.`,
      eyebrow: "Personalized next move",
      image: "/rebuild-yoga-light.jpg",
      logKind: "yoga" as LogKind,
      title: "Downshift without disappearing",
    };
  }

  if (location === "pool") {
    return {
      detail: `${minutes} minutes in the pool. Smooth laps, controlled breathing, no heroic pacing required.`,
      eyebrow: "Personalized next move",
      image: "/rebuild-swim-lane.jpg",
      logKind: "swim" as LogKind,
      title: "Low-impact engine",
    };
  }

  if (data.bikeSessions.length || goals.includes("cardio")) {
    return {
      detail: `${minutes} minutes on the bike. Start easy, finish honest, and log the actual minutes.`,
      eyebrow: "Personalized next move",
      image: "/rebuild-air-bike.jpg",
      logKind: "bike" as LogKind,
      title: "Cardio base",
    };
  }

  return {
    detail: `${minutes} minutes of strength work matched to your equipment. Pick one lift, one pull, one carry.`,
    eyebrow: "Personalized next move",
    image: "/rebuild-kettlebell-pushup.jpg",
    logKind: "strength" as LogKind,
    title: "Strength proof",
  };
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
