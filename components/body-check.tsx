"use client";

import { AlertTriangle, Camera, ImagePlus, Loader2, ShieldCheck, Sparkles, Trash2, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { ActionButton } from "@/components/action-button";
import { Section } from "@/components/section";
import type { OnboardingProfile } from "@/types/rebuild";

type BodyAnalysis = {
  summary: string;
  observations: string[];
  trainingPriorities: string[];
  nextActions: string[];
  progressPhotoTips: string[];
  disclaimer: string;
};

type AnalysisResponse = {
  analysis: BodyAnalysis;
  mock?: boolean;
};

const emptyAnalysis: BodyAnalysis = {
  summary: "",
  observations: [],
  trainingPriorities: [],
  nextActions: [],
  progressPhotoTips: [],
  disclaimer: "",
};

export function BodyCheck({ profile }: { profile: OnboardingProfile | null }) {
  const [imageData, setImageData] = useState("");
  const [fileName, setFileName] = useState("");
  const [context, setContext] = useState("");
  const [consent, setConsent] = useState(false);
  const [analysis, setAnalysis] = useState<BodyAnalysis | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const canAnalyze = Boolean(imageData && consent && !isLoading);
  const profileContext = useMemo(() => {
    const goals = profile?.goals?.length ? profile.goals.join(", ") : profile?.goal;
    return [
      profile?.firstName ? `Name: ${profile.firstName}` : "",
      goals ? `Goals: ${goals}` : "",
      profile?.height ? `Height: ${profile.height}` : "",
      profile?.currentWeight ? `Current weight: ${profile.currentWeight} lb` : "",
      profile?.targetWeight ? `Target weight: ${profile.targetWeight} lb` : "",
      profile?.equipment?.length ? `Equipment: ${profile.equipment.join(", ")}` : "",
      context ? `User note: ${context}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [context, profile]);

  async function handleFile(file: File | null) {
    setError("");
    setAnalysis(null);
    setIsMock(false);

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }

    try {
      const resized = await resizeImage(file);
      setImageData(resized);
      setFileName(file.name);
    } catch {
      setError("That photo could not be prepared. Try a different image.");
    }
  }

  async function analyzePhoto() {
    if (!canAnalyze) return;

    setIsLoading(true);
    setError("");
    setAnalysis(null);
    setIsMock(false);

    try {
      const response = await fetch("/api/body-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData,
          context: profileContext,
        }),
      });

      const payload = (await response.json()) as Partial<AnalysisResponse> & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Analysis failed.");
      }

      setAnalysis(normalizeAnalysis(payload.analysis));
      setIsMock(Boolean(payload.mock));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function clearPhoto() {
    setImageData("");
    setFileName("");
    setAnalysis(null);
    setIsMock(false);
    setError("");
  }

  return (
    <Section
      id="body-check"
      eyebrow="AI progress check"
      title="Body Check"
      action={<ActionButton label="Private mode" icon={ShieldCheck} variant="dark" />}
    >
      <div className="panel overflow-hidden">
        <div className="relative min-h-56 bg-black">
          {imageData ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageData} alt="Selected body progress preview" className="absolute inset-0 h-full w-full object-cover opacity-75" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(216,177,95,0.22),transparent_14rem),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.01))]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="metric-label text-white/58">Photo analysis</p>
            <h2 className="mt-2 font-display text-4xl uppercase leading-none text-white">
              Progress, not judgment.
            </h2>
            <p className="mt-3 max-w-[21rem] text-sm font-semibold leading-5 text-white/68">
              Upload a body photo and get non-medical coaching on posture cues, training priorities, and what to track next.
            </p>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/18 bg-white/[0.055] p-4 text-center transition hover:border-champagne/60">
            <input
              type="file"
              accept="image/*"
              capture="user"
              className="sr-only"
              onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
            />
            <span className="grid size-12 place-items-center rounded-full bg-champagne text-carbon">
              {imageData ? <Camera size={21} strokeWidth={2.4} aria-hidden /> : <ImagePlus size={21} strokeWidth={2.4} aria-hidden />}
            </span>
            <span>
              <span className="block text-base font-black text-porcelain">
                {imageData ? "Change progress photo" : "Upload or take photo"}
              </span>
              <span className="mt-1 block text-sm font-semibold text-white/45">
                {fileName || "Front, side, or back photo. Good lighting helps."}
              </span>
            </span>
          </label>

          {imageData ? (
            <button
              type="button"
              onClick={clearPhoto}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 px-4 text-sm font-bold text-white/58"
            >
              <Trash2 size={16} strokeWidth={2.2} aria-hidden />
              Clear photo
            </button>
          ) : null}

          <label className="block">
            <span className="metric-label">Optional note</span>
            <textarea
              value={context}
              onChange={(event) => setContext(event.target.value)}
              placeholder="Example: I want to improve posture, lose fat, build shoulders, or compare month over month."
              className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-carbon/70 px-4 py-3 text-base font-semibold text-porcelain outline-none placeholder:text-white/28 focus:border-champagne"
            />
          </label>

          <label className="flex items-start gap-3 rounded-2xl bg-white/[0.055] p-3">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-1 size-5 accent-[rgb(var(--color-accent))]"
            />
            <span className="text-sm font-semibold leading-5 text-white/58">
              I understand this is coaching feedback, not a medical diagnosis. Do not upload nude images or photos of anyone without permission.
            </span>
          </label>

          {error ? (
            <div className="flex gap-3 rounded-2xl border border-ember/35 bg-ember/10 p-3 text-sm font-semibold leading-5 text-white/72">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-ember" strokeWidth={2.2} aria-hidden />
              {error}
            </div>
          ) : null}

          <button
            type="button"
            disabled={!canAnalyze}
            onClick={() => void analyzePhoto()}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-champagne px-5 text-base font-black text-carbon shadow-glow transition disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isLoading ? <Loader2 size={19} className="animate-spin" strokeWidth={2.4} aria-hidden /> : <Sparkles size={19} strokeWidth={2.4} aria-hidden />}
            {isLoading ? "Analyzing..." : "Analyze body check"}
          </button>

          <div className="rounded-2xl border border-white/10 bg-carbon/70 p-3">
            <p className="metric-label">Privacy posture</p>
            <p className="mt-2 text-sm font-semibold leading-5 text-white/50">
              REBUILD does not save the photo automatically. The image is resized on your device, sent once for analysis, and the preview can be cleared anytime.
            </p>
          </div>

          {analysis ? <AnalysisCard analysis={analysis} isMock={isMock} /> : null}
        </div>
      </div>
    </Section>
  );
}

function AnalysisCard({ analysis, isMock }: { analysis: BodyAnalysis; isMock: boolean }) {
  return (
    <div className="space-y-3 rounded-3xl border border-champagne/30 bg-champagne/10 p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-champagne text-carbon">
          <Sparkles size={18} strokeWidth={2.4} aria-hidden />
        </span>
        <div>
          <p className="metric-label text-champagne">Analysis</p>
          <p className="mt-1 text-lg font-black leading-6 text-porcelain">{analysis.summary}</p>
          {isMock ? (
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-white/45">
              Demo mode. Add OPENAI_API_KEY in Vercel for live AI.
            </p>
          ) : null}
        </div>
      </div>

      <AnalysisList title="Visible cues" items={analysis.observations} />
      <AnalysisList title="Training priorities" items={analysis.trainingPriorities} />
      <AnalysisList title="Next actions" items={analysis.nextActions} />
      <AnalysisList title="Better progress photos" items={analysis.progressPhotoTips} />

      <p className="rounded-2xl bg-carbon/70 p-3 text-xs font-semibold leading-5 text-white/45">
        {analysis.disclaimer}
      </p>
    </div>
  );
}

function AnalysisList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;

  return (
    <div className="rounded-2xl bg-carbon/70 p-3">
      <p className="metric-label">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm font-semibold leading-5 text-white/62">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-champagne" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function normalizeAnalysis(value: unknown): BodyAnalysis {
  if (!value || typeof value !== "object") return emptyAnalysis;
  const raw = value as Partial<BodyAnalysis>;

  return {
    summary: stringOr(raw.summary, "Use this photo as a baseline and compare under the same lighting every 2-4 weeks."),
    observations: stringArray(raw.observations),
    trainingPriorities: stringArray(raw.trainingPriorities),
    nextActions: stringArray(raw.nextActions),
    progressPhotoTips: stringArray(raw.progressPhotoTips),
    disclaimer: stringOr(raw.disclaimer, "This is non-medical coaching feedback and should not replace professional care."),
  };
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean).slice(0, 5)
    : [];
}

function stringOr(value: unknown, fallback: string) {
  const text = String(value ?? "").trim();
  return text || fallback;
}

async function resizeImage(file: File) {
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const maxSide = 1280;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) throw new Error("No canvas context");

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", 0.82);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image failed to load"));
    image.src = src;
  });
}
