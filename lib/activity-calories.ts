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

  const machineCalories = data.machineWorkoutSessions
    .filter((session) => isToday(session.date))
    .reduce((sum, session) => {
      if (session.calories && session.calories > 0) return sum + session.calories;
      const minutes = session.minutes ?? Math.max((session.sets ?? 0) * 4, 8);
      return sum + caloriesFromMinutes(minutes, machineMet(session.machine), weightLb);
    }, 0);
  if (machineCalories) {
    const count = data.machineWorkoutSessions.filter((session) => isToday(session.date)).length;
    items.push({
      calories: Math.round(machineCalories),
      detail: `${count} machine log${count === 1 ? "" : "s"}`,
      label: "Gym machines",
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
  if (kind === "machine") {
    const minutes = Math.max(number(draft.minutes), number(draft.sets) * 4, 8);
    return caloriesFromMinutes(minutes, machineMet(text(draft.machine, "machine")), weightLb);
  }

  return 0;
}

function getBaseCalorieGuide(data: RebuildData, profile: OnboardingProfile | null) {
  const weightLb = getReferenceWeight(data, profile);
  const heightInches = parseHeightInches(profile?.height);
  const bmr = estimateBmr({
    age: profile?.age,
    heightInches,
    sex: profile?.calorieSex,
    weightLb,
  });
  const goalText = [...(profile?.goals ?? []), profile?.goal ?? ""].join(" ").toLowerCase();
  const isCutting = goalText.includes("lose") || goalText.includes("weight");
  const isBuilding = goalText.includes("muscle") || goalText.includes("strength");
  const activityFactor = isCutting ? 1.3 : isBuilding ? 1.45 : 1.38;
  const goalAdjustment = isCutting ? -350 : isBuilding ? 150 : 0;

  return clamp(roundToNearest(bmr * activityFactor + goalAdjustment, 25), 1500, 3800);
}

function getReferenceWeight(data?: RebuildData, profile?: OnboardingProfile | null) {
  return data?.weights[0]?.weight || profile?.currentWeight || 200;
}

function caloriesFromMinutes(minutes: number, met: number, weightLb: number) {
  if (!Number.isFinite(minutes) || minutes <= 0) return 0;
  const weightKg = weightLb * 0.453592;
  return Math.round((met * 3.5 * weightKg * minutes) / 200);
}

function estimateBmr({
  age,
  heightInches,
  sex,
  weightLb,
}: {
  age?: number;
  heightInches: number | null;
  sex?: OnboardingProfile["calorieSex"];
  weightLb: number;
}) {
  const weightKg = weightLb * 0.453592;
  const heightCm = (heightInches ?? 70) * 2.54;
  const profileAge = age && age >= 13 && age <= 100 ? age : 35;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * profileAge;

  if (sex === "male") return base + 5;
  if (sex === "female") return base - 161;
  return base - 78;
}

function machineMet(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("stair")) return 8.8;
  if (lower.includes("treadmill")) return 7.5;
  if (lower.includes("row") || lower.includes("air bike")) return 7.2;
  if (lower.includes("elliptical")) return 5.5;
  if (lower.includes("bike")) return 7.2;
  if (lower.includes("battle rope")) return 8.0;
  if (lower.includes("pull-up") || lower.includes("dip")) return 6.0;
  if (lower.includes("leg press") || lower.includes("hack squat") || lower.includes("smith")) return 5.8;
  return 5.0;
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
