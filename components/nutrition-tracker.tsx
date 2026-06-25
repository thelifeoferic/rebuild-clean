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
  const proteinGuide = profile?.currentWeight ? Math.round(profile.currentWeight * 0.7) : 150;
  const calorieProgress = Math.min((calories / calorieGuide.totalGuide) * 100, 100);
  const proteinProgress = Math.min((protein / proteinGuide) * 100, 100);
  const proteinRemaining = Math.max(proteinGuide - protein, 0);
  const proteinAnchorsLeft = Math.ceil(proteinRemaining / 35);
  const todaysMeals = data.meals.filter((meal) => !meal.date || isToday(meal.date)).slice(0, 3);

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045]">
      <div className="relative min-h-32 bg-black">
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
        <div className="mt-3 rounded-2xl bg-carbon/70 p-3">
          <p className="metric-label">{calorieGuide.remaining >= 0 ? "Guide remaining" : "Over guide"}</p>
          <p className="mt-1 text-lg font-semibold text-porcelain">
            {Math.abs(calorieGuide.remaining)} <span className="text-sm text-white/40">cal</span>
          </p>
          <p className="mt-1 text-xs leading-5 text-white/40">
            {proteinRemaining > 0
              ? `${proteinRemaining}g protein left, roughly ${proteinAnchorsLeft} solid anchor${proteinAnchorsLeft === 1 ? "" : "s"}.`
              : "Protein target cleared. Keep the rest of the day boring and honest."}
          </p>
        </div>
        {todaysMeals.length ? (
          <div className="mt-3 space-y-2">
            {todaysMeals.map((meal) => (
              <div key={meal.id} className="rounded-2xl bg-white/[0.055] px-3 py-2">
                <p className="text-sm font-semibold text-porcelain">{meal.name}</p>
                <p className="text-xs font-semibold text-white/42">
                  {meal.calories} cal · {meal.protein}g protein
                </p>
              </div>
            ))}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => onOpenLog("meal")}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-3 text-sm font-bold text-porcelain"
        >
          <Salad size={17} strokeWidth={2.2} aria-hidden />
          Log food
        </button>
        <p className="mt-3 text-xs leading-5 text-white/40">
          Activity calories are estimates based on logged work, height, and weight. Adjust targets once you learn your real trend.
        </p>
      </div>
    </div>
  );
}

function SmallStat({ label, unit, value }: { label: string; unit: string; value: number }) {
  return (
    <div className="rounded-2xl bg-carbon/70 p-3">
      <p className="metric-label">{label}</p>
      <p className="mt-1 text-base font-semibold text-porcelain">
        {value} <span className="text-xs text-white/40">{unit}</span>
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
    <div className="rounded-2xl bg-carbon/70 p-3">
      <p className="metric-label">{label}</p>
      <p className="mt-1 text-lg font-semibold text-porcelain">
        {value}
        <span className="text-sm text-white/40"> / {guide}{unit}</span>
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-champagne" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
