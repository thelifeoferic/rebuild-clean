import { Activity, CalendarCheck2, Salad, ShieldCheck } from "lucide-react";
import { Section } from "@/components/section";
import type { RebuildData } from "@/types/rebuild";

export function StreakSummary({ data }: { data: RebuildData }) {
  const proofDays = uniqueDates([
    ...data.weights.map((item) => item.date),
    ...data.bikeSessions.map((item) => item.date),
    ...data.jacobsLadderSessions.map((item) => item.date),
    ...data.pushUpSessions.map((item) => item.date),
    ...data.dumbbellCurlSessions.map((item) => item.date),
    ...data.strengthAccessorySessions.map((item) => item.date),
    ...data.kettlebellSessions.map((item) => item.date),
    ...data.farmerCarrySessions.map((item) => item.date),
    ...data.swimSessions.map((item) => item.date),
    ...data.yogaSessions.map((item) => item.date),
    ...data.meals.map((item) => item.date ?? "Today"),
    ...data.behaviorWins.map((item) => item.date),
  ]).length;

  const trainingSessions =
    data.bikeSessions.length +
    data.jacobsLadderSessions.length +
    data.pushUpSessions.length +
    data.dumbbellCurlSessions.length +
    data.strengthAccessorySessions.length +
    data.kettlebellSessions.length +
    data.farmerCarrySessions.length +
    data.swimSessions.length +
    data.yogaSessions.length;

  const proteinHits = data.meals.filter((meal) => meal.protein >= 25).length;
  const patternWins = data.behaviorWins.length;

  return (
    <Section id="streaks" eyebrow="Proof, not vibes" title="Consistency">
      <div className="grid grid-cols-2 gap-2">
        <ProofCard label="Show-up days" value={`${proofDays}`} detail="days with any saved proof" icon={CalendarCheck2} />
        <ProofCard label="Training" value={`${trainingSessions}`} detail="movement sessions logged" icon={Activity} />
        <ProofCard label="Protein hits" value={`${proteinHits}`} detail="meals at 25g+" icon={Salad} />
        <ProofCard label="Pattern wins" value={`${patternWins}`} detail="replacement behavior logged" icon={ShieldCheck} />
      </div>
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
