import { Bike, Headphones, Scale, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { tidalPlaylistUrl } from "@/data/mock-data";
import type { AppView, OnboardingProfile, RebuildData } from "@/types/rebuild";
import { getTodaysBikeMinutes } from "@/lib/rebuild-data";
import { formatMinutes, formatWeight } from "@/lib/metrics";

export function HeroDashboard({
  data,
  onNavigate,
  onQuickAdd,
  profile,
}: {
  data: RebuildData;
  onNavigate: (view: AppView) => void;
  onQuickAdd: () => void;
  profile: OnboardingProfile | null;
}) {
  const todayWeight = data.weights[0]?.weight ?? 0;
  const todaysBikeMinutes = getTodaysBikeMinutes(data);
  const hasLogs =
    data.weights.length +
      data.bikeSessions.length +
      data.pushUpSessions.length +
      data.behaviorWins.length +
      data.meals.length >
    0;

  return (
    <section className="px-4 pb-4 pt-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="metric-label mb-2">{profile?.goal ?? "Fresh start"}</p>
          <div className="w-48 overflow-hidden rounded-xl border border-white/10 bg-black sm:w-56">
            <Image
              src="/rebuild-logo.png"
              alt="REBUILD. Better every day."
              width={1774}
              height={887}
              priority
              className="aspect-[2.4/1] w-full object-cover object-center"
            />
          </div>
        </div>
      </div>

      <div className="panel p-5">
        <div className="relative">
          <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-champagne/70 to-transparent" />
          <p className="metric-label">Today</p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight text-porcelain">
            {hasLogs ? "Next rep." : "Blank slate."}
          </h2>
          <p className="mt-2 text-sm leading-5 text-white/55">
            {hasLogs
              ? "Log the next action and let the numbers stay honest."
              : "Start with one clean entry when tomorrow begins."}
          </p>

          <div className="mt-5 grid gap-2">
            <button
              type="button"
              onClick={() => onNavigate("log")}
              className="min-h-12 rounded-2xl bg-champagne px-4 text-base font-bold text-carbon shadow-glow"
            >
              Log workout
            </button>
            <a
              href={tidalPlaylistUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-signal px-3 text-sm font-bold text-carbon"
            >
              <Headphones size={17} strokeWidth={2.2} aria-hidden />
              Start TIDAL playlist
            </a>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onQuickAdd}
                className="min-h-11 rounded-2xl bg-white/10 px-3 text-sm font-semibold text-porcelain"
              >
                Log reset
              </button>
              <button
                type="button"
                onClick={() => onNavigate("progress")}
                className="min-h-11 rounded-2xl bg-white/10 px-3 text-sm font-semibold text-porcelain"
              >
                View progress
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniStat label="Weight" value={data.weights.length ? formatWeight(todayWeight) : "--"} icon={Scale} />
        <MiniStat label="Bike" value={formatMinutes(todaysBikeMinutes)} icon={Bike} />
        <MiniStat label="Wins" value={`${data.behaviorWins.length}`} icon={ShieldCheck} />
      </div>
    </section>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Scale;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
      <Icon className="mb-2 text-champagne" size={17} strokeWidth={2.1} aria-hidden />
      <p className="metric-label">{label}</p>
      <p className="mt-1 text-base font-semibold text-porcelain">{value}</p>
    </div>
  );
}
