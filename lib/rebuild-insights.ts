import type { LogKind, OnboardingProfile, RebuildData } from "@/types/rebuild";
import { bikeDistanceForSession } from "@/lib/bike-distance";
import {
  daysBetweenCalendarDates,
  formatLogDate,
  getBestJacobsLadderTime,
  getPushUpMaxSet,
  getRecentLowWeight,
  getSevenDayAverageWeight,
  getTodayIso,
  getTodaysCalories,
  getTodaysProtein,
  getTodaysWaterOunces,
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

  const weeklyGoal = getWeeklyMovementGoal(profile);
  const workouts = weeklyWorkoutSessions(data);
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
      detail: `${streak} day${streak === 1 ? "" : "s"} in a row with at least one saved log.`,
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
    const starters = [
      "your rebuild starts with one honest entry. Log a weigh-in, one movement session, or one pattern interrupt and the app will start reflecting the trend back.",
      "the first entry does not need to be impressive. It just needs to be true enough to give tomorrow something to build from.",
      "start with the cleanest signal: body weight, movement, food, water, sleep, or one better choice. The system wakes up after the first log.",
    ];
    return `${prefix}${pickDailyInsight(starters, "empty")}`;
  }

  const bikeMinutes = getWeeklyBikeMinutes(data);
  const bestPush = getPushUpMaxSet(data);
  const totalPushUps = getTotalPushUps(data);
  const patternCount = data.behaviorWins.length;
  const latestWeight = data.weights[0]?.weight;
  const weightDelta = getWeightChangeFromLast(data);
  const todaysProtein = getTodaysProtein(data);
  const todaysCalories = getTodaysCalories(data);
  const todaysWater = getTodaysWaterOunces(data);
  const workouts = workoutSessions(data);
  const todaysWorkouts = workouts.filter((workout) => isToday(workout.date));
  const latestWorkout = workouts.toSorted((a, b) => b.date.localeCompare(a.date))[0];
  const streak = activeStreak(data);
  const longestLadderSeconds = Math.max(0, ...data.jacobsLadderSessions.map((session) => timeToSeconds(session.longestContinuous || session.duration)));
  const machineCount = data.machineWorkoutSessions.length;
  const kettlebellReps = data.kettlebellSessions.reduce((sum, session) => sum + session.reps, 0);
  const swimMinutes = data.swimSessions.reduce((sum, session) => sum + session.minutes, 0);
  const yogaMinutes = data.yogaSessions.reduce((sum, session) => sum + session.minutes, 0);
  const latestSleep = data.sleepLogs[0];
  const candidates: string[] = [];

  if (patternCount >= 2) {
    candidates.push(`you have ${patternCount} pattern interrupts logged. That is not motivation; it is replacement behavior showing up in the record.`);
  }

  if (bikeMinutes > 0) {
    candidates.push(`you have ${bikeMinutes} bike minutes logged this week. If your legs feel flat tomorrow, recovery work still counts as keeping the promise.`);
  }

  if (bestPush > 0) {
    candidates.push(`your best push-up set is ${bestPush}. The next useful target is not heroic; it is one cleaner set than last time.`);
  }

  if (totalPushUps >= 20) {
    candidates.push(`you have ${totalPushUps} total push-ups saved. That number matters because it is accumulated identity, not one perfect workout.`);
  }

  if (latestWeight) {
    const direction = data.weights.length > 1 ? `, ${weightDelta > 0 ? "up" : "down"} ${Math.abs(weightDelta).toFixed(1)} lb from the last weigh-in` : "";
    candidates.push(`your current logged weight is ${latestWeight.toFixed(1)} lb${direction}. Keep weighing in the same way so the trend stays honest.`);
  }

  if (streak >= 2) {
    candidates.push(`${streak} days in a row have at least one saved log. The streak is useful because it proves the floor is getting stronger.`);
  }

  if (todaysWorkouts.length >= 2) {
    candidates.push(`today already has ${todaysWorkouts.length} movement logs. The next high-return move might be food, water, or sleep so the training has somewhere to land.`);
  } else if (latestWorkout) {
    candidates.push(`your latest saved session was ${latestWorkout.title.toLowerCase()} with ${latestWorkout.detail}. The next session should make the pattern easier to repeat, not harder to recover from.`);
  }

  if (longestLadderSeconds > 0) {
    candidates.push(`your best Jacob's Ladder effort is ${formatSeconds(longestLadderSeconds)}. That machine rewards patience; one controlled round is better than one sloppy sprint.`);
  }

  if (machineCount > 0) {
    const latestMachine = data.machineWorkoutSessions[0];
    candidates.push(`you have ${machineCount} gym machine log${machineCount === 1 ? "" : "s"} saved. ${latestMachine.machine} is now part of the record, so load and reps can start telling a real story.`);
  }

  if (kettlebellReps > 0) {
    candidates.push(`you have ${kettlebellReps} kettlebell reps saved. Keep the hinge clean and let the weight follow the form, not the other way around.`);
  }

  if (todaysProtein > 0) {
    candidates.push(`you have ${todaysProtein}g protein logged today. That is the kind of boring anchor that makes the training count later.`);
  } else if (todaysCalories > 0) {
    candidates.push(`you have food logged today, but no protein signal yet. Add one protein anchor and the nutrition picture gets much more useful.`);
  } else if (data.meals.length > 0) {
    candidates.push("no food is logged yet today. One boring protein entry is enough to keep the day visible.");
  }

  if (todaysWater > 0) {
    candidates.push(`you have ${todaysWater} oz of water logged today. Hydration is not dramatic, but it changes how tomorrow's training feels.`);
  }

  if (latestSleep) {
    candidates.push(`your last sleep log was ${latestSleep.hours} hours and marked ${latestSleep.quality}. Recovery is part of the rebuild, not time away from it.`);
  }

  if (swimMinutes > 0) {
    candidates.push(`you have ${swimMinutes} swim minutes saved. That gives you a low-impact lane for conditioning when joints or legs need a break.`);
  }

  if (yogaMinutes > 0) {
    candidates.push(`you have ${yogaMinutes} yoga or mobility minutes saved. That is not filler; it is maintenance for the body doing the work.`);
  }

  if (!candidates.length) {
    candidates.push("you have logs in the system now. The next entry does not need to be dramatic; it needs to be real.");
  }

  return `${prefix}${pickDailyInsight(candidates, `${profile?.coachingTone ?? "calm"}:${totalProofCount(data)}`)}`;
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
    detail: getWeeklyBikeDistance(data) ? "Current bike distance, with estimates when mileage was not entered." : "First ride unlocks estimated bike miles.",
    history: data.bikeSessions.map((session) => bikeDistanceForSession(session)),
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
    detail: "Days in a row with at least one saved log.",
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
  const goal = getWeeklyMovementGoal(profile);
  const sessions = weeklyWorkoutSessions(data).length;
  return {
    goal,
    percent: clamp((sessions / goal) * 100),
    sessions,
    summary: sessions ? `You've logged ${sessions} movement session${sessions === 1 ? "" : "s"} this week against a ${goal}-session target.` : "Your first workout this week will start the consistency line.",
  };
}

export function getWeeklyMovementGoal(profile: OnboardingProfile | null) {
  const goals = [...(profile?.goals ?? []), profile?.goal ?? ""].join(" ").toLowerCase();
  const preferredMinutes = profile?.preferredTrainingMinutes ?? 25;
  let target = 5;

  if (preferredMinutes >= 45) target -= 1;
  if (preferredMinutes <= 20) target += 1;
  if (goals.includes("cardio") || goals.includes("weight") || goals.includes("discipline")) target += 1;
  if (goals.includes("strength") || goals.includes("muscle")) target = Math.max(target, 5);
  if (goals.includes("stress") || goals.includes("sleep") || goals.includes("recovery")) target = Math.max(4, target - 1);

  return Math.max(4, Math.min(6, target));
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
    ...data.bikeSessions.map((item) => {
      const distance = bikeDistanceForSession(item);
      return {
        date: normalizeLogDate(item.date),
        detail: `${item.minutes} min${distance ? ` · ${distance} mi${item.distanceEstimated || !item.distanceMiles ? " est." : ""}` : ""}`,
        kind: "bike" as LogKind,
        minutes: item.minutes,
        title: "Bike session",
      };
    }),
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

function weeklyWorkoutSessions(data: RebuildData) {
  return workoutSessions(data).filter((session) => isCurrentWeek(session.date));
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

function pickDailyInsight(insights: string[], seed: string) {
  const cleanInsights = insights.filter(Boolean);
  if (!cleanInsights.length) return "";
  return cleanInsights[dailyIndex(`${getTodayIso()}:${seed}`, cleanInsights.length)] ?? cleanInsights[0];
}

function dailyIndex(seed: string, count: number) {
  if (count <= 1) return 0;
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash % count;
}

function formatSeconds(seconds: number) {
  const cleanSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(cleanSeconds / 60);
  const remainder = cleanSeconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
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

function isCurrentWeek(iso: string) {
  const today = getTodayIso();
  const dayOfWeek = dateFromIso(today).getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const start = addDays(today, mondayOffset);
  const end = addDays(start, 6);
  const normalized = normalizeLogDate(iso);

  return normalized >= start && normalized <= end;
}

function dateFromIso(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
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
