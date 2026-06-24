import { Activity, Bike, Dumbbell, Flame, Footprints, Salad, Trophy, Waves } from "lucide-react";
import type { RebuildData } from "@/types/rebuild";
import {
  getBestJacobsLadderTime,
  getTodaysBikeMinutes,
  getTodaysPushUps,
  getWeeklyBikeMinutes,
} from "@/lib/rebuild-data";
import { formatMinutes } from "@/lib/metrics";
import { Section } from "@/components/section";

const trainingBlocks = [
  {
    title: "Cardio base",
    detail: "Bike or Jacob's Ladder",
    target: "20-45 min",
    icon: Bike,
    tone: "text-champagne bg-champagne/10",
  },
  {
    title: "Bodyweight",
    detail: "Push-ups and reset reps",
    target: "3-5 sets",
    icon: Trophy,
    tone: "text-signal bg-signal/10",
  },
  {
    title: "Loaded carries",
    detail: "Farmer carries or suitcase holds",
    target: "4 rounds",
    icon: Footprints,
    tone: "text-ember bg-ember/10",
  },
  {
    title: "Rotation",
    detail: "Pass-arounds or around-the-worlds",
    target: "50-200 reps",
    icon: Dumbbell,
    tone: "text-white/75 bg-white/10",
  },
  {
    title: "Recovery lane",
    detail: "Swim or yoga when joints need lower impact",
    target: "10-30 min",
    icon: Waves,
    tone: "text-signal bg-signal/10",
  },
];

export function TrainingOverview({ data }: { data: RebuildData }) {
  const latestCarry = data.farmerCarrySessions[0];
  const latestCurl = data.dumbbellCurlSessions[0];
  const latestKettlebell = data.kettlebellSessions[0];
  const latestMeal = data.meals[0];
  const latestStrength = data.strengthAccessorySessions[0];
  const latestSwim = data.swimSessions[0];
  const latestYoga = data.yogaSessions[0];

  return (
    <Section id="train-overview" eyebrow="Training hub" title="Today's Work">
      <div className="grid grid-cols-2 gap-2">
        <TrainingStat label="Bike today" value={formatMinutes(getTodaysBikeMinutes(data))} icon={Bike} />
        <TrainingStat label="Weekly bike" value={formatMinutes(getWeeklyBikeMinutes(data))} icon={Activity} />
        <TrainingStat label="Ladder best" value={getBestJacobsLadderTime(data)} icon={Flame} />
        <TrainingStat label="Push-ups" value={`${getTodaysPushUps(data)}`} icon={Trophy} />
      </div>

      <div className="mt-3 panel p-4">
        <p className="metric-label mb-3">Next blocks</p>
        <div className="grid gap-2">
          {trainingBlocks.map((block) => {
            const Icon = block.icon;
            return (
              <article key={block.title} className="flex items-center gap-3 rounded-2xl bg-white/[0.055] p-3">
                <div className={`grid size-11 place-items-center rounded-full ${block.tone}`}>
                  <Icon size={19} strokeWidth={2.2} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-porcelain">{block.title}</p>
                  <p className="text-sm text-white/50">{block.detail}</p>
                </div>
                <p className="text-right text-xs font-bold uppercase tracking-[0.14em] text-white/38">{block.target}</p>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <TrainingStat
          label="Kettlebell"
          value={latestKettlebell ? `${latestKettlebell.weight} lb` : "--"}
          detail={latestKettlebell ? `${latestKettlebell.exercise} · ${latestKettlebell.reps} reps` : "none logged"}
          icon={Dumbbell}
        />
        <TrainingStat
          label="Carries"
          value={latestCarry ? `${latestCarry.rounds} rounds` : "--"}
          detail={latestCarry ? `${latestCarry.weightEachHand} lb each` : "none logged"}
          icon={Footprints}
        />
        <TrainingStat
          label="Curls"
          value={latestCurl ? `${latestCurl.weight} lb` : "--"}
          detail={latestCurl ? `${latestCurl.repsEachArm * 2} reps` : "none logged"}
          icon={Dumbbell}
        />
        <TrainingStat
          label="Strength"
          value={latestStrength ? `${latestStrength.weight} lb` : "--"}
          detail={latestStrength ? `${latestStrength.exercise} · ${latestStrength.reps} reps` : "none logged"}
          icon={Dumbbell}
        />
        <TrainingStat
          label="Meals"
          value={`${data.meals.length}`}
          detail={latestMeal ? `${latestMeal.protein}g protein` : "none logged"}
          icon={Salad}
        />
        <TrainingStat
          label="Swim"
          value={latestSwim ? `${latestSwim.minutes} min` : "--"}
          detail={latestSwim ? `${latestSwim.distance} yd · ${latestSwim.stroke}` : "none logged"}
          icon={Waves}
        />
        <TrainingStat
          label="Yoga"
          value={latestYoga ? `${latestYoga.minutes} min` : "--"}
          detail={latestYoga ? latestYoga.focus : "none logged"}
          icon={Flame}
        />
      </div>
    </Section>
  );
}

function TrainingStat({
  detail,
  icon: Icon,
  label,
  value,
}: {
  detail?: string;
  icon: typeof Bike;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
      <Icon className="mb-3 text-champagne" size={18} strokeWidth={2.1} aria-hidden />
      <p className="metric-label">{label}</p>
      <p className="mt-1 text-xl font-semibold text-porcelain">{value}</p>
      {detail ? <p className="mt-1 text-xs font-semibold text-white/40">{detail}</p> : null}
    </div>
  );
}
