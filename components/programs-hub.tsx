"use client";

import { useEffect, useState } from "react";
import { BikeDashboard } from "@/components/bike-dashboard";
import { ExerciseGuides } from "@/components/exercise-guides";
import { FormVisuals } from "@/components/form-visuals";
import { FuelGuide } from "@/components/fuel-guide";
import { GoalTrainingPlan } from "@/components/goal-training-plan";
import { KettlebellPrograms } from "@/components/kettlebell-programs";
import { MeditationPrograms } from "@/components/meditation-programs";
import { TrainingOverview } from "@/components/training-overview";
import { VideoLibrary } from "@/components/video-library";
import { WorkoutStopwatch } from "@/components/workout-stopwatch";
import { WorkoutPrograms } from "@/components/workout-programs";
import type { LogKind, OnboardingProfile, RebuildData } from "@/types/rebuild";

const tabs = ["Today", "Programs", "Guides", "Meditation", "Nutrition", "Media"] as const;
type ProgramsTab = (typeof tabs)[number];
const programsTabIntentKey = "rebuild:programs-tab:intent";

export function ProgramsHub({
  data,
  onOpenLog,
  profile,
}: {
  data: RebuildData;
  onOpenLog: (kind: LogKind, draft?: Record<string, string>) => void;
  profile: OnboardingProfile | null;
}) {
  const [activeTab, setActiveTab] = useState<ProgramsTab>("Today");

  useEffect(() => {
    const target = window.sessionStorage.getItem(programsTabIntentKey);
    if (target && tabs.includes(target as ProgramsTab)) {
      setActiveTab(target as ProgramsTab);
      window.sessionStorage.removeItem(programsTabIntentKey);
    }
  }, []);

  return (
    <>
      <div className="sticky top-0 z-30 bg-carbon/92 px-4 pt-5 backdrop-blur-xl">
        <p className="metric-label">Built around your tools</p>
        <h1 className="mt-1 text-3xl font-semibold text-porcelain">Programs</h1>
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
        <>
          <div className="px-4 pt-5">
            <WorkoutStopwatch />
          </div>
          <GoalTrainingPlan data={data} onOpenLog={onOpenLog} profile={profile} />
          <TrainingOverview data={data} />
        </>
      ) : null}

      {activeTab === "Programs" ? (
        <>
          <WorkoutPrograms profile={profile} />
          <BikeDashboard data={data} />
          <KettlebellPrograms data={data} />
        </>
      ) : null}

      {activeTab === "Guides" ? (
        <>
          <FormVisuals />
          <ExerciseGuides onOpenLog={onOpenLog} />
        </>
      ) : null}

      {activeTab === "Meditation" ? <MeditationPrograms onOpenLog={onOpenLog} /> : null}
      {activeTab === "Nutrition" ? <FuelGuide /> : null}
      {activeTab === "Media" ? <VideoLibrary profile={profile} /> : null}
    </>
  );
}
