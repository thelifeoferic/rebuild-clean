"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { HeroDashboard } from "@/components/hero-dashboard";
import { LogModal, type LogDraft } from "@/components/log-modal";
import { MeHub, type MeTab } from "@/components/me-hub";
import { Onboarding } from "@/components/onboarding";
import { ProgramsHub } from "@/components/programs-hub";
import { QuickAdd } from "@/components/quick-add";
import { RecordsHub } from "@/components/records-hub";
import { estimateDraftActivityCalories } from "@/lib/activity-calories";
import { estimateBikeDistanceMiles } from "@/lib/bike-distance";
import { buildTimeline, cloneSeedData, createId, getTodayIso, normalizeLogDate, normalizeRebuildData, storageKey } from "@/lib/rebuild-data";
import type { AppView, LogKind, MoodReason, OnboardingProfile, RebuildData } from "@/types/rebuild";

type Draft = LogDraft;
type EditTarget = {
  id: string;
  kind: LogKind;
};
const profileKey = "rebuild:profile:v2";
const accentMigrationKey = "rebuild:accent-default-cobalt:v1";
const whyIntroSeenKey = "rebuild:why-intro-seen:v1";
const whyIntroVisitKey = "rebuild:why-intro-visits:v1";

export function RebuildApp() {
  const [data, setData] = useState<RebuildData>(() => cloneSeedData());
  const [activeView, setActiveView] = useState<AppView>("home");
  const [activeLog, setActiveLog] = useState<LogKind | null>(null);
  const [createDraft, setCreateDraft] = useState<Draft | null>(null);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [meTabIntent, setMeTabIntent] = useState<MeTab | undefined>();
  const [recordsResetSignal, setRecordsResetSignal] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [showWhyIntro, setShowWhyIntro] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    const storedProfile = window.localStorage.getItem(profileKey);

    try {
      if (stored) {
        const restored = normalizeRebuildData(JSON.parse(stored) as Partial<RebuildData>);
        setData(restored);
      }
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile) as OnboardingProfile;
        const migratedProfile =
          !window.localStorage.getItem(accentMigrationKey) && parsedProfile.accentColor === "ember"
            ? { ...parsedProfile, accentColor: "cobalt" as const }
            : parsedProfile;

        if (migratedProfile !== parsedProfile) {
          window.localStorage.setItem(profileKey, JSON.stringify(migratedProfile));
        }
        window.localStorage.setItem(accentMigrationKey, "true");
        setProfile(migratedProfile);
      }
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

  useEffect(() => {
    if (!profile?.completed) return;

    const visits = Number(window.localStorage.getItem(whyIntroVisitKey) ?? "0") + 1;
    const hasSeenIntro = window.localStorage.getItem(whyIntroSeenKey) === "true";
    window.localStorage.setItem(whyIntroVisitKey, String(visits));

    if (!hasSeenIntro || visits % 4 === 0) {
      window.localStorage.setItem(whyIntroSeenKey, "true");
      setShowWhyIntro(true);
    }
  }, [profile?.completed]);

  useEffect(() => {
    if (!showWhyIntro) return;
    const timer = window.setTimeout(() => setShowWhyIntro(false), 7000);
    return () => window.clearTimeout(timer);
  }, [showWhyIntro]);

  const timeline = useMemo(() => buildTimeline(data), [data]);
  const editDraft = useMemo(
    () => (editTarget ? draftFromLog(data, editTarget.kind, editTarget.id) : null),
    [data, editTarget],
  );
  const modalDraft = editTarget ? editDraft : createDraft;

  function completeOnboarding(nextProfile: OnboardingProfile) {
    setProfile(nextProfile);
    window.localStorage.setItem(profileKey, JSON.stringify(nextProfile));
    setToast("Fresh start ready");
  }

  function updateProfile(nextProfile: OnboardingProfile) {
    setProfile(nextProfile);
    window.localStorage.setItem(profileKey, JSON.stringify(nextProfile));
    setToast("Profile updated");
  }

  function navigate(view: AppView) {
    if (view === "records") setRecordsResetSignal((current) => current + 1);
    setMeTabIntent(view === "me" ? "Profile" : undefined);
    setActiveView(view);
  }

  function openBodyScan() {
    setMeTabIntent("AI Body Scan");
    setActiveView("me");
  }

  function saveLog(kind: LogKind, draft: Draft) {
    const target = editTarget;

    setData((current) =>
      target ? updateLog(current, kind, target.id, draft, profile) : appendLog(current, kind, draft, profile),
    );
    setActiveLog(null);
    setCreateDraft(null);
    setEditTarget(null);
    setToast(`${labelFor(kind)} ${target ? "updated" : "saved"}`);
  }

  function closeLogModal() {
    setActiveLog(null);
    setCreateDraft(null);
    setEditTarget(null);
  }

  function openLog(kind: LogKind, draft?: Draft) {
    setEditTarget(null);
    setCreateDraft(draft ?? null);
    setActiveLog(kind);
  }

  function openEditLog(kind: LogKind, id: string) {
    if (!draftFromLog(data, kind, id)) {
      setToast("That log could not be found.");
      return;
    }

    setCreateDraft(null);
    setEditTarget({ id, kind });
    setActiveLog(kind);
  }

  function deleteLog(kind: LogKind, id: string) {
    if (!draftFromLog(data, kind, id)) {
      setToast("That log could not be found.");
      return;
    }

    setData((current) => deleteLogFromData(current, kind, id));
    setToast(`${labelFor(kind)} deleted`);
  }

  function duplicateLog(kind: LogKind, id: string) {
    const draft = draftFromLog(data, kind, id);
    if (!draft) {
      setToast("That log could not be found.");
      return;
    }

    setData((current) => appendLog(current, kind, { ...draft, date: getTodayIso() }, profile));
    setToast(`${labelFor(kind)} duplicated for today`);
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
    <>
    <AppShell activeView={activeView} onNavigate={navigate} profile={profile}>
      {activeView === "home" ? (
        <HeroDashboard
          data={data}
          onNavigate={navigate}
          onOpenBodyScan={openBodyScan}
          onOpenLog={openLog}
          onUpdateProfile={updateProfile}
          profile={profile}
        />
      ) : null}
      {activeView === "log" ? <QuickAdd onSelect={openLog} /> : null}
      {activeView === "records" ? (
        <RecordsHub
          data={data}
          onDelete={deleteLog}
          onDuplicate={duplicateLog}
          onEdit={openEditLog}
          onOpenLog={openLog}
          profile={profile}
          resetSignal={recordsResetSignal}
          timeline={timeline}
        />
      ) : null}
      {activeView === "programs" ? <ProgramsHub data={data} onOpenLog={openLog} profile={profile} /> : null}
      {activeView === "me" ? (
        <MeHub
          data={data}
          initialTab={meTabIntent}
          onRestart={restartOnboarding}
          onRestore={restoreFromCloud}
          onUpdateProfile={updateProfile}
          profile={profile}
        />
      ) : null}
      {toast ? (
        <div className="fixed inset-x-4 bottom-24 z-[70] mx-auto max-w-sm rounded-2xl border border-white/10 bg-carbon/92 px-4 py-3 text-sm font-semibold text-porcelain shadow-panel backdrop-blur-xl">
          {toast}
        </div>
      ) : null}
      <LogModal
        initialDraft={modalDraft}
        kind={activeLog}
        mode={editTarget ? "edit" : "create"}
        onClose={closeLogModal}
        profile={profile}
        onSave={saveLog}
      />
    </AppShell>
      {showWhyIntro ? <WhyIntro onClose={() => setShowWhyIntro(false)} profile={profile} /> : null}
    </>
  );
}

function WhyIntro({ onClose, profile }: { onClose: () => void; profile: OnboardingProfile }) {
  const [secondsLeft, setSecondsLeft] = useState(7);
  const firstName = profile.firstName?.trim();
  const why = profile.why?.trim() || "You are building proof that the next version of you is already in motion.";

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/92 px-5 backdrop-blur-xl">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-carbon shadow-panel">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(var(--color-accent),0.3),transparent_34%),radial-gradient(circle_at_76%_0%,rgba(var(--color-accent),0.16),transparent_30%)]" />
        <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between gap-3">
          <span className="rounded-full border border-champagne/35 bg-black/55 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-champagne backdrop-blur">
            {secondsLeft}s
          </span>
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-full border border-champagne/25 bg-black/55 text-lg font-black text-champagne backdrop-blur"
            aria-label="Close why reminder"
          >
            X
          </button>
        </div>
        <div className="relative min-h-[27rem]">
          <div className="absolute inset-0 bg-[url('/rebuild-run.jpg')] bg-cover bg-center opacity-55 grayscale contrast-125 saturate-0" />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.06)_0_1px,transparent_1px_6px)] opacity-30" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(var(--color-accent),0.32),transparent_38%),linear-gradient(0deg,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.76)_52%,rgba(0,0,0,0.3)_100%)]" />
          <div className="relative flex min-h-[27rem] flex-col justify-end p-6">
            <p className="metric-label text-white/70">Remember why</p>
            <h2 className="mt-3 text-2xl font-black leading-tight text-white">
              {firstName ? `${firstName}, remember why you're doing this.` : "Remember why you're doing this."}
            </h2>
            <p className="mt-5 break-words font-display text-3xl font-black uppercase leading-[1.02] text-white drop-shadow-[0_3px_18px_rgba(0,0,0,0.92)]">&ldquo;{why}&rdquo;</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 min-h-12 rounded-2xl bg-champagne px-4 text-base font-black text-[rgb(var(--color-accent-foreground))] shadow-glow"
            >
              Enter REBUILD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function appendLog(data: RebuildData, kind: LogKind, draft: Draft, profile: OnboardingProfile | null): RebuildData {
  const next = cloneMutableData(data);

  if (kind === "weight") {
    next.weights.unshift(weightFromDraft(draft));
  }

  if (kind === "bike") {
    next.bikeSessions.unshift(bikeFromDraft(draft, createId("bike"), "gym", profile, data));
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

  if (kind === "machine") {
    next.machineWorkoutSessions.unshift(machineFromDraft(draft, createId("machine"), profile, data));
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

  if (kind === "water") {
    next.waterLogs.unshift(waterFromDraft(draft));
  }

  if (kind === "sleep") {
    next.sleepLogs.unshift(sleepFromDraft(draft));
  }

  if (kind === "mood") {
    next.behaviorWins.unshift(moodFromDraft(draft));
  }

  return sortDataByDate(next);
}

function updateLog(data: RebuildData, kind: LogKind, id: string, draft: Draft, profile: OnboardingProfile | null): RebuildData {
  const next = cloneMutableData(data);

  if (kind === "weight") {
    next.weights = next.weights.map((entry) =>
      entry.id === id ? weightFromDraft(draft, id, entry.moment) : entry,
    );
  }

  if (kind === "bike") {
    next.bikeSessions = next.bikeSessions.map((session) =>
      session.id === id ? bikeFromDraft(draft, id, session.location, profile, data) : session,
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

  if (kind === "machine") {
    next.machineWorkoutSessions = next.machineWorkoutSessions.map((session) =>
      session.id === id ? machineFromDraft(draft, id, profile, data) : session,
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

  if (kind === "water") {
    next.waterLogs = next.waterLogs.map((entry) =>
      entry.id === id ? waterFromDraft(draft, id) : entry,
    );
  }

  if (kind === "sleep") {
    next.sleepLogs = next.sleepLogs.map((entry) =>
      entry.id === id ? sleepFromDraft(draft, id) : entry,
    );
  }

  if (kind === "mood") {
    next.behaviorWins = next.behaviorWins.map((win) =>
      win.id === id ? moodFromDraft(draft, id) : win,
    );
  }

  return sortDataByDate(next);
}

function deleteLogFromData(data: RebuildData, kind: LogKind, id: string): RebuildData {
  const next = cloneMutableData(data);

  if (kind === "weight") next.weights = next.weights.filter((entry) => entry.id !== id);
  if (kind === "bike") next.bikeSessions = next.bikeSessions.filter((entry) => entry.id !== id);
  if (kind === "jacobsLadder") next.jacobsLadderSessions = next.jacobsLadderSessions.filter((entry) => entry.id !== id);
  if (kind === "pushUps") next.pushUpSessions = next.pushUpSessions.filter((entry) => entry.id !== id);
  if (kind === "dumbbellCurls") next.dumbbellCurlSessions = next.dumbbellCurlSessions.filter((entry) => entry.id !== id);
  if (kind === "strength") next.strengthAccessorySessions = next.strengthAccessorySessions.filter((entry) => entry.id !== id);
  if (kind === "kettlebell") next.kettlebellSessions = next.kettlebellSessions.filter((entry) => entry.id !== id);
  if (kind === "farmerCarries") next.farmerCarrySessions = next.farmerCarrySessions.filter((entry) => entry.id !== id);
  if (kind === "swim") next.swimSessions = next.swimSessions.filter((entry) => entry.id !== id);
  if (kind === "yoga") next.yogaSessions = next.yogaSessions.filter((entry) => entry.id !== id);
  if (kind === "machine") next.machineWorkoutSessions = next.machineWorkoutSessions.filter((entry) => entry.id !== id);
  if (kind === "meal") next.meals = next.meals.filter((entry) => entry.id !== id);
  if (kind === "water") next.waterLogs = next.waterLogs.filter((entry) => entry.id !== id);
  if (kind === "sleep") next.sleepLogs = next.sleepLogs.filter((entry) => entry.id !== id);
  if (kind === "mood") next.behaviorWins = next.behaviorWins.filter((entry) => entry.id !== id);

  return sortDataByDate(next);
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
    machineWorkoutSessions: [...(data.machineWorkoutSessions ?? [])],
    swimSessions: [...(data.swimSessions ?? [])],
    yogaSessions: [...(data.yogaSessions ?? [])],
    meals: [...data.meals],
    waterLogs: [...(data.waterLogs ?? [])],
    sleepLogs: [...(data.sleepLogs ?? [])],
    behaviorWins: [...data.behaviorWins],
  };
}

function sortDataByDate(data: RebuildData): RebuildData {
  return {
    ...data,
    weights: sortByDate(data.weights),
    bikeSessions: sortByDate(data.bikeSessions),
    jacobsLadderSessions: sortByDate(data.jacobsLadderSessions),
    pushUpSessions: sortByDate(data.pushUpSessions),
    dumbbellCurlSessions: sortByDate(data.dumbbellCurlSessions),
    kettlebellSessions: sortByDate(data.kettlebellSessions),
    farmerCarrySessions: sortByDate(data.farmerCarrySessions),
    strengthAccessorySessions: sortByDate(data.strengthAccessorySessions),
    machineWorkoutSessions: sortByDate(data.machineWorkoutSessions),
    swimSessions: sortByDate(data.swimSessions),
    yogaSessions: sortByDate(data.yogaSessions),
    meals: sortByDate(data.meals),
    waterLogs: sortByDate(data.waterLogs),
    sleepLogs: sortByDate(data.sleepLogs),
    behaviorWins: sortByDate(data.behaviorWins),
  };
}

function sortByDate<T extends { date?: string }>(items: T[]) {
  return [...items].sort((a, b) => normalizeLogDate(b.date).localeCompare(normalizeLogDate(a.date)));
}

function weightFromDraft(draft: Draft, id = createId("weight"), moment: "morning" | "bedtime" | "check-in" = "check-in") {
  return {
    id,
    date: dateFromDraft(draft),
    weight: number(draft.weight),
    moment,
  };
}

function bikeFromDraft(
  draft: Draft,
  id = createId("bike"),
  location: "home" | "gym" = "gym",
  profile: OnboardingProfile | null = null,
  data?: RebuildData,
) {
  const savedCalories = number(draft.calories);
  const minutes = number(draft.minutes);
  const resistance = number(draft.resistance);
  const calories = savedCalories > 0 ? savedCalories : estimateDraftActivityCalories("bike", draft, profile, data);
  const savedDistance = number(draft.distanceMiles);
  const estimatedDistance = estimateBikeDistanceMiles({
    calories,
    minutes,
    resistance,
    weightLb: data?.weights[0]?.weight || profile?.currentWeight,
  });

  return {
    id,
    date: dateFromDraft(draft),
    minutes,
    distanceEstimated: savedDistance <= 0 && estimatedDistance > 0,
    distanceMiles: savedDistance > 0 ? savedDistance : estimatedDistance,
    resistance,
    calories,
    notes: text(draft.notes, "Logged from Quick Add."),
    location,
  };
}

function jacobsLadderFromDraft(draft: Draft, id = createId("ladder")) {
  return {
    id,
    date: dateFromDraft(draft),
    duration: text(draft.duration, "0:00"),
    longestContinuous: text(draft.longestContinuous, "0:00"),
  };
}

function pushUpsFromDraft(draft: Draft, id = createId("push")) {
  return {
    id,
    date: dateFromDraft(draft),
    sets: pushUpSetsFromDraft(draft),
  };
}

function dumbbellCurlsFromDraft(draft: Draft, id = createId("curl")) {
  return {
    id,
    date: dateFromDraft(draft),
    exercise: text(draft.exercise, "Dumbbell curls"),
    weight: number(draft.weight),
    repsEachArm: number(draft.repsEachArm),
  };
}

function strengthFromDraft(draft: Draft, id = createId("strength")) {
  return {
    id,
    date: dateFromDraft(draft),
    exercise: text(draft.exercise, "Bench press"),
    weight: number(draft.weight),
    reps: number(draft.reps),
    notes: text(draft.notes, "Logged strength work."),
  };
}

function machineFromDraft(draft: Draft, id = createId("machine"), profile: OnboardingProfile | null = null, data?: RebuildData) {
  const savedCalories = number(draft.calories);

  return {
    id,
    date: dateFromDraft(draft),
    gymName: text(draft.gymName, profile?.homeGymName ?? "Gym"),
    machine: text(draft.machine, "Leg press"),
    category: text(draft.category, "Strength machine"),
    weight: optionalNumber(draft.weight),
    sets: optionalNumber(draft.sets),
    reps: optionalNumber(draft.reps),
    minutes: optionalNumber(draft.minutes),
    distanceMiles: optionalNumber(draft.distanceMiles),
    calories: savedCalories > 0 ? savedCalories : estimateDraftActivityCalories("machine", draft, profile, data),
    notes: text(draft.notes, "Machine work logged."),
  };
}

function kettlebellFromDraft(draft: Draft, id = createId("kb")) {
  return {
    id,
    date: dateFromDraft(draft),
    exercise: text(draft.exercise, "Pass-arounds"),
    weight: number(draft.weight),
    reps: number(draft.reps),
  };
}

function farmerCarriesFromDraft(draft: Draft, id = createId("carry")) {
  return {
    id,
    date: dateFromDraft(draft),
    weightEachHand: number(draft.weightEachHand),
    distanceFeet: number(draft.distanceFeet),
    rounds: number(draft.rounds),
  };
}

function swimFromDraft(draft: Draft, id = createId("swim")) {
  return {
    id,
    date: dateFromDraft(draft),
    minutes: number(draft.minutes),
    distance: number(draft.distance),
    stroke: text(draft.stroke, "Freestyle"),
    notes: text(draft.notes, "Technique work."),
  };
}

function yogaFromDraft(draft: Draft, id = createId("yoga")) {
  return {
    id,
    date: dateFromDraft(draft),
    minutes: number(draft.minutes),
    focus: text(draft.focus, "Mobility"),
    notes: text(draft.notes, "Recovery session."),
  };
}

function mealFromDraft(draft: Draft, id = createId("meal")) {
  return {
    id,
    date: dateFromDraft(draft),
    name: text(draft.name, "Meal"),
    calories: number(draft.calories),
    protein: number(draft.protein),
    notes: text(draft.notes, "Quick logged."),
  };
}

function waterFromDraft(draft: Draft, id = createId("water")) {
  return {
    id,
    date: dateFromDraft(draft),
    ounces: number(draft.ounces),
  };
}

function sleepFromDraft(draft: Draft, id = createId("sleep")) {
  const quality = text(draft.quality, "good");

  return {
    id,
    date: dateFromDraft(draft),
    hours: number(draft.hours),
    quality: ["low", "okay", "good", "great"].includes(quality) ? quality as "low" | "okay" | "good" | "great" : "good",
    notes: text(draft.notes, "Sleep logged."),
  };
}

function moodFromDraft(draft: Draft, id = createId("win")) {
  return {
    id,
    date: dateFromDraft(draft),
    reason: text(draft.reason, "stress") as MoodReason,
    label: text(draft.label, "Stayed present"),
    didntSmoke: true,
    didntSpiral: true,
  };
}

function draftFromLog(data: RebuildData, kind: LogKind, id: string): Draft | null {
  if (kind === "weight") {
    const entry = data.weights.find((item) => item.id === id);
    return entry ? { date: editDate(entry.date), weight: String(entry.weight) } : null;
  }

  if (kind === "bike") {
    const session = data.bikeSessions.find((item) => item.id === id);
    return session
      ? {
          date: editDate(session.date),
          minutes: String(session.minutes),
          distanceMiles: session.distanceEstimated ? "" : String(session.distanceMiles ?? ""),
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
          date: editDate(session.date),
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
      date: editDate(session.date),
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
          date: editDate(session.date),
          exercise: session.exercise ?? "Dumbbell curls",
          weight: String(session.weight),
          repsEachArm: String(session.repsEachArm),
        }
      : null;
  }

  if (kind === "strength") {
    const session = data.strengthAccessorySessions.find((item) => item.id === id);
    return session
      ? {
          date: editDate(session.date),
          exercise: session.exercise,
          weight: String(session.weight),
          reps: String(session.reps),
          notes: session.notes,
        }
      : null;
  }

  if (kind === "machine") {
    const session = data.machineWorkoutSessions.find((item) => item.id === id);
    return session
      ? {
          date: editDate(session.date),
          gymName: session.gymName ?? "",
          machine: session.machine,
          category: session.category ?? "Strength machine",
          weight: String(session.weight ?? ""),
          sets: String(session.sets ?? ""),
          reps: String(session.reps ?? ""),
          minutes: String(session.minutes ?? ""),
          distanceMiles: String(session.distanceMiles ?? ""),
          calories: String(session.calories ?? ""),
          notes: session.notes,
        }
      : null;
  }

  if (kind === "kettlebell") {
    const session = data.kettlebellSessions.find((item) => item.id === id);
    return session
      ? {
          date: editDate(session.date),
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
          date: editDate(session.date),
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
          date: editDate(session.date),
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
          date: editDate(session.date),
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
          date: normalizeLogDate(meal.date, getTodayIso()),
          name: meal.name,
          calories: String(meal.calories),
          protein: String(meal.protein),
          notes: meal.notes,
          selectedFoods: "",
        }
      : null;
  }

  if (kind === "water") {
    const entry = data.waterLogs.find((item) => item.id === id);
    return entry
      ? {
          date: editDate(entry.date),
          ounces: String(entry.ounces),
        }
      : null;
  }

  if (kind === "sleep") {
    const entry = data.sleepLogs.find((item) => item.id === id);
    return entry
      ? {
          date: editDate(entry.date),
          hours: String(entry.hours),
          quality: entry.quality,
          notes: entry.notes,
        }
      : null;
  }

  if (kind === "mood") {
    const win = data.behaviorWins.find((item) => item.id === id);
    return win
      ? {
          date: editDate(win.date),
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

function optionalNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function dateFromDraft(draft: Draft) {
  return normalizeLogDate(text(draft.date, getTodayIso()), getTodayIso());
}

function editDate(value: string) {
  return normalizeLogDate(value, getTodayIso());
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
    dumbbellCurls: "Dumbbell work",
    strength: "Strength lift",
    machine: "Gym machine",
    kettlebell: "Kettlebell work",
    farmerCarries: "Farmer carries",
    swim: "Swim",
    yoga: "Yoga",
    meal: "Meal",
    water: "Water",
    sleep: "Sleep",
    mood: "Pattern interrupt",
  };

  return labels[kind];
}
