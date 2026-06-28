"use client";

import { useEffect, useState } from "react";
import { DailyCalendar } from "@/components/daily-calendar";
import { PersonalRecords } from "@/components/personal-records";
import { ProgressTrends } from "@/components/progress-trends";
import { RebuildTimeline } from "@/components/rebuild-timeline";
import { StreakSummary } from "@/components/streak-summary";
import type { LogKind, OnboardingProfile, RebuildData, TimelineItem } from "@/types/rebuild";

const tabs = ["Today", "Trends", "Records", "Timeline", "Consistency"] as const;
type RecordsTab = (typeof tabs)[number];

export function RecordsHub({
  data,
  onDelete,
  onDuplicate,
  onEdit,
  onOpenLog,
  profile,
  resetSignal,
  timeline,
}: {
  data: RebuildData;
  onDelete: (kind: LogKind, id: string) => void;
  onDuplicate: (kind: LogKind, id: string) => void;
  onEdit: (kind: LogKind, id: string) => void;
  onOpenLog: (kind: LogKind, draft?: Record<string, string>) => void;
  profile: OnboardingProfile | null;
  resetSignal: number;
  timeline: TimelineItem[];
}) {
  const [activeTab, setActiveTab] = useState<RecordsTab>("Today");

  useEffect(() => {
    setActiveTab("Today");
  }, [resetSignal]);

  return (
    <>
      <div className="sticky top-0 z-30 bg-carbon/92 px-4 pt-5 backdrop-blur-xl">
        <p className="metric-label">Your fitness record</p>
        <h1 className="mt-1 text-3xl font-semibold text-porcelain">The Rebuild</h1>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-bold ${
                activeTab === tab ? "border-champagne bg-champagne text-carbon" : "border-white/10 bg-white/[0.055] text-white/62"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "Today" ? (
        <DailyCalendar
          data={data}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onEdit={onEdit}
          onOpenLog={onOpenLog}
          profile={profile}
        />
      ) : null}
      {activeTab === "Trends" ? <ProgressTrends data={data} /> : null}
      {activeTab === "Records" ? <PersonalRecords data={data} onOpenLog={onOpenLog} /> : null}
      {activeTab === "Timeline" ? (
        <RebuildTimeline
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onEdit={onEdit}
          onOpenLog={onOpenLog}
          timeline={timeline}
        />
      ) : null}
      {activeTab === "Consistency" ? <StreakSummary data={data} /> : null}
    </>
  );
}
