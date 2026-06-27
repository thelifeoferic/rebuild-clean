"use client";

/* eslint-disable @next/next/no-img-element */

import {
  Bike,
  BookOpen,
  Building2,
  CheckCircle2,
  Dumbbell,
  Flame,
  Headphones,
  LineChart,
  MapPin,
  PlayCircle,
  Salad,
  Scale,
  ShieldCheck,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { tidalPlaylistUrl } from "@/data/mock-data";
import { CountUp } from "@/components/count-up";
import { NutritionTracker } from "@/components/nutrition-tracker";
import { TodayPlan } from "@/components/today-plan";
import { getGymPreset, localGymPresets, machineCategoryFor } from "@/data/gym-presets";
import type { AppView, LogKind, OnboardingProfile, RebuildData } from "@/types/rebuild";
import { getActivityCalorieBreakdown, getTodaysActivityCalories } from "@/lib/activity-calories";
import { getTodaysBikeMinutes, getTotalPushUps, getWeightChangeFromLast, isToday } from "@/lib/rebuild-data";
import { getCoachInsight, getPersonalRecords, getRebuildDay, getRebuildScore, getWeeklyConsistency } from "@/lib/rebuild-insights";
import { formatMinutes, formatWeight } from "@/lib/metrics";

const programsTabIntentKey = "rebuild:programs-tab:intent";

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
  onUpdateProfile,
  profile,
}: {
  data: RebuildData;
  onNavigate: (view: AppView) => void;
  onOpenLog: (kind: LogKind, draft?: Record<string, string>) => void;
  onUpdateProfile: (profile: OnboardingProfile) => void;
  profile: OnboardingProfile | null;
}) {
  const todayWeight = data.weights[0]?.weight ?? 0;
  const weightChange = getWeightChangeFromLast(data);
  const weightDetail = data.weights.length > 1 ? `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} lb` : "weigh-in";
  const todaysBikeMinutes = getTodaysBikeMinutes(data);
  const totalPushUps = getTotalPushUps(data);
  const firstName = profile?.firstName?.trim();
  const avatarSrc = profile?.avatarDataUrl || profile?.avatarUrl;
  const activeQuotes = getQuotesForStyle(profile?.quoteStyle);
  const [quoteIndex, setQuoteIndex] = useState(() => randomQuoteIndex(quotes.length));
  const [showBurnBreakdown, setShowBurnBreakdown] = useState(false);
  const quote = activeQuotes[quoteIndex % activeQuotes.length];
  const recommendation = getHomeRecommendation(profile, data);
  const rebuildScore = getRebuildScore(data, profile);
  const coachInsight = getCoachInsight(data, profile);
  const rebuildDay = getRebuildDay(data);
  const latestEntry = getLatestHomeEntry(data);
  const activityBurn = getTodaysActivityCalories(data, profile);
  const activityBreakdown = getActivityCalorieBreakdown(data, profile);
  const weeklyConsistency = getWeeklyConsistency(data, profile);
  const records = getPersonalRecords(data);
  const topRecord = records.find((record) => record.value !== "—") ?? records[0];

  useEffect(() => {
    setQuoteIndex(randomQuoteIndex(activeQuotes.length));
  }, [activeQuotes.length, profile?.quoteStyle]);

  return (
    <section className="px-4 pb-4 pt-5">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black shadow-panel">
        <Image
          src={homeHeroImage(profile)}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 448px"
          className="object-cover object-[52%_40%] opacity-72"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.76),rgba(0,0,0,0.48)_36%,rgba(0,0,0,0.94))]" />
        <div className="relative p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="metric-label text-white/70">{greeting()}, {firstName || "Member"}.</p>
              <h1 className="mt-2 max-w-[18rem] font-display text-5xl font-black uppercase leading-[0.88] tracking-normal text-white">
                Day {rebuildDay} of your rebuild.
              </h1>
            </div>
            {avatarSrc ? (
              <button
                type="button"
                onClick={() => onNavigate("me")}
                className="size-14 shrink-0 overflow-hidden rounded-full border border-white/20 bg-black/45 shadow-panel"
                aria-label="Open profile"
              >
                <img src={avatarSrc} alt={`${firstName || "Member"} profile`} className="h-full w-full object-cover" />
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onNavigate("records")}
              className="contrast-panel rounded-[1.35rem] border border-champagne/25 bg-black/70 p-4 text-left backdrop-blur"
            >
              <p className="metric-label text-white/55">REBUILD Score</p>
              <p className="mt-2 font-display text-5xl font-black uppercase leading-none text-champagne">
                {rebuildScore.value === null ? "—" : <CountUp value={rebuildScore.value} />}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-white/45">{rebuildScore.deltaLabel}</p>
            </button>
            <button
              type="button"
              onClick={() => onOpenLog("weight")}
              className="contrast-panel rounded-[1.35rem] border border-white/10 bg-black/70 p-4 text-left backdrop-blur"
            >
              <p className="metric-label text-white/55">Current Weight</p>
              <p className="mt-2 font-display text-4xl font-black uppercase leading-none text-white">
                {data.weights.length ? formatWeight(todayWeight) : "—"}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-white/45">{weightDetail}</p>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("records")}
            className="contrast-panel mt-3 w-full rounded-[1.35rem] border border-white/10 bg-black/75 p-4 text-left backdrop-blur"
          >
            <p className="metric-label text-white/55">Coach insight</p>
            <p className="mt-2 text-sm font-semibold leading-5 text-porcelain">{coachInsight}</p>
          </button>

          <div className="contrast-panel mt-3 rounded-[1.35rem] border border-white/10 bg-black/75 p-4 backdrop-blur">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="metric-label text-white/55">Today&apos;s plan</p>
              <span className="text-xs font-bold text-champagne">{todayCompletion(data)}/3</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <PlanButton label="Weigh-in" done={data.weights.some((entry) => isToday(entry.date))} onClick={() => onOpenLog("weight")} />
              <PlanButton label="Move" done={hasMovementToday(data)} onClick={() => onNavigate("log")} />
              <PlanButton label="Reset" done={data.behaviorWins.some((entry) => isToday(entry.date))} onClick={() => onOpenLog("mood")} />
            </div>
          </div>
        </div>
      </div>

      {profile?.quoteStyle !== "none" ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
          <p className="metric-label mb-2">Operating thought</p>
          <p className="text-lg font-semibold leading-snug text-porcelain">
            <span aria-hidden>&ldquo;</span>
            {quote.line}
            <span aria-hidden>&rdquo;</span>
          </p>
          <p className="mt-2 text-sm font-semibold text-champagne">{quote.source}</p>
        </div>
      ) : null}

      <a
        href={tidalPlaylistUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ember px-3 text-base font-black text-white shadow-glow"
      >
        <Headphones size={18} strokeWidth={2.2} aria-hidden />
        Start TIDAL playlist
      </a>

      <HomeGymPanel onOpenLog={onOpenLog} onUpdateProfile={onUpdateProfile} profile={profile} />

      <div className="mt-4 grid gap-3">
        <ImageTile
          src="/rebuild-air-bike.jpg"
          label="Cardio"
          detail="Bike, swim, walks, and conditioning"
          onClick={() => openProgramsTab("Programs", onNavigate)}
        />
        <ImageTile
          src="/rebuild-kettlebell-outdoor.jpg"
          label="Strength"
          detail="Programs, kettlebells, and lifting blocks"
          onClick={() => openProgramsTab("Programs", onNavigate)}
        />
        <ImageTile
          src="/rebuild-yoga-light.jpg"
          label="Recovery"
          detail="Mobility, yoga, and reset work"
          onClick={() => openProgramsTab("Guides", onNavigate)}
        />
      </div>

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
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-champagne px-3 text-sm font-bold text-carbon shadow-glow"
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

      <div className="mt-4 grid grid-cols-2 gap-3">
        <HomeSignalCard
          icon={CheckCircle2}
          label="Latest entry"
          title={latestEntry.title}
          detail={latestEntry.detail}
          onClick={() => onNavigate("log")}
        />
        <HomeSignalCard
          icon={Flame}
          label="Activity burn"
          title={`${activityBurn} cal`}
          detail="Estimated from today's saved workouts using your height and weight."
          onClick={() => setShowBurnBreakdown(true)}
        />
        <HomeSignalCard
          icon={LineChart}
          label="Consistency"
          title={`${weeklyConsistency.sessions}/${weeklyConsistency.goal} sessions`}
          detail={weeklyConsistency.summary}
          onClick={() => onNavigate("records")}
        />
        <HomeSignalCard
          icon={Trophy}
          label="Record"
          title={topRecord ? topRecord.label : "First record"}
          detail={topRecord ? `${topRecord.value}${topRecord.unit ? ` ${topRecord.unit}` : ""} · ${topRecord.detail}` : "Your first workout sets it."}
          onClick={() => onNavigate("records")}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <MiniStat label="Weight" value={data.weights.length ? formatWeight(todayWeight) : "--"} detail={weightDetail} icon={Scale} />
        <MiniStat label="Bike" value={formatMinutes(todaysBikeMinutes)} icon={Bike} />
        <MiniStat label="Push-ups" value={`${totalPushUps}`} detail="all time" icon={Trophy} />
        <MiniStat label="Choices" value={`${data.behaviorWins.length}`} icon={ShieldCheck} />
      </div>

      <TodayPlan data={data} onOpenLog={onOpenLog} />
      <NutritionTracker data={data} onOpenLog={onOpenLog} profile={profile} />

      <HomeSectionShortcuts onOpenProgramsTab={(tab) => openProgramsTab(tab, onNavigate)} />

      {showBurnBreakdown ? (
        <ActivityBurnSheet
          activityBurn={activityBurn}
          breakdown={activityBreakdown}
          onClose={() => setShowBurnBreakdown(false)}
          onOpenLog={() => {
            setShowBurnBreakdown(false);
            onNavigate("log");
          }}
        />
      ) : null}
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

function getLatestHomeEntry(data: RebuildData) {
  const latestRide = data.bikeSessions[0];
  if (latestRide) {
    const distance = latestRide.distanceMiles ? ` · ${latestRide.distanceMiles.toFixed(1)} mi` : "";
    return {
      detail: `${latestRide.minutes} minutes${distance} · ${latestRide.calories} calories saved.`,
      title: "Bike ride saved",
    };
  }

  const latestWeight = data.weights[0];
  if (latestWeight) {
    return {
      detail: `${latestWeight.weight.toFixed(1)} lb saved as your latest weigh-in.`,
      title: "Weigh-in saved",
    };
  }

  const latestChoice = data.behaviorWins[0];
  if (latestChoice) {
    return {
      detail: latestChoice.label.replace(/^Pattern interrupted\s*→\s*/i, ""),
      title: "Better choice logged",
    };
  }

  return {
    detail: "Log your first session, weigh-in, meal, or reset choice.",
    title: "Your first entry goes here",
  };
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

function HomeGymPanel({
  onOpenLog,
  onUpdateProfile,
  profile,
}: {
  onOpenLog: (kind: LogKind, draft?: Record<string, string>) => void;
  onUpdateProfile: (profile: OnboardingProfile) => void;
  profile: OnboardingProfile | null;
}) {
  if (!profile) return null;

  const currentProfile = profile;
  const selectedPreset = getGymPreset(profile.homeGymId);
  const selectedValue = selectedPreset ? selectedPreset.id : profile.homeGymName ? "custom" : "none";
  const equipment = profile.homeGymEquipment?.length
    ? profile.homeGymEquipment
    : selectedPreset?.machines.map((machine) => machine.name) ?? [];
  const gymName = profile.homeGymName || selectedPreset?.name || "Home gym";
  const firstMachine = equipment[0] || "Leg extension";

  function chooseGym(value: string) {
    const preset = getGymPreset(value);

    if (!preset) {
      if (value === "none") {
        onUpdateProfile({
          ...currentProfile,
          homeGymAddress: undefined,
          homeGymEquipment: [],
          homeGymId: undefined,
          homeGymName: undefined,
        });
      }
      return;
    }

    const homeGymEquipment = preset.machines.map((machine) => machine.name);
    onUpdateProfile({
      ...currentProfile,
      defaultLocation: "gym",
      equipment: mergeUnique([...(currentProfile.equipment ?? []), ...homeGymEquipment]),
      homeGymAddress: preset.address,
      homeGymEquipment,
      homeGymId: preset.id,
      homeGymName: preset.name,
    });
  }

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] shadow-panel">
      <div className="relative min-h-36 bg-black">
        <Image
          src="/rebuild-leg-press-side.jpg"
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 448px"
          className="object-cover object-center opacity-72"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/42 to-black/10" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="mb-3 grid size-10 place-items-center rounded-full bg-champagne text-carbon">
            <Building2 size={18} strokeWidth={2.3} aria-hidden />
          </div>
          <p className="metric-label text-white/68">Home gym</p>
          <h2 className="mt-1 text-2xl font-black uppercase leading-none text-white">{selectedValue === "none" ? "Choose your floor" : gymName}</h2>
          {profile.homeGymAddress ? (
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-white/72">
              <MapPin size={15} strokeWidth={2.2} aria-hidden />
              {profile.homeGymAddress}
            </p>
          ) : null}
        </div>
      </div>

      <div className="p-4">
        <label className="block">
          <span className="metric-label mb-2 block">Select gym</span>
          <select
            value={selectedValue}
            onChange={(event) => chooseGym(event.target.value)}
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-carbon px-4 text-base font-semibold text-porcelain outline-none focus:border-champagne"
          >
            <option value="none">No home gym selected</option>
            {localGymPresets.map((gym) => (
              <option key={gym.id} value={gym.id}>
                {gym.name} - {gym.city}
              </option>
            ))}
            {selectedValue === "custom" ? <option value="custom">Custom gym</option> : null}
          </select>
        </label>

        {equipment.length ? (
          <div className="mt-3">
            <p className="metric-label mb-2">Available here</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {equipment.slice(0, 12).map((item) => (
                <span key={item} className="shrink-0 rounded-full bg-carbon px-3 py-2 text-xs font-bold text-white/62">
                  {item}
                </span>
              ))}
              {equipment.length > 12 ? (
                <span className="shrink-0 rounded-full bg-carbon px-3 py-2 text-xs font-bold text-white/62">
                  +{equipment.length - 12} more
                </span>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm leading-5 text-white/50">Pick Total Fitness or another local preset to load that gym&apos;s machine list.</p>
        )}

        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <button
            type="button"
            onClick={() =>
              onOpenLog("machine", {
                category: machineCategoryFor(firstMachine),
                gymName,
                machine: firstMachine,
              })
            }
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-champagne px-4 text-sm font-black text-carbon shadow-glow"
          >
            <Dumbbell size={17} strokeWidth={2.2} aria-hidden />
            Use gym
          </button>
          <button
            type="button"
            onClick={() => onOpenLog("bike")}
            className="grid min-h-12 min-w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.055] text-champagne"
            aria-label="Log cardio"
          >
            <Bike size={18} strokeWidth={2.2} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

function HomeSectionShortcuts({
  onOpenProgramsTab,
}: {
  onOpenProgramsTab: (tab: "Programs" | "Guides" | "Nutrition" | "Media") => void;
}) {
  const shortcuts = [
    {
      detail: "Plans matched to your goals and equipment.",
      icon: Dumbbell,
      image: "/rebuild-kettlebell-outdoor.jpg",
      tab: "Programs" as const,
      title: "Programs",
    },
    {
      detail: "Form cues before you add load.",
      icon: BookOpen,
      image: "/rebuild-kettlebell-pushup.jpg",
      tab: "Guides" as const,
      title: "Guides",
    },
    {
      detail: "Protein anchors, quick foods, and calorie context.",
      icon: Salad,
      image: "/rebuild-nutrition.jpg",
      tab: "Nutrition" as const,
      title: "Nutrition guide",
    },
    {
      detail: "Featured workouts, videos, and the TIDAL link.",
      icon: PlayCircle,
      image: "/rebuild-air-bike.jpg",
      tab: "Media" as const,
      title: "Media",
    },
  ];

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="metric-label">Explore</p>
          <h2 className="mt-1 text-xl font-semibold text-porcelain">Where to go next</h2>
        </div>
      </div>
      <div className="grid gap-3">
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon;

          return (
            <button
              key={shortcut.title}
              type="button"
              onClick={() => onOpenProgramsTab(shortcut.tab)}
              className="group relative min-h-48 overflow-hidden rounded-2xl border border-white/10 bg-black text-left shadow-panel active:scale-[0.98]"
            >
              <Image src={shortcut.image} alt="" fill sizes="(max-width: 768px) 100vw, 448px" className="object-cover opacity-78 transition group-active:scale-[1.02]" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/28 to-transparent" />
              <span className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <span>
                  <span className="mb-3 grid size-10 place-items-center rounded-full bg-champagne text-carbon">
                    <Icon size={18} strokeWidth={2.3} aria-hidden />
                  </span>
                  <span className="block text-lg font-black uppercase tracking-[0.08em] text-white">{shortcut.title}</span>
                  <span className="mt-1 block text-sm leading-5 text-white/72">{shortcut.detail}</span>
                </span>
                <span className="shrink-0 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">
                  Open
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ActivityBurnSheet({
  activityBurn,
  breakdown,
  onClose,
  onOpenLog,
}: {
  activityBurn: number;
  breakdown: ReturnType<typeof getActivityCalorieBreakdown>;
  onClose: () => void;
  onOpenLog: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end bg-black/70 px-3 pb-3 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full rounded-[1.75rem] border border-white/10 bg-carbon p-4 shadow-panel">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="metric-label">Activity burn</p>
            <h2 className="mt-1 font-display text-4xl font-black uppercase leading-none text-champagne">{activityBurn} cal</h2>
            <p className="mt-2 text-sm leading-5 text-white/50">
              Estimated from today&apos;s saved training and your profile. Use it as a guide, not a lab number.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-white/70"
            aria-label="Close activity burn breakdown"
          >
            <X size={18} strokeWidth={2.3} aria-hidden />
          </button>
        </div>

        {breakdown.length ? (
          <div className="space-y-2">
            {breakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.055] p-3">
                <div>
                  <p className="font-semibold text-porcelain">{item.label}</p>
                  <p className="text-xs font-semibold text-white/42">{item.detail}</p>
                </div>
                <p className="text-lg font-black text-champagne">{item.calories}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white/[0.055] p-4">
            <p className="font-semibold text-porcelain">No activity burn yet.</p>
            <p className="mt-1 text-sm leading-5 text-white/48">Log a workout and REBUILD will estimate the calorie impact here.</p>
          </div>
        )}

        <button
          type="button"
          onClick={onOpenLog}
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-champagne px-4 text-sm font-black text-carbon"
        >
          Log activity
        </button>
      </div>
    </div>
  );
}

function openProgramsTab(tab: "Programs" | "Guides" | "Nutrition" | "Media", onNavigate: (view: AppView) => void) {
  window.sessionStorage.setItem(programsTabIntentKey, tab);
  onNavigate("programs");
}

function PlanButton({
  done,
  label,
  onClick,
}: {
  done: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-16 rounded-2xl border px-2 text-center text-xs font-black uppercase tracking-[0.08em] active:scale-[0.97] ${
        done ? "border-signal/30 bg-signal/15 text-signal" : "border-white/10 bg-white/10 text-white/68"
      }`}
    >
      {done ? "Done" : label}
    </button>
  );
}

function ImageTile({
  detail,
  label,
  onClick,
  src,
}: {
  detail: string;
  label: string;
  onClick: () => void;
  src: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative min-h-44 w-full overflow-hidden rounded-2xl border border-white/10 bg-black text-left shadow-panel active:scale-[0.98]"
    >
      <Image src={src} alt="" fill sizes="(max-width: 768px) 100vw, 448px" className="object-cover opacity-78" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
      <span className="absolute bottom-4 left-4 right-4">
        <span className="block text-[0.68rem] font-black uppercase tracking-[0.18em] text-white/68">{label}</span>
        <span className="mt-1 block text-lg font-black leading-tight text-white">{detail}</span>
      </span>
    </button>
  );
}

function HomeSignalCard({
  detail,
  icon: Icon,
  label,
  onClick,
  title,
}: {
  detail: string;
  icon: typeof Scale;
  label: string;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-40 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-left shadow-panel transition active:scale-[0.97]"
    >
      <Icon className="mb-3 text-champagne" size={18} strokeWidth={2.1} aria-hidden />
      <p className="metric-label">{label}</p>
      <h3 className="mt-2 text-base font-semibold leading-tight text-porcelain">{title}</h3>
      <p className="mt-2 line-clamp-3 text-xs leading-4 text-white/45">{detail}</p>
    </button>
  );
}

function mergeUnique(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function todayCompletion(data: RebuildData) {
  return [
    data.weights.some((entry) => isToday(entry.date)),
    hasMovementToday(data),
    data.behaviorWins.some((entry) => isToday(entry.date)),
  ].filter(Boolean).length;
}

function hasMovementToday(data: RebuildData) {
  return (
    data.bikeSessions.some((entry) => isToday(entry.date)) ||
    data.jacobsLadderSessions.some((entry) => isToday(entry.date)) ||
    data.pushUpSessions.some((entry) => isToday(entry.date)) ||
    data.dumbbellCurlSessions.some((entry) => isToday(entry.date)) ||
    data.strengthAccessorySessions.some((entry) => isToday(entry.date)) ||
    data.machineWorkoutSessions.some((entry) => isToday(entry.date)) ||
    data.kettlebellSessions.some((entry) => isToday(entry.date)) ||
    data.farmerCarrySessions.some((entry) => isToday(entry.date)) ||
    data.swimSessions.some((entry) => isToday(entry.date)) ||
    data.yogaSessions.some((entry) => isToday(entry.date))
  );
}
