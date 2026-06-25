"use client";

import { useEffect, useMemo, useState } from "react";
import { AccountSync } from "@/components/account-sync";
import { AppleHealthRoadmap } from "@/components/apple-health-roadmap";
import { AppShell } from "@/components/app-shell";
import { BikeDashboard } from "@/components/bike-dashboard";
import { BodyCheck } from "@/components/body-check";
import { ExerciseGuides } from "@/components/exercise-guides";
import { FuelGuide } from "@/components/fuel-guide";
import { FormVisuals } from "@/components/form-visuals";
import { GoalTrainingPlan } from "@/components/goal-training-plan";
import { HeroDashboard } from "@/components/hero-dashboard";
import { InstallPrompt } from "@/components/install-prompt";
import { KettlebellPrograms } from "@/components/kettlebell-programs";
import { LogModal, type LogDraft } from "@/components/log-modal";
import { Onboarding } from "@/components/onboarding";
import { ProfileCard } from "@/components/profile-card";
import { ProgressTrends } from "@/components/progress-trends";
import { QuickAdd } from "@/components/quick-add";
import { RebuildTimeline } from "@/components/rebuild-timeline";
import { StreakSummary } from "@/components/streak-summary";
import { TrainingOverview } from "@/components/training-overview";
import { VideoLibrary } from "@/components/video-library";
import { WorkoutPrograms } from "@/components/workout-programs";
import { buildTimeline, cloneSeedData, createId, normalizeRebuildData, storageKey } from "@/lib/rebuild-data";
import type { AppView, LogKind, MoodReason, OnboardingProfile, RebuildData } from "@/types/rebuild";

type Draft = LogDraft;
type EditTarget = {
  id: string;
  kind: LogKind;
};
const profileKey = "rebuild:profile:v2";

export function RebuildApp() {
  const [data, setData] = useState<RebuildData>(() => cloneSeedData());
  const [activeView, setActiveView] = useState<AppView>("home");
  const [activeLog, setActiveLog] = useState<LogKind | null>(null);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
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
  const editDraft = useMemo(
    () => (editTarget ? draftFromLog(data, editTarget.kind, editTarget.id) : null),
    [data, editTarget],
  );

  function completeOnboarding(nextProfile: OnboardingProfile) {
    setProfile(nextProfile);
    window.localStorage.setItem(profileKey, JSON.stringify(nextProfile));
    setToast("Fresh start ready");
  }

  function saveLog(kind: LogKind, draft: Draft) {
    const target = editTarget;

    setData((current) =>
      target ? updateLog(current, kind, target.id, draft) : appendLog(current, kind, draft),
    );
    setActiveLog(null);
    setEditTarget(null);
    setToast(`${labelFor(kind)} ${target ? "updated" : "saved"}`);
  }

  function closeLogModal() {
    setActiveLog(null);
    setEditTarget(null);
  }

  function openEditLog(kind: LogKind, id: string) {
    if (!draftFromLog(data, kind, id)) {
      setToast("That log could not be found.");
      return;
    }

    setEditTarget({ id, kind });
    setActiveLog(kind);
  }

  function resetData() {
    const fresh = cloneSeedData();
    setData(fresh);
    window.localStorage.setItem(storageKey, JSON.stringify(fresh));
    setToast("Fresh zero state restored");
  }

  function restartOnboarding() {
    setProfile(null);
    window.localStorage.removeItem(profileKey);
    setToast("Setup reopened. Your logs stayed saved.");
  }

  function restoreFromCloud(nextProfile: OnboardingProfile | null, nextData: RebuildData | null) {
    if (nextProfile) {
      setProfile(nextProfile);
      window.localStorage.setItem(profileKey, JSON.stringify(nextProfile));
    }

    if (nextData) {
      const restored = normalizeRebuildData(nextData);
      setData(restored);
      window.localStorage.setItem(storageKey, JSON.stringify(restored));
    }

    setToast("Cloud data restored");
  }

  if (!profile?.completed) {
    return (
      <AppShell activeView="home" onNavigate={setActiveView} showNavigation={false}>
        <Onboarding onComplete={completeOnboarding} />
      </AppShell>
    );
  }

  return (
    <AppShell activeView={activeView} onNavigate={setActiveView} profile={profile}>
      {activeView === "home" ? (
        <HeroDashboard
          data={data}
          onNavigate={setActiveView}
          onOpenLog={setActiveLog}
          profile={profile}
        />
      ) : null}
      {activeView === "home" ? <InstallPrompt /> : null}
      {activeView === "log" ? <QuickAdd onSelect={setActiveLog} /> : null}
      {activeView === "training" ? (
        <>
          <GoalTrainingPlan data={data} onOpenLog={setActiveLog} profile={profile} />
          <TrainingOverview data={data} />
          <FormVisuals />
          <WorkoutPrograms profile={profile} />
          <FuelGuide />
          <ExerciseGuides />
          <BikeDashboard data={data} />
          <KettlebellPrograms data={data} />
        </>
      ) : null}
      {activeView === "progress" ? (
        <>
          <ProgressTrends data={data} />
          <StreakSummary data={data} />
          <ProfileCard onRestart={restartOnboarding} profile={profile} />
          <AccountSync data={data} onRestore={restoreFromCloud} profile={profile} />
          <AppleHealthRoadmap />
        </>
      ) : null}
      {activeView === "body" ? <BodyCheck profile={profile} /> : null}
      {activeView === "reset" ? <RebuildTimeline onEdit={openEditLog} timeline={timeline} /> : null}
      {activeView === "library" ? <VideoLibrary profile={profile} /> : null}
      {toast ? (
        <div className="fixed inset-x-4 bottom-24 z-[70] mx-auto max-w-sm rounded-2xl border border-white/10 bg-carbon/92 px-4 py-3 text-sm font-semibold text-porcelain shadow-panel backdrop-blur-xl">
          {toast}
        </div>
      ) : null}
      <LogModal
        initialDraft={editDraft}
        kind={activeLog}
        mode={editTarget ? "edit" : "create"}
        onClose={closeLogModal}
        onSave={saveLog}
      />
    </AppShell>
  );
}

function appendLog(data: RebuildData, kind: LogKind, draft: Draft): RebuildData {
  const next = cloneMutableData(data);

  if (kind === "weight") {
    next.weights.unshift(weightFromDraft(draft));
  }

  if (kind === "bike") {
    next.bikeSessions.unshift(bikeFromDraft(draft));
  }

  if (kind === "jacobsLadder") {
    next.jacobsLadderSessions.unshift(jacobsLadderFromDraft(draft));
  }

  if (kind === "pushUps") {
    next.pushUpSessions.unshift(pushUpsFromDraft(draft));
  }

  if (kind === "dumbbellCurls") {
    next.dumbbellCurlSessions.unshift(dumbbellCurlsFromDraft(draft));
  }

  if (kind === "strength") {
    next.strengthAccessorySessions.unshift(strengthFromDraft(draft));
  }

  if (kind === "kettlebell") {
    next.kettlebellSessions.unshift(kettlebellFromDraft(draft));
  }

  if (kind === "farmerCarries") {
    next.farmerCarrySessions.unshift(farmerCarriesFromDraft(draft));
  }

  if (kind === "swim") {
    next.swimSessions.unshift(swimFromDraft(draft));
  }

  if (kind === "yoga") {
    next.yogaSessions.unshift(yogaFromDraft(draft));
  }

  if (kind === "meal") {
    next.meals.unshift(mealFromDraft(draft));
  }

  if (kind === "mood") {
    next.behaviorWins.unshift(moodFromDraft(draft));
  }

  return next;
}

function updateLog(data: RebuildData, kind: LogKind, id: string, draft: Draft): RebuildData {
  const next = cloneMutableData(data);

  if (kind === "weight") {
    next.weights = next.weights.map((entry) =>
      entry.id === id ? weightFromDraft(draft, id, entry.moment) : entry,
    );
  }

  if (kind === "bike") {
    next.bikeSessions = next.bikeSessions.map((session) =>
      session.id === id ? bikeFromDraft(draft, id, session.location) : session,
    );
  }

  if (kind === "jacobsLadder") {
    next.jacobsLadderSessions = next.jacobsLadderSessions.map((session) =>
      session.id === id ? jacobsLadderFromDraft(draft, id) : session,
    );
  }

  if (kind === "pushUps") {
    next.pushUpSessions = next.pushUpSessions.map((session) =>
      session.id === id ? pushUpsFromDraft(draft, id) : session,
    );
  }

  if (kind === "dumbbellCurls") {
    next.dumbbellCurlSessions = next.dumbbellCurlSessions.map((session) =>
      session.id === id ? dumbbellCurlsFromDraft(draft, id) : session,
    );
  }

  if (kind === "strength") {
    next.strengthAccessorySessions = next.strengthAccessorySessions.map((session) =>
      session.id === id ? strengthFromDraft(draft, id) : session,
    );
  }

  if (kind === "kettlebell") {
    next.kettlebellSessions = next.kettlebellSessions.map((session) =>
      session.id === id ? kettlebellFromDraft(draft, id) : session,
    );
  }

  if (kind === "farmerCarries") {
    next.farmerCarrySessions = next.farmerCarrySessions.map((session) =>
      session.id === id ? farmerCarriesFromDraft(draft, id) : session,
    );
  }

  if (kind === "swim") {
    next.swimSessions = next.swimSessions.map((session) =>
      session.id === id ? swimFromDraft(draft, id) : session,
    );
  }

  if (kind === "yoga") {
    next.yogaSessions = next.yogaSessions.map((session) =>
      session.id === id ? yogaFromDraft(draft, id) : session,
    );
  }

  if (kind === "meal") {
    next.meals = next.meals.map((meal) =>
      meal.id === id ? mealFromDraft(draft, id) : meal,
    );
  }

  if (kind === "mood") {
    next.behaviorWins = next.behaviorWins.map((win) =>
      win.id === id ? moodFromDraft(draft, id) : win,
    );
  }

  return next;
}

function cloneMutableData(data: RebuildData): RebuildData {
  return {
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
}

function weightFromDraft(draft: Draft, id = createId("weight"), moment: "morning" | "bedtime" | "check-in" = "check-in") {
  return {
    id,
    date: text(draft.date, "Today"),
    weight: number(draft.weight),
    moment,
  };
}

function bikeFromDraft(draft: Draft, id = createId("bike"), location: "home" | "gym" = "gym") {
  return {
    id,
    date: text(draft.date, "Today"),
    minutes: number(draft.minutes),
    distanceMiles: number(draft.distanceMiles),
    resistance: number(draft.resistance),
    calories: number(draft.calories),
    notes: text(draft.notes, "Logged from Quick Add."),
    location,
  };
}

function jacobsLadderFromDraft(draft: Draft, id = createId("ladder")) {
  return {
    id,
    date: text(draft.date, "Today"),
    duration: text(draft.duration, "0:00"),
    longestContinuous: text(draft.longestContinuous, "0:00"),
  };
}

function pushUpsFromDraft(draft: Draft, id = createId("push")) {
  return {
    id,
    date: text(draft.date, "Today"),
    sets: pushUpSetsFromDraft(draft),
  };
}

function dumbbellCurlsFromDraft(draft: Draft, id = createId("curl")) {
  return {
    id,
    date: text(draft.date, "Today"),
    weight: number(draft.weight),
    repsEachArm: number(draft.repsEachArm),
  };
}

function strengthFromDraft(draft: Draft, id = createId("strength")) {
  return {
    id,
    date: text(draft.date, "Today"),
    exercise: text(draft.exercise, "Strength lift"),
    weight: number(draft.weight),
    reps: number(draft.reps),
    notes: text(draft.notes, "Logged strength work."),
  };
}

function kettlebellFromDraft(draft: Draft, id = createId("kb")) {
  return {
    id,
    date: text(draft.date, "Today"),
    exercise: text(draft.exercise, "Kettlebell work"),
    weight: number(draft.weight),
    reps: number(draft.reps),
  };
}

function farmerCarriesFromDraft(draft: Draft, id = createId("carry")) {
  return {
    id,
    date: text(draft.date, "Today"),
    weightEachHand: number(draft.weightEachHand),
    distanceFeet: number(draft.distanceFeet),
    rounds: number(draft.rounds),
  };
}

function swimFromDraft(draft: Draft, id = createId("swim")) {
  return {
    id,
    date: text(draft.date, "Today"),
    minutes: number(draft.minutes),
    distance: number(draft.distance),
    stroke: text(draft.stroke, "Freestyle"),
    notes: text(draft.notes, "Technique work."),
  };
}

function yogaFromDraft(draft: Draft, id = createId("yoga")) {
  return {
    id,
    date: text(draft.date, "Today"),
    minutes: number(draft.minutes),
    focus: text(draft.focus, "Mobility"),
    notes: text(draft.notes, "Recovery session."),
  };
}

function mealFromDraft(draft: Draft, id = createId("meal")) {
  return {
    id,
    date: text(draft.date, "Today"),
    name: text(draft.name, "Meal"),
    calories: number(draft.calories),
    protein: number(draft.protein),
    notes: text(draft.notes, "Quick logged."),
  };
}

function moodFromDraft(draft: Draft, id = createId("win")) {
  return {
    id,
    date: text(draft.date, "Today"),
    reason: text(draft.reason, "stress") as MoodReason,
    label: text(draft.label, "Chose the reset instead of the old loop"),
    didntSmoke: Boolean(draft.didntSmoke),
    didntSpiral: Boolean(draft.didntSpiral),
  };
}

function draftFromLog(data: RebuildData, kind: LogKind, id: string): Draft | null {
  if (kind === "weight") {
    const entry = data.weights.find((item) => item.id === id);
    return entry ? { date: entry.date, weight: String(entry.weight) } : null;
  }

  if (kind === "bike") {
    const session = data.bikeSessions.find((item) => item.id === id);
    return session
      ? {
          date: session.date,
          minutes: String(session.minutes),
          distanceMiles: String(session.distanceMiles ?? ""),
          resistance: String(session.resistance),
          calories: String(session.calories),
          notes: session.notes,
        }
      : null;
  }

  if (kind === "jacobsLadder") {
    const session = data.jacobsLadderSessions.find((item) => item.id === id);
    return session
      ? {
          date: session.date,
          duration: session.duration,
          longestContinuous: session.longestContinuous,
        }
      : null;
  }

  if (kind === "pushUps") {
    const session = data.pushUpSessions.find((item) => item.id === id);
    if (!session) return null;

    const firstSix = session.sets.slice(0, 6);
    const extras = session.sets.slice(6);

    return {
      date: session.date,
      set1: String(firstSix[0] ?? ""),
      set2: String(firstSix[1] ?? ""),
      set3: String(firstSix[2] ?? ""),
      set4: String(firstSix[3] ?? ""),
      set5: String(firstSix[4] ?? ""),
      set6: String(firstSix[5] ?? ""),
      extraSets: extras.join(", "),
    };
  }

  if (kind === "dumbbellCurls") {
    const session = data.dumbbellCurlSessions.find((item) => item.id === id);
    return session
      ? {
          date: session.date,
          weight: String(session.weight),
          repsEachArm: String(session.repsEachArm),
        }
      : null;
  }

  if (kind === "strength") {
    const session = data.strengthAccessorySessions.find((item) => item.id === id);
    return session
      ? {
          date: session.date,
          exercise: session.exercise,
          weight: String(session.weight),
          reps: String(session.reps),
          notes: session.notes,
        }
      : null;
  }

  if (kind === "kettlebell") {
    const session = data.kettlebellSessions.find((item) => item.id === id);
    return session
      ? {
          date: session.date,
          exercise: session.exercise,
          weight: String(session.weight),
          reps: String(session.reps),
        }
      : null;
  }

  if (kind === "farmerCarries") {
    const session = data.farmerCarrySessions.find((item) => item.id === id);
    return session
      ? {
          date: session.date,
          weightEachHand: String(session.weightEachHand),
          distanceFeet: String(session.distanceFeet),
          rounds: String(session.rounds),
        }
      : null;
  }

  if (kind === "swim") {
    const session = data.swimSessions.find((item) => item.id === id);
    return session
      ? {
          date: session.date,
          minutes: String(session.minutes),
          distance: String(session.distance),
          stroke: session.stroke,
          notes: session.notes,
        }
      : null;
  }

  if (kind === "yoga") {
    const session = data.yogaSessions.find((item) => item.id === id);
    return session
      ? {
          date: session.date,
          minutes: String(session.minutes),
          focus: session.focus,
          notes: session.notes,
        }
      : null;
  }

  if (kind === "meal") {
    const meal = data.meals.find((item) => item.id === id);
    return meal
      ? {
          date: meal.date ?? "Today",
          name: meal.name,
          calories: String(meal.calories),
          protein: String(meal.protein),
          notes: meal.notes,
          selectedFoods: "",
        }
      : null;
  }

  if (kind === "mood") {
    const win = data.behaviorWins.find((item) => item.id === id);
    return win
      ? {
          date: win.date,
          reason: win.reason,
          label: win.label,
          didntSmoke: win.didntSmoke,
          didntSpiral: win.didntSpiral,
        }
      : null;
  }

  return null;
}

function number(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function text(value: unknown, fallback: string) {
  const parsed = String(value ?? "").trim();
  return parsed || fallback;
}

function pushUpSetsFromDraft(draft: Draft) {
  const structuredSets = ["set1", "set2", "set3", "set4", "set5", "set6"]
    .map((key) => Number(draft[key]))
    .filter((set) => Number.isFinite(set) && set > 0);
  const extraSets = String(draft.extraSets ?? "")
    .split(",")
    .map((set) => Number(set.trim()))
    .filter((set) => Number.isFinite(set) && set > 0);
  const legacySets = String(draft.sets ?? "")
    .split(",")
    .map((set) => Number(set.trim()))
    .filter((set) => Number.isFinite(set) && set > 0);

  return [...structuredSets, ...extraSets, ...legacySets];
}

function labelFor(kind: LogKind) {
  const labels: Record<LogKind, string> = {
    weight: "Weight",
    bike: "Bike session",
    jacobsLadder: "Jacob's Ladder",
    pushUps: "Push-ups",
    dumbbellCurls: "Dumbbell curls",
    strength: "Strength lift",
    kettlebell: "Kettlebell work",
    farmerCarries: "Farmer carries",
    swim: "Swim",
    yoga: "Yoga",
    meal: "Meal",
    mood: "Mood reset",
  };

  return labels[kind];
}
