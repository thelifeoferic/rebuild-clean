"use client";

import { AlertTriangle, Camera, ImagePlus, Loader2, Save, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ActionButton } from "@/components/action-button";
import { Section } from "@/components/section";
import {
  deleteProgressPhoto,
  listProgressPhotos,
  saveProgressPhoto,
  type ProgressPhoto,
  type ProgressPhotoAnalysis,
} from "@/lib/progress-photos";
import type { OnboardingProfile } from "@/types/rebuild";

type BodyAnalysis = ProgressPhotoAnalysis;

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
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [selectedBeforeId, setSelectedBeforeId] = useState("");
  const [selectedAfterId, setSelectedAfterId] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [error, setError] = useState("");

  const canAnalyze = Boolean(imageData && consent && !isLoading);
  const canSavePhoto = Boolean(imageData && !isLoading);
  const selectedBefore = photos.find((photo) => photo.id === selectedBeforeId) ?? null;
  const selectedAfter = photos.find((photo) => photo.id === selectedAfterId) ?? null;
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

  useEffect(() => {
    void refreshPhotos();
  }, []);

  useEffect(() => {
    if (selectedBeforeId || photos.length < 2) return;
    setSelectedBeforeId(photos[photos.length - 1]?.id ?? "");
  }, [photos, selectedBeforeId]);

  useEffect(() => {
    if (selectedAfterId || photos.length < 1) return;
    setSelectedAfterId(photos[0]?.id ?? "");
  }, [photos, selectedAfterId]);

  async function handleFile(file: File | null) {
    setError("");
    setAnalysis(null);
    setIsMock(false);
    setSaveStatus("");

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

      const nextAnalysis = normalizeAnalysis(payload.analysis);
      const nextIsMock = Boolean(payload.mock);
      setAnalysis(nextAnalysis);
      setIsMock(nextIsMock);
      await saveAnalyzedPhoto(nextAnalysis, nextIsMock);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function saveCurrentPhoto() {
    if (!canSavePhoto) return;

    setError("");
    setSaveStatus("");

    const photo: ProgressPhoto = {
      analysis: analysis ?? undefined,
      analysisMock: isMock || undefined,
      id: createPhotoId(),
      analysisSummary: analysis?.summary,
      createdAt: new Date().toISOString(),
      imageData,
      note: context.trim(),
    };

    try {
      await saveProgressPhoto(photo);
      const nextPhotos = await listProgressPhotos();
      setPhotos(nextPhotos);
      setSelectedAfterId(photo.id);
      if (!selectedBeforeId && nextPhotos.length > 1) setSelectedBeforeId(nextPhotos[nextPhotos.length - 1].id);
      setSaveStatus(analysis ? "AI body scan saved to progress library." : "Photo saved to progress library.");
    } catch {
      setError("Could not save this photo on this device.");
    }
  }

  async function saveAnalyzedPhoto(nextAnalysis: BodyAnalysis, nextIsMock: boolean) {
    const photo: ProgressPhoto = {
      analysis: nextAnalysis,
      analysisMock: nextIsMock || undefined,
      analysisSummary: nextAnalysis.summary,
      createdAt: new Date().toISOString(),
      id: createPhotoId(),
      imageData,
      note: context.trim(),
    };

    try {
      await saveProgressPhoto(photo);
      const nextPhotos = await listProgressPhotos();
      setPhotos(nextPhotos);
      setSelectedAfterId(photo.id);
      if (!selectedBeforeId && nextPhotos.length > 1) setSelectedBeforeId(nextPhotos[nextPhotos.length - 1].id);
      setSaveStatus("AI body scan saved. You can reopen this analysis from the progress library.");
    } catch {
      setSaveStatus("Analysis ready. Save this photo if you want it in comparisons.");
    }
  }

  async function removeSavedPhoto(id: string) {
    try {
      await deleteProgressPhoto(id);
      const nextPhotos = await listProgressPhotos();
      setPhotos(nextPhotos);
      if (selectedBeforeId === id) setSelectedBeforeId(nextPhotos[nextPhotos.length - 1]?.id ?? "");
      if (selectedAfterId === id) setSelectedAfterId(nextPhotos[0]?.id ?? "");
      setSaveStatus("Progress photo deleted.");
    } catch {
      setError("Could not delete that photo.");
    }
  }

  async function refreshPhotos() {
    try {
      const nextPhotos = await listProgressPhotos();
      setPhotos(nextPhotos);
    } catch {
      setError("Saved progress photos are not available in this browser.");
    }
  }

  function clearPhoto() {
    setImageData("");
    setFileName("");
    setAnalysis(null);
    setIsMock(false);
    setSaveStatus("");
    setError("");
  }

  function loadSavedPhoto(photo: ProgressPhoto) {
    setImageData(photo.imageData);
    setFileName(`Saved ${formatPhotoDate(photo.createdAt)}`);
    setContext(photo.note ?? "");
    setAnalysis(photo.analysis ? normalizeAnalysis(photo.analysis) : photo.analysisSummary ? { ...emptyAnalysis, summary: photo.analysisSummary } : null);
    setIsMock(Boolean(photo.analysisMock));
    setSaveStatus(photo.analysis ? "Saved AI body scan loaded." : "Saved photo loaded as current preview.");
    setError("");
  }

  return (
    <Section
      id="body-check"
      eyebrow="Signature feature"
      title="AI Body Scan"
      action={<ActionButton label="Private mode" icon={ShieldCheck} variant="dark" />}
    >
      <div className="panel overflow-hidden">
        <div className="relative min-h-56 bg-black">
          {imageData ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageData} alt="Selected body progress preview" className="absolute inset-0 h-full w-full object-cover opacity-75" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(232,91,62,0.22),transparent_14rem),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.01))]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="metric-label text-white/58">Photo analysis</p>
            <h2 className="mt-2 font-display text-4xl uppercase leading-none text-white">
              See what is changing.
            </h2>
            <p className="mt-3 max-w-[21rem] text-sm font-semibold leading-5 text-white/68">
              Upload a progress photo and get non-medical coaching on posture cues, training priorities, and what to track next.
            </p>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <label className="flex min-h-[9.25rem] cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/18 bg-white/[0.055] p-4 text-center transition hover:border-champagne/60">
            <input
              type="file"
              accept="image/*"
              capture="user"
              className="sr-only"
              onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
            />
            <span className="app-primary-action grid size-12 place-items-center rounded-full p-0">
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
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void saveCurrentPhoto()}
                disabled={!canSavePhoto}
                className="app-primary-action inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-black disabled:opacity-45"
              >
                <Save size={16} strokeWidth={2.2} aria-hidden />
                Save to progress
              </button>
              <button
                type="button"
                onClick={clearPhoto}
                className="app-secondary-action inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-bold"
              >
                <Trash2 size={16} strokeWidth={2.2} aria-hidden />
                Clear photo
              </button>
            </div>
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

          {saveStatus ? (
            <div className="rounded-2xl border border-signal/25 bg-signal/10 p-3 text-sm font-semibold leading-5 text-white/68">
              {saveStatus}
            </div>
          ) : null}

          <button
            type="button"
            disabled={!canAnalyze}
            onClick={() => void analyzePhoto()}
            className="app-primary-action flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-5 text-base font-black transition disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isLoading ? <Loader2 size={19} className="animate-spin" strokeWidth={2.4} aria-hidden /> : <Sparkles size={19} strokeWidth={2.4} aria-hidden />}
            {isLoading ? "Analyzing..." : "Analyze body scan"}
          </button>

          <div className="rounded-2xl border border-white/10 bg-carbon/70 p-3">
            <p className="metric-label">Privacy posture</p>
            <p className="mt-2 text-sm font-semibold leading-5 text-white/50">
              Body scans save on this device after analysis so you can revisit them. Delete any saved photo from the progress library whenever you want.
            </p>
          </div>

          {analysis ? <AnalysisCard analysis={analysis} isMock={isMock} /> : null}

          <ProgressPhotoLibrary
            onDelete={(id) => void removeSavedPhoto(id)}
            onLoad={loadSavedPhoto}
            onSelectAfter={setSelectedAfterId}
            onSelectBefore={setSelectedBeforeId}
            photos={photos}
            selectedAfter={selectedAfter}
            selectedAfterId={selectedAfterId}
            selectedBefore={selectedBefore}
            selectedBeforeId={selectedBeforeId}
          />
        </div>
      </div>
    </Section>
  );
}

function ProgressPhotoLibrary({
  onDelete,
  onLoad,
  onSelectAfter,
  onSelectBefore,
  photos,
  selectedAfter,
  selectedAfterId,
  selectedBefore,
  selectedBeforeId,
}: {
  onDelete: (id: string) => void;
  onLoad: (photo: ProgressPhoto) => void;
  onSelectAfter: (id: string) => void;
  onSelectBefore: (id: string) => void;
  photos: ProgressPhoto[];
  selectedAfter: ProgressPhoto | null;
  selectedAfterId: string;
  selectedBefore: ProgressPhoto | null;
  selectedBeforeId: string;
}) {
  return (
    <div className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="metric-label">Progress library</p>
          <h3 className="mt-1 text-lg font-black text-porcelain">Saved body scans</h3>
          <p className="mt-1 text-sm font-semibold leading-5 text-white/45">
            Tap a photo to reopen its image, note, and saved analysis.
          </p>
        </div>
        <span className="rounded-full bg-carbon px-3 py-1 text-xs font-black text-white/50">
          {photos.length} saved
        </span>
      </div>

      {photos.length >= 2 ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <PhotoSelect label="Before" onChange={onSelectBefore} photos={photos} value={selectedBeforeId} />
            <PhotoSelect label="After" onChange={onSelectAfter} photos={photos} value={selectedAfterId} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <ComparePhoto label="Before" photo={selectedBefore} />
            <ComparePhoto label="After" photo={selectedAfter} />
          </div>
        </div>
      ) : (
        <p className="rounded-2xl bg-carbon/70 p-3 text-sm font-semibold leading-5 text-white/48">
          Save at least two photos to unlock side-by-side comparisons.
        </p>
      )}

      {photos.length ? (
        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {photos.map((photo) => (
            <article key={photo.id} className="flex gap-3 rounded-2xl bg-carbon/70 p-3">
              <button
                type="button"
                onClick={() => onLoad(photo)}
                className="relative h-20 w-16 shrink-0 overflow-hidden rounded-2xl bg-black"
                aria-label={`Load photo from ${formatPhotoDate(photo.createdAt)}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.imageData} alt="" className="h-full w-full object-cover" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-black text-porcelain">{formatPhotoDate(photo.createdAt)}</p>
                  {photo.analysis ? (
                    <span className="rounded-full bg-signal/10 px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-[0.12em] text-signal">
                      Analysis saved
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 line-clamp-2 text-xs font-semibold leading-4 text-white/45">
                  {photo.note || photo.analysisSummary || "Saved progress photo"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectBefore(photo.id)}
                    className="app-secondary-action rounded-full px-3 py-1 text-xs font-bold"
                  >
                    Before
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectAfter(photo.id)}
                    className="app-secondary-action rounded-full px-3 py-1 text-xs font-bold"
                  >
                    After
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDelete(photo.id)}
                className="app-secondary-action grid size-10 shrink-0 place-items-center rounded-full"
                aria-label={`Delete photo from ${formatPhotoDate(photo.createdAt)}`}
              >
                <Trash2 size={16} strokeWidth={2.2} aria-hidden />
              </button>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PhotoSelect({
  label,
  onChange,
  photos,
  value,
}: {
  label: string;
  onChange: (id: string) => void;
  photos: ProgressPhoto[];
  value: string;
}) {
  return (
    <label className="block">
      <span className="metric-label mb-2 block">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full rounded-2xl border border-white/10 bg-carbon px-3 text-sm font-bold text-porcelain outline-none focus:border-champagne"
      >
        {photos.map((photo) => (
          <option key={photo.id} value={photo.id}>
            {formatPhotoDate(photo.createdAt)}
          </option>
        ))}
      </select>
    </label>
  );
}

function ComparePhoto({ label, photo }: { label: string; photo: ProgressPhoto | null }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-black">
      <div className="relative aspect-[3/4]">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.imageData} alt={`${label} progress`} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-white/[0.055]" />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/70">{label}</p>
          <p className="mt-1 text-xs font-semibold text-white/52">
            {photo ? formatPhotoDate(photo.createdAt) : "Choose photo"}
          </p>
        </div>
      </div>
    </div>
  );
}

function AnalysisCard({ analysis, isMock }: { analysis: BodyAnalysis; isMock: boolean }) {
  return (
    <div className="space-y-3 rounded-3xl border border-champagne/30 bg-champagne/10 p-4">
      <div className="flex items-start gap-3">
        <span className="app-primary-action grid size-10 shrink-0 place-items-center rounded-full p-0">
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

function createPhotoId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `body-${crypto.randomUUID()}`;
  }

  return `body-${Date.now()}`;
}

function formatPhotoDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Saved photo";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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
