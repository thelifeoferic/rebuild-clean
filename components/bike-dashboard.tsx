import { Bike, Gauge, Timer, Zap } from "lucide-react";
import Image from "next/image";
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
      <div className="relative mb-3 min-h-40 overflow-hidden rounded-2xl border border-white/10 bg-black">
        <Image
          src="/rebuild-cardio.jpg"
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 448px"
          className="object-cover object-[54%_42%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="metric-label text-white/60">Cardio</p>
          <p className="mt-1 text-xl font-semibold text-porcelain">Build the engine.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Today" value={formatMinutes(todaysMinutes)} detail="logged today" icon={Timer} tone="gold" />
        <MetricCard label="Resistance" value={`${latest?.resistance ?? 0}`} detail="latest ride" icon={Gauge} tone="steel" />
        <MetricCard label="Calories" value={`${latest?.calories ?? 0}`} detail="latest burn" icon={Zap} tone="ember" />
        <MetricCard label="Sessions" value={`${data.bikeSessions.length}`} detail="stored rides" icon={Bike} tone="green" />
      </div>

      <div className="mt-3 panel p-4">
        <p className="metric-label mb-3">Recent rides</p>
        <div className="space-y-3">
          {data.bikeSessions.length ? data.bikeSessions.map((session) => (
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
          )) : (
            <p className="rounded-2xl bg-white/[0.055] p-3 text-sm leading-5 text-white/55">
              No rides logged yet. Add the first bike session from the Log tab.
            </p>
          )}
        </div>
      </div>
    </Section>
  );
}
