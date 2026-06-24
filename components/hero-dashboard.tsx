import { Bike, Headphones, RotateCcw, Scale, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { tidalPlaylistUrl } from "@/data/mock-data";
import type { AppView, OnboardingProfile, RebuildData } from "@/types/rebuild";
import { getTodaysBikeMinutes } from "@/lib/rebuild-data";
import { formatMinutes, formatWeight } from "@/lib/metrics";

export function HeroDashboard({
  data,
  onNavigate,
  onQuickAdd,
  onReset,
  profile,
}: {
  data: RebuildData;
  onNavigate: (view: AppView) => void;
  onQuickAdd: () => void;
  onReset: () => void;
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
      <div className="relative min-h-[360px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-black shadow-panel">
        <Image
          src="/rebuild-bike-room.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 448px"
          className="object-cover object-[52%_40%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.40),rgba(0,0,0,0.20)_34%,rgba(0,0,0,0.90))]" />
        <div className="relative flex min-h-[360px] flex-col justify-between p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="w-40 overflow-hidden rounded-xl border border-white/10 bg-black/70 backdrop-blur">
              <Image
                src="/rebuild-logo.png"
                alt="REBUILD. Better every day."
                width={1774}
                height={887}
                priority
                className="aspect-[2.4/1] w-full object-cover object-center"
              />
            </div>
            <p className="rounded-full border border-white/10 bg-black/50 px-3 py-2 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white/70 backdrop-blur">
              {profile?.goal ?? "Fresh start"}
            </p>
          </div>

          <div>
            <p className="metric-label text-white/60">Today</p>
            <h2 className="mt-2 text-3xl font-semibold leading-none text-porcelain">
              {hasLogs ? "Next rep." : "Blank slate."}
            </h2>
            <p className="mt-2 max-w-[18rem] text-sm leading-5 text-white/68">
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
                  className="min-h-11 rounded-2xl bg-black/55 px-3 text-sm font-semibold text-porcelain backdrop-blur"
                >
                  Log reset
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate("progress")}
                  className="min-h-11 rounded-2xl bg-black/55 px-3 text-sm font-semibold text-porcelain backdrop-blur"
                >
                  View progress
                </button>
              </div>
              <button
                type="button"
                onClick={onReset}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl bg-black/35 px-3 text-xs font-bold uppercase tracking-[0.14em] text-white/62 backdrop-blur"
              >
                <RotateCcw size={14} aria-hidden />
                Reset data
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
