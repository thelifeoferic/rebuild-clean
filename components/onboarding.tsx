"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, Cloud, Dumbbell, Scale, ShieldCheck, Target } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { LoginPanel } from "@/components/login-panel";
import { RebuildWordmark } from "@/components/rebuild-wordmark";
import type { OnboardingProfile } from "@/types/rebuild";

const goals = [
  "Lose weight",
  "Build strength",
  "Quit smoking",
  "Stop spiraling",
  "Improve cardio",
  "Eat better",
  "Sleep better",
  "Rebuild discipline",
];

const equipment = [
  "Bike",
  "StairMaster",
  "Jacob's Ladder",
  "Treadmill",
  "Incline treadmill",
  "Row machine",
  "Air bike",
  "Elliptical",
  "SkiErg",
  "Kettlebells",
  "Dumbbells",
  "Adjustable dumbbells",
  "Barbell",
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
  "Hamstring curl",
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

const behaviorFocus = ["Smoking", "Anger", "Stress", "Boredom", "Stress eating", "Avoidance", "Late-night scrolling"];
const themeOptions = ["dark", "light", "auto"] as const;
const accentOptions = ["champagne", "white", "ember", "volt"] as const;
const toneOptions = ["calm", "intense", "minimal", "tactical"] as const;
const quoteOptions = ["goggins", "calm", "athlete", "none"] as const;
const locationOptions = ["home", "gym", "travel", "pool"] as const;
const durationOptions = [10, 20, 25, 30, 45] as const;

const stepMeta = [
  { title: "Welcome", eyebrow: "Start here", icon: ShieldCheck },
  { title: "Baseline", eyebrow: "Tell the truth", icon: Scale },
  { title: "Goals", eyebrow: "Choose the lanes", icon: Target },
  { title: "Equipment", eyebrow: "Use what is real", icon: Dumbbell },
  { title: "Style", eyebrow: "Make it yours", icon: Target },
  { title: "Commit", eyebrow: "Protect the reset", icon: Cloud },
];

export function Onboarding({
  onComplete,
}: {
  onComplete: (profile: OnboardingProfile) => void;
}) {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>(["Lose weight", "Rebuild discipline"]);
  const [currentWeight, setCurrentWeight] = useState("");
  const [height, setHeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [why, setWhy] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(["Bike", "Kettlebells", "Dumbbells", "Weight bench"]);
  const [equipmentQuery, setEquipmentQuery] = useState("");
  const [themePreference, setThemePreference] = useState<NonNullable<OnboardingProfile["themePreference"]>>("dark");
  const [accentColor, setAccentColor] = useState<NonNullable<OnboardingProfile["accentColor"]>>("champagne");
  const [coachingTone, setCoachingTone] = useState<NonNullable<OnboardingProfile["coachingTone"]>>("calm");
  const [quoteStyle, setQuoteStyle] = useState<NonNullable<OnboardingProfile["quoteStyle"]>>("goggins");
  const [defaultLocation, setDefaultLocation] = useState<NonNullable<OnboardingProfile["defaultLocation"]>>("gym");
  const [preferredTrainingMinutes, setPreferredTrainingMinutes] = useState<NonNullable<OnboardingProfile["preferredTrainingMinutes"]>>(25);
  const [selectedFocus, setSelectedFocus] = useState<string[]>(["Smoking", "Avoidance"]);
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

  function complete() {
    onComplete({
      accentColor,
      behaviorFocus: selectedFocus,
      coachingTone,
      completed: true,
      currentWeight: numberOrUndefined(currentWeight),
      defaultLocation,
      equipment: selectedEquipment,
      firstName: firstName.trim(),
      goal: selectedGoals[0] ?? "Rebuild discipline",
      goals: selectedGoals,
      height: height.trim(),
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

        <div className="flex items-center gap-2">
          {stepMeta.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setStep(index)}
              className={`h-2.5 rounded-full transition-all ${index === step ? "w-8 bg-champagne" : "w-2.5 bg-white/18"}`}
              aria-label={`Go to ${item.title}`}
            />
          ))}
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
            className="object-cover object-center opacity-72"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.22),rgba(0,0,0,0.35)_42%,rgba(0,0,0,0.92))]" />
          <div className="absolute bottom-4 left-4 right-4">
            <RebuildWordmark align="left" className="mb-5 drop-shadow-[0_2px_18px_rgba(0,0,0,0.65)]" />
            <p className="metric-label text-white/62">{currentMeta.eyebrow}</p>
            <h1 className="mt-1 text-3xl font-semibold leading-none text-porcelain">{headlineFor(step)}</h1>
          </div>
        </div>

        <div className="min-h-[24rem] p-4">
          {step === 0 ? (
            <div className="space-y-3">
              <p className="text-sm leading-5 text-white/58">
                REBUILD starts local-first: log the next right action, protect your streaks, and sync to Supabase when you want cloud backup.
              </p>
              <div className="grid gap-2">
                <IntroPoint icon={Scale} title="Baseline" detail="Weight, height, target, and why." />
                <IntroPoint icon={Target} title="Training logic" detail="Goals and equipment shape the recommendations." />
                <IntroPoint icon={Cloud} title="Account optional" detail="Sign in with email for cloud backup, or start local first." />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-3">
              <Field label="First name" value={firstName} onChange={setFirstName} placeholder="First name" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Current weight" value={currentWeight} onChange={setCurrentWeight} placeholder="Current" inputMode="decimal" suffix="lb" />
                <Field label="Height" value={height} onChange={setHeight} placeholder={`5'10"`} />
                <Field label="Target weight" value={targetWeight} onChange={setTargetWeight} placeholder="Goal" inputMode="decimal" suffix="lb" />
              </div>
              <TextArea
                label="Why I'm doing this"
                value={why}
                onChange={setWhy}
                placeholder="A short sentence REBUILD can keep in view."
              />
            </div>
          ) : null}

          {step === 2 ? (
            <ChoiceGroup
              title="Primary goals"
              helper="Select a few. The Train page will rank workouts around these."
              options={goals}
              selected={selectedGoals}
              onSelect={(value) => toggle(value, selectedGoals, setSelectedGoals)}
            />
          ) : null}

          {step === 3 ? (
            <div>
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

          {step === 4 ? (
            <div className="space-y-4">
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
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-4">
              <ChoiceGroup
                title="Behavior loops to replace"
                helper="These become reset moments, not identity labels."
                options={behaviorFocus}
                selected={selectedFocus}
                onSelect={(value) => toggle(value, selectedFocus, setSelectedFocus)}
              />

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

function headlineFor(step: number) {
  if (step === 0) return "Welcome to the rebuild.";
  if (step === 1) return "Set your baseline.";
  if (step === 2) return "Choose the mission.";
  if (step === 3) return "Map your tools.";
  if (step === 4) return "Tune the experience.";
  return "Commit the reset.";
}

function onboardingImageFor(step: number) {
  if (step === 0) return "/rebuild-conditioning.jpg";
  if (step === 1) return "/rebuild-bike-room.jpg";
  if (step === 2) return "/rebuild-leg-press-side.jpg";
  if (step === 3) return "/rebuild-kettlebell-outdoor.jpg";
  if (step === 4) return "/rebuild-yoga-light.jpg";
  return "/rebuild-swim-lane.jpg";
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
