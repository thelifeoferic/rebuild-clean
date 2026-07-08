import { Salad } from "lucide-react";
import Image from "next/image";
import type { LogKind, OnboardingProfile, RebuildData } from "@/types/rebuild";
import { getDailyCalorieGuide } from "@/lib/activity-calories";
import { getTodaysCalories, getTodaysProtein, isToday } from "@/lib/rebuild-data";

export function NutritionTracker({
  data,
  onOpenLog,
  profile,
}: {
  data: RebuildData;
  onOpenLog: (kind: LogKind) => void;
  profile: OnboardingProfile | null;
}) {
  const calories = getTodaysCalories(data);
  const protein = getTodaysProtein(data);
  const calorieGuide = getDailyCalorieGuide(data, profile, calories);
  const referenceWeight = data.weights[0]?.weight || profile?.currentWeight || 200;
  const proteinGuide = Math.round(referenceWeight * 0.7);
  const calorieProgress = Math.min((calories / calorieGuide.totalGuide) * 100, 100);
  const proteinProgress = Math.min((protein / proteinGuide) * 100, 100);
  const proteinRemaining = Math.max(proteinGuide - protein, 0);
  const proteinAnchorsLeft = Math.ceil(proteinRemaining / 35);
  const todaysMeals = data.meals.filter((meal) => !meal.date || isToday(meal.date)).slice(0, 3);
  const estimateBasis = [
    profile?.age ? `${profile.age}y` : null,
    profile?.height,
    profile?.calorieSex && profile.calorieSex !== "prefer_not_to_say" ? profile.calorieSex : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="app-card mt-4 overflow-hidden rounded-2xl">
      <div className="relative min-h-[10.5rem] bg-black">
        <Image src="/rebuild-nutrition.jpg" alt="" fill sizes="(max-width: 768px) 100vw, 448px" className="object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="metric-label text-white/60">Calorie tracker</p>
          <h3 className="mt-1 text-2xl font-semibold text-porcelain">{calories} cal eaten</h3>
          <p className="mt-1 text-sm font-semibold text-white/55">
            {calorieGuide.activityBurn} cal estimated from today&apos;s training
          </p>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          <TrackerBar label="Calories" value={calories} guide={calorieGuide.totalGuide} unit="cal" progress={calorieProgress} />
          <TrackerBar label="Protein" value={protein} guide={proteinGuide} unit="g" progress={proteinProgress} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <SmallStat label="Base guide" value={calorieGuide.baseGuide} unit="cal" />
          <SmallStat label="Activity burn" value={calorieGuide.activityBurn} unit="cal" />
        </div>
        <div className="app-card mt-3 rounded-2xl p-3">
          <p className="metric-label">{calorieGuide.remaining >= 0 ? "Guide remaining" : "Over guide"}</p>
          <p className="mt-1 text-lg font-semibold text-porcelain">
            {Math.abs(calorieGuide.remaining)} <span className="app-subtle text-sm">cal</span>
          </p>
          <p className="app-subtle mt-1 text-xs leading-5">
            {proteinRemaining > 0
              ? `${proteinRemaining}g protein left, roughly ${proteinAnchorsLeft} solid anchor${proteinAnchorsLeft === 1 ? "" : "s"}.`
              : "Protein target cleared. Keep the rest of the day boring and honest."}
          </p>
        </div>
        {todaysMeals.length ? (
          <div className="mt-3 space-y-2">
            {todaysMeals.map((meal) => (
              <div key={meal.id} className="app-card rounded-2xl px-3 py-2">
                <p className="text-sm font-semibold text-porcelain">{meal.name}</p>
                <p className="app-subtle text-xs font-semibold">
                  {meal.calories} cal · {meal.protein}g protein
                </p>
              </div>
            ))}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => onOpenLog("meal")}
          className="app-secondary-action mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl px-3 text-sm font-bold"
        >
          <Salad size={17} strokeWidth={2.2} aria-hidden />
          Log food
        </button>
        <p className="app-subtle mt-3 text-xs leading-5">
          Base calories use your latest weight{estimateBasis ? `, ${estimateBasis}` : ""}. Activity burn is estimated from logged work and current body weight.
        </p>
      </div>
    </div>
  );
}

function SmallStat({ label, unit, value }: { label: string; unit: string; value: number }) {
  return (
    <div className="app-card rounded-2xl p-3">
      <p className="metric-label">{label}</p>
      <p className="mt-1 text-base font-semibold text-porcelain">
        {value} <span className="app-subtle text-xs">{unit}</span>
      </p>
    </div>
  );
}

function TrackerBar({
  guide,
  label,
  progress,
  unit,
  value,
}: {
  guide: number;
  label: string;
  progress: number;
  unit: string;
  value: number;
}) {
  return (
    <div className="app-card rounded-2xl p-3">
      <p className="metric-label">{label}</p>
      <p className="mt-1 text-lg font-semibold text-porcelain">
        {value}
        <span className="app-subtle text-sm"> / {guide}{unit}</span>
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-champagne" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
