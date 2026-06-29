"use client";

import { CalendarDays, CheckCircle2, Clock3, Dumbbell, MapPin, UserRound } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  classesForDay,
  currentStudioDay,
  studioClassDays,
  totalFitnessClassSchedule,
  totalFitnessScheduleNotes,
  type StudioClass,
  type StudioClassCategory,
  type StudioClassDay,
} from "@/data/class-schedule";
import { Section } from "@/components/section";
import type { LogKind } from "@/types/rebuild";

export function ClassSchedule({
  onOpenLog,
}: {
  onOpenLog: (kind: LogKind, draft?: Record<string, string>) => void;
}) {
  const [selectedDay, setSelectedDay] = useState<StudioClassDay>(() => currentStudioDay());
  const [plannedClasses, setPlannedClasses] = useState<Record<string, boolean>>({});
  const selectedClasses = useMemo(() => classesForDay(selectedDay), [selectedDay]);
  const today = currentStudioDay();
  const todayClasses = classesForDay(today);
  const featured = todayClasses[0] ?? totalFitnessClassSchedule[0];

  return (
    <Section id="classes" eyebrow="Total Fitness" title="Studio Classes">
      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.045] shadow-panel">
        <button
          type="button"
          onClick={() => setSelectedDay(today)}
          className="group relative min-h-[24rem] w-full overflow-hidden bg-black text-left active:scale-[0.99]"
        >
          <Image
            src={featured.image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 448px"
            className="object-cover object-center opacity-78 transition duration-300 group-active:scale-[1.02]"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black via-black/42 to-black/8" />
          <span className="absolute left-5 right-5 top-5 flex items-center justify-between gap-3">
            <span className="rounded-full border border-white/18 bg-black/42 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/76 backdrop-blur">
              {totalFitnessScheduleNotes.month}
            </span>
            <span className="grid size-11 place-items-center rounded-full bg-white text-carbon">
              <CalendarDays size={19} strokeWidth={2.3} aria-hidden />
            </span>
          </span>
          <span className="absolute bottom-5 left-5 right-5">
            <span className="metric-label block text-white/64">Today at Total Fitness</span>
            <span className="mt-2 block font-display text-5xl font-black uppercase leading-[0.92] tracking-normal text-white">
              {todayClasses.length ? `${todayClasses.length} classes` : "Open floor"}
            </span>
            <span className="mt-3 block max-w-[19rem] text-sm font-semibold leading-5 text-white/74">
              Tap a class to log it, or scan the full week before you leave for the gym.
            </span>
          </span>
        </button>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-2">
            <ScheduleStat label="This week" value={`${totalFitnessClassSchedule.length}`} detail="studio options" />
            <ScheduleStat label="Today" value={`${todayClasses.length}`} detail={today} />
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {studioClassDays.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-black ${
                  selectedDay === day
                    ? "border-champagne bg-champagne text-[rgb(var(--color-accent-foreground))]"
                    : "border-white/10 bg-carbon text-white/62"
                }`}
              >
                {shortDay(day)}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <p className="metric-label">Selected day</p>
              <h3 className="mt-1 text-2xl font-black uppercase leading-none text-porcelain">{selectedDay}</h3>
            </div>
            <p className="rounded-full bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-white/54">
              {selectedClasses.length} classes
            </p>
          </div>

          <div className="mt-4 space-y-4">
            {selectedClasses.map((item) => (
              <ClassCard
                key={item.id}
                item={item}
                onLog={() => onOpenLog(item.logKind, item.logDraft)}
                onTogglePlan={() => setPlannedClasses((current) => ({ ...current, [item.id]: !current[item.id] }))}
                planned={Boolean(plannedClasses[item.id])}
              />
            ))}
          </div>

          {selectedDay === "Friday" ? (
            <div className="mt-4 rounded-2xl border border-ember/20 bg-ember/10 p-4">
              <p className="font-black uppercase tracking-[0.16em] text-ember">June note</p>
              <p className="mt-2 text-sm leading-5 text-white/62">No studio classes on 6/19 in observance of Juneteenth Day.</p>
            </div>
          ) : null}

          <div className="mt-4 grid gap-2">
            <InfoRow icon={MapPin} title="Member access" detail={totalFitnessScheduleNotes.access} />
            <InfoRow icon={UserRound} title="Kids Corner" detail={totalFitnessScheduleNotes.kidsCorner} />
          </div>

          <p className="mt-4 text-xs font-semibold leading-5 text-white/35">{totalFitnessScheduleNotes.source}</p>
        </div>
      </div>
    </Section>
  );
}

function ClassCard({
  item,
  onLog,
  onTogglePlan,
  planned,
}: {
  item: StudioClass;
  onLog: () => void;
  onTogglePlan: () => void;
  planned: boolean;
}) {
  return (
    <article className="overflow-hidden rounded-[1.65rem] bg-[#f1eee8] text-[#08090a] shadow-panel">
      <div className="relative min-h-56 bg-black">
        <Image
          src={item.image}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 448px"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/86 via-black/20 to-black/4" />
        <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
          <div className="rounded-full bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#08090a] shadow-panel">
            {categoryLabel(item.category)}
          </div>
          <button
            type="button"
            onClick={onTogglePlan}
            className={`grid size-10 place-items-center rounded-full border shadow-panel ${
              planned ? "border-signal bg-signal text-carbon" : "border-white/25 bg-black/45 text-white"
            }`}
            aria-label={planned ? `Remove ${item.title} from plan` : `Add ${item.title} to plan`}
          >
            <CheckCircle2 size={19} strokeWidth={2.4} aria-hidden />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-white/76">
            <Clock3 size={15} strokeWidth={2.3} aria-hidden />
            {item.start} - {item.end}
          </p>
          <h3 className="mt-2 max-w-[18rem] text-3xl font-black uppercase leading-[0.94] tracking-normal text-white">
            {item.title}
          </h3>
        </div>
      </div>
      <div className="bg-[#f1eee8] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-black/45">Instructor</p>
            <p className="mt-1 text-xl font-black text-[#08090a]">{item.instructor}</p>
            {item.note ? <p className="mt-2 text-sm font-bold leading-5 text-ember">{item.note}</p> : null}
          </div>
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-champagne text-[rgb(var(--color-accent-foreground))]">
            <Dumbbell size={19} strokeWidth={2.4} aria-hidden />
          </div>
        </div>
        <button
          type="button"
          onClick={onLog}
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#08090a] px-5 text-sm font-black uppercase tracking-[0.1em] text-white active:scale-[0.98]"
        >
          Log this class
        </button>
      </div>
    </article>
  );
}

function ScheduleStat({ detail, label, value }: { detail: string; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-carbon p-4">
      <p className="metric-label">{label}</p>
      <p className="mt-1 font-display text-4xl font-black uppercase leading-none text-champagne">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-white/42">{detail}</p>
    </div>
  );
}

function InfoRow({
  detail,
  icon: Icon,
  title,
}: {
  detail: string;
  icon: typeof MapPin;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-carbon p-3">
      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-champagne/10 text-champagne">
        <Icon size={17} strokeWidth={2.3} aria-hidden />
      </div>
      <div>
        <p className="font-black text-porcelain">{title}</p>
        <p className="mt-1 text-xs font-semibold leading-4 text-white/45">{detail}</p>
      </div>
    </div>
  );
}

function categoryLabel(category: StudioClassCategory) {
  if (category === "senior") return "Silver";
  if (category === "therapy") return "Therapy";
  return category;
}

function shortDay(day: StudioClassDay) {
  return day.slice(0, 3);
}
