import { Dumbbell, Footprints, Repeat2, Shell } from "lucide-react";
import Image from "next/image";
import type { RebuildData } from "@/types/rebuild";
import { MetricCard } from "@/components/metric-card";
import { Section } from "@/components/section";

export function KettlebellPrograms({ data }: { data: RebuildData }) {
  const latestCurl = data.dumbbellCurlSessions[0];
  const latestCarry = data.farmerCarrySessions[0];

  return (
    <Section id="kettlebell" eyebrow="Strength circuit" title="Kettlebell Programs">
      <div className="relative mb-3 min-h-40 overflow-hidden rounded-2xl border border-white/10 bg-black">
        <Image
          src="/rebuild-kettlebell-plank.jpg"
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 448px"
          className="object-cover object-[52%_45%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="metric-label text-white/60">Strength</p>
          <p className="mt-1 text-xl font-semibold text-porcelain">Simple work, repeated.</p>
        </div>
      </div>
      <div className="panel p-4">
        <div className="space-y-3">
          {data.kettlebellSessions.length ? data.kettlebellSessions.map((move) => (
            <article key={move.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.055] p-3">
              <div className="grid size-11 place-items-center rounded-full bg-champagne/10 text-champagne">
                <Repeat2 size={20} strokeWidth={2.2} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-porcelain">{move.exercise}</p>
                <p className="text-sm text-white/50">{move.weight} lb · {move.reps} reps</p>
              </div>
            </article>
          )) : (
            <p className="rounded-2xl bg-white/[0.055] p-3 text-sm leading-5 text-white/55">
              No kettlebell work logged yet. Start fresh with one clean set.
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <MetricCard
          label="Curls"
          value={`${latestCurl?.weight ?? 0} lb`}
          detail={`${latestCurl ? latestCurl.repsEachArm * 2 : 0} total reps`}
          icon={Dumbbell}
          tone="ember"
        />
        <MetricCard
          label="Carries"
          value={`${latestCarry?.rounds ?? 0} rounds`}
          detail={`${latestCarry?.weightEachHand ?? 0} lb each hand · ${latestCarry?.distanceFeet ?? 0} ft`}
          icon={Footprints}
          tone="green"
        />
      </div>

      {data.strengthAccessorySessions.length ? (
        <div className="mt-3 panel p-4">
          <p className="metric-label mb-3">Accessory work</p>
          <div className="space-y-3">
            {data.strengthAccessorySessions.map((move) => (
              <article key={move.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.055] p-3">
                <div className="grid size-11 place-items-center rounded-full bg-signal/10 text-signal">
                  <Shell size={20} strokeWidth={2.2} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-porcelain">{move.exercise}</p>
                  <p className="text-sm text-white/50">
                    {move.weight} lb · {move.reps} reps
                  </p>
                  <p className="mt-1 text-sm text-white/45">{move.notes}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </Section>
  );
}
