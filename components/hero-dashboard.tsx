import { BatteryCharging, Bike, CircleGauge, Scale, ShieldCheck } from "lucide-react";
import type { RebuildData } from "@/types/rebuild";
import {
  getBestJacobsLadderTime,
  getRecentLowWeight,
  getSevenDayAverageWeight,
  getTodaysBikeMinutes,
  getTodaysPushUps,
  getWeeklyBikeMinutes,
} from "@/lib/rebuild-data";
import { formatMinutes, formatWeight } from "@/lib/metrics";
import { MetricCard } from "@/components/metric-card";

export function HeroDashboard({ data, onQuickAdd }: { data: RebuildData; onQuickAdd: () => void }) {
  const todayWeight = data.weights[0]?.weight ?? 0;
  const pushUpsToday = getTodaysPushUps(data);
  const behaviorWin = data.behaviorWins[0];
  const recentLow = getRecentLowWeight(data);
  const todaysBikeMinutes = getTodaysBikeMinutes(data);
  const sevenDayAverageWeight = getSevenDayAverageWeight(data);

  return (
    <section id="home" className="px-4 pb-4 pt-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="metric-label mb-2">Personal control room</p>
          <h1 className="text-4xl font-semibold leading-none text-porcelain">REBUILD</h1>
        </div>
        <div className="rounded-full border border-champagne/30 bg-champagne/10 px-3 py-2 text-xs font-semibold text-champagne">
          Day 1 locked
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="relative p-5">
          <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-champagne/70 to-transparent" />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="metric-label">Readiness</p>
              <p className="mt-2 text-5xl font-semibold leading-none text-porcelain">86</p>
              <p className="mt-2 text-sm text-white/55">Gym response beat the old loop.</p>
            </div>
            <div className="relative grid size-32 place-items-center rounded-full border border-white/10 bg-carbon">
              <div className="absolute inset-3 rounded-full border-[10px] border-white/10" />
              <div className="absolute inset-3 rounded-full border-[10px] border-champagne border-l-transparent border-t-transparent" />
              <BatteryCharging className="text-signal" size={34} strokeWidth={2.1} aria-hidden />
            </div>
          </div>

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
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MetricCard
          label="7-day avg"
          value={formatWeight(sevenDayAverageWeight)}
          detail={`Recent low ${formatWeight(recentLow)}`}
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
          label="Ladder best"
          value={getBestJacobsLadderTime(data)}
          detail="continuous attempt"
          icon={CircleGauge}
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
        <p className="metric-label">Latest reset</p>
        <p className="mt-2 text-base font-semibold text-porcelain">{behaviorWin?.label ?? "Log the next reset win."}</p>
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
            onClick={onQuickAdd}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-champagne px-4 text-sm font-semibold text-carbon shadow-glow transition hover:bg-[#f0ca75]"
          >
            <CircleGauge size={17} strokeWidth={2.2} aria-hidden />
            Quick add
          </button>
        </div>
      </div>
    </section>
  );
}
