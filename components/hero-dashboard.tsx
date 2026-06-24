import { Bike, Dumbbell, Flame, Headphones, Scale, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { tidalPlaylistUrl } from "@/data/mock-data";
import type { AppView, OnboardingProfile, RebuildData } from "@/types/rebuild";
import {
  getSevenDayAverageWeight,
  getTodaysBikeMinutes,
  getTodaysPushUps,
  getWeeklyBikeMinutes,
} from "@/lib/rebuild-data";
import { formatMinutes, formatWeight } from "@/lib/metrics";
import { MetricCard } from "@/components/metric-card";

export function HeroDashboard({
  data,
  onNavigate,
  onQuickAdd,
  profile,
}: {
  data: RebuildData;
  onNavigate: (view: AppView) => void;
  onQuickAdd: () => void;
  profile: OnboardingProfile | null;
}) {
  const todayWeight = data.weights[0]?.weight ?? 0;
  const pushUpsToday = getTodaysPushUps(data);
  const behaviorWin = data.behaviorWins[0];
  const todaysBikeMinutes = getTodaysBikeMinutes(data);
  const sevenDayAverageWeight = getSevenDayAverageWeight(data);
  const hasLogs =
    data.weights.length +
      data.bikeSessions.length +
      data.pushUpSessions.length +
      data.behaviorWins.length +
      data.meals.length >
    0;

  return (
    <section className="px-4 pb-4 pt-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="metric-label mb-2">{profile?.goal ?? "Fresh start"}</p>
          <div className="w-44 overflow-hidden rounded-xl border border-white/10 bg-black sm:w-52">
            <Image
              src="/rebuild-logo.png"
              alt="REBUILD. Better every day."
              width={1774}
              height={887}
              priority
              className="aspect-[2.4/1] w-full object-cover object-center"
            />
          </div>
        </div>
        <div className="rounded-full border border-champagne/30 bg-champagne/10 px-3 py-2 text-xs font-semibold text-champagne">
          Zero day
        </div>
      </div>

      <div className="panel p-5">
        <div className="relative">
          <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-champagne/70 to-transparent" />
          <p className="metric-label">Today</p>
          <h2 className="mt-2 text-3xl font-semibold leading-tight text-porcelain">
            {hasLogs ? "Keep the streak alive." : "Start tomorrow clean."}
          </h2>
          <p className="mt-2 text-sm leading-5 text-white/55">
            {hasLogs
              ? "Log the next action and let the numbers stay honest."
              : "First priority: one weight, one training entry, one reset win."}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white/[0.055] p-3">
              <p className="metric-label">Weight</p>
              <p className="mt-1 text-lg font-semibold">{formatWeight(todayWeight)}</p>
            </div>
            <div className="rounded-2xl bg-white/[0.055] p-3">
              <p className="metric-label">Bike</p>
              <p className="mt-1 text-lg font-semibold">{formatMinutes(todaysBikeMinutes)}</p>
            </div>
            <div className="rounded-2xl bg-white/[0.055] p-3">
              <p className="metric-label">Push</p>
              <p className="mt-1 text-lg font-semibold">{pushUpsToday}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-2">
            <button
              type="button"
              onClick={() => onNavigate("log")}
              className="min-h-12 rounded-2xl bg-champagne px-4 text-base font-bold text-carbon shadow-glow"
            >
              Log workout
            </button>
            <a
              href={tidalPlaylistUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-signal px-3 text-sm font-bold text-carbon"
            >
              <Headphones size={17} strokeWidth={2.2} aria-hidden />
              Start TIDAL playlist
            </a>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onQuickAdd}
                className="min-h-11 rounded-2xl bg-white/10 px-3 text-sm font-semibold text-porcelain"
              >
                Log reset
              </button>
              <button
                type="button"
                onClick={() => onNavigate("progress")}
                className="min-h-11 rounded-2xl bg-white/10 px-3 text-sm font-semibold text-porcelain"
              >
                View progress
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MetricCard
          label="7-day avg"
          value={formatWeight(sevenDayAverageWeight)}
          detail={data.weights.length ? "from logged weights" : "waiting for first weigh-in"}
          icon={Scale}
          tone="gold"
        />
        <MetricCard
          label="Bike week"
          value={formatMinutes(getWeeklyBikeMinutes(data))}
          detail={`${todaysBikeMinutes} minutes today`}
          icon={Bike}
          tone="green"
        />
        <MetricCard
          label="Push today"
          value={`${pushUpsToday}`}
          detail="total reps"
          icon={Dumbbell}
          tone="ember"
        />
        <MetricCard
          label="Behavior"
          value={`${data.behaviorWins.length} wins`}
          detail="did not smoke, did not spiral"
          icon={ShieldCheck}
          tone="steel"
        />
      </div>

      <div className="mt-4 panel p-4">
        <p className="metric-label">Next move</p>
        <p className="mt-2 text-base font-semibold text-porcelain">
          {behaviorWin?.label ?? profile?.resetPlan ?? "Pick the reset response before the old loop gets a vote."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onQuickAdd}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-signal px-4 text-sm font-semibold text-carbon transition hover:bg-[#5af0bc]"
          >
            <ShieldCheck size={17} strokeWidth={2.2} aria-hidden />
            Log win
          </button>
          <button
            type="button"
            onClick={() => onNavigate("training")}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-champagne px-4 text-sm font-semibold text-carbon shadow-glow transition hover:bg-[#f0ca75]"
          >
            <Flame size={17} strokeWidth={2.2} aria-hidden />
            Training
          </button>
        </div>
      </div>
    </section>
  );
}
