"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { BikeDashboard } from "@/components/bike-dashboard";
import { HeroDashboard } from "@/components/hero-dashboard";
import { KettlebellPrograms } from "@/components/kettlebell-programs";
import { LogModal } from "@/components/log-modal";
import { Onboarding } from "@/components/onboarding";
import { ProgressTrends } from "@/components/progress-trends";
import { QuickAdd } from "@/components/quick-add";
import { RebuildTimeline } from "@/components/rebuild-timeline";
import { VideoLibrary } from "@/components/video-library";
import { buildTimeline, cloneSeedData, createId, normalizeRebuildData, storageKey } from "@/lib/rebuild-data";
import type { AppView, LogKind, MoodReason, OnboardingProfile, RebuildData } from "@/types/rebuild";

type Draft = Record<string, string | boolean>;
const profileKey = "rebuild:profile:v2";

export function RebuildApp() {
  const [data, setData] = useState<RebuildData>(() => cloneSeedData());
  const [activeView, setActiveView] = useState<AppView>("home");
  const [activeLog, setActiveLog] = useState<LogKind | null>(null);
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [savedMessage, setSavedMessage] = useState("Ready");

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    const storedProfile = window.localStorage.getItem(profileKey);

    try {
      if (stored) {
        const restored = normalizeRebuildData(JSON.parse(stored) as Partial<RebuildData>);
        setData(restored);
        setSavedMessage(totalLogs(restored) ? "Loaded saved logs" : "Fresh slate");
      }
      if (storedProfile) setProfile(JSON.parse(storedProfile) as OnboardingProfile);
    } catch {
      setSavedMessage("Using seed data");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data]);

  const timeline = useMemo(() => buildTimeline(data), [data]);

  function completeOnboarding(nextProfile: OnboardingProfile) {
    setProfile(nextProfile);
    window.localStorage.setItem(profileKey, JSON.stringify(nextProfile));
    setSavedMessage("Fresh start ready");
  }

  function saveLog(kind: LogKind, draft: Draft) {
    setData((current) => appendLog(current, kind, draft));
    setActiveLog(null);
    setSavedMessage(`${labelFor(kind)} saved`);
  }

  function resetData() {
    const fresh = cloneSeedData();
    setData(fresh);
    window.localStorage.setItem(storageKey, JSON.stringify(fresh));
    setSavedMessage("Fresh zero state restored");
  }

  if (!profile?.completed) {
    return (
      <AppShell activeView="home" onNavigate={setActiveView}>
        <Onboarding onComplete={completeOnboarding} />
      </AppShell>
    );
  }

  return (
    <AppShell activeView={activeView} onNavigate={setActiveView}>
      <div className="px-4 pt-5">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2">
          <p className="text-sm font-semibold text-white/60">{savedMessage}</p>
          <button
            type="button"
            onClick={resetData}
            className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white/10 px-3 text-xs font-bold text-white/70"
          >
            <RotateCcw size={14} aria-hidden />
            Reset
          </button>
        </div>
      </div>
      {activeView === "home" ? (
        <HeroDashboard data={data} onNavigate={setActiveView} onQuickAdd={() => setActiveLog("mood")} profile={profile} />
      ) : null}
      {activeView === "log" ? <QuickAdd onSelect={setActiveLog} /> : null}
      {activeView === "training" ? (
        <>
          <BikeDashboard data={data} />
          <KettlebellPrograms data={data} />
        </>
      ) : null}
      {activeView === "progress" ? <ProgressTrends data={data} /> : null}
      {activeView === "reset" ? <RebuildTimeline timeline={timeline} /> : null}
      {activeView === "library" ? <VideoLibrary /> : null}
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
    meal: "Meal",
    mood: "Mood reset",
  };

  return labels[kind];
}

function totalLogs(data: RebuildData) {
  return (
    data.weights.length +
    data.bikeSessions.length +
    data.jacobsLadderSessions.length +
    data.pushUpSessions.length +
    data.dumbbellCurlSessions.length +
    data.kettlebellSessions.length +
    data.farmerCarrySessions.length +
    data.strengthAccessorySessions.length +
    data.meals.length +
    data.behaviorWins.length
  );
}
