import type { BikeSession } from "@/types/rebuild";

type BikeDistanceInput = {
  calories?: number;
  minutes?: number;
  resistance?: number;
  weightLb?: number | null;
};

export function bikeDistanceForSession(session?: BikeSession | null) {
  if (!session) return 0;
  if (typeof session.distanceMiles === "number" && session.distanceMiles > 0) return roundDistance(session.distanceMiles);

  return estimateBikeDistanceMiles({
    calories: session.calories,
    minutes: session.minutes,
    resistance: session.resistance,
  });
}

export function estimateBikeDistanceMiles({
  calories,
  minutes,
  resistance,
  weightLb,
}: BikeDistanceInput) {
  const rideMinutes = positive(minutes);
  if (!rideMinutes) return 0;

  const riderWeight = clamp(positive(weightLb) || 200, 90, 400);
  const resistanceLevel = clamp(positive(resistance), 0, 25);
  const resistanceMet = clamp(6.2 + (resistanceLevel - 5) * 0.22, 4.8, 9.2);
  const calorieMet = metFromCalories(calories, rideMinutes, riderWeight);
  const estimatedMet = calorieMet ? clamp(calorieMet * 0.8 + resistanceMet * 0.2, 4.2, 11) : resistanceMet;
  const estimatedMph = clamp(8.5 + (estimatedMet - 4) * 1.25, 8, 18);

  return roundDistance((rideMinutes / 60) * estimatedMph);
}

function metFromCalories(calories: number | undefined, minutes: number, weightLb: number) {
  const burn = positive(calories);
  if (!burn) return 0;

  const weightKg = weightLb * 0.453592;
  return (burn * 200) / (3.5 * weightKg * minutes);
}

function positive(value: number | undefined | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function roundDistance(value: number) {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
