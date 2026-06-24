"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { BikeDashboard } from "@/components/bike-dashboard";
import { ExerciseGuides } from "@/components/exercise-guides";
import { FuelGuide } from "@/components/fuel-guide";
import { HeroDashboard } from "@/components/hero-dashboard";
import { KettlebellPrograms } from "@/components/kettlebell-programs";
import { LogModal } from "@/components/log-modal";
import { Onboarding } from "@/components/onboarding";
import { ProgressTrends } from "@/components/progress-trends";
import { QuickAdd } from "@/components/quick-add";
import { RebuildTimeline } from "@/components/rebuild-timeline";
import { TrainingOverview } from "@/components/training-overview";
import { VideoLibrary } from "@/components/video-library";
import { WorkoutPrograms } from "@/components/workout-programs";
import { buildTimeline, cloneSeedData, createId, normalizeRebuildData, storageKey } from "@/lib/rebuild-data";
import type { AppView, LogKind, MoodReason, OnboardingProfile, RebuildData } from "@/types/rebuild";

type Draft = Record<string, string | boolean>;
const profileKey = "rebuild:profile:v2";

export function RebuildApp() {
  const [data, setData] = useState<RebuildData>(() => cloneSeedData());
  const [activeView, setActiveView] = useState<AppView>("home");
  const [activeLog, setActiveLog] = useState<LogKind | null>(null);
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    const storedProfile = window.localStorage.getItem(profileKey);

    try {
      if (stored) {
        const restored = normalizeRebuildData(JSON.parse(stored) as Partial<RebuildData>);
        setData(restored);
      }
      if (storedProfile) setProfile(JSON.parse(storedProfile) as OnboardingProfile);
    } catch {
      setToast("Using fresh local data");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const timeline = useMemo(() => buildTimeline(data), [data]);

  function completeOnboarding(nextProfile: OnboardingProfile) {
    setProfile(nextProfile);
    window.localStorage.setItem(profileKey, JSON.stringify(nextProfile));
    setToast("Fresh start ready");
  }

  function saveLog(kind: LogKind, draft: Draft) {
    setData((current) => appendLog(current, kind, draft));
    setActiveLog(null);
    setToast(`${labelFor(kind)} saved`);
  }

  function resetData() {
    const fresh = cloneSeedData();
    setData(fresh);
    window.localStorage.setItem(storageKey, JSON.stringify(fresh));
    setToast("Fresh zero state restored");
  }

  if (!profile?.completed) {
    return (
      <AppShell activeView="home" onNavigate={setActiveView} showNavigation={false}>
        <Onboarding onComplete={completeOnboarding} />
      </AppShell>
    );
  }

  return (
    <AppShell activeView={activeView} onNavigate={setActiveView}>
      {activeView === "home" ? (
        <HeroDashboard
          data={data}
          onNavigate={setActiveView}
          onOpenLog={setActiveLog}
          onQuickAdd={() => setActiveLog("mood")}
          onReset={resetData}
          profile={profile}
        />
      ) : null}
      {activeView === "log" ? <QuickAdd onSelect={setActiveLog} /> : null}
      {activeView === "training" ? (
        <>
          <TrainingOverview data={data} />
          <WorkoutPrograms />
          <FuelGuide />
          <ExerciseGuides />
          <BikeDashboard data={data} />
          <KettlebellPrograms data={data} />
        </>
      ) : null}
      {activeView === "progress" ? <ProgressTrends data={data} /> : null}
      {activeView === "reset" ? <RebuildTimeline timeline={timeline} /> : null}
      {activeView === "library" ? <VideoLibrary /> : null}
      {toast ? (
        <div className="fixed inset-x-4 bottom-24 z-[70] mx-auto max-w-sm rounded-2xl border border-white/10 bg-carbon/92 px-4 py-3 text-sm font-semibold text-porcelain shadow-panel backdrop-blur-xl">
          {toast}
        </div>
      ) : null}
      <LogModal kind={activeLog} onClose={() => setActiveLog(null)} onSave={saveLog} />
    </AppShell>
  );
}

function appendLog(data: RebuildData, kind: LogKind, draft: Draft): RebuildData {
  const next: RebuildData = {
    weights: [...data.weights],
    bikeSessions: [...data.bikeSessions],
    jacobsLadderSessions: [...data.jacobsLadderSessions],
    pushUpSessions: [...data.pushUpSessions],
    dumbbellCurlSessions: [...data.dumbbellCurlSessions],
    kettlebellSessions: [...data.kettlebellSessions],
    farmerCarrySessions: [...data.farmerCarrySessions],
    strengthAccessorySessions: [...(data.strengthAccessorySessions ?? [])],
    swimSessions: [...(data.swimSessions ?? [])],
    yogaSessions: [...(data.yogaSessions ?? [])],
    meals: [...data.meals],
    behaviorWins: [...data.behaviorWins],
  };

  if (kind === "weight") {
    next.weights.unshift({
      id: createId("weight"),
      date: text(draft.date, "Today"),
      weight: number(draft.weight),
      moment: "check-in",
    });
  }

  if (kind === "bike") {
    next.bikeSessions.unshift({
      id: createId("bike"),
      date: text(draft.date, "Today"),
      minutes: number(draft.minutes),
      resistance: number(draft.resistance),
      calories: number(draft.calories),
      notes: text(draft.notes, "Logged from Quick Add."),
      location: "gym",
    });
  }

  if (kind === "jacobsLadder") {
    next.jacobsLadderSessions.unshift({
      id: createId("ladder"),
      date: text(draft.date, "Today"),
      duration: text(draft.duration, "0:00"),
      longestContinuous: text(draft.longestContinuous, "0:00"),
    });
  }

  if (kind === "pushUps") {
    next.pushUpSessions.unshift({
      id: createId("push"),
      date: text(draft.date, "Today"),
      sets: String(draft.sets ?? "")
        .split(",")
        .map((set) => Number(set.trim()))
        .filter((set) => Number.isFinite(set) && set > 0),
    });
  }

  if (kind === "dumbbellCurls") {
    next.dumbbellCurlSessions.unshift({
      id: createId("curl"),
      date: text(draft.date, "Today"),
      weight: number(draft.weight),
      repsEachArm: number(draft.repsEachArm),
    });
  }

  if (kind === "kettlebell") {
    next.kettlebellSessions.unshift({
      id: createId("kb"),
      date: text(draft.date, "Today"),
      exercise: text(draft.exercise, "Kettlebell work"),
      weight: number(draft.weight),
      reps: number(draft.reps),
    });
  }

  if (kind === "farmerCarries") {
    next.farmerCarrySessions.unshift({
      id: createId("carry"),
      date: text(draft.date, "Today"),
      weightEachHand: number(draft.weightEachHand),
      distanceFeet: number(draft.distanceFeet),
      rounds: number(draft.rounds),
    });
  }

  if (kind === "swim") {
    next.swimSessions.unshift({
      id: createId("swim"),
      date: text(draft.date, "Today"),
      minutes: number(draft.minutes),
      distance: number(draft.distance),
      stroke: text(draft.stroke, "Freestyle"),
      notes: text(draft.notes, "Technique work."),
    });
  }

  if (kind === "yoga") {
    next.yogaSessions.unshift({
      id: createId("yoga"),
      date: text(draft.date, "Today"),
      minutes: number(draft.minutes),
      focus: text(draft.focus, "Mobility"),
      notes: text(draft.notes, "Recovery session."),
    });
  }

  if (kind === "meal") {
    next.meals.unshift({
      id: createId("meal"),
      name: text(draft.name, "Meal"),
      calories: number(draft.calories),
      protein: number(draft.protein),
      notes: text(draft.notes, "Quick logged."),
    });
  }

  if (kind === "mood") {
    next.behaviorWins.unshift({
      id: createId("win"),
      date: text(draft.date, "Today"),
      reason: text(draft.reason, "stress") as MoodReason,
      label: text(draft.label, "Chose the reset instead of the old loop"),
      didntSmoke: Boolean(draft.didntSmoke),
      didntSpiral: Boolean(draft.didntSpiral),
    });
  }

  return next;
}

function number(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function text(value: unknown, fallback: string) {
  const parsed = String(value ?? "").trim();
  return parsed || fallback;
}

function labelFor(kind: LogKind) {
  const labels: Record<LogKind, string> = {
    weight: "Weight",
    bike: "Bike session",
    jacobsLadder: "Jacob's Ladder",
    pushUps: "Push-ups",
    dumbbellCurls: "Dumbbell curls",
    kettlebell: "Kettlebell work",
    farmerCarries: "Farmer carries",
    swim: "Swim",
    yoga: "Yoga",
    meal: "Meal",
    mood: "Mood reset",
  };

  return labels[kind];
}
