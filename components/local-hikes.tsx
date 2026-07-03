"use client";

import { ArrowUpRight, Clock3, Flame, MapPin, Mountain, Route, type LucideIcon } from "lucide-react";
import Image from "next/image";
import {
  estimateHikeCalories,
  estimateHikeCaloriesRange,
  formatHikeDuration,
  getReferenceWeightForHikes,
  localHikes,
  suggestedHikeMinutes,
  type LocalHike,
} from "@/data/local-hikes";
import type { LogKind, OnboardingProfile, RebuildData } from "@/types/rebuild";

export function LocalHikesPanel({
  data,
  mode = "programs",
  onOpenLog,
  profile,
}: {
  data?: RebuildData;
  mode?: "home" | "programs";
  onOpenLog: (kind: LogKind, draft?: Record<string, string>) => void;
  profile: OnboardingProfile | null;
}) {
  const referenceWeight = getReferenceWeightForHikes(data, profile);
  const hikes = mode === "home" ? localHikes.slice(0, 3) : localHikes;

  function openHikeLog(hike: LocalHike) {
    onOpenLog("machine", {
      calories: String(estimateHikeCalories(hike, referenceWeight)),
      category: "Outdoor",
      distanceMiles: String(hike.distanceMiles),
      gymName: "Outdoor",
      machine: `Hike - ${hike.name}`,
      minutes: String(suggestedHikeMinutes(hike)),
      notes: `${hike.difficulty} ${hike.route.toLowerCase()} near ${hike.area}. ${hike.notes}`,
    });
  }

  return (
    <section className={mode === "home" ? "mt-4" : "px-4 py-5"}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="metric-label">Outside counts</p>
          <h2 className="mt-1 text-xl font-semibold text-porcelain">{mode === "home" ? "Local hikes" : "Local Hikes"}</h2>
        </div>
        {mode === "programs" ? (
          <a
            href={localHikes[0]?.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.12em] text-champagne"
          >
            Source
            <ArrowUpRight size={13} strokeWidth={2.4} aria-hidden />
          </a>
        ) : null}
      </div>

      <div className={mode === "home" ? "grid gap-3" : "grid gap-4"}>
        {hikes.map((hike) => {
          const [lowCalories, highCalories] = estimateHikeCaloriesRange(hike, referenceWeight);

          return (
            <article key={hike.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] shadow-panel">
              <div className={mode === "home" ? "relative min-h-[12.5rem] bg-black" : "relative min-h-[16rem] bg-black"}>
                <Image
                  src={hike.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 448px"
                  className="object-cover opacity-86"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/24 to-black/12" />
                <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3">
                  <span className="rounded-full border border-white/20 bg-black/34 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-white">
                    {hike.difficulty}
                  </span>
                  <span className="rounded-full bg-champagne px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[rgb(var(--color-accent-foreground))]">
                    {hike.distanceMiles} mi
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/72">
                    <MapPin size={14} strokeWidth={2.3} aria-hidden />
                    {hike.area}
                  </p>
                  <h3 className="mt-2 text-3xl font-black uppercase leading-none text-white">{hike.name}</h3>
                  <p className="mt-2 max-w-[22rem] text-sm font-semibold leading-5 text-white/76">{hike.notes}</p>
                </div>
              </div>

              <div className="grid gap-3 p-4">
                <div className="grid grid-cols-2 gap-2">
                  <HikeMetric icon={Route} label="Route" value={hike.route} />
                  <HikeMetric icon={Clock3} label="Time" value={formatHikeDuration(hike)} />
                  <HikeMetric icon={Flame} label="Burn" value={`${lowCalories}-${highCalories} cal`} />
                  <HikeMetric icon={Mountain} label="Gain" value={`${hike.elevationFeet} ft`} />
                </div>

                <button
                  type="button"
                  onClick={() => openHikeLog(hike)}
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-champagne px-4 text-sm font-black uppercase tracking-[0.08em] text-[rgb(var(--color-accent-foreground))] shadow-glow active:scale-[0.98]"
                >
                  Log hike
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {mode === "programs" ? (
        <p className="mt-4 text-xs font-semibold leading-5 text-white/46">
          Distances and durations are pulled from the Joshua Tree National Park hiking guide. Calorie burn is an estimate using your saved weight and route difficulty. Avoid exposed routes in heat and bring more water than feels necessary.
        </p>
      ) : null}
    </section>
  );
}

function HikeMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-carbon/70 p-3">
      <Icon className="mb-2 text-champagne" size={16} strokeWidth={2.2} aria-hidden />
      <p className="metric-label">{label}</p>
      <p className="mt-1 text-sm font-black text-porcelain">{value}</p>
    </div>
  );
}
