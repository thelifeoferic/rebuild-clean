"use client";

import { Bike, CircleGauge, Dumbbell, Footprints, LineChart, Scale, ShieldCheck, Timer, Trophy } from "lucide-react";
import { useState } from "react";
import { CountUp } from "@/components/count-up";
import { EmptyState } from "@/components/empty-state";
import { Section } from "@/components/section";
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
  onClick,
  onOpenLog,
  record,
}: {
  active: boolean;
  onClick: () => void;
  onOpenLog: (kind: LogKind) => void;
  record: PersonalRecord;
}) {
  const Icon = iconMap[record.icon];
  const hasValue = record.value !== "—";

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
          <p className="metric-label mb-3">Record history</p>
          <Sparkline values={record.history} />
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
