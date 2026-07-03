"use client";

import { Bike, CircleGauge, Dumbbell, Footprints, LineChart, Scale, ShieldCheck, Timer, Trophy } from "lucide-react";
import { useState } from "react";
import { CountUp } from "@/components/count-up";
import { EmptyState } from "@/components/empty-state";
import { Section } from "@/components/section";
import { bikeDistanceForSession } from "@/lib/bike-distance";
import { formatLogDate, isCurrentWeek, normalizeLogDate, timeToSeconds } from "@/lib/rebuild-data";
import { getPersonalRecords, hasAnyProof, type PersonalRecord } from "@/lib/rebuild-insights";
import type { LogKind, RebuildData } from "@/types/rebuild";

const iconMap = {
  bike: Bike,
  carry: Footprints,
  distance: LineChart,
  duration: Timer,
  ladder: CircleGauge,
  machine: Dumbbell,
  pattern: ShieldCheck,
  push: Trophy,
  scale: Scale,
  streak: ShieldCheck,
};

type RecordDetail = {
  date?: string;
  detail: string;
  title: string;
  value: string;
};

export function PersonalRecords({
  data,
  onOpenLog,
}: {
  data: RebuildData;
  onOpenLog: (kind: LogKind) => void;
}) {
  const [activeRecord, setActiveRecord] = useState<PersonalRecord | null>(null);
  const records = getPersonalRecords(data);

  if (!hasAnyProof(data)) {
    return (
      <Section id="records" eyebrow="Earned proof" title="Personal Records">
        <EmptyState
          action={{ label: "Log first entry", onClick: () => onOpenLog("bike") }}
          detail="Your first workout sets your first record. Nothing to compare against yet, which is exactly where a rebuild starts."
          icon={Trophy}
          title="Your trophy case is waiting."
        />
      </Section>
    );
  }

  return (
    <Section id="records" eyebrow="Earned proof" title="Personal Records">
      <div className="grid gap-3">
        {records.map((record) => (
          <RecordCard
            key={record.label}
            active={activeRecord?.label === record.label}
            onClick={() => setActiveRecord((current) => (current?.label === record.label ? null : record))}
            data={data}
            onOpenLog={onOpenLog}
            record={record}
          />
        ))}
      </div>
    </Section>
  );
}

function RecordCard({
  active,
  data,
  onClick,
  onOpenLog,
  record,
}: {
  active: boolean;
  data: RebuildData;
  onClick: () => void;
  onOpenLog: (kind: LogKind) => void;
  record: PersonalRecord;
}) {
  const Icon = iconMap[record.icon];
  const hasValue = record.value !== "—";
  const details = getRecordDetails(data, record);

  return (
    <article className="panel overflow-hidden p-4">
      <button type="button" onClick={onClick} className="w-full text-left">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="metric-label">{record.label}</p>
            <p className="mt-2 font-display text-4xl font-black uppercase leading-none text-champagne">
              {hasValue && Number.isFinite(Number(record.value)) ? <CountUp value={Number(record.value)} /> : record.value}
              {record.unit ? <span className="ml-1 text-base text-white/45">{record.unit}</span> : null}
            </p>
            <p className="mt-2 text-sm leading-5 text-white/52">{record.detail}</p>
            {record.when ? <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-white/35">{record.when}</p> : null}
          </div>
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-champagne/10 text-champagne">
            <Icon size={20} strokeWidth={2.2} aria-hidden />
          </div>
        </div>
      </button>

      {active ? (
        <div className="mt-4 rounded-2xl bg-carbon/70 p-3">
          <p className="metric-label mb-3">Record shape</p>
          <Sparkline values={record.history} />
          <RecordDetails details={details} />
          {record.logKind ? (
            <button
              type="button"
              onClick={() => onOpenLog(record.logKind!)}
              className="mt-3 min-h-10 w-full rounded-2xl bg-white/10 px-3 text-sm font-bold text-porcelain"
            >
              Log another attempt
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function RecordDetails({ details }: { details: RecordDetail[] }) {
  if (!details.length) {
    return <p className="mt-4 text-sm leading-5 text-white/45">No saved activity details yet. The next log will show here.</p>;
  }

  return (
    <div className="mt-4 space-y-2">
      <p className="metric-label">Saved activity details</p>
      {details.map((detail, index) => (
        <div key={`${detail.title}-${detail.date ?? index}`} className="rounded-2xl border border-white/10 bg-black/25 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-porcelain">{detail.title}</p>
              <p className="mt-1 text-xs leading-4 text-white/50">{detail.detail}</p>
              {detail.date ? <p className="mt-2 text-[0.65rem] font-black uppercase tracking-[0.14em] text-white/35">{detail.date}</p> : null}
            </div>
            <p className="max-w-[9rem] shrink-0 truncate rounded-full bg-champagne px-3 py-1.5 text-xs font-black text-carbon">{detail.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function getRecordDetails(data: RebuildData, record: PersonalRecord): RecordDetail[] {
  if (record.label === "Longest Ride") {
    return topBy(data.bikeSessions, (session) => session.minutes).map((session) => {
      const distance = bikeDistanceForSession(session);
      return {
        date: formatLogDate(session.date),
        detail: `Resistance ${session.resistance} · ${distance ? `${distance.toFixed(1)} mi${session.distanceEstimated || !session.distanceMiles ? " est." : ""} · ` : ""}${session.calories} cal`,
        title: session.location === "home" ? "Home bike session" : "Bike session",
        value: `${session.minutes} min`,
      };
    });
  }

  if (record.label === "Bike Miles") {
    return topBy(data.bikeSessions.filter((session) => isCurrentWeek(session.date)), bikeDistanceForSession).map((session) => {
      const distance = bikeDistanceForSession(session);
      return {
        date: formatLogDate(session.date),
        detail: `${session.minutes} min · resistance ${session.resistance} · ${session.calories} cal`,
        title: session.distanceEstimated || !session.distanceMiles ? "Estimated bike distance" : "Bike distance",
        value: `${distance.toFixed(1)} mi`,
      };
    });
  }

  if (record.label === "Best Push-up Set") {
    return topBy(data.pushUpSessions, (session) => Math.max(0, ...session.sets)).map((session) => ({
      date: formatLogDate(session.date),
      detail: `${session.sets.reduce((sum, reps) => sum + reps, 0)} total reps · sets: ${session.sets.join(", ")}`,
      title: "Push-up session",
      value: `${Math.max(0, ...session.sets)} max`,
    }));
  }

  if (record.label === "Total Push-ups") {
    return byDate(data.pushUpSessions).map((session) => ({
      date: formatLogDate(session.date),
      detail: `${session.sets.length} sets · ${session.sets.join(", ")}`,
      title: "Push-ups logged",
      value: `${session.sets.reduce((sum, reps) => sum + reps, 0)} reps`,
    }));
  }

  if (record.label === "Jacob's Ladder") {
    return topBy(data.jacobsLadderSessions, (session) => timeToSeconds(session.longestContinuous || session.duration)).map((session) => ({
      date: formatLogDate(session.date),
      detail: `${session.duration} total${session.rounds ? ` · ${session.rounds} rounds` : ""}${session.notes ? ` · ${session.notes}` : ""}`,
      title: "Jacob's Ladder session",
      value: session.longestContinuous,
    }));
  }

  if (record.label === "Heaviest Carry") {
    return topBy(data.farmerCarrySessions, (session) => session.weightEachHand).map((session) => ({
      date: formatLogDate(session.date),
      detail: `${session.distanceFeet} ft · ${session.rounds} rounds · ${session.distanceFeet * session.rounds} ft total`,
      title: "Farmer carry",
      value: `${session.weightEachHand} lb`,
    }));
  }

  if (record.label === "Machine Load") {
    return topBy(data.machineWorkoutSessions, (session) => session.weight ?? 0).map((session) => ({
      date: formatLogDate(session.date),
      detail: `${session.category ?? "Machine"}${session.sets && session.reps ? ` · ${session.sets} x ${session.reps}` : ""}${session.minutes ? ` · ${session.minutes} min` : ""}`,
      title: session.machine,
      value: session.weight ? `${session.weight} lb` : "timed",
    }));
  }

  if (record.label === "Workout Streak") {
    return workoutDays(data).map((date) => ({
      date: formatLogDate(date),
      detail: "At least one saved workout activity on this day.",
      title: "Training day",
      value: "saved",
    }));
  }

  if (record.label === "Lowest Weight") {
    return topBy(data.weights, (entry) => -entry.weight).map((entry) => ({
      date: formatLogDate(entry.date),
      detail: `Saved as ${entry.moment ?? "check-in"}.`,
      title: "Weigh-in",
      value: `${entry.weight.toFixed(1)} lb`,
    }));
  }

  if (record.label === "Reset Wins") {
    return byDate(data.behaviorWins).map((entry) => ({
      date: formatLogDate(entry.date),
      detail: `Reason: ${entry.reason}`,
      title: "Meditation / reset",
      value: entry.label,
    }));
  }

  if (record.label === "Longest Workout") {
    return topBy(timedWorkouts(data), (entry) => entry.minutes).map((entry) => ({
      date: formatLogDate(entry.date),
      detail: entry.detail,
      title: entry.title,
      value: `${entry.minutes} min`,
    }));
  }

  return [];
}

function topBy<T>(items: T[], valueFor: (item: T) => number, count = 5) {
  return [...items]
    .sort((a, b) => valueFor(b) - valueFor(a))
    .slice(0, count);
}

function byDate<T extends { date: string }>(items: T[], count = 5) {
  return [...items]
    .sort((a, b) => normalizeLogDate(b.date).localeCompare(normalizeLogDate(a.date)))
    .slice(0, count);
}

function workoutDays(data: RebuildData) {
  return Array.from(
    new Set(timedWorkouts(data).map((entry) => normalizeLogDate(entry.date))),
  )
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 7);
}

function timedWorkouts(data: RebuildData) {
  return [
    ...data.bikeSessions.map((session) => ({
      date: session.date,
      detail: `Resistance ${session.resistance} · ${bikeDistanceForSession(session).toFixed(1)} mi${session.distanceEstimated || !session.distanceMiles ? " est." : ""}`,
      minutes: session.minutes,
      title: "Bike session",
    })),
    ...data.jacobsLadderSessions.map((session) => ({
      date: session.date,
      detail: `${session.duration} total · ${session.longestContinuous} continuous`,
      minutes: Math.round(timeToSeconds(session.duration) / 60),
      title: "Jacob's Ladder",
    })),
    ...data.machineWorkoutSessions.map((session) => ({
      date: session.date,
      detail: `${session.machine}${session.category ? ` · ${session.category}` : ""}`,
      minutes: session.minutes ?? Math.max((session.sets ?? 0) * 4, 8),
      title: "Machine session",
    })),
    ...data.swimSessions.map((session) => ({
      date: session.date,
      detail: `${session.distance} yd · ${session.stroke}`,
      minutes: session.minutes,
      title: "Swim",
    })),
    ...data.yogaSessions.map((session) => ({
      date: session.date,
      detail: session.focus,
      minutes: session.minutes,
      title: "Yoga",
    })),
    ...data.kettlebellSessions.map((session) => ({
      date: session.date,
      detail: `${session.exercise} · ${session.weight} lb · ${session.reps} reps`,
      minutes: 12,
      title: "Kettlebell",
    })),
    ...data.strengthAccessorySessions.map((session) => ({
      date: session.date,
      detail: `${session.exercise} · ${session.weight} lb · ${session.reps} reps`,
      minutes: 20,
      title: "Strength",
    })),
    ...data.farmerCarrySessions.map((session) => ({
      date: session.date,
      detail: `${session.weightEachHand} lb each hand · ${session.distanceFeet * session.rounds} ft total`,
      minutes: 8,
      title: "Farmer carry",
    })),
    ...data.pushUpSessions.map((session) => ({
      date: session.date,
      detail: `${session.sets.reduce((sum, reps) => sum + reps, 0)} total reps`,
      minutes: 5,
      title: "Push-ups",
    })),
  ];
}

function Sparkline({ values }: { values: number[] }) {
  const cleanValues = values.filter((value) => Number.isFinite(value) && value > 0);

  if (!cleanValues.length) {
    return <p className="text-sm leading-5 text-white/45">No history yet. The first saved entry becomes the baseline.</p>;
  }

  const max = Math.max(...cleanValues);
  const min = Math.min(...cleanValues);

  return (
    <div className="flex h-20 items-end gap-1.5">
      {cleanValues.slice(-12).map((value, index) => {
        const height = 22 + ((value - min) / Math.max(max - min, 1)) * 58;
        return (
          <div key={`${value}-${index}`} className="flex flex-1 items-end rounded-full bg-white/[0.055] p-1">
            <div
              className="w-full rounded-full bg-champagne transition-all duration-500 ease-out"
              style={{ height: `${height}%` }}
              aria-label={`${value}`}
            />
          </div>
        );
      })}
    </div>
  );
}
