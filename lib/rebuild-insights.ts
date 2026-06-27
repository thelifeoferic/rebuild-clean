import type { LogKind, OnboardingProfile, RebuildData } from "@/types/rebuild";
import {
  daysBetweenCalendarDates,
  formatLogDate,
  getBestJacobsLadderTime,
  getPushUpMaxSet,
  getRecentLowWeight,
  getSevenDayAverageWeight,
  getTodayIso,
  getTotalPushUps,
  getWeightChangeFromLast,
  getWeeklyBikeDistance,
  getWeeklyBikeMinutes,
  isToday,
  normalizeLogDate,
  timeToSeconds,
} from "@/lib/rebuild-data";
import { formatWeight } from "@/lib/metrics";

type ScoreSignal = {
  label: string;
  score: number;
  weight: number;
  detail: string;
};

export type RebuildScore = {
  deltaLabel: string;
  signals: ScoreSignal[];
  value: number | null;
};

export type PersonalRecord = {
  detail: string;
  history: number[];
  icon: "bike" | "distance" | "push" | "ladder" | "carry" | "machine" | "streak" | "scale" | "pattern" | "duration";
  label: string;
  logKind?: LogKind;
  sortValue: number;
  unit?: string;
  value: string;
  when?: string;
};

export function hasAnyProof(data: RebuildData) {
  return totalProofCount(data) > 0;
}

export function getRebuildDay(data: RebuildData) {
  const startDate = getRebuildStartDate(data);
  if (!startDate) return 1;
  return Math.max(1, daysBetweenCalendarDates(startDate, getTodayIso()) + 1);
}

export function getRebuildScore(data: RebuildData, profile: OnboardingProfile | null): RebuildScore {
  if (!hasAnyProof(data)) {
    return {
      deltaLabel: "First log sets the baseline",
      signals: [],
      value: null,
    };
  }

  const weeklyGoal = Math.max(1, Math.round((profile?.preferredTrainingMinutes ?? 25) >= 30 ? 4 : 3));
  const workouts = workoutSessions(data);
  const workoutScore = clamp((workouts.length / weeklyGoal) * 100);
  const patternScore = clamp((data.behaviorWins.length / 3) * 100);
  const weightScore = weightTrendScore(data, profile);
  const streak = activeStreak(data);
  const streakScore = clamp((streak / 7) * 100);
  const foodWaterScore = clamp(((data.meals.length + data.waterLogs.length) / 7) * 100);
  const sleepScore = data.sleepLogs.length ? clamp((data.sleepLogs.length / 4) * 100) : 50;

  const signals: ScoreSignal[] = [
    {
      detail: `${workouts.length}/${weeklyGoal} movement sessions saved.`,
      label: "Workout consistency",
      score: workoutScore,
      weight: 30,
    },
    {
      detail: `${data.behaviorWins.length} better-choice moments logged.`,
      label: "Pattern interrupts",
      score: patternScore,
      weight: 20,
    },
    {
      detail: data.weights.length > 1 ? `${formatWeight(Math.abs(getWeightChangeFromLast(data)))} change from last weigh-in.` : "First weigh-in is the baseline.",
      label: "Weight trend",
      score: weightScore,
      weight: 20,
    },
    {
      detail: `${streak} active day${streak === 1 ? "" : "s"} with proof.`,
      label: "Streak length",
      score: streakScore,
      weight: 15,
    },
    {
      detail: `${data.meals.length} food logs and ${data.waterLogs.length} water logs.`,
      label: "Food and water",
      score: foodWaterScore,
      weight: 10,
    },
    {
      detail: data.sleepLogs.length ? `${data.sleepLogs.length} sleep logs saved.` : "Sleep logs will refine this signal later.",
      label: "Sleep",
      score: sleepScore,
      weight: 5,
    },
  ];

  const value = Math.round(
    signals.reduce((sum, signal) => sum + signal.score * (signal.weight / 100), 0),
  );

  return {
    deltaLabel: value >= 80 ? "Stable high signal" : value >= 55 ? "Baseline building" : "More proof needed",
    signals,
    value: clamp(value),
  };
}

export function getCoachInsight(data: RebuildData, profile: OnboardingProfile | null) {
  const firstName = profile?.firstName?.trim();
  const prefix = firstName ? `${firstName}, ` : "";

  if (!hasAnyProof(data)) {
    return `${prefix}your rebuild starts with one honest entry. Log a weigh-in, one movement session, or one pattern interrupt and the app will start reflecting the trend back.`;
  }

  const bikeMinutes = getWeeklyBikeMinutes(data);
  const bestPush = getPushUpMaxSet(data);
  const patternCount = data.behaviorWins.length;
  const latestWeight = data.weights[0]?.weight;
  const weightDelta = getWeightChangeFromLast(data);

  if (patternCount >= 2) {
    return `${prefix}you have ${patternCount} pattern interrupts logged. That is not motivation, it is replacement behavior showing up in the record.`;
  }

  if (bikeMinutes > 0) {
    return `${prefix}you have ${bikeMinutes} bike minutes logged this week. If your legs feel flat tomorrow, recovery work still counts as keeping the promise.`;
  }

  if (bestPush > 0) {
    return `${prefix}your best push-up set is ${bestPush}. The next useful target is not heroic; it is one cleaner set than last time.`;
  }

  if (latestWeight) {
    const direction = data.weights.length > 1 ? `, ${weightDelta > 0 ? "up" : "down"} ${Math.abs(weightDelta).toFixed(1)} lb from the last weigh-in` : "";
    return `${prefix}your current logged weight is ${latestWeight.toFixed(1)} lb${direction}. Keep weighing in the same way so the trend stays honest.`;
  }

  return `${prefix}you have proof in the system now. The next entry does not need to be dramatic; it needs to be real.`;
}

export function getPersonalRecords(data: RebuildData): PersonalRecord[] {
  const records: PersonalRecord[] = [];
  const longestRide = maxBy(data.bikeSessions, (session) => session.minutes);
  const bestPushSession = maxBy(data.pushUpSessions, (session) => Math.max(0, ...session.sets));
  const totalPushUps = getTotalPushUps(data);
  const cumulativePushUpHistory = data.pushUpSessions.toReversed().reduce<number[]>((history, session) => {
    const sessionTotal = session.sets.reduce((sum, reps) => sum + reps, 0);
    history.push((history.at(-1) ?? 0) + sessionTotal);
    return history;
  }, []);
  const longestLadder = maxBy(data.jacobsLadderSessions, (session) => timeToSeconds(session.longestContinuous || session.duration));
  const heaviestCarry = maxBy(data.farmerCarrySessions, (session) => session.weightEachHand);
  const heaviestMachine = maxBy(data.machineWorkoutSessions, (session) => session.weight ?? 0);
  const lowestWeight = getRecentLowWeight(data);
  const longestWorkout = longestSingleWorkout(data);

  records.push({
    detail: longestRide ? "Longest single bike session." : "First ride sets the record.",
    history: data.bikeSessions.map((session) => session.minutes),
    icon: "bike",
    label: "Longest Ride",
    logKind: "bike",
    sortValue: longestRide?.minutes ?? 0,
    unit: "min",
    value: longestRide ? `${longestRide.minutes}` : "—",
    when: longestRide ? formatLogDate(longestRide.date) : undefined,
  });

  records.push({
    detail: getWeeklyBikeDistance(data) ? "Current saved bike distance." : "Log bike distance to unlock this.",
    history: data.bikeSessions.map((session) => session.distanceMiles ?? 0),
    icon: "distance",
    label: "Bike Miles",
    logKind: "bike",
    sortValue: getWeeklyBikeDistance(data),
    unit: "mi",
    value: getWeeklyBikeDistance(data) ? getWeeklyBikeDistance(data).toFixed(1) : "—",
    when: getWeeklyBikeDistance(data) ? "This week" : undefined,
  });

  records.push({
    detail: bestPushSession ? "Best single set saved." : "First push-up set sets the record.",
    history: data.pushUpSessions.flatMap((session) => session.sets),
    icon: "push",
    label: "Best Push-up Set",
    logKind: "pushUps",
    sortValue: getPushUpMaxSet(data),
    unit: "reps",
    value: getPushUpMaxSet(data) ? `${getPushUpMaxSet(data)}` : "—",
    when: bestPushSession ? formatLogDate(bestPushSession.date) : undefined,
  });

  records.push({
    detail: totalPushUps ? "All saved push-up reps across your rebuild." : "Every logged set adds to this.",
    history: cumulativePushUpHistory,
    icon: "push",
    label: "Total Push-ups",
    logKind: "pushUps",
    sortValue: totalPushUps,
    unit: "reps",
    value: totalPushUps ? `${totalPushUps}` : "—",
    when: totalPushUps ? "All time" : undefined,
  });

  records.push({
    detail: longestLadder ? "Longest continuous effort." : "First ladder attempt sets the record.",
    history: data.jacobsLadderSessions.map((session) => timeToSeconds(session.longestContinuous)),
    icon: "ladder",
    label: "Jacob's Ladder",
    logKind: "jacobsLadder",
    sortValue: longestLadder ? timeToSeconds(longestLadder.longestContinuous) : 0,
    value: longestLadder ? getBestJacobsLadderTime(data) : "—",
    when: longestLadder ? formatLogDate(longestLadder.date) : undefined,
  });

  records.push({
    detail: heaviestCarry ? "Heaviest each-hand load." : "First carry sets the record.",
    history: data.farmerCarrySessions.map((session) => session.weightEachHand),
    icon: "carry",
    label: "Heaviest Carry",
    logKind: "farmerCarries",
    sortValue: heaviestCarry?.weightEachHand ?? 0,
    unit: "lb",
    value: heaviestCarry ? `${heaviestCarry.weightEachHand}` : "—",
    when: heaviestCarry ? formatLogDate(heaviestCarry.date) : undefined,
  });

  records.push({
    detail: heaviestMachine ? `${heaviestMachine.machine} is the current heaviest machine load.` : "First machine session sets the record.",
    history: data.machineWorkoutSessions.map((session) => session.weight ?? 0),
    icon: "machine",
    label: "Machine Load",
    logKind: "machine",
    sortValue: heaviestMachine?.weight ?? 0,
    unit: "lb",
    value: heaviestMachine?.weight ? `${heaviestMachine.weight}` : "—",
    when: heaviestMachine ? formatLogDate(heaviestMachine.date) : undefined,
  });

  records.push({
    detail: "Consecutive days with any saved proof.",
    history: [activeStreak(data)],
    icon: "streak",
    label: "Active Streak",
    sortValue: activeStreak(data),
    unit: "days",
    value: activeStreak(data) ? `${activeStreak(data)}` : "—",
    when: activeStreak(data) ? "Current" : undefined,
  });

  records.push({
    detail: lowestWeight ? "Lowest logged weight." : "First weigh-in sets the record.",
    history: data.weights.map((entry) => entry.weight),
    icon: "scale",
    label: "Lowest Weight",
    logKind: "weight",
    sortValue: lowestWeight,
    unit: "lb",
    value: lowestWeight ? lowestWeight.toFixed(1) : "—",
    when: data.weights.find((entry) => entry.weight === lowestWeight)?.date
      ? formatLogDate(data.weights.find((entry) => entry.weight === lowestWeight)?.date)
      : undefined,
  });

  records.push({
    detail: data.behaviorWins.length ? "Most replacement moments saved." : "First pattern interrupt starts this record.",
    history: [data.behaviorWins.length],
    icon: "pattern",
    label: "Pattern Interrupts",
    logKind: "mood",
    sortValue: data.behaviorWins.length,
    unit: "week",
    value: data.behaviorWins.length ? `${data.behaviorWins.length}` : "—",
    when: data.behaviorWins.length ? "This week" : undefined,
  });

  records.push({
    detail: longestWorkout.detail,
    history: longestWorkout.history,
    icon: "duration",
    label: "Longest Workout",
    logKind: longestWorkout.logKind,
    sortValue: longestWorkout.minutes,
    unit: "min",
    value: longestWorkout.minutes ? `${longestWorkout.minutes}` : "—",
    when: longestWorkout.when,
  });

  return records;
}

export function getRecentQuickWin(data: RebuildData) {
  const win = data.behaviorWins[0];
  if (win) return { title: "Pattern interrupted", detail: normalizePatternLabel(win.label), kind: "mood" as LogKind };

  const workout = workoutSessions(data)[0];
  if (workout) return { title: workout.title, detail: workout.detail, kind: workout.kind };

  return null;
}

export function getWeeklyConsistency(data: RebuildData, profile: OnboardingProfile | null) {
  const goal = Math.max(3, Math.round(((profile?.preferredTrainingMinutes ?? 25) / 30) * 4));
  const sessions = workoutSessions(data).length;
  return {
    goal,
    percent: clamp((sessions / goal) * 100),
    sessions,
    summary: sessions ? `You've logged ${sessions} movement session${sessions === 1 ? "" : "s"} against a ${goal}-session weekly target.` : "Your first workout will start the weekly consistency line.",
  };
}

export function allProofDates(data: RebuildData) {
  return [
    ...data.weights.map((item) => normalizeLogDate(item.date)),
    ...workoutSessions(data).map((item) => item.date),
    ...data.meals.map((item) => normalizeLogDate(item.date)),
    ...data.waterLogs.map((item) => normalizeLogDate(item.date)),
    ...data.sleepLogs.map((item) => normalizeLogDate(item.date)),
    ...data.behaviorWins.map((item) => normalizeLogDate(item.date)),
  ];
}

function workoutSessions(data: RebuildData) {
  return [
    ...data.bikeSessions.map((item) => ({ date: normalizeLogDate(item.date), detail: `${item.minutes} min${item.distanceMiles ? ` · ${item.distanceMiles} mi` : ""}`, kind: "bike" as LogKind, minutes: item.minutes, title: "Bike session" })),
    ...data.jacobsLadderSessions.map((item) => ({ date: normalizeLogDate(item.date), detail: `${item.duration} total · ${item.longestContinuous} continuous`, kind: "jacobsLadder" as LogKind, minutes: Math.round(timeToSeconds(item.duration) / 60), title: "Jacob's Ladder" })),
    ...data.pushUpSessions.map((item) => ({ date: normalizeLogDate(item.date), detail: `${item.sets.reduce((sum, reps) => sum + reps, 0)} total reps`, kind: "pushUps" as LogKind, minutes: 5, title: "Push-ups" })),
    ...data.dumbbellCurlSessions.map((item) => ({ date: normalizeLogDate(item.date), detail: `${item.weight} lb · ${item.repsEachArm * 2} total reps`, kind: "dumbbellCurls" as LogKind, minutes: 8, title: item.exercise ?? "Dumbbell curls" })),
    ...data.strengthAccessorySessions.map((item) => ({ date: normalizeLogDate(item.date), detail: `${item.weight} lb · ${item.reps} reps`, kind: "strength" as LogKind, minutes: 20, title: item.exercise })),
    ...data.machineWorkoutSessions.map((item) => ({ date: normalizeLogDate(item.date), detail: machineWorkoutDetail(item), kind: "machine" as LogKind, minutes: item.minutes ?? Math.max((item.sets ?? 0) * 4, 8), title: item.machine })),
    ...data.kettlebellSessions.map((item) => ({ date: normalizeLogDate(item.date), detail: `${item.weight} lb · ${item.reps} reps`, kind: "kettlebell" as LogKind, minutes: 12, title: item.exercise })),
    ...data.farmerCarrySessions.map((item) => ({ date: normalizeLogDate(item.date), detail: `${item.weightEachHand} lb each hand · ${item.distanceFeet * item.rounds} ft`, kind: "farmerCarries" as LogKind, minutes: 8, title: "Farmer carries" })),
    ...data.swimSessions.map((item) => ({ date: normalizeLogDate(item.date), detail: `${item.minutes} min · ${item.distance} yd`, kind: "swim" as LogKind, minutes: item.minutes, title: "Swim" })),
    ...data.yogaSessions.map((item) => ({ date: normalizeLogDate(item.date), detail: `${item.minutes} min · ${item.focus}`, kind: "yoga" as LogKind, minutes: item.minutes, title: "Yoga" })),
  ];
}

function machineWorkoutDetail(item: RebuildData["machineWorkoutSessions"][number]) {
  const load = item.weight ? `${item.weight} lb` : item.category ?? "machine";
  const reps = item.sets && item.reps ? ` · ${item.sets} x ${item.reps}` : "";
  const time = item.minutes ? ` · ${item.minutes} min` : "";
  const distance = item.distanceMiles ? ` · ${item.distanceMiles} mi` : "";
  return `${load}${reps}${time}${distance}`;
}

function longestSingleWorkout(data: RebuildData) {
  const workouts = workoutSessions(data);
  const longest = maxBy(workouts, (item) => item.minutes);
  return {
    detail: longest ? longest.detail : "First timed session sets the record.",
    history: workouts.map((item) => item.minutes),
    logKind: longest?.kind,
    minutes: longest?.minutes ?? 0,
    when: longest?.date,
  };
}

function weightTrendScore(data: RebuildData, profile: OnboardingProfile | null) {
  if (!data.weights.length) return 0;
  if (data.weights.length < 2) return 55;

  const latest = data.weights[0].weight;
  const previous = data.weights[1].weight;
  const target = profile?.targetWeight;

  if (!target) return latest <= previous ? 75 : 45;
  if (target < previous) return latest <= previous ? 85 : 45;
  if (target > previous) return latest >= previous ? 85 : 45;
  return 60;
}

function activeStreak(data: RebuildData) {
  const dates = new Set(uniqueDates(allProofDates(data)));
  if (!dates.size) return 0;

  let cursor = dates.has(getTodayIso()) ? getTodayIso() : addDays(getTodayIso(), -1);
  let streak = 0;
  while (dates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function totalProofCount(data: RebuildData) {
  return (
    data.weights.length +
    workoutSessions(data).length +
    data.meals.length +
    data.waterLogs.length +
    data.sleepLogs.length +
    data.behaviorWins.length
  );
}

function maxBy<T>(items: T[], valueFor: (item: T) => number) {
  return items.reduce<T | null>((best, item) => {
    if (!best) return item;
    return valueFor(item) > valueFor(best) ? item : best;
  }, null);
}

function uniqueDates(dates: string[]) {
  return Array.from(new Set(dates.filter(Boolean)));
}

function getRebuildStartDate(data: RebuildData) {
  const dates = uniqueDates(allProofDates(data)).sort();
  return dates[0] ?? null;
}

function addDays(iso: string, days: number) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizePatternLabel(label: string) {
  const clean = label
    .replace(/did(n't| not) smoke/gi, "interrupted the old loop")
    .replace(/did(n't| not) spiral/gi, "stayed present")
    .replace(/chose the reset instead of the old loop/gi, "Stayed with the better choice");

  return clean.includes("→") ? clean : `Pattern interrupted → ${clean}`;
}
