"use client";

import { CheckCircle2, Mic, Square, Wand2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { getTodayIso } from "@/lib/rebuild-data";
import type { LogDraft } from "@/components/log-modal";
import type { LogKind, OnboardingProfile } from "@/types/rebuild";

export type VoiceLogItem = {
  draft: LogDraft;
  kind: LogKind;
};

type ParsedVoiceLog = VoiceLogItem & {
  label: string;
  summary: string;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: {
    transcript: string;
  };
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export function VoiceWorkoutLog({
  onSave,
  profile,
}: {
  onSave: (items: VoiceLogItem[]) => void;
  profile?: OnboardingProfile | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const parsedLogs = useMemo(() => parseVoiceWorkoutNote(transcript, profile), [profile, transcript]);

  function startListening() {
    setError(null);

    const recognitionConstructor = getSpeechRecognitionConstructor();
    if (!recognitionConstructor) {
      setError("Voice capture is not available in this browser. Type the note below and REBUILD will still draft it.");
      return;
    }

    const recognition = new recognitionConstructor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const parts: string[] = [];
      for (let index = 0; index < event.results.length; index += 1) {
        parts.push(event.results[index][0].transcript);
      }
      setTranscript(parts.join(" ").replace(/\s+/g, " ").trim());
    };
    recognition.onerror = (event) => {
      setError(event.error ? `Voice capture stopped: ${event.error}` : "Voice capture stopped.");
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  function saveDraftedLogs() {
    if (!parsedLogs.length) {
      setError("I need one clear workout, food, weight, water, sleep, or meditation detail before saving.");
      return;
    }

    onSave(parsedLogs.map(({ draft, kind }) => ({ draft, kind })));
    setTranscript("");
    setError(null);
  }

  return (
    <div className="panel mb-4 overflow-hidden p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="metric-label">Voice log</p>
          <h3 className="mt-1 text-2xl font-semibold text-porcelain">Say the workout. Let REBUILD draft it.</h3>
          <p className="mt-2 text-sm leading-5 text-white/48">
            Try: &ldquo;Bike 30 minutes, resistance 8, 240 calories. Push-ups 10, 8, 7. Protein shake 180 calories, 30 grams protein.&rdquo;
          </p>
        </div>
        <div className={`grid size-12 shrink-0 place-items-center rounded-full ${isListening ? "bg-ember/15 text-ember" : "bg-champagne/14 text-champagne"}`}>
          <Mic size={22} strokeWidth={2.2} aria-hidden />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-champagne px-4 text-sm font-black text-[rgb(var(--color-accent-foreground))] shadow-glow active:scale-[0.97]"
        >
          {isListening ? <Square size={16} strokeWidth={2.4} aria-hidden /> : <Mic size={16} strokeWidth={2.4} aria-hidden />}
          {isListening ? "Stop" : "Speak"}
        </button>
        <button
          type="button"
          onClick={saveDraftedLogs}
          disabled={!parsedLogs.length}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm font-black text-porcelain disabled:opacity-35 active:scale-[0.97]"
        >
          <CheckCircle2 size={16} strokeWidth={2.4} aria-hidden />
          Save {parsedLogs.length ? parsedLogs.length : ""}
        </button>
      </div>

      <label className="mt-4 block">
        <span className="metric-label mb-2 block">Transcript</span>
        <textarea
          value={transcript}
          onChange={(event) => {
            setTranscript(event.target.value);
            setError(null);
          }}
          placeholder="Speak or type the session here..."
          rows={4}
          className="w-full resize-none rounded-2xl border border-white/10 bg-carbon/70 px-4 py-3 text-base leading-6 text-porcelain outline-none placeholder:text-white/32 focus:border-champagne"
        />
      </label>

      {error ? <p className="mt-3 rounded-2xl border border-ember/20 bg-ember/10 px-3 py-2 text-sm font-semibold leading-5 text-ember">{error}</p> : null}

      {parsedLogs.length ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-3">
          <div className="mb-3 flex items-center gap-2">
            <Wand2 size={15} className="text-champagne" strokeWidth={2.2} aria-hidden />
            <p className="metric-label">Drafted logs</p>
          </div>
          <div className="grid gap-2">
            {parsedLogs.map((item, index) => (
              <div key={`${item.kind}-${item.label}-${index}`} className="rounded-xl bg-carbon/70 px-3 py-2">
                <p className="text-sm font-black text-porcelain">{item.label}</p>
                <p className="mt-1 text-xs font-semibold leading-4 text-white/45">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined") return null;
  const browserWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition ?? null;
}

function parseVoiceWorkoutNote(transcript: string, profile?: OnboardingProfile | null): ParsedVoiceLog[] {
  const note = transcript.trim();
  if (!note) return [];

  const clean = note.toLowerCase();
  const date = getTodayIso();
  const logs: ParsedVoiceLog[] = [];
  const baseNotes = `Voice note: ${note}`;

  const weight = matchNumber(clean, /(?:weigh(?:ed| in)?|weighed in|body weight|scale)\D{0,24}(\d{2,3}(?:\.\d+)?)/);
  if (weight) {
    logs.push({
      kind: "weight",
      label: "Weigh-in",
      summary: `${weight} lb`,
      draft: { date, weight, notes: baseNotes },
    });
  }

  if (hasAny(clean, ["bike", "cycling", "cycle", "spin"])) {
    const minutes = matchNumber(clean, /(?:bike|cycling|cycle|spin)[^.]*?(\d+(?:\.\d+)?)\s*(?:min|mins|minute|minutes)\b/) ?? firstMinutes(clean);
    const resistance = matchNumber(clean, /resistance\D{0,10}(\d+(?:\.\d+)?)/);
    const calories = matchNumber(clean, /(\d{2,4})\s*(?:cal|cals|calories)\b/);
    const distanceMiles = matchNumber(clean, /(\d+(?:\.\d+)?)\s*(?:mi|mile|miles)\b/);
    logs.push({
      kind: "bike",
      label: "Bike session",
      summary: [minutes ? `${minutes} min` : null, distanceMiles ? `${distanceMiles} mi` : null, calories ? `${calories} cal` : null].filter(Boolean).join(" · ") || "Bike work",
      draft: { date, minutes: minutes ?? "", distanceMiles: distanceMiles ?? "", resistance: resistance ?? "", calories: calories ?? "", notes: baseNotes },
    });
  }

  if (hasAny(clean, ["jacob", "ladder"])) {
    const duration = matchTime(clean, /(?:jacob'?s ladder|jacob|ladder)[^.]*?(\d+(?::\d{2})?|\d+(?:\.\d+)?)\s*(?:min|mins|minute|minutes)?/);
    const longestContinuous = matchTime(clean, /(?:longest|continuous|best)[^.]*?(\d+(?::\d{2})?|\d+(?:\.\d+)?)\s*(?:min|mins|minute|minutes)?/);
    logs.push({
      kind: "jacobsLadder",
      label: "Jacob's Ladder",
      summary: [duration ? `${duration} total` : null, longestContinuous ? `${longestContinuous} continuous` : null].filter(Boolean).join(" · ") || "Ladder work",
      draft: { date, duration: duration ?? "", longestContinuous: longestContinuous ?? "", notes: baseNotes },
    });
  }

  if (hasAny(clean, ["pushup", "push-up", "push ups", "push-ups"])) {
    const sets = pushUpSets(clean);
    logs.push({
      kind: "pushUps",
      label: "Push-ups",
      summary: sets.length ? `${sets.reduce((sum, set) => sum + set, 0)} total · ${sets.length} sets` : "Push-up work",
      draft: {
        date,
        set1: String(sets[0] ?? ""),
        set2: String(sets[1] ?? ""),
        set3: String(sets[2] ?? ""),
        set4: String(sets[3] ?? ""),
        set5: String(sets[4] ?? ""),
        set6: String(sets[5] ?? ""),
        extraSets: sets.slice(6).join(", "),
        notes: baseNotes,
      },
    });
  }

  if (hasAny(clean, ["farmer carry", "farmer carries", "suitcase carry", "carries"])) {
    const weightEachHand = matchNumber(clean, /(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound|pounds)[^.]*?(?:each hand|per hand|farmer|carry|carries)/) ?? matchNumber(clean, /(?:farmer|carry|carries)[^.]*?(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound|pounds)/);
    const distanceFeet = matchNumber(clean, /(\d+(?:\.\d+)?)\s*(?:ft|feet|foot)\b/);
    const rounds = matchNumber(clean, /(\d+)\s*(?:round|rounds|trips)\b/);
    logs.push({
      kind: "farmerCarries",
      label: "Farmer carries",
      summary: [weightEachHand ? `${weightEachHand} lb each` : null, distanceFeet ? `${distanceFeet} ft` : null, rounds ? `${rounds} rounds` : null].filter(Boolean).join(" · ") || "Carry work",
      draft: { date, weightEachHand: weightEachHand ?? "", distanceFeet: distanceFeet ?? "", rounds: rounds ?? "", notes: baseNotes },
    });
  }

  if (hasAny(clean, ["kettlebell", "kettle bell", "bell swings", "kb "])) {
    const exercise = inferExercise(clean, [
      "Around-the-worlds",
      "Pass-arounds",
      "Two-hand swings",
      "One-arm swings",
      "Goblet squats",
      "Turkish get-ups",
      "Clean and press",
      "Snatches",
      "Halos",
      "Rows",
      "Overhead press",
      "Suitcase carries",
    ], "Kettlebell");
    const weight = matchNumber(clean, /(?:kettlebell|kettle bell|kb)[^.]*?(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound|pounds)/) ?? matchNumber(clean, /(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound|pounds)[^.]*?(?:kettlebell|kettle bell|kb)/);
    const reps = repsExcludingWeight(clean, weight);
    logs.push({
      kind: "kettlebell",
      label: "Kettlebell",
      summary: [exercise, weight ? `${weight} lb` : null, reps ? `${reps} reps` : null].filter(Boolean).join(" · "),
      draft: { date, exercise, weight: weight ?? "", reps: reps ?? "", notes: baseNotes },
    });
  }

  if (hasAny(clean, ["dumbbell", "dumb bell", "curl", "lateral raise", "shoulder press"])) {
    const exercise = inferExercise(clean, [
      "Hammer curls",
      "Dumbbell curls",
      "Alternating curls",
      "Lateral raises",
      "Shoulder press",
      "One-arm rows",
      "Chest press",
      "Floor press",
      "Romanian deadlift",
    ], "Dumbbell");
    const weight = matchNumber(clean, /(?:dumbbell|dumb bell|curl|raise|press)[^.]*?(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound|pounds)/) ?? matchNumber(clean, /(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound|pounds)[^.]*?(?:dumbbell|dumb bell|curl|raise|press)/);
    const totalReps = matchNumber(clean, /(\d+)\s*(?:total reps|reps total)\b/);
    const eachArm = matchNumber(clean, /(\d+)\s*(?:reps each arm|each arm|per arm|each side|per side)\b/);
    const repsEachArm = eachArm ?? (totalReps ? String(Math.max(1, Math.round(Number(totalReps) / 2))) : matchNumber(clean, /(\d+)\s*(?:rep|reps)\b/));
    logs.push({
      kind: "dumbbellCurls",
      label: "Dumbbell work",
      summary: [exercise, weight ? `${weight} lb` : null, repsEachArm ? `${repsEachArm} per side` : null].filter(Boolean).join(" · "),
      draft: { date, exercise, weight: weight ?? "", repsEachArm: repsEachArm ?? "", notes: baseNotes },
    });
  }

  const machine = inferMachine(clean);
  if (machine) {
    const minutes = firstMinutes(clean);
    const calories = matchNumber(clean, /(\d{2,4})\s*(?:cal|cals|calories)\b/);
    const distanceMiles = matchNumber(clean, /(\d+(?:\.\d+)?)\s*(?:mi|mile|miles)\b/);
    const sets = matchNumber(clean, /(\d+)\s*(?:sets|rounds)\b/);
    const reps = matchNumber(clean, /(\d+)\s*(?:reps|rep)\b/);
    const weight = matchNumber(clean, /(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound|pounds)\b/);
    logs.push({
      kind: "machine",
      label: machine.name,
      summary: machine.category === "Cardio"
        ? [minutes ? `${minutes} min` : null, distanceMiles ? `${distanceMiles} mi` : null, calories ? `${calories} cal` : null].filter(Boolean).join(" · ") || "Cardio machine"
        : [weight ? `${weight} lb` : null, sets ? `${sets} sets` : null, reps ? `${reps} reps` : null].filter(Boolean).join(" · ") || "Machine work",
      draft: {
        date,
        gymName: profile?.homeGymName ?? "Gym",
        machine: machine.name,
        category: machine.category,
        weight: machine.category === "Cardio" ? "" : weight ?? "",
        sets: machine.category === "Cardio" ? "" : sets ?? "",
        reps: machine.category === "Cardio" ? "" : reps ?? "",
        minutes: minutes ?? "",
        distanceMiles: distanceMiles ?? "",
        calories: calories ?? "",
        notes: baseNotes,
      },
    });
  }

  if (hasAny(clean, ["swim", "swam", "pool"])) {
    const minutes = firstMinutes(clean);
    const distance = matchNumber(clean, /(\d+(?:\.\d+)?)\s*(?:yd|yard|yards|meter|meters|m)\b/);
    logs.push({
      kind: "swim",
      label: "Swim",
      summary: [minutes ? `${minutes} min` : null, distance ? `${distance} yd` : null].filter(Boolean).join(" · ") || "Swim session",
      draft: { date, minutes: minutes ?? "", distance: distance ?? "", stroke: "Freestyle", notes: baseNotes },
    });
  }

  if (hasAny(clean, ["yoga", "mobility", "stretch"])) {
    const minutes = firstMinutes(clean);
    logs.push({
      kind: "yoga",
      label: "Yoga / mobility",
      summary: minutes ? `${minutes} min` : "Recovery work",
      draft: { date, minutes: minutes ?? "", focus: hasAny(clean, ["stretch"]) ? "Stretch" : "Mobility", notes: baseNotes },
    });
  }

  if (hasAny(clean, ["meditated", "meditation", "reset", "stayed present", "journaled"])) {
    logs.push({
      kind: "mood",
      label: "Meditation / reset",
      summary: "Pattern interrupted",
      draft: { date, reason: "stress", label: inferResetAction(clean), didntSmoke: true, didntSpiral: true, notes: baseNotes },
    });
  }

  if (hasAny(clean, ["meal", "ate", "food", "protein shake", "shake", "burrito", "latte", "pizza", "huel"])) {
    const calories = matchNumber(clean, /(\d{2,4})\s*(?:cal|cals|calories)\b/);
    const protein = matchNumber(clean, /(\d+(?:\.\d+)?)\s*(?:g|grams?)\s*(?:of\s*)?protein\b/);
    logs.push({
      kind: "meal",
      label: "Meal",
      summary: [calories ? `${calories} cal` : null, protein ? `${protein}g protein` : null].filter(Boolean).join(" · ") || "Food note",
      draft: { date, name: inferMealName(clean), calories: calories ?? "", protein: protein ?? "", notes: baseNotes },
    });
  }

  if (hasAny(clean, ["water", "hydrated", "drank"])) {
    const ounces = matchNumber(clean, /(\d+(?:\.\d+)?)\s*(?:oz|ounces)\b/);
    if (ounces) {
      logs.push({
        kind: "water",
        label: "Water",
        summary: `${ounces} oz`,
        draft: { date, ounces },
      });
    }
  }

  if (hasAny(clean, ["sleep", "slept", "bed"])) {
    const hours = matchNumber(clean, /(\d+(?:\.\d+)?)\s*(?:hours|hrs|hour|hr)\b/);
    if (hours) {
      logs.push({
        kind: "sleep",
        label: "Sleep",
        summary: `${hours} hours`,
        draft: { date, hours, quality: "good", notes: baseNotes },
      });
    }
  }

  return dedupeParsedLogs(logs);
}

function hasAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function matchNumber(value: string, pattern: RegExp) {
  const match = value.match(pattern);
  return match?.[1] ?? null;
}

function firstMinutes(value: string) {
  return matchNumber(value, /(\d+(?:\.\d+)?)\s*(?:min|mins|minute|minutes)\b/);
}

function matchTime(value: string, pattern: RegExp) {
  const raw = matchNumber(value, pattern);
  if (!raw) return null;
  if (raw.includes(":")) return raw;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return raw;
  const minutes = Math.floor(parsed);
  const seconds = Math.round((parsed - minutes) * 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function pushUpSets(value: string) {
  const setsOf = value.match(/(\d+)\s*sets?\s*(?:of|x)\s*(\d+)\s*(?:push|push-?ups?)/);
  if (setsOf) {
    return Array.from({ length: Number(setsOf[1]) }, () => Number(setsOf[2])).filter(Number.isFinite);
  }

  const segment = sliceAround(value, /push[- ]?ups?/);
  const numbers = Array.from(segment.matchAll(/\b(\d{1,3})\b/g)).map((match) => Number(match[1]));
  return numbers.filter((item) => item > 0 && item <= 150).slice(0, 10);
}

function sliceAround(value: string, pattern: RegExp) {
  const match = value.match(pattern);
  if (!match || match.index === undefined) return value;
  return value.slice(Math.max(0, match.index - 36), Math.min(value.length, match.index + 120));
}

function repsExcludingWeight(value: string, weight: string | null) {
  const matches = Array.from(value.matchAll(/\b(\d{1,4})\s*(?:reps?|swings?|passes?|rounds?)\b/g)).map((match) => match[1]);
  return matches.find((match) => match !== weight) ?? null;
}

function inferExercise(value: string, options: string[], fallbackPrefix: string) {
  const match = options.find((option) => {
    const normalized = option.toLowerCase().replace(/-/g, " ");
    return normalized.split(" ").every((word) => value.includes(word)) || value.includes(normalized);
  });
  return match ?? (fallbackPrefix === "Kettlebell" ? "Swings" : "Dumbbell curls");
}

function inferMachine(value: string) {
  const machines = [
    { category: "Cardio", name: "Treadmill", terms: ["treadmill"] },
    { category: "Cardio", name: "StairMaster", terms: ["stairmaster", "stair master", "stairs"] },
    { category: "Cardio", name: "Elliptical", terms: ["elliptical"] },
    { category: "Cardio", name: "Concept2 rower", terms: ["concept 2", "concept2", "rower", "rowing machine"] },
    { category: "Strength machine", name: "Leg press", terms: ["leg press"] },
    { category: "Strength machine", name: "Leg extension", terms: ["leg extension"] },
    { category: "Strength machine", name: "Seated leg curl", terms: ["leg curl", "seated leg curl"] },
    { category: "Strength machine", name: "Converging chest press", terms: ["chest press"] },
    { category: "Strength machine", name: "Converging shoulder press", terms: ["shoulder press"] },
    { category: "Strength machine", name: "Lateral raise", terms: ["lateral raise"] },
    { category: "Strength machine", name: "Bicep curl", terms: ["bicep curl", "biceps curl"] },
    { category: "Strength machine", name: "Rotary torso", terms: ["rotary torso", "torso rotation"] },
    { category: "Strength machine", name: "Abdominal", terms: ["abdominal", "ab machine"] },
    { category: "Strength machine", name: "Inner thigh", terms: ["inner thigh", "adductor"] },
    { category: "Strength machine", name: "Bench press", terms: ["bench press"] },
  ];

  return machines.find((machine) => machine.terms.some((term) => value.includes(term))) ?? null;
}

function inferResetAction(value: string) {
  if (value.includes("meditat")) return "Meditated";
  if (value.includes("journal")) return "Journaled";
  if (value.includes("walk")) return "Walked";
  if (value.includes("gym")) return "Went to the gym";
  if (value.includes("bed")) return "Early bedtime";
  return "Stayed present";
}

function inferMealName(value: string) {
  const knownFoods = ["protein shake", "huel", "burrito", "pizza", "latte", "poke bowl", "beans", "banana", "peach"];
  return knownFoods.find((food) => value.includes(food)) ?? "Voice logged meal";
}

function dedupeParsedLogs(logs: ParsedVoiceLog[]) {
  const seen = new Set<string>();
  return logs.filter((log) => {
    const key = `${log.kind}:${log.label}:${log.summary}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
