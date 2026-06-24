import { Cloud, HeartPulse, LockKeyhole, Watch } from "lucide-react";
import { Section } from "@/components/section";

const steps = [
  {
    title: "Current app",
    detail: "Manual logs stay local first, with Supabase backup when connected.",
    icon: LockKeyhole,
  },
  {
    title: "Health import",
    detail: "A native iPhone companion can request Health permission and import workout summaries.",
    icon: HeartPulse,
  },
  {
    title: "Watch companion",
    detail: "A watchOS app can capture quick starts, heart-rate context, and post-workout notes.",
    icon: Watch,
  },
];

export function AppleHealthRoadmap() {
  return (
    <Section id="apple-watch" eyebrow="Future bridge" title="Apple Watch">
      <div className="panel p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="metric-label">Health data path</p>
            <h3 className="mt-1 text-xl font-semibold leading-tight text-porcelain">Possible, but native.</h3>
          </div>
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-signal/10 text-signal">
            <Cloud size={19} strokeWidth={2.2} aria-hidden />
          </div>
        </div>
        <p className="text-sm leading-5 text-white/55">
          The web app cannot directly read Apple Watch workouts. The right production path is a small iOS/watchOS companion that asks for Health permission, then syncs approved summaries into REBUILD.
        </p>
        <div className="mt-4 grid gap-2">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <article key={step.title} className="flex items-start gap-3 rounded-2xl bg-white/[0.055] p-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-champagne">
                  <Icon size={18} strokeWidth={2.2} aria-hidden />
                </div>
                <div>
                  <p className="font-semibold text-porcelain">{step.title}</p>
                  <p className="mt-1 text-sm leading-5 text-white/45">{step.detail}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
