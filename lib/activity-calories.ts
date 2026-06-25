import { isToday, timeToSeconds } from "@/lib/rebuild-data";
import type { LogKind, OnboardingProfile, RebuildData } from "@/types/rebuild";

type DraftLike = Record<string, unknown>;

export type DailyCalorieGuide = {
  activityBurn: number;
  baseGuide: number;
  eaten: number;
  remaining: number;
  totalGuide: number;
};

export type ActivityCalorieBreakdownItem = {
  calories: number;
  detail: string;
  label: string;
};

export function getDailyCalorieGuide(data: RebuildData, profile: OnboardingProfile | null, eaten: number): DailyCalorieGuide {
  const activityBurn = getTodaysActivityCalories(data, profile);
  const baseGuide = getBaseCalorieGuide(data, profile);
  const totalGuide = baseGuide + activityBurn;

  return {
    activityBurn,
    baseGuide,
    eaten,
    remaining: totalGuide - eaten,
    totalGuide,
  };
}

export function getTodaysActivityCalories(data: RebuildData, profile: OnboardingProfile | null) {
  return getActivityCalorieBreakdown(data, profile).reduce((sum, item) => sum + item.calories, 0);
}

export function getActivityCalorieBreakdown(data: RebuildData, profile: OnboardingProfile | null): ActivityCalorieBreakdownItem[] {
  const weightLb = getReferenceWeight(data, profile);
  const items: ActivityCalorieBreakdownItem[] = [];

  const bikeCalories = data.bikeSessions
    .filter((session) => isToday(session.date))
    .reduce((sum, session) => sum + (session.calories > 0 ? session.calories : caloriesFromMinutes(session.minutes, 7.2, weightLb)), 0);
  if (bikeCalories) {
    const minutes = data.bikeSessions.filter((session) => isToday(session.date)).reduce((sum, session) => sum + session.minutes, 0);
    items.push({ calories: Math.round(bikeCalories), detail: `${minutes} min logged`, label: "Bike" });
  }

  const ladderCalories = data.jacobsLadderSessions
    .filter((session) => isToday(session.date))
    .reduce((sum, session) => sum + caloriesFromMinutes(Math.max(timeToSeconds(session.duration) / 60, 1), 9.0, weightLb), 0);
  if (ladderCalories) {
    const seconds = data.jacobsLadderSessions.filter((session) => isToday(session.date)).reduce((sum, session) => sum + timeToSeconds(session.duration), 0);
    items.push({ calories: Math.round(ladderCalories), detail: `${Math.round(seconds / 60)} min total`, label: "Jacob's Ladder" });
  }

  const pushUpCalories = data.pushUpSessions
    .filter((session) => isToday(session.date))
    .reduce((sum, session) => {
      const reps = session.sets.reduce((innerSum, set) => innerSum + set, 0);
      return sum + caloriesFromMinutes(Math.max(reps * 0.18, 4), 6.8, weightLb);
    }, 0);
  if (pushUpCalories) {
    const reps = data.pushUpSessions
      .filter((session) => isToday(session.date))
      .flatMap((session) => session.sets)
      .reduce((sum, set) => sum + set, 0);
    items.push({ calories: Math.round(pushUpCalories), detail: `${reps} total reps`, label: "Push-ups" });
  }

  const curlCalories = data.dumbbellCurlSessions
    .filter((session) => isToday(session.date))
    .reduce((sum, session) => sum + caloriesFromMinutes(Math.max(session.repsEachArm * 2 * 0.12, 4), 4.0, weightLb), 0);
  if (curlCalories) {
    const reps = data.dumbbellCurlSessions
      .filter((session) => isToday(session.date))
      .reduce((sum, session) => sum + session.repsEachArm * 2, 0);
    items.push({ calories: Math.round(curlCalories), detail: `${reps} total reps`, label: "Dumbbell work" });
  }

  const strengthCalories = data.strengthAccessorySessions
    .filter((session) => isToday(session.date))
    .reduce((sum, session) => sum + caloriesFromMinutes(Math.max(session.reps * 0.2, 8), 5.0, weightLb), 0);
  if (strengthCalories) {
    items.push({
      calories: Math.round(strengthCalories),
      detail: `${data.strengthAccessorySessions.filter((session) => isToday(session.date)).length} lift log${data.strengthAccessorySessions.filter((session) => isToday(session.date)).length === 1 ? "" : "s"}`,
      label: "Strength",
    });
  }

  const kettlebellCalories = data.kettlebellSessions
    .filter((session) => isToday(session.date))
    .reduce((sum, session) => sum + caloriesFromMinutes(Math.max(session.reps * 0.08, 6), 8.0, weightLb), 0);
  if (kettlebellCalories) {
    const reps = data.kettlebellSessions.filter((session) => isToday(session.date)).reduce((sum, session) => sum + session.reps, 0);
    items.push({ calories: Math.round(kettlebellCalories), detail: `${reps} reps logged`, label: "Kettlebell" });
  }

  const carryCalories = data.farmerCarrySessions
    .filter((session) => isToday(session.date))
    .reduce((sum, session) => sum + caloriesFromMinutes(Math.max(session.rounds * 2, 4), 6.5, weightLb), 0);
  if (carryCalories) {
    const feet = data.farmerCarrySessions
      .filter((session) => isToday(session.date))
      .reduce((sum, session) => sum + session.distanceFeet * session.rounds, 0);
    items.push({ calories: Math.round(carryCalories), detail: `${feet} ft carried`, label: "Farmer carries" });
  }

  const swimCalories = data.swimSessions
    .filter((session) => isToday(session.date))
    .reduce((sum, session) => sum + caloriesFromMinutes(session.minutes, 7.0, weightLb), 0);
  if (swimCalories) {
    const minutes = data.swimSessions.filter((session) => isToday(session.date)).reduce((sum, session) => sum + session.minutes, 0);
    items.push({ calories: Math.round(swimCalories), detail: `${minutes} min in pool`, label: "Swim" });
  }

  const yogaCalories = data.yogaSessions
    .filter((session) => isToday(session.date))
    .reduce((sum, session) => sum + caloriesFromMinutes(session.minutes, 3.0, weightLb), 0);
  if (yogaCalories) {
    const minutes = data.yogaSessions.filter((session) => isToday(session.date)).reduce((sum, session) => sum + session.minutes, 0);
    items.push({ calories: Math.round(yogaCalories), detail: `${minutes} min recovery`, label: "Yoga" });
  }

  return items.sort((a, b) => b.calories - a.calories);
}

export function estimateDraftActivityCalories(kind: LogKind, draft: DraftLike, profile: OnboardingProfile | null, data?: RebuildData) {
  const weightLb = getReferenceWeight(data, profile);

  if (kind === "bike") return caloriesFromMinutes(number(draft.minutes), 7.2, weightLb);
  if (kind === "swim") return caloriesFromMinutes(number(draft.minutes), 7.0, weightLb);
  if (kind === "yoga") return caloriesFromMinutes(number(draft.minutes), 3.0, weightLb);
  if (kind === "jacobsLadder") return caloriesFromMinutes(Math.max(timeToSeconds(text(draft.duration, "0:00")) / 60, 1), 9.0, weightLb);
  if (kind === "kettlebell") return caloriesFromMinutes(Math.max(number(draft.reps) * 0.08, 6), 8.0, weightLb);
  if (kind === "farmerCarries") return caloriesFromMinutes(Math.max(number(draft.rounds) * 2, 4), 6.5, weightLb);
  if (kind === "strength") return caloriesFromMinutes(Math.max(number(draft.reps) * 0.2, 8), 5.0, weightLb);

  return 0;
}

function getBaseCalorieGuide(data: RebuildData, profile: OnboardingProfile | null) {
  const weightLb = getReferenceWeight(data, profile);
  const heightInches = parseHeightInches(profile?.height);
  const goalText = [...(profile?.goals ?? []), profile?.goal ?? ""].join(" ").toLowerCase();
  const multiplier = goalText.includes("lose") || goalText.includes("weight") ? 10 : goalText.includes("muscle") ? 13 : 12;
  const heightAdjustment = heightInches ? (heightInches - 68) * 12 : 0;

  return clamp(roundToNearest(weightLb * multiplier + heightAdjustment, 25), 1700, 3400);
}

function getReferenceWeight(data?: RebuildData, profile?: OnboardingProfile | null) {
  return data?.weights[0]?.weight || profile?.currentWeight || 200;
}

function caloriesFromMinutes(minutes: number, met: number, weightLb: number) {
  if (!Number.isFinite(minutes) || minutes <= 0) return 0;
  const weightKg = weightLb * 0.453592;
  return Math.round((met * 3.5 * weightKg * minutes) / 200);
}

function parseHeightInches(value?: string) {
  if (!value) return null;
  const clean = value.toLowerCase().replace(/feet|foot|ft/g, "'").replace(/inches|inch|in/g, "");
  const feetInches = clean.match(/(\d+)\s*'\s*(\d+)?/);
  if (feetInches) return Number(feetInches[1]) * 12 + Number(feetInches[2] ?? 0);

  const numbers = clean.match(/\d+/g)?.map(Number) ?? [];
  if (numbers.length >= 2 && numbers[0] <= 8) return numbers[0] * 12 + numbers[1];
  if (numbers.length === 1) return numbers[0] > 36 ? numbers[0] : numbers[0] * 12;
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

function roundToNearest(value: number, nearest: number) {
  return Math.round(value / nearest) * nearest;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
