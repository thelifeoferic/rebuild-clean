"use client";

import { Bike, CheckCircle2, Copy, Flame, Pencil, Scale, Trash2, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import type { LogKind, TimelineItem } from "@/types/rebuild";
import { EmptyState } from "@/components/empty-state";
import { Section } from "@/components/section";

const toneClasses = {
  gold: "border-champagne/50 bg-champagne/10 text-champagne",
  green: "border-signal/50 bg-signal/10 text-signal",
  ember: "border-ember/50 bg-ember/10 text-ember",
  steel: "border-white/20 bg-white/10 text-white/70",
};

export function RebuildTimeline({
  onDelete,
  onDuplicate,
  onEdit,
  onOpenLog,
  timeline,
}: {
  onDelete?: (kind: LogKind, id: string) => void;
  onDuplicate?: (kind: LogKind, id: string) => void;
  onEdit?: (kind: LogKind, id: string) => void;
  onOpenLog?: (kind: LogKind) => void;
  timeline: TimelineItem[];
}) {
  const [filter, setFilter] = useState<TimelineFilter>("All");
  const filteredTimeline = useMemo(
    () => timeline.filter((item) => filter === "All" || classifyTimelineItem(item) === filter),
    [filter, timeline],
  );

  return (
    <Section id="timeline" eyebrow="Identity reps" title="Rebuild Timeline">
      <div className="panel p-4">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`min-h-9 shrink-0 rounded-full border px-3 text-xs font-bold ${
                filter === item ? "border-champagne bg-champagne text-carbon" : "border-white/10 bg-carbon/70 text-white/55"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {filteredTimeline.length ? filteredTimeline.map((item) => {
            const Icon = iconForTimelineItem(item);
            return (
            <article key={item.id} className="relative rounded-2xl border border-white/10 bg-carbon/70 p-4">
              <div className="flex gap-3">
                <div className={`grid size-9 shrink-0 place-items-center rounded-full border ${toneClasses[item.tone]}`}>
                  <Icon size={18} strokeWidth={2.2} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/38">{item.date}</p>
                  <h3 className="mt-1 text-base font-semibold text-porcelain">{item.title}</h3>
                  <p className="mt-1 text-sm leading-5 text-white/56">{item.detail}</p>
                  {item.editable ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {onEdit ? (
                        <TimelineAction
                          icon={Pencil}
                          label="Edit"
                          onClick={() => onEdit(item.editable!.kind, item.editable!.id)}
                        />
                      ) : null}
                      {onDuplicate ? (
                        <TimelineAction
                          icon={Copy}
                          label="Repeat"
                          onClick={() => onDuplicate(item.editable!.kind, item.editable!.id)}
                        />
                      ) : null}
                      {onDelete ? (
                        <TimelineAction
                          icon={Trash2}
                          label="Delete"
                          onClick={() => {
                            if (window.confirm(`Delete ${item.title}?`)) onDelete(item.editable!.kind, item.editable!.id);
                          }}
                          tone="danger"
                        />
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
            );
          }) : (
            <EmptyState
              action={onOpenLog ? { label: "Log something", onClick: () => onOpenLog("bike") } : undefined}
              detail="Your story starts with the first entry. Workouts, records, weight milestones, and pattern interrupts will collect here."
              icon={CheckCircle2}
              title="The timeline is ready."
            />
          )}
        </div>
      </div>
    </Section>
  );
}

function TimelineAction({
  icon: Icon,
  label,
  onClick,
  tone = "default",
}: {
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-9 items-center justify-center gap-1 rounded-full px-3 text-xs font-bold ${
        tone === "danger" ? "bg-ember/10 text-ember" : "bg-white/10 text-white/62"
      }`}
    >
      <Icon size={13} strokeWidth={2.2} aria-hidden />
      {label}
    </button>
  );
}

const filters = ["All", "Workouts", "Records", "Milestones", "Patterns"] as const;
type TimelineFilter = (typeof filters)[number];

function classifyTimelineItem(item: TimelineItem): TimelineFilter {
  const kind = item.editable?.kind;
  if (kind === "mood") return "Patterns";
  if (item.title.toLowerCase().includes("record") || item.date === "Best") return "Records";
  if (kind === "weight" || item.title.toLowerCase().includes("milestone")) return "Milestones";
  if (kind && ["bike", "jacobsLadder", "pushUps", "dumbbellCurls", "strength", "machine", "kettlebell", "farmerCarries", "swim", "yoga"].includes(kind)) {
    return "Workouts";
  }
  return "All";
}

function iconForTimelineItem(item: TimelineItem) {
  const kind = item.editable?.kind;
  if (kind === "mood") return Flame;
  if (kind === "weight") return Scale;
  if (item.title.toLowerCase().includes("record") || item.date === "Best") return Trophy;
  if (kind === "bike") return Bike;
  return CheckCircle2;
}
