"use client";

/* eslint-disable @next/next/no-img-element */

import {
  Bike,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Flame,
  Headphones,
  LineChart,
  MapPin,
  PlayCircle,
  Salad,
  Scale,
  ScanSearch,
  ShieldCheck,
  Trophy,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { tidalPlaylistUrl } from "@/data/mock-data";
import { CountUp } from "@/components/count-up";
import { NutritionTracker } from "@/components/nutrition-tracker";
import { classesForDay, currentStudioDay } from "@/data/class-schedule";
import { equipmentLogKindFor, getGymPreset, localGymPresets, machineCategoryFor } from "@/data/gym-presets";
import type { AppView, LogKind, OnboardingProfile, RebuildData } from "@/types/rebuild";
import { getActivityCalorieBreakdown, getTodaysActivityCalories } from "@/lib/activity-calories";
import { bikeDistanceForSession } from "@/lib/bike-distance";
import { listProgressPhotos, type ProgressPhoto } from "@/lib/progress-photos";
import { getTodaysBikeMinutes, getTotalPushUps, getWeightChangeFromLast, isToday } from "@/lib/rebuild-data";
import { getCoachInsight, getPersonalRecords, getRebuildDay, getRebuildScore, getWorkoutStreak } from "@/lib/rebuild-insights";
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
  { line: "Nobody cares what you did yesterday. What have you done today to better yourself?", source: "David Goggins", style: "goggins" },
  { line: "The only way to gain mental toughness is to do things you're not happy doing.", source: "David Goggins", style: "goggins" },
  {
    line: "When you're driven, whatever is in front of you, whether it's racism, sexism, injuries, divorce, depression, obesity, tragedy, or poverty, becomes fuel for your metamorphosis.",
    source: "David Goggins",
    style: "goggins",
  },
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
  onOpenBodyScan,
  onOpenLog,
  onUpdateProfile,
  profile,
}: {
  data: RebuildData;
  onNavigate: (view: AppView) => void;
  onOpenBodyScan: () => void;
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
  const [bodyScanPhoto, setBodyScanPhoto] = useState<ProgressPhoto | null>(null);
  const quote = activeQuotes[quoteIndex % activeQuotes.length];
  const recommendation = getHomeRecommendation(profile, bodyScanPhoto);
  const rebuildScore = getRebuildScore(data, profile);
  const coachInsight = getCoachInsight(data, profile);
  const rebuildDay = getRebuildDay(data);
  const latestEntry = getLatestHomeEntry(data);
  const activityBurn = getTodaysActivityCalories(data, profile);
  const activityBreakdown = getActivityCalorieBreakdown(data, profile);
  const workoutStreak = getWorkoutStreak(data);
  const records = getPersonalRecords(data);
  const topRecord = records.find((record) => record.value !== "—") ?? records[0];

  useEffect(() => {
    setQuoteIndex(randomQuoteIndex(activeQuotes.length));
  }, [activeQuotes.length, profile?.quoteStyle]);

  useEffect(() => {
    let mounted = true;

    listProgressPhotos()
      .then((photos) => {
        if (!mounted) return;
        setBodyScanPhoto(photos.find((photo) => photo.analysis) ?? photos[0] ?? null);
      })
      .catch(() => {
        if (mounted) setBodyScanPhoto(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

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
              <PlanButton
                label="Meditate"
                done={hasMeditatedToday(data)}
                onClick={() => onOpenLog("mood", { label: "Meditation", reason: "stress" })}
              />
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
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-champagne px-3 text-base font-black text-carbon shadow-glow"
      >
        <Headphones size={18} strokeWidth={2.2} aria-hidden />
        Start TIDAL playlist
      </a>

      <HomeGymPanel
        onOpenClasses={() => openProgramsTab("Classes", onNavigate)}
        onOpenLog={onOpenLog}
        onUpdateProfile={onUpdateProfile}
        profile={profile}
      />

      <div className="mt-4 overflow-hidden rounded-[1.75rem] border border-white/10 bg-black shadow-panel">
        <div className="relative min-h-[17rem] bg-black">
          <RecommendationImage
            src={recommendation.image}
            alt=""
            className="object-cover object-[52%_34%] opacity-95"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.2)_0%,rgba(0,0,0,0.08)_36%,rgba(0,0,0,0.92)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(var(--color-accent),0.24),transparent_34%)]" />
          <div className="absolute bottom-5 left-5 right-5">
            <p className="metric-label text-white/72">{recommendation.eyebrow}</p>
            <h3 className="mt-2 max-w-[16rem] font-display text-4xl font-black uppercase leading-[0.9] text-white drop-shadow-[0_3px_18px_rgba(0,0,0,0.9)]">
              {recommendation.title}
            </h3>
          </div>
        </div>
        <div className="border-t border-white/10 bg-carbon/92 p-4">
          <div className="mb-3 flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-champagne/10 text-champagne">
              {recommendation.logKind ? <Dumbbell size={18} strokeWidth={2.2} aria-hidden /> : <ScanSearch size={18} strokeWidth={2.2} aria-hidden />}
            </div>
            <div>
              <p className="text-sm font-semibold leading-5 text-white/72">{recommendation.detail}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-white/44">
                {recommendation.meta}
              </p>
            </div>
          </div>
          {recommendation.workoutBlocks?.length ? (
            <div className="mb-3 grid gap-2">
              {recommendation.workoutBlocks.map((block, index) => (
                <div key={block} className="flex gap-3 rounded-2xl bg-white/[0.055] p-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-champagne/12 text-xs font-black text-champagne">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold leading-5 text-white/68">{block}</p>
                </div>
              ))}
            </div>
          ) : null}
          <div className="grid gap-2">
            <button
              type="button"
              onClick={() => {
                if (recommendation.programTab) {
                  openProgramsTab(recommendation.programTab, onNavigate);
                  return;
                }
                onOpenBodyScan();
              }}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-champagne px-3 text-sm font-bold text-[rgb(var(--color-accent-foreground))] shadow-glow"
            >
              {recommendation.programTab ? <Dumbbell size={17} strokeWidth={2.2} aria-hidden /> : <ScanSearch size={17} strokeWidth={2.2} aria-hidden />}
              {recommendation.ctaLabel}
            </button>
            {recommendation.logKind ? (
              <button
                type="button"
                onClick={() => onOpenLog(recommendation.logKind)}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-3 text-sm font-bold text-porcelain"
              >
                <CheckCircle2 size={17} strokeWidth={2.2} aria-hidden />
                Log after workout
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="mb-3">
          <p className="metric-label">Proof stack</p>
          <h2 className="mt-1 text-xl font-semibold text-porcelain">What you&apos;ve done today</h2>
        </div>
        <HomeSignalRow
          icon={CheckCircle2}
          label="Latest entry"
          title={latestEntry.title}
          detail={latestEntry.detail}
          onClick={() => onNavigate("log")}
        />
        <HomeSignalRow
          icon={Flame}
          label="Activity burn"
          title={`${activityBurn} cal`}
          detail="Estimated from today's saved workouts using your profile and current weight."
          onClick={() => setShowBurnBreakdown(true)}
        />
        <HomeSignalRow
          icon={LineChart}
          label="Workout streak"
          title={workoutStreak ? `${workoutStreak} day${workoutStreak === 1 ? "" : "s"}` : "Start today"}
          detail={
            workoutStreak
              ? "Consecutive days with at least one saved workout."
              : "Log one workout today to start a training streak."
          }
          onClick={() => onNavigate("records")}
        />
        <HomeSignalRow
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

      <NutritionTracker data={data} onOpenLog={onOpenLog} profile={profile} />

      <HomeSectionShortcuts onOpenBodyScan={onOpenBodyScan} onOpenProgramsTab={(tab) => openProgramsTab(tab, onNavigate)} />

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
    const rideDistance = bikeDistanceForSession(latestRide);
    const distance = rideDistance ? ` · ${rideDistance.toFixed(1)} mi${latestRide.distanceEstimated || !latestRide.distanceMiles ? " est." : ""}` : "";
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
    detail: "Log your first session, weigh-in, meal, or pattern choice.",
    title: "Your first entry goes here",
  };
}

function homeHeroImage(profile: OnboardingProfile | null) {
  if (profile?.defaultLocation === "pool") return "/rebuild-swim-lane.jpg";
  if (profile?.defaultLocation === "home") return "/rebuild-yoga-light.jpg";
  if (profile?.defaultLocation === "travel") return "/rebuild-kettlebell-outdoor.jpg";
  return "/rebuild-leg-press-top.jpg";
}

function getHomeRecommendation(profile: OnboardingProfile | null, bodyScanPhoto: ProgressPhoto | null) {
  const analysis = bodyScanPhoto?.analysis;
  const minutes = profile?.preferredTrainingMinutes ?? 25;
  const location = profile?.defaultLocation ?? "gym";

  if (!analysis) {
    return {
      ctaLabel: "Take body scan",
      detail: "Upload a progress photo and REBUILD will turn it into a practical, non-medical training focus for your next block.",
      eyebrow: "AI body scan",
      image: "/rebuild-body-scan-selfie.jpg",
      meta: "Private by default · saved to your progress library",
      title: "Build from a photo",
    };
  }

  const signal =
    analysis.nextActions?.[0] ??
    analysis.trainingPriorities?.[0] ??
    analysis.observations?.[0] ??
    analysis.summary;
  const logKind = logKindFromScanSignal(signal, location);
  const workout = workoutFromScanSignal(logKind, minutes, signal);

  return {
    ctaLabel: "Open workout plan",
    detail: signal,
    eyebrow: "AI body scan workout",
    image: bodyScanPhoto?.imageData ?? "/rebuild-body-scan-selfie.jpg",
    logKind,
    meta: `${minutes} min · ${location} · based on latest scan`,
    programTab: "Programs" as const,
    title: workout.title,
    workoutBlocks: workout.blocks,
  };
}

function logKindFromScanSignal(signal: string, location: OnboardingProfile["defaultLocation"]): LogKind {
  const normalized = signal.toLowerCase();

  if (location === "pool" || normalized.includes("swim") || normalized.includes("pool")) return "swim";
  if (normalized.includes("bike") || normalized.includes("cardio") || normalized.includes("conditioning")) return "bike";
  if (normalized.includes("yoga") || normalized.includes("mobility") || normalized.includes("stretch") || normalized.includes("recovery")) return "yoga";
  if (normalized.includes("kettlebell") || normalized.includes("hinge") || normalized.includes("swing")) return "kettlebell";
  if (normalized.includes("push")) return "pushUps";
  return "strength";
}

function workoutFromScanSignal(logKind: LogKind, minutes: number, signal: string) {
  const controlled = Math.max(12, minutes);
  const normalized = signal.toLowerCase();

  if (logKind === "bike") {
    return {
      blocks: [
        "5 min easy spin to find your breathing rhythm.",
        `${Math.max(8, controlled - 10)} min steady ride, resistance controlled enough to keep posture clean.`,
        "5 min cooldown, then save minutes, resistance, distance, and calories.",
      ],
      title: "Conditioning plan",
    };
  }

  if (logKind === "swim") {
    return {
      blocks: [
        "4 easy lengths focused on long exhale and relaxed shoulders.",
        `${Math.max(10, controlled - 8)} min alternating smooth laps with short rests.`,
        "Finish with 2 calm lengths and save distance plus stroke notes.",
      ],
      title: "Low-impact plan",
    };
  }

  if (logKind === "yoga") {
    return {
      blocks: [
        "3 min breath-led warm-up: neck, shoulders, spine.",
        `${Math.max(10, controlled - 6)} min hips, hamstrings, thoracic rotation, and slow transitions.`,
        "Close with 2 min stillness, then log focus and minutes.",
      ],
      title: normalized.includes("mobility") ? "Mobility plan" : "Recovery plan",
    };
  }

  if (logKind === "kettlebell") {
    return {
      blocks: [
        "5 min hinge practice: bodyweight good mornings and light deadlifts.",
        "3 rounds: swings, goblet squat, carry. Stop each set while form still looks sharp.",
        "Log bell weight, reps, and the cue that kept the movement clean.",
      ],
      title: "Kettlebell strength plan",
    };
  }

  if (logKind === "pushUps") {
    return {
      blocks: [
        "2 easy ramp sets, leaving several reps in reserve.",
        "4 quality sets: chest line steady, elbows controlled, no rushed reps.",
        "Save each set separately so the max set and total push-ups stay accurate.",
      ],
      title: "Push strength plan",
    };
  }

  return {
    blocks: [
      "5 min warm-up: bike, rower, or dynamic mobility.",
      "3 controlled rounds: push, pull, hinge or squat. Keep the last rep clean.",
      "Save the machine or weight used so the next session has a real baseline.",
    ],
    title: "Strength plan",
  };
}

function RecommendationImage({ alt, className, src }: { alt: string; className: string; src: string }) {
  if (src.startsWith("data:")) {
    return <img src={src} alt={alt} className={`absolute inset-0 h-full w-full ${className}`} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 448px"
      className={className}
    />
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

function HomeGymPanel({
  onOpenClasses,
  onOpenLog,
  onUpdateProfile,
  profile,
}: {
  onOpenClasses: () => void;
  onOpenLog: (kind: LogKind, draft?: Record<string, string>) => void;
  onUpdateProfile: (profile: OnboardingProfile) => void;
  profile: OnboardingProfile | null;
}) {
  const [selectedMachine, setSelectedMachine] = useState("");
  const currentProfile = profile;
  const selectedPreset = currentProfile ? getGymPreset(currentProfile.homeGymId) : undefined;
  const selectedValue = selectedPreset ? selectedPreset.id : currentProfile?.homeGymName ? "custom" : "none";
  const equipment = useMemo(
    () => currentProfile?.homeGymEquipment?.length
      ? currentProfile.homeGymEquipment
      : selectedPreset?.machines.map((machine) => machine.name) ?? [],
    [currentProfile?.homeGymEquipment, selectedPreset],
  );
  const gymName = currentProfile?.homeGymName || selectedPreset?.name || "Home gym";
  const selectedMachineForLog = selectedMachine || equipment[0] || "Leg extension";
  const studioDay = currentStudioDay();
  const todaysStudioClasses = selectedPreset?.id === "total-fitness-29-palms" ? classesForDay(studioDay) : [];
  const nextStudioClasses = todaysStudioClasses.slice(0, 2);

  useEffect(() => {
    if (!equipment.length) return;
    if (!equipment.includes(selectedMachine)) setSelectedMachine(equipment[0]);
  }, [equipment, selectedMachine]);

  if (!currentProfile) return null;
  const safeProfile = currentProfile;

  function chooseGym(value: string) {
    const preset = getGymPreset(value);

    if (!preset) {
      if (value === "none") {
        onUpdateProfile({
          ...safeProfile,
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
      ...safeProfile,
      defaultLocation: "gym",
      equipment: mergeUnique([...(safeProfile.equipment ?? []), ...homeGymEquipment]),
      homeGymAddress: preset.address,
      homeGymEquipment,
      homeGymId: preset.id,
      homeGymName: preset.name,
    });
  }

  function openEquipmentLog(item: string) {
    const logKind = equipmentLogKindFor(item);

    if (logKind === "bike") {
      onOpenLog("bike", { notes: `${gymName} - ${item}` });
      return;
    }

    if (logKind === "jacobsLadder") {
      onOpenLog("jacobsLadder", {});
      return;
    }

    if (logKind === "kettlebell") {
      onOpenLog("kettlebell", { exercise: "Swings" });
      return;
    }

    if (logKind === "dumbbellCurls") {
      onOpenLog("dumbbellCurls", { exercise: "Dumbbell curls" });
      return;
    }

    if (logKind === "farmerCarries") {
      onOpenLog("farmerCarries", {});
      return;
    }

    if (logKind === "yoga") {
      onOpenLog("yoga", { focus: item.includes("Foam") ? "Recovery" : "Mobility" });
      return;
    }

    if (logKind === "strength") {
      onOpenLog("strength", { exercise: strengthExerciseFor(item), notes: `${gymName} - ${item}` });
      return;
    }

    onOpenLog("machine", {
      category: machineCategoryFor(item),
      gymName,
      machine: item,
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
          {safeProfile.homeGymAddress ? (
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-white/72">
              <MapPin size={15} strokeWidth={2.2} aria-hidden />
              {safeProfile.homeGymAddress}
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

        {selectedPreset?.id === "total-fitness-29-palms" ? (
          <div className="mt-4 rounded-[1.35rem] border border-champagne/22 bg-gradient-to-br from-champagne/14 via-white/[0.07] to-white/[0.04] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="metric-label text-white/72">Today at Total Fitness</p>
                <h3 className="mt-1 text-xl font-black uppercase leading-none text-porcelain">
                  {todaysStudioClasses.length ? `${todaysStudioClasses.length} studio classes` : "Open floor"}
                </h3>
                <p className="mt-2 text-sm font-semibold leading-5 text-white/78">
                  The schedule is tied to this gym. Tap a class to log it, or open the full week.
                </p>
              </div>
              <div className="grid size-11 shrink-0 place-items-center rounded-full bg-champagne text-[rgb(var(--color-accent-foreground))]">
                <CalendarDays size={18} strokeWidth={2.3} aria-hidden />
              </div>
            </div>

            {nextStudioClasses.length ? (
              <div className="mt-3 grid gap-2">
                {nextStudioClasses.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onOpenLog(item.logKind, item.logDraft)}
                    className="flex min-h-12 items-center justify-between gap-3 rounded-2xl bg-carbon px-3 py-2 text-left transition active:scale-[0.98]"
                    aria-label={`Log ${item.title}`}
                  >
                    <span>
                      <span className="block text-sm font-black text-porcelain">{item.title}</span>
                      <span className="mt-0.5 flex items-center gap-1 text-xs font-bold uppercase tracking-[0.1em] text-white/68">
                        <Clock3 size={12} strokeWidth={2.3} aria-hidden />
                        {item.start}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-white/12 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-white/76">
                      Log
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              onClick={onOpenClasses}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-black uppercase tracking-[0.08em] text-carbon active:scale-[0.98]"
            >
              View full schedule
            </button>
          </div>
        ) : null}

        {equipment.length ? (
          <div className="mt-3">
            <p className="metric-label mb-2">Available here</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {equipment.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => openEquipmentLog(item)}
                  className="shrink-0 rounded-full bg-carbon px-3 py-2 text-xs font-bold text-white/70 transition active:scale-[0.97]"
                  aria-label={`Log ${item}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm leading-5 text-white/50">Pick Total Fitness or another local preset to load that gym&apos;s machine list.</p>
        )}

        {equipment.length ? (
          <label className="mt-4 block">
            <span className="metric-label mb-2 block">Machine / equipment to log</span>
            <select
              value={selectedMachineForLog}
              onChange={(event) => setSelectedMachine(event.target.value)}
              className="min-h-12 w-full rounded-2xl border border-white/10 bg-carbon px-4 text-base font-semibold text-porcelain outline-none focus:border-champagne"
            >
              {equipment.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <button
            type="button"
            onClick={() => openEquipmentLog(selectedMachineForLog)}
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
  onOpenBodyScan,
  onOpenProgramsTab,
}: {
  onOpenBodyScan: () => void;
  onOpenProgramsTab: (tab: "Programs" | "Guides" | "Classes" | "Nutrition" | "Media") => void;
}) {
  const shortcuts = [
    {
      detail: "Plans matched to your goals and equipment.",
      icon: Dumbbell,
      image: "/rebuild-class-metcon.jpg",
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
      detail: "Total Fitness studio schedule and class logging.",
      icon: CalendarDays,
      image: "/rebuild-class-studio.jpg",
      tab: "Classes" as const,
      title: "Classes",
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
        <button
          type="button"
          onClick={onOpenBodyScan}
          className="group relative min-h-64 overflow-hidden rounded-3xl border border-white/10 bg-black text-left shadow-panel active:scale-[0.98]"
        >
          <Image
            src="/rebuild-body-scan-selfie.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 448px"
            className="object-cover object-[58%_42%] opacity-100 transition group-active:scale-[1.02]"
          />
          <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(0,0,0,0.08)_42%,rgba(0,0,0,0.88)_100%)]" />
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(var(--color-accent),0.22),transparent_34%)]" />
          <span className="absolute bottom-5 left-5 right-5">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">
              <ScanSearch size={15} strokeWidth={2.3} aria-hidden />
              Signature feature
            </span>
            <span className="block font-display text-4xl font-black uppercase leading-none text-white drop-shadow-[0_3px_18px_rgba(0,0,0,0.9)]">
              AI Body Scan
            </span>
            <span className="mt-2 block max-w-[22rem] text-sm font-semibold leading-5 text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
              Upload progress photos, compare changes over time, and get non-medical coaching on what to track next.
            </span>
            <span className="mt-4 inline-flex rounded-full bg-champagne px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[rgb(var(--color-accent-foreground))]">
              Open scan
            </span>
          </span>
        </button>
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

function strengthExerciseFor(item: string) {
  const normalized = item.toLowerCase();
  if (normalized.includes("bench")) return "Bench press";
  if (normalized.includes("barbell")) return "Squat";
  if (normalized.includes("squat")) return "Squat";
  if (normalized.includes("curl")) return "Biceps curls";
  if (normalized.includes("ez")) return "Biceps curls";
  return item;
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

function openProgramsTab(tab: "Programs" | "Guides" | "Classes" | "Nutrition" | "Media", onNavigate: (view: AppView) => void) {
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

function HomeSignalRow({
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
      className="flex min-h-24 w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-left shadow-panel transition active:scale-[0.98]"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-champagne/10 text-champagne">
        <Icon size={18} strokeWidth={2.2} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="metric-label block">{label}</span>
        <span className="mt-1 block text-base font-semibold leading-tight text-porcelain">{title}</span>
        <span className="mt-1 line-clamp-2 block text-xs leading-4 text-white/48">{detail}</span>
      </span>
      <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.055] px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.12em] text-white/62">
        Open
      </span>
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
    hasMeditatedToday(data),
  ].filter(Boolean).length;
}

function hasMeditatedToday(data: RebuildData) {
  return (
    data.behaviorWins.some((entry) => isToday(entry.date) && isMeditationLabel(entry.label)) ||
    data.yogaSessions.some((entry) => isToday(entry.date) && isMeditationLabel(entry.focus))
  );
}

function isMeditationLabel(value?: string) {
  const normalized = String(value ?? "").toLowerCase();
  return normalized.includes("meditat") || normalized.includes("breath") || normalized.includes("stayed present");
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
