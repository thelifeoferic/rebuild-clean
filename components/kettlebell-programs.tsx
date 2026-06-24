import { Dumbbell, Footprints, Repeat2 } from "lucide-react";
import type { RebuildData } from "@/types/rebuild";
import { MetricCard } from "@/components/metric-card";
import { Section } from "@/components/section";

export function KettlebellPrograms({ data }: { data: RebuildData }) {
  const latestCurl = data.dumbbellCurlSessions[0];
  const latestCarry = data.farmerCarrySessions[0];

  return (
    <Section id="kettlebell" eyebrow="Strength circuit" title="Kettlebell Programs">
      <div className="panel p-4">
        <div className="space-y-3">
          {data.kettlebellSessions.map((move) => (
            <article key={move.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.055] p-3">
              <div className="grid size-11 place-items-center rounded-full bg-champagne/10 text-champagne">
                <Repeat2 size={20} strokeWidth={2.2} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-porcelain">{move.exercise}</p>
                <p className="text-sm text-white/50">{move.weight} lb · {move.reps} reps</p>
              </div>
            </article>
          ))}
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
    </Section>
  );
}
