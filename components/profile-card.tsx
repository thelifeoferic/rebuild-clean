import { RotateCcw, UserRound } from "lucide-react";
import { Section } from "@/components/section";
import type { OnboardingProfile } from "@/types/rebuild";

export function ProfileCard({
  onRestart,
  profile,
}: {
  onRestart: () => void;
  profile: OnboardingProfile | null;
}) {
  const firstName = profile?.firstName?.trim() || "Member";
  const goals = profile?.goals?.length ? profile.goals : profile?.goal ? [profile.goal] : ["Rebuild discipline"];
  const equipmentCount = profile?.equipment?.length ?? 0;

  return (
    <Section id="profile" eyebrow="Member profile" title={`Hi, ${firstName}`}>
      <div className="panel p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="metric-label">Operating profile</p>
            <h3 className="mt-1 text-xl font-semibold text-porcelain">{goals.slice(0, 2).join(" + ")}</h3>
            <p className="mt-1 text-sm leading-5 text-white/45">
              {equipmentCount} equipment options selected. Training recommendations use this profile first.
            </p>
          </div>
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-champagne/10 text-champagne">
            <UserRound size={19} strokeWidth={2.2} aria-hidden />
          </div>
        </div>

        {profile?.why ? (
          <div className="mb-3 rounded-2xl bg-white/[0.055] p-3">
            <p className="metric-label mb-1">Why</p>
            <p className="text-sm leading-5 text-white/58">{profile.why}</p>
          </div>
        ) : null}

        <div className="mb-3 flex flex-wrap gap-2">
          {[
            ...goals.slice(0, 4),
            `${profile?.preferredTrainingMinutes ?? 25} min`,
            profile?.defaultLocation ?? "gym",
            profile?.themePreference ?? "dark",
            profile?.accentColor ?? "champagne",
            profile?.coachingTone ?? "calm",
          ].map((item) => (
            <span key={item} className="rounded-full bg-white/[0.055] px-3 py-1 text-xs font-bold capitalize text-white/55">
              {item}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-3 text-sm font-bold text-white/62"
        >
          <RotateCcw size={16} strokeWidth={2.2} aria-hidden />
          Redo setup, keep logs
        </button>
      </div>
    </Section>
  );
}
