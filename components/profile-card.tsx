"use client";

/* eslint-disable @next/next/no-img-element */

import { Building2, Camera, Loader2, RotateCcw, Trash2, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Section } from "@/components/section";
import { prepareProfileAvatar, uploadProfileAvatar } from "@/lib/profile-avatar";
import { getSupabaseClient } from "@/lib/supabase";
import { saveCloudProfile } from "@/lib/supabase-sync";
import type { OnboardingProfile } from "@/types/rebuild";

export function ProfileCard({
  onUpdateProfile,
  onRestart,
  profile,
}: {
  onUpdateProfile: (profile: OnboardingProfile) => void;
  onRestart: () => void;
  profile: OnboardingProfile | null;
}) {
  const client = useMemo(() => getSupabaseClient(), []);
  const firstName = profile?.firstName?.trim() || "Member";
  const goals = profile?.goals?.length ? profile.goals : profile?.goal ? [profile.goal] : ["Rebuild discipline"];
  const equipmentCount = profile?.equipment?.length ?? 0;
  const homeGymEquipment = profile?.homeGymEquipment ?? [];
  const avatarSrc = profile?.avatarDataUrl || profile?.avatarUrl;
  const profileSignals = [
    profile?.age ? `${profile.age} years` : null,
    profile?.height || null,
    profile?.targetWeight ? `${profile.targetWeight} lb target` : null,
  ].filter(Boolean) as string[];
  const [avatarStatus, setAvatarStatus] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  async function changeAvatar(file: File | null) {
    if (!file || !profile) return;

    setIsUploadingAvatar(true);
    setAvatarStatus("");

    try {
      const avatarDataUrl = await prepareProfileAvatar(file);
      let nextProfile: OnboardingProfile = { ...profile, avatarDataUrl };
      onUpdateProfile(nextProfile);
      setAvatarStatus("Profile photo saved on this device.");

      if (!client) return;

      try {
        const avatarUrl = await uploadProfileAvatar(client, avatarDataUrl);
        nextProfile = { ...nextProfile, avatarUrl };
        onUpdateProfile(nextProfile);
        await saveCloudProfile({ client, profile: nextProfile });
        setAvatarStatus("Profile photo saved to your account.");
      } catch (error) {
        setAvatarStatus(error instanceof Error ? `Saved locally. Cloud photo needs setup: ${error.message}` : "Saved locally. Cloud photo needs setup.");
      }
    } catch (error) {
      setAvatarStatus(error instanceof Error ? error.message : "That photo could not be saved.");
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  function removeAvatar() {
    if (!profile) return;
    onUpdateProfile({ ...profile, avatarDataUrl: undefined, avatarUrl: undefined });
    setAvatarStatus("Profile photo removed from this device.");
  }

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
          <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 bg-champagne/10 text-champagne">
            {avatarSrc ? (
              <img src={avatarSrc} alt={`${firstName} profile`} className="h-full w-full object-cover" />
            ) : (
              <UserRound size={24} strokeWidth={2.2} aria-hidden />
            )}
          </div>
        </div>

        <div className={`mb-3 rounded-2xl ${avatarSrc ? "border border-white/10 bg-transparent p-3" : "bg-white/[0.055] p-3"}`}>
          <p className="metric-label mb-2">Profile photo</p>
          <div className={avatarSrc ? "flex items-center justify-between gap-2" : "grid grid-cols-[1fr_auto] gap-2"}>
            {avatarSrc ? <p className="text-sm font-semibold text-white/55">Photo saved</p> : null}
            <label
              className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl px-3 text-sm font-black ${
                avatarSrc ? "border border-white/10 bg-white/[0.055] text-white/70" : "bg-champagne text-carbon"
              }`}
            >
              {isUploadingAvatar ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Camera size={16} strokeWidth={2.2} aria-hidden />}
              {avatarSrc ? "Change photo" : "Add photo"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => void changeAvatar(event.target.files?.[0] ?? null)}
              />
            </label>
            {avatarSrc ? (
              <button
                type="button"
                onClick={removeAvatar}
                className="grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.055] text-white/62"
                aria-label="Remove profile photo"
              >
                <Trash2 size={16} strokeWidth={2.2} aria-hidden />
              </button>
            ) : null}
          </div>
          <p className="mt-2 text-xs leading-5 text-white/42">
            {avatarStatus || "Saved locally first. If you are signed in and the avatars bucket exists, it syncs to Supabase too."}
          </p>
        </div>

        {profile?.why ? (
          <div className="mb-3 rounded-2xl bg-white/[0.055] p-3">
            <p className="metric-label mb-1">Why</p>
            <p className="text-sm leading-5 text-white/58">{profile.why}</p>
          </div>
        ) : null}

        {profile?.homeGymName ? (
          <div className="mb-3 rounded-2xl bg-white/[0.055] p-3">
            <div className="mb-3 flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-champagne/10 text-champagne">
                <Building2 size={18} strokeWidth={2.2} aria-hidden />
              </div>
              <div>
                <p className="metric-label">Home gym</p>
                <p className="mt-1 text-base font-semibold text-porcelain">{profile.homeGymName}</p>
                {profile.homeGymAddress ? <p className="mt-1 text-sm leading-5 text-white/45">{profile.homeGymAddress}</p> : null}
              </div>
            </div>
            <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1">
              {homeGymEquipment.slice(0, 18).map((item) => (
                <span key={item} className="rounded-full bg-carbon px-3 py-1 text-xs font-bold text-white/58">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mb-3 flex flex-wrap gap-2">
          {[
            ...goals.slice(0, 4),
            ...profileSignals,
            `${profile?.preferredTrainingMinutes ?? 25} min`,
            profile?.defaultLocation ?? "gym",
            profile?.themePreference ?? "dark",
            profile?.accentColor ?? "ember",
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
