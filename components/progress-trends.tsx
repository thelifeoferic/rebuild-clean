import { CircleGauge, LineChart, Scale, Trophy } from "lucide-react";
import type { RebuildData } from "@/types/rebuild";
import {
  getBestJacobsLadderTime,
  getPushUpMaxSet,
  getRecentLowWeight,
  getSevenDayAverageWeight,
  getTodaysPushUps,
  getTotalPushUps,
  getWeightChangeFromLast,
  getWeeklyBikeDistance,
  getWeeklyBikeMinutes,
  formatLogDate,
} from "@/lib/rebuild-data";
import { formatWeight } from "@/lib/metrics";
import { MetricCard } from "@/components/metric-card";
import { Section } from "@/components/section";

export function ProgressTrends({ data }: { data: RebuildData }) {
  const weights = data.weights.slice(0, 7);
  const sevenDayAverageWeight = getSevenDayAverageWeight(data);
  const latestWeight = data.weights[0]?.weight ?? 0;
  const weightChange = getWeightChangeFromLast(data);
  const weightChangeLabel = data.weights.length > 1 ? `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} lb` : "first entry";
  const recentLow = getRecentLowWeight(data);
  const totalPushUps = getTotalPushUps(data);
  const todaysPushUps = getTodaysPushUps(data);

  return (
    <Section id="trends" eyebrow="Proof, not vibes" title="Progress Trends">
      <div className="panel p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="metric-label">Weight trend</p>
            <p className="mt-1 text-lg font-semibold text-porcelain">{data.weights.length ? `${formatWeight(sevenDayAverageWeight)} avg` : "Trend waiting"}</p>
            <p className="mt-1 text-sm font-semibold text-white/45">
              {data.weights.length ? `Latest ${formatWeight(latestWeight)} · ${weightChangeLabel}` : "Check back after a few weigh-ins."}
            </p>
          </div>
          <LineChart className="text-champagne" size={22} strokeWidth={2.1} aria-hidden />
        </div>
        <div className="h-40">
          {weights.length ? (
            <WeightSparkline weights={weights} />
          ) : (
            <div className="grid h-28 w-full place-items-center rounded-2xl bg-white/[0.055] px-4 text-center text-sm leading-5 text-white/55">
              Log a weigh-in to start the trend.
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <MetricCard label="Bike min" value={`${getWeeklyBikeMinutes(data)}`} detail={`${formatBikeDistance(getWeeklyBikeDistance(data))} weekly`} icon={LineChart} tone="green" />
        <MetricCard label="Ladder" value={getBestJacobsLadderTime(data)} detail="best continuous" icon={CircleGauge} tone="gold" />
        <MetricCard
          label="Push-ups"
          value={`${totalPushUps} total`}
          detail={getPushUpMaxSet(data) ? `${getPushUpMaxSet(data)} largest set · ${todaysPushUps} today` : "first set starts it"}
          icon={Trophy}
          tone="ember"
        />
        <MetricCard label="Low" value={recentLow ? formatWeight(recentLow) : "—"} detail={recentLow ? "recent floor" : "first weigh-in sets it"} icon={Scale} tone="steel" />
      </div>
    </Section>
  );
}

function formatBikeDistance(value: number) {
  return value ? `${value.toFixed(value >= 10 ? 1 : 2)} mi` : "0 mi";
}

function WeightSparkline({ weights }: { weights: RebuildData["weights"] }) {
  const ordered = weights.toReversed();
  const values = ordered.map((entry) => entry.weight);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(max - min, 0.5);
  const width = 320;
  const height = 112;
  const padding = 14;
  const points = ordered.map((entry, index) => {
    const x = ordered.length === 1 ? width / 2 : padding + (index / (ordered.length - 1)) * (width - padding * 2);
    const y = padding + ((max - entry.weight) / range) * (height - padding * 2);
    return { date: entry.date, label: formatWeight(entry.weight), x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const area = points.length > 1
    ? `${path} L ${points.at(-1)!.x.toFixed(1)} ${height - padding} L ${points[0].x.toFixed(1)} ${height - padding} Z`
    : "";

  return (
    <div className="rounded-2xl border border-white/10 bg-carbon/70 p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-28 w-full overflow-visible" role="img" aria-label="Weight trend line">
        <defs>
          <linearGradient id="weightTrendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(232,91,62)" stopOpacity="0.24" />
            <stop offset="100%" stopColor="rgb(232,91,62)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={padding} x2={width - padding} y1={height - padding} y2={height - padding} stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        {area ? <path d={area} fill="url(#weightTrendFill)" /> : null}
        {points.length > 1 ? (
          <path d={path} fill="none" stroke="rgb(232,91,62)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" />
        ) : null}
        {points.map((point) => (
          <g key={`${point.date}-${point.label}`}>
            <circle cx={point.x} cy={point.y} r="6" fill="rgb(246,243,237)" stroke="rgb(232,91,62)" strokeWidth="4" />
          </g>
        ))}
      </svg>
      <div className="mt-1 flex items-center justify-between gap-3 text-xs font-bold text-white/42">
        <span>{formatLogDate(ordered[0].date)}</span>
        <span className="text-porcelain">{points.at(-1)?.label}</span>
        <span>{formatLogDate(ordered.at(-1)!.date)}</span>
      </div>
    </div>
  );
}
