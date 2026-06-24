import { Bike, Gauge, Timer, Zap } from "lucide-react";
import type { RebuildData } from "@/types/rebuild";
import { getTodaysBikeMinutes } from "@/lib/rebuild-data";
import { formatMinutes } from "@/lib/metrics";
import { MetricCard } from "@/components/metric-card";
import { Section } from "@/components/section";

export function BikeDashboard({ data }: { data: RebuildData }) {
  const latest = data.bikeSessions[0];
  const todaysMinutes = getTodaysBikeMinutes(data);

  return (
    <Section id="bike" eyebrow="Engine room" title="Bike Dashboard">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Today" value={formatMinutes(todaysMinutes)} detail="logged today" icon={Timer} tone="gold" />
        <MetricCard label="Resistance" value={`${latest?.resistance ?? 0}`} detail="latest ride" icon={Gauge} tone="steel" />
        <MetricCard label="Calories" value={`${latest?.calories ?? 0}`} detail="latest burn" icon={Zap} tone="ember" />
        <MetricCard label="Sessions" value={`${data.bikeSessions.length}`} detail="stored rides" icon={Bike} tone="green" />
      </div>

      <div className="mt-3 panel p-4">
        <p className="metric-label mb-3">Recent rides</p>
        <div className="space-y-3">
          {data.bikeSessions.map((session) => (
            <article key={session.id} className="rounded-2xl bg-white/[0.055] p-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-porcelain">{session.date}</p>
                <p className="text-sm font-semibold text-champagne">{session.minutes} min</p>
              </div>
              <p className="mt-1 text-sm leading-5 text-white/50">
                Resistance {session.resistance} · {session.calories} cal
              </p>
              <p className="mt-2 text-sm leading-5 text-white/62">{session.notes}</p>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
