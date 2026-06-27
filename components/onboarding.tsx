"use client";

import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Cloud, Dumbbell, HeartPulse, Scale, ShieldCheck, Target } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { LoginPanel } from "@/components/login-panel";
import { RebuildWordmark } from "@/components/rebuild-wordmark";
import { defaultGymEquipment, getGymPreset, localGymPresets } from "@/data/gym-presets";
import type { OnboardingProfile } from "@/types/rebuild";

const goals = [
  "Lose weight",
  "Build strength",
  "Improve cardio",
  "Eat better",
  "Sleep better",
  "Reduce stress",
  "Build confidence",
  "Rebuild discipline",
];

const equipment = [
  "Bike",
  "StairMaster",
  "StairMasters",
  "Jacob's Ladder",
  "Treadmill",
  "Incline treadmill",
  "Row machine",
  "Air bike",
  "Elliptical",
  "Elliptical machines",
  "SkiErg",
  "Kettlebells",
  "Dumbbells",
  "Adjustable dumbbells",
  "Barbell",
  "Barbells",
  "EZ curl bar",
  "Trap bar",
  "Weight bench",
  "Incline bench",
  "Squat rack",
  "Power rack",
  "Cable machine",
  "Smith machine",
  "Leg press",
  "Hack squat",
  "Leg extension",
  "Seated leg curl",
  "Hamstring curl",
  "Rotary torso",
  "Abdominal",
  "Converging chest press",
  "Inner thigh",
  "Chest press",
  "Shoulder press",
  "Lat pulldown",
  "Seated row",
  "Pec deck",
  "Pull-up bar",
  "Dip station",
  "TRX straps",
  "Resistance bands",
  "Battle ropes",
  "Punching bag",
  "Sled",
  "Plyo box",
  "Jump rope",
  "Medicine ball",
  "Sandbag",
  "Foam roller",
  "Yoga mat",
  "Pool",
  "Bodyweight",
  "Farmer carry space",
];

const behaviorFocus = [
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
const themeOptions = ["dark", "light", "auto"] as const;
const accentOptions = ["cobalt", "ember", "white", "champagne", "volt"] as const;
const toneOptions = ["calm", "intense", "minimal", "tactical"] as const;
const quoteOptions = ["goggins", "calm", "athlete", "none"] as const;
const locationOptions = ["home", "gym", "travel", "pool"] as const;
const calorieSexOptions = ["male", "female", "prefer_not_to_say"] as const;
const durationOptions = [10, 20, 25, 30, 45] as const;
const homeGymOptions = ["none", ...localGymPresets.map((gym) => gym.id), "custom"] as const;

const stepMeta = [
  { title: "Welcome", eyebrow: "The first honest entry", icon: ShieldCheck },
  { title: "Identity", eyebrow: "Make it personal", icon: CalendarDays },
  { title: "Body", eyebrow: "Calorie baseline", icon: Scale },
  { title: "Mission", eyebrow: "Choose the lane", icon: Target },
  { title: "Equipment", eyebrow: "Use what is real", icon: Dumbbell },
  { title: "Mode", eyebrow: "Set the cockpit", icon: HeartPulse },
];

export function Onboarding({
  onComplete,
}: {
  onComplete: (profile: OnboardingProfile) => void;
}) {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [age, setAge] = useState("");
  const [calorieSex, setCalorieSex] = useState<NonNullable<OnboardingProfile["calorieSex"]>>("prefer_not_to_say");
  const [selectedGoals, setSelectedGoals] = useState<string[]>(["Lose weight"]);
  const [currentWeight, setCurrentWeight] = useState("");
  const [height, setHeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [why, setWhy] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(["Bike", "Kettlebells", "Dumbbells", "Weight bench"]);
  const [homeGymAddress, setHomeGymAddress] = useState("");
  const [homeGymId, setHomeGymId] = useState("none");
  const [homeGymName, setHomeGymName] = useState("");
  const [equipmentQuery, setEquipmentQuery] = useState("");
  const [themePreference, setThemePreference] = useState<NonNullable<OnboardingProfile["themePreference"]>>("dark");
  const [accentColor, setAccentColor] = useState<NonNullable<OnboardingProfile["accentColor"]>>("cobalt");
  const [coachingTone, setCoachingTone] = useState<NonNullable<OnboardingProfile["coachingTone"]>>("calm");
  const [quoteStyle, setQuoteStyle] = useState<NonNullable<OnboardingProfile["quoteStyle"]>>("goggins");
  const [defaultLocation, setDefaultLocation] = useState<NonNullable<OnboardingProfile["defaultLocation"]>>("gym");
  const [preferredTrainingMinutes, setPreferredTrainingMinutes] = useState<NonNullable<OnboardingProfile["preferredTrainingMinutes"]>>(25);
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const isFinalStep = step === stepMeta.length - 1;
  const currentMeta = stepMeta[step];
  const StepIcon = currentMeta.icon;

  const visibleEquipment = useMemo(() => {
    const query = equipmentQuery.trim().toLowerCase();
    if (!query) return equipment;
    return equipment.filter((item) => item.toLowerCase().includes(query));
  }, [equipmentQuery]);

  function toggle(value: string, values: string[], update: (next: string[]) => void) {
    update(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  }

  function numberOrUndefined(value: string) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  }

  function selectHomeGym(value: string) {
    const preset = getGymPreset(value);
    setHomeGymId(value);

    if (!preset) {
      if (value === "none") {
        setHomeGymName("");
        setHomeGymAddress("");
      }
      return;
    }

    const gymEquipment = preset.machines.map((machine) => machine.name);
    setHomeGymName(preset.name);
    setHomeGymAddress(preset.address);
    setDefaultLocation("gym");
    setSelectedEquipment((current) => mergeUnique([...current, ...gymEquipment]));
  }

  function complete() {
    const selectedHomeGym = getGymPreset(homeGymId);
    onComplete({
      accentColor,
      age: numberOrUndefined(age),
      behaviorFocus: selectedFocus,
      calorieSex,
      coachingTone,
      completed: true,
      currentWeight: numberOrUndefined(currentWeight),
      defaultLocation,
      equipment: selectedEquipment,
      firstName: firstName.trim(),
      goal: selectedGoals[0] ?? "Rebuild discipline",
      goals: selectedGoals,
      height: height.trim(),
      homeGymAddress: (selectedHomeGym?.address ?? homeGymAddress).trim(),
      homeGymEquipment: selectedHomeGym ? selectedHomeGym.machines.map((machine) => machine.name) : selectedEquipment.filter((item) => defaultGymEquipment.includes(item)),
      homeGymId: homeGymId === "none" ? undefined : homeGymId,
      homeGymName: (selectedHomeGym?.name ?? homeGymName).trim(),
      preferredTrainingMinutes,
      quoteStyle,
      targetWeight: numberOrUndefined(targetWeight),
      themePreference,
      why: why.trim(),
    });
  }

  function next() {
    if (isFinalStep) {
      complete();
      return;
    }

    setStep((current) => Math.min(current + 1, stepMeta.length - 1));
  }

  return (
    <section className="px-4 pb-4 pt-5">
      <div className="mb-5 flex justify-center">
        <RebuildWordmark align="center" className="drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)]" />
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((current) => Math.max(current - 1, 0))}
          disabled={step === 0}
          className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.055] text-white/65 disabled:opacity-25"
          aria-label="Previous onboarding step"
        >
          <ArrowLeft size={18} strokeWidth={2.2} aria-hidden />
        </button>

        <div
          className="h-2 w-36 overflow-hidden rounded-full bg-white/12"
          aria-label={`Onboarding step ${step + 1} of ${stepMeta.length}`}
          aria-valuemax={stepMeta.length}
          aria-valuemin={1}
          aria-valuenow={step + 1}
          role="progressbar"
        >
          <div
            className="h-full rounded-full bg-champagne transition-all duration-300 ease-out"
            style={{ width: `${((step + 1) / stepMeta.length) * 100}%` }}
          />
        </div>

        <div className="grid size-11 place-items-center rounded-full bg-champagne/10 text-champagne">
          <StepIcon size={18} strokeWidth={2.2} aria-hidden />
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-panel">
        <div className="relative min-h-[13.5rem] bg-black">
          <Image
            src={onboardingImageFor(step)}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 448px"
            className={`object-cover opacity-72 ${onboardingImageClassFor(step)}`}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.22),rgba(0,0,0,0.35)_42%,rgba(0,0,0,0.92))]" />
          <div className="absolute left-4 top-4 rounded-full border border-white/12 bg-black/45 px-3 py-1.5 text-[0.65rem] font-black uppercase tracking-[0.2em] text-white/70 backdrop-blur-md">
            Step {step + 1} of {stepMeta.length}
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <p className="metric-label text-white/62">{currentMeta.eyebrow}</p>
            <h1 className="mt-1 text-3xl font-semibold leading-none text-porcelain">{headlineFor(step)}</h1>
          </div>
        </div>

        <div className="min-h-[24rem] p-4">
          {step === 0 ? (
            <div className="space-y-3">
              <p className="text-sm leading-5 text-white/58">
                Welcome. REBUILD is a private record of becoming someone different. Start with the facts, then let the app reflect the pattern back.
              </p>
              <div className="grid gap-2">
                <IntroPoint icon={Scale} title="Baseline" detail="Weight, height, age, and calorie estimate inputs." />
                <IntroPoint icon={Target} title="Mission" detail="Goals and equipment shape the plan you see first." />
                <IntroPoint icon={Cloud} title="Private by default" detail="Start local first, then sync to Supabase whenever you want backup." />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-3">
              <Field label="First name" value={firstName} onChange={setFirstName} placeholder="First name" />
              <Field label="Age" value={age} onChange={setAge} placeholder="Age" inputMode="numeric" />
              <PreferenceGroup
                title="Sex for calorie estimates"
                helper="Used only to make calorie guidance less generic. It is not displayed on the home screen."
                options={calorieSexOptions}
                selected={calorieSex}
                onSelect={setCalorieSex}
              />
              <p className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 text-sm leading-5 text-white/50">
                These fields help estimate your daily baseline. They can be changed later under Me → Setup.
              </p>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-3">
              <Field label="Current weight" value={currentWeight} onChange={setCurrentWeight} placeholder="Current" inputMode="decimal" suffix="lb" />
              <Field label="Height" value={height} onChange={setHeight} placeholder={`5'10"`} inputMode="text" />
              <Field label="Target weight" value={targetWeight} onChange={setTargetWeight} placeholder="Optional" inputMode="decimal" suffix="lb" />
              <p className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 text-sm leading-5 text-white/50">
                Your calorie guide uses weight, height, age, and the estimate field from the previous step. Training burn is added on top as you log work.
              </p>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <ChoiceGroup
                title="Primary goal"
                helper="Pick one now. Add more goals later under Me → Setup."
                options={goals}
                selected={selectedGoals}
                onSelect={(value) => setSelectedGoals([value])}
              />
              <TextArea label="Why I'm doing this" value={why} onChange={setWhy} placeholder="A sentence you want REBUILD to remember." />
              <ChoiceGroup
                title="Private patterns to replace"
                helper="Optional. These stay private and only inform Coach insights."
                options={behaviorFocus}
                selected={selectedFocus}
                onSelect={(value) => toggle(value, selectedFocus, setSelectedFocus)}
              />
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4">
              <label className="block">
                <span className="metric-label mb-2 block">Home gym</span>
                <select
                  value={homeGymId}
                  onChange={(event) => selectHomeGym(event.target.value)}
                  className="min-h-12 w-full rounded-2xl border border-white/10 bg-carbon px-4 text-base font-semibold text-porcelain outline-none focus:border-champagne"
                >
                  {homeGymOptions.map((option) => {
                    const preset = getGymPreset(option);
                    return (
                      <option key={option} value={option}>
                        {preset ? `${preset.name} - ${preset.city}` : option === "custom" ? "Custom gym" : "No home gym yet"}
                      </option>
                    );
                  })}
                </select>
              </label>
              {homeGymId === "custom" ? (
                <div className="grid gap-2">
                  <input
                    value={homeGymName}
                    onChange={(event) => setHomeGymName(event.target.value)}
                    placeholder="Gym name"
                    className="min-h-12 w-full rounded-2xl border border-white/10 bg-carbon px-4 text-base font-semibold text-white outline-none placeholder:text-white/58 focus:border-champagne"
                  />
                  <input
                    value={homeGymAddress}
                    onChange={(event) => setHomeGymAddress(event.target.value)}
                    placeholder="Gym address"
                    className="min-h-12 w-full rounded-2xl border border-white/10 bg-carbon px-4 text-base font-semibold text-white outline-none placeholder:text-white/58 focus:border-champagne"
                  />
                </div>
              ) : null}
              <label className="mb-3 flex min-h-11 items-center rounded-2xl border border-white/10 bg-carbon px-3 focus-within:border-champagne">
                <input
                  value={equipmentQuery}
                  onChange={(event) => setEquipmentQuery(event.target.value)}
                  placeholder="Search equipment..."
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/58"
                />
              </label>
              <ChoiceGroup
                title="Available equipment"
                helper="Pick what you can actually use at home, outside, or at the gym."
                options={visibleEquipment}
                selected={selectedEquipment}
                onSelect={(value) => toggle(value, selectedEquipment, setSelectedEquipment)}
                scrollable
              />
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-champagne/20 bg-champagne/10 p-4">
                <p className="metric-label mb-2 text-champagne">Operating mode</p>
                <p className="text-sm leading-5 text-white/58">
                  These controls tune how REBUILD feels before you enter. You can change all of them later under Me.
                </p>
              </div>
              <PreferenceGroup
                title="Interface"
                helper="Light mode softens the product. Dark mode keeps the original cockpit feel."
                options={themeOptions}
                selected={themePreference}
                onSelect={setThemePreference}
              />
              <PreferenceGroup title="Accent color" options={accentOptions} selected={accentColor} onSelect={setAccentColor} />
              <PreferenceGroup title="Coaching tone" options={toneOptions} selected={coachingTone} onSelect={setCoachingTone} />
              <PreferenceGroup title="Quote style" options={quoteOptions} selected={quoteStyle} onSelect={setQuoteStyle} />
              <PreferenceGroup title="Default location" options={locationOptions} selected={defaultLocation} onSelect={setDefaultLocation} />
              <div>
                <p className="metric-label mb-2">Default workout length</p>
                <div className="grid grid-cols-5 gap-2">
                  {durationOptions.map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() => setPreferredTrainingMinutes(minutes)}
                      className={`min-h-10 rounded-2xl border text-sm font-bold ${
                        preferredTrainingMinutes === minutes
                          ? "border-champagne bg-champagne text-carbon"
                          : "border-white/10 bg-white/[0.055] text-white/62"
                      }`}
                    >
                      {minutes}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-signal/20 bg-signal/10 p-4">
                <p className="metric-label mb-2 text-signal">Account backup</p>
                <p className="text-sm leading-5 text-white/58">
                  Sign in now to connect this device to Supabase. You can also enter REBUILD first and sign in from Home or Progress later.
                </p>
              </div>
              <LoginPanel />
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
        <button
          type="button"
          onClick={next}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-champagne px-4 text-base font-bold text-carbon shadow-glow"
        >
          {isFinalStep ? "Enter REBUILD" : step === 0 ? "Start setup" : "Continue"}
          {isFinalStep ? <CheckCircle2 size={18} strokeWidth={2.2} aria-hidden /> : <ArrowRight size={18} strokeWidth={2.2} aria-hidden />}
        </button>
        {step > 0 && !isFinalStep ? (
          <button
            type="button"
            onClick={complete}
            className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm font-bold text-white/62"
          >
            Skip
          </button>
        ) : null}
      </div>
    </section>
  );
}

function mergeUnique(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function headlineFor(step: number) {
  if (step === 0) return "Welcome to the rebuild.";
  if (step === 1) return "Make it yours.";
  if (step === 2) return "Set the baseline.";
  if (step === 3) return "Name the mission.";
  if (step === 4) return "Map your tools.";
  return "Tune the experience.";
}

function onboardingImageFor(step: number) {
  if (step === 0) return "/rebuild-conditioning.jpg";
  if (step === 1) return "/rebuild-run.jpg";
  if (step === 2) return "/rebuild-bike-room.jpg";
  if (step === 3) return "/rebuild-leg-press-side.jpg";
  if (step === 4) return "/rebuild-kettlebell-outdoor.jpg";
  return "/rebuild-swim-lane.jpg";
}

function onboardingImageClassFor(step: number) {
  if (step === 1) return "object-[58%_22%]";
  if (step === 2) return "object-[58%_36%]";
  if (step === 3) return "object-[58%_30%]";
  if (step === 4) return "object-[48%_44%]";
  return "object-center";
}

function IntroPoint({
  detail,
  icon: Icon,
  title,
}: {
  detail: string;
  icon: typeof Scale;
  title: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white/[0.055] p-3">
      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-champagne/10 text-champagne">
        <Icon size={18} strokeWidth={2.2} aria-hidden />
      </div>
      <div>
        <p className="font-semibold text-porcelain">{title}</p>
        <p className="mt-1 text-sm leading-5 text-white/45">{detail}</p>
      </div>
    </div>
  );
}

function ChoiceGroup({
  helper,
  onSelect,
  options,
  scrollable,
  selected,
  title,
}: {
  helper?: string;
  onSelect: (value: string) => void;
  options: string[];
  scrollable?: boolean;
  selected: string[];
  title: string;
}) {
  return (
    <div>
      <p className="metric-label mb-2">{title}</p>
      {helper ? <p className="mb-3 text-sm leading-5 text-white/45">{helper}</p> : null}
      <div className={`flex flex-wrap gap-2 ${scrollable ? "max-h-72 overflow-y-auto pr-1" : ""}`}>
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-sm font-semibold transition ${
                isSelected ? "border-champagne bg-champagne text-carbon" : "border-white/10 bg-white/[0.055] text-white/62"
              }`}
            >
              {isSelected ? <CheckCircle2 size={15} strokeWidth={2.2} aria-hidden /> : null}
              {option}
            </button>
          );
        })}
        {!options.length ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 text-sm font-semibold text-white/45">
            No matches. Try a different equipment search.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function PreferenceGroup<T extends string>({
  helper,
  onSelect,
  options,
  selected,
  title,
}: {
  helper?: string;
  onSelect: (value: T) => void;
  options: readonly T[];
  selected: T;
  title: string;
}) {
  return (
    <div>
      <p className="metric-label mb-2">{title}</p>
      {helper ? <p className="mb-3 text-sm leading-5 text-white/45">{helper}</p> : null}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-sm font-semibold capitalize transition ${
              selected === option ? "border-champagne bg-champagne text-carbon" : "border-white/10 bg-white/[0.055] text-white/62"
            }`}
          >
            {selected === option ? <CheckCircle2 size={15} strokeWidth={2.2} aria-hidden /> : null}
            {option.replace("_", " ")}
          </button>
        ))}
      </div>
    </div>
  );
}

function Field({
  inputMode,
  label,
  onChange,
  placeholder,
  suffix,
  value,
}: {
  inputMode?: "decimal" | "numeric" | "text";
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="metric-label mb-2 block">{label}</span>
      <div className="flex min-h-12 items-center rounded-2xl border border-white/15 bg-white/[0.075] px-4 focus-within:border-champagne">
        <input
          value={value}
          inputMode={inputMode}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-base font-semibold text-white outline-none placeholder:text-white/58"
        />
        {suffix ? <span className="text-sm font-semibold text-white/70">{suffix}</span> : null}
      </div>
    </label>
  );
}

function TextArea({
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
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-24 w-full rounded-2xl border border-white/15 bg-white/[0.075] px-4 py-3 text-base font-semibold text-white outline-none placeholder:text-white/58 focus:border-champagne"
      />
    </label>
  );
}
