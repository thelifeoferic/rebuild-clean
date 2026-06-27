"use client";

/* eslint-disable @next/next/no-img-element */

import { Building2, CheckCircle2, ChevronDown, Cloud, MapPin, ScanSearch, UserRound, Watch } from "lucide-react";
import { useMemo, useState } from "react";
import { AccountSync } from "@/components/account-sync";
import { AppleHealthRoadmap } from "@/components/apple-health-roadmap";
import { BodyCheck } from "@/components/body-check";
import { ProfileCard } from "@/components/profile-card";
import { defaultGymEquipment, getGymPreset, localGymPresets } from "@/data/gym-presets";
import type { OnboardingProfile, RebuildData } from "@/types/rebuild";

const tabs = ["Profile", "Setup", "Sync", "Body Check", "Health"] as const;
type MeTab = (typeof tabs)[number];

const behaviorFocusOptions = [
  "Alcohol",
  "Marijuana",
  "Nicotine",
  "Pornography",
  "Social Media",
  "Video Games",
  "Emotional Eating",
  "Shopping",
  "Gambling",
  "Other",
  "Prefer not to say",
];

const goalOptions = [
  "Lose weight",
  "Build strength",
  "Improve cardio",
  "Eat better",
  "Sleep better",
  "Reduce stress",
  "Rebuild discipline",
  "Build confidence",
];

const themeOptions = ["dark", "light", "auto"] as const;
const accentOptions = ["ember", "cobalt", "white", "champagne", "volt"] as const;
const toneOptions = ["calm", "intense", "minimal", "tactical"] as const;
const quoteOptions = ["goggins", "calm", "athlete", "none"] as const;
const locationOptions = ["home", "gym", "travel", "pool"] as const;
const gymSelectorOptions = ["none", ...localGymPresets.map((gym) => gym.id), "custom"] as const;

export function MeHub({
  data,
  onRestart,
  onRestore,
  onUpdateProfile,
  profile,
}: {
  data: RebuildData;
  onRestart: () => void;
  onRestore: (profile: OnboardingProfile | null, data: RebuildData | null) => void;
  onUpdateProfile: (profile: OnboardingProfile) => void;
  profile: OnboardingProfile | null;
}) {
  const [activeTab, setActiveTab] = useState<MeTab>("Profile");
  const firstName = profile?.firstName?.trim() || "Member";
  const avatarSrc = profile?.avatarDataUrl || profile?.avatarUrl;

  return (
    <>
      <div className="sticky top-0 z-30 bg-carbon/92 px-4 pt-5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center overflow-hidden rounded-full border border-white/10 bg-champagne/10 text-champagne">
            {avatarSrc ? (
              <img src={avatarSrc} alt={`${firstName} profile`} className="h-full w-full object-cover" />
            ) : (
              <UserRound size={20} strokeWidth={2.2} aria-hidden />
            )}
          </div>
          <div>
            <p className="metric-label">Identity and backup</p>
            <h1 className="mt-1 text-3xl font-semibold text-porcelain">Me</h1>
          </div>
        </div>
        <p className="mt-3 text-sm leading-5 text-white/50">Hi, {firstName}. This is where the rebuild gets more personal.</p>
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

      {activeTab === "Profile" ? <ProfileCard onRestart={onRestart} onUpdateProfile={onUpdateProfile} profile={profile} /> : null}
      {activeTab === "Setup" ? <ProgressiveSetup onUpdateProfile={onUpdateProfile} profile={profile} /> : null}
      {activeTab === "Sync" ? <AccountSync data={data} onRestore={onRestore} profile={profile} /> : null}
      {activeTab === "Body Check" ? <BodyCheck profile={profile} /> : null}
      {activeTab === "Health" ? <AppleHealthRoadmap /> : null}
    </>
  );
}

function ProgressiveSetup({
  onUpdateProfile,
  profile,
}: {
  onUpdateProfile: (profile: OnboardingProfile) => void;
  profile: OnboardingProfile | null;
}) {
  const [draft, setDraft] = useState<OnboardingProfile>(() => ({
    accentColor: profile?.accentColor ?? "ember",
    avatarDataUrl: profile?.avatarDataUrl,
    avatarUrl: profile?.avatarUrl,
    behaviorFocus: profile?.behaviorFocus ?? [],
    coachingTone: profile?.coachingTone ?? "calm",
    completed: true,
    currentWeight: profile?.currentWeight,
    defaultLocation: profile?.defaultLocation ?? "gym",
    equipment: profile?.equipment ?? [],
    firstName: profile?.firstName ?? "",
    goal: profile?.goal ?? "Rebuild discipline",
    goals: profile?.goals ?? [profile?.goal ?? "Rebuild discipline"],
    height: profile?.height ?? "",
    homeGymAddress: profile?.homeGymAddress ?? "",
    homeGymEquipment: profile?.homeGymEquipment ?? [],
    homeGymId: profile?.homeGymId ?? "none",
    homeGymName: profile?.homeGymName ?? "",
    preferredTrainingMinutes: profile?.preferredTrainingMinutes ?? 25,
    quoteStyle: profile?.quoteStyle ?? "goggins",
    resetPlan: profile?.resetPlan ?? "",
    targetWeight: profile?.targetWeight,
    themePreference: profile?.themePreference ?? "dark",
    why: profile?.why ?? "",
  }));
  const completion = useMemo(() => setupCompletion(draft), [draft]);

  function update<K extends keyof OnboardingProfile>(key: K, value: OnboardingProfile[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function toggle(value: string, key: "goals" | "behaviorFocus") {
    const current = draft[key] ?? [];
    update(key, current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  function toggleHomeGymEquipment(value: string) {
    const current = draft.homeGymEquipment ?? [];
    const nextEquipment = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    update("homeGymEquipment", nextEquipment);
  }

  function selectHomeGym(value: string) {
    const preset = getGymPreset(value);

    if (!preset) {
      setDraft((current) => ({
        ...current,
        defaultLocation: value === "none" ? current.defaultLocation : "gym",
        homeGymAddress: value === "none" ? "" : current.homeGymAddress,
        homeGymEquipment: value === "none" ? [] : current.homeGymEquipment,
        homeGymId: value === "none" ? "none" : "custom",
        homeGymName: value === "none" ? "" : current.homeGymName,
      }));
      return;
    }

    const homeGymEquipment = preset.machines.map((machine) => machine.name);
    setDraft((current) => ({
      ...current,
      defaultLocation: "gym",
      equipment: mergeUnique([...(current.equipment ?? []), ...homeGymEquipment]),
      homeGymAddress: preset.address,
      homeGymEquipment,
      homeGymId: preset.id,
      homeGymName: preset.name,
    }));
  }

  function save() {
    const goals = draft.goals?.length ? draft.goals : [draft.goal || "Rebuild discipline"];
    const homeGymEquipment = draft.homeGymEquipment ?? [];
    onUpdateProfile({
      ...draft,
      goal: goals[0],
      goals,
      completed: true,
      equipment: mergeUnique([...(draft.equipment ?? []), ...homeGymEquipment]),
      height: draft.height?.trim(),
      homeGymAddress: draft.homeGymAddress?.trim(),
      homeGymName: draft.homeGymName?.trim(),
      why: draft.why?.trim(),
    });
  }

  return (
    <section className="px-4 py-5">
      <div className="panel p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="metric-label">Finish setting up REBUILD</p>
            <h2 className="mt-1 text-xl font-semibold text-porcelain">{completion}% complete</h2>
            <p className="mt-1 text-sm leading-5 text-white/45">These details make recommendations, coaching, and the home screen feel less generic.</p>
          </div>
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-champagne/10 text-champagne">
            <ChevronDown size={19} strokeWidth={2.2} aria-hidden />
          </div>
        </div>

        <div className="space-y-4">
          <Field label="Height" value={draft.height ?? ""} onChange={(value) => update("height", value)} placeholder={`5'10"`} />
          <Field label="Why I'm doing this" value={draft.why ?? ""} onChange={(value) => update("why", value)} placeholder="The sentence you want REBUILD to remember." />
          <NumberField label="Target weight" value={draft.targetWeight} onChange={(value) => update("targetWeight", value)} suffix="lb" />
          <NumberField label="Default workout minutes" value={draft.preferredTrainingMinutes} onChange={(value) => update("preferredTrainingMinutes", value ?? 25)} />
          <ChipGroup title="Additional goals" options={goalOptions} selected={draft.goals ?? []} onSelect={(value) => toggle(value, "goals")} />
          <HomeGymSelector value={draft.homeGymId ?? "none"} onChange={selectHomeGym} />
          {(draft.homeGymId === "custom" || draft.homeGymName) && draft.homeGymId !== "none" ? (
            <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-champagne/10 text-champagne">
                  <Building2 size={18} strokeWidth={2.2} aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="metric-label">Home gym profile</p>
                  <p className="mt-1 text-sm leading-5 text-white/45">Equipment here becomes available inside the Gym Machine log.</p>
                </div>
              </div>
              <Field label="Gym name" value={draft.homeGymName ?? ""} onChange={(value) => update("homeGymName", value)} placeholder="Total Fitness" />
              <Field label="Gym address" value={draft.homeGymAddress ?? ""} onChange={(value) => update("homeGymAddress", value)} placeholder="71717 29 Palms Hwy" />
              <ChipGroup
                title="Gym equipment"
                helper="Scroll and select what this gym has. This powers machine logging and program matching."
                options={defaultGymEquipment}
                selected={draft.homeGymEquipment ?? []}
                onSelect={toggleHomeGymEquipment}
              />
            </div>
          ) : null}
          <ChipGroup title="Private habit loops" helper="Stored privately. Main UI only shows the replacement behavior." options={behaviorFocusOptions} selected={draft.behaviorFocus} onSelect={(value) => toggle(value, "behaviorFocus")} />
          <SelectGroup label="Default location" options={locationOptions} value={draft.defaultLocation ?? "gym"} onChange={(value) => update("defaultLocation", value)} />
          <SelectGroup label="Coaching tone" options={toneOptions} value={draft.coachingTone ?? "calm"} onChange={(value) => update("coachingTone", value)} />
          <SelectGroup label="Quote style" options={quoteOptions} value={draft.quoteStyle ?? "goggins"} onChange={(value) => update("quoteStyle", value)} />
          <SelectGroup label="Theme" options={themeOptions} value={draft.themePreference ?? "dark"} onChange={(value) => update("themePreference", value)} />
          <SelectGroup label="Accent" options={accentOptions} value={draft.accentColor ?? "ember"} onChange={(value) => update("accentColor", value)} />
        </div>

        <button
          type="button"
          onClick={save}
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-champagne px-4 text-base font-bold text-carbon shadow-glow"
        >
          <CheckCircle2 size={18} strokeWidth={2.2} aria-hidden />
          Save setup
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <SetupTile icon={Cloud} label="Cloud ready" detail="Sync lives under Me." />
        <SetupTile icon={ScanSearch} label="Body Check" detail="Photos stay comparable." />
        <SetupTile icon={Watch} label="Apple Watch" detail="Roadmap is preserved." />
        <SetupTile icon={UserRound} label="Private loops" detail="Shown only as patterns." />
      </div>
    </section>
  );
}

function Field({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="metric-label mb-2 block">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-12 w-full rounded-2xl border border-white/10 bg-carbon px-4 text-base font-semibold text-porcelain outline-none placeholder:text-white/35 focus:border-champagne"
      />
    </label>
  );
}

function NumberField({
  label,
  onChange,
  suffix,
  value,
}: {
  label: string;
  onChange: (value: number | undefined) => void;
  suffix?: string;
  value?: number;
}) {
  return (
    <label className="block">
      <span className="metric-label mb-2 block">{label}</span>
      <div className="flex min-h-12 items-center rounded-2xl border border-white/10 bg-carbon px-4 focus-within:border-champagne">
        <input
          value={value ?? ""}
          inputMode="decimal"
          onChange={(event) => {
            const parsed = Number(event.target.value);
            onChange(Number.isFinite(parsed) && parsed > 0 ? parsed : undefined);
          }}
          className="min-w-0 flex-1 bg-transparent text-base font-semibold text-porcelain outline-none placeholder:text-white/35"
        />
        {suffix ? <span className="text-sm font-bold text-white/38">{suffix}</span> : null}
      </div>
    </label>
  );
}

function ChipGroup({
  helper,
  onSelect,
  options,
  selected,
  title,
}: {
  helper?: string;
  onSelect: (value: string) => void;
  options: string[];
  selected: string[];
  title: string;
}) {
  return (
    <div>
      <p className="metric-label mb-2">{title}</p>
      {helper ? <p className="mb-2 text-sm leading-5 text-white/45">{helper}</p> : null}
      <div className="flex max-h-44 flex-wrap gap-2 overflow-y-auto pr-1">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={`min-h-10 rounded-full border px-3 text-sm font-semibold ${
                active ? "border-champagne bg-champagne text-carbon" : "border-white/10 bg-white/[0.055] text-white/62"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SelectGroup<T extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: T) => void;
  options: readonly T[];
  value: T;
}) {
  return (
    <label className="block">
      <span className="metric-label mb-2 block">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="min-h-12 w-full rounded-2xl border border-white/10 bg-carbon px-4 text-base font-semibold capitalize text-porcelain outline-none focus:border-champagne"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function HomeGymSelector({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="metric-label mb-2 block">Home gym</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-2xl border border-white/10 bg-carbon px-4 text-base font-semibold text-porcelain outline-none focus:border-champagne"
      >
        {gymSelectorOptions.map((option) => {
          const preset = getGymPreset(option);
          return (
            <option key={option} value={option}>
              {preset ? `${preset.name} - ${preset.city}` : option === "custom" ? "Custom gym" : "No home gym yet"}
            </option>
          );
        })}
      </select>
      {value !== "none" ? (
        <div className="mt-2 flex items-start gap-2 text-xs leading-5 text-white/42">
          <MapPin size={14} strokeWidth={2.2} aria-hidden className="mt-0.5 shrink-0 text-champagne" />
          <span>{getGymPreset(value)?.note ?? "Add the machines and equipment you want available when logging."}</span>
        </div>
      ) : null}
    </label>
  );
}

function SetupTile({
  detail,
  icon: Icon,
  label,
}: {
  detail: string;
  icon: typeof Cloud;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
      <Icon className="mb-2 text-champagne" size={17} strokeWidth={2.1} aria-hidden />
      <p className="text-sm font-semibold text-porcelain">{label}</p>
      <p className="mt-1 text-xs leading-4 text-white/42">{detail}</p>
    </div>
  );
}

function setupCompletion(profile: OnboardingProfile) {
  const fields = [
    profile.firstName,
    profile.currentWeight,
    profile.height,
    profile.targetWeight,
    profile.why,
    profile.goals?.length,
    profile.equipment?.length,
    profile.homeGymName || profile.homeGymEquipment?.length,
    profile.behaviorFocus?.length,
    profile.defaultLocation,
    profile.coachingTone,
    profile.themePreference,
  ];

  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

function mergeUnique(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}
