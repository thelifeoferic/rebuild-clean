import { CircleGauge, LineChart, Scale, Trophy } from "lucide-react";
import type { RebuildData } from "@/types/rebuild";
import {
  getBestJacobsLadderTime,
  getPushUpMaxSet,
  getRecentLowWeight,
  getSevenDayAverageWeight,
  getTodaysPushUps,
  getWeightChangeFromLast,
  getWeeklyBikeMinutes,
} from "@/lib/rebuild-data";
import { formatWeight } from "@/lib/metrics";
import { MetricCard } from "@/components/metric-card";
import { Section } from "@/components/section";

export function ProgressTrends({ data }: { data: RebuildData }) {
  const weights = data.weights.slice(0, 7);
  const maxWeight = weights.length ? Math.max(...weights.map((entry) => entry.weight)) : 0;
  const minWeight = weights.length ? Math.min(...weights.map((entry) => entry.weight)) : 0;
  const sevenDayAverageWeight = getSevenDayAverageWeight(data);
  const latestWeight = data.weights[0]?.weight ?? 0;
  const weightChange = getWeightChangeFromLast(data);
  const weightChangeLabel = data.weights.length > 1 ? `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} lb` : "first entry";

  return (
    <Section id="trends" eyebrow="Proof, not vibes" title="Progress Trends">
      <div className="panel p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="metric-label">Weight trend</p>
            <p className="mt-1 text-lg font-semibold text-porcelain">{formatWeight(sevenDayAverageWeight)} avg</p>
            <p className="mt-1 text-sm font-semibold text-white/45">
              Latest {formatWeight(latestWeight)} · {weightChangeLabel}
            </p>
          </div>
          <LineChart className="text-champagne" size={22} strokeWidth={2.1} aria-hidden />
        </div>
        <div className="flex h-36 items-end gap-2">
          {weights.length ? weights.toReversed().map((entry) => {
            const height = 32 + ((entry.weight - minWeight) / Math.max(maxWeight - minWeight, 1)) * 72;
            return (
              <div key={entry.date} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-28 w-full items-end rounded-full bg-white/[0.045] p-1">
                  <div
                    className="w-full rounded-full bg-gradient-to-t from-ember to-champagne"
                    style={{ height: `${height}%` }}
                    aria-label={`${entry.date}: ${entry.weight} pounds`}
                  />
                </div>
                <span className="text-[0.62rem] font-semibold text-white/45">{entry.date}</span>
              </div>
            );
          }) : (
            <div className="grid h-28 w-full place-items-center rounded-2xl bg-white/[0.055] px-4 text-center text-sm leading-5 text-white/55">
              Log a weigh-in to start the trend.
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <MetricCard label="Bike min" value={`${getWeeklyBikeMinutes(data)}`} detail="weekly total" icon={LineChart} tone="green" />
        <MetricCard label="Ladder" value={getBestJacobsLadderTime(data)} detail="best continuous" icon={CircleGauge} tone="gold" />
        <MetricCard
          label="Push-ups"
          value={`${getTodaysPushUps(data)} total`}
          detail={getPushUpMaxSet(data) ? `${getPushUpMaxSet(data)} largest set` : "reps today"}
          icon={Trophy}
          tone="ember"
        />
        <MetricCard label="Low" value={formatWeight(getRecentLowWeight(data))} detail="recent floor" icon={Scale} tone="steel" />
      </div>
    </Section>
  );
}
