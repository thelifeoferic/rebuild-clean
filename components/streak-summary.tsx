import { Activity, CalendarCheck2, Salad, ShieldCheck } from "lucide-react";
import { Section } from "@/components/section";
import { getTodayIso, normalizeLogDate } from "@/lib/rebuild-data";
import type { RebuildData } from "@/types/rebuild";

export function StreakSummary({ data }: { data: RebuildData }) {
  const workoutDates = uniqueDates([
    ...data.bikeSessions.map((item) => normalizeLogDate(item.date)),
    ...data.jacobsLadderSessions.map((item) => normalizeLogDate(item.date)),
    ...data.pushUpSessions.map((item) => normalizeLogDate(item.date)),
    ...data.dumbbellCurlSessions.map((item) => normalizeLogDate(item.date)),
    ...data.strengthAccessorySessions.map((item) => normalizeLogDate(item.date)),
    ...data.machineWorkoutSessions.map((item) => normalizeLogDate(item.date)),
    ...data.kettlebellSessions.map((item) => normalizeLogDate(item.date)),
    ...data.farmerCarrySessions.map((item) => normalizeLogDate(item.date)),
    ...data.swimSessions.map((item) => normalizeLogDate(item.date)),
    ...data.yogaSessions.map((item) => normalizeLogDate(item.date)),
  ]);
  const loggedDays = uniqueDates([
    ...workoutDates,
    ...data.weights.map((item) => normalizeLogDate(item.date)),
    ...data.meals.map((item) => normalizeLogDate(item.date)),
    ...data.behaviorWins.map((item) => normalizeLogDate(item.date)),
  ]).length;
  const workoutStreak = countConsecutiveWorkoutDays(workoutDates);

  const trainingSessions =
    data.bikeSessions.length +
    data.jacobsLadderSessions.length +
    data.pushUpSessions.length +
    data.dumbbellCurlSessions.length +
    data.strengthAccessorySessions.length +
    data.machineWorkoutSessions.length +
    data.kettlebellSessions.length +
    data.farmerCarrySessions.length +
    data.swimSessions.length +
    data.yogaSessions.length;

  const proteinHits = data.meals.filter((meal) => meal.protein >= 25).length;
  const patternWins = data.behaviorWins.length;

  return (
    <Section id="streaks" eyebrow="Proof, not vibes" title="Streaks">
      <div className="grid grid-cols-2 gap-2">
        <ProofCard label="Workout streak" value={`${workoutStreak}`} detail="consecutive days with movement" icon={CalendarCheck2} />
        <ProofCard label="Training" value={`${trainingSessions}`} detail="movement sessions logged" icon={Activity} />
        <ProofCard label="Protein hits" value={`${proteinHits}`} detail="meals at 25g+" icon={Salad} />
        <ProofCard label="Reset wins" value={`${patternWins}`} detail="meditation or replacement logged" icon={ShieldCheck} />
      </div>
      <p className="mt-3 text-sm leading-5 text-white/42">
        You have {loggedDays} total logged days. The streak number only counts days with saved movement.
      </p>
    </Section>
  );
}

function ProofCard({
  detail,
  icon: Icon,
  label,
  value,
}: {
  detail: string;
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <Icon className="mb-3 text-champagne" size={18} strokeWidth={2.1} aria-hidden />
      <p className="metric-label">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-porcelain">{value}</p>
      <p className="mt-1 text-xs leading-4 text-white/40">{detail}</p>
    </div>
  );
}

function uniqueDates(dates: string[]) {
  return Array.from(new Set(dates.filter(Boolean)));
}

function countConsecutiveWorkoutDays(dates: string[]) {
  const days = new Set(dates);
  let cursor = new Date(`${getTodayIso()}T00:00:00`);
  let streak = 0;

  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
