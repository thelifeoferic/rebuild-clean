"use client";

import { Activity, AlertTriangle, CheckCircle2, Maximize2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Section } from "@/components/section";

const visuals = [
  {
    title: "Bike",
    variant: "bike",
    equipment: "Cardio",
    phases: ["Tall", "Drive", "Breathe"],
    keep: ["Tall chest", "Knees track forward", "Full pedal stroke"],
    watch: ["Collapsed shoulders", "Rocking hips"],
  },
  {
    title: "StairMaster",
    variant: "stair",
    equipment: "Cardio",
    phases: ["Step", "Stack", "Settle"],
    keep: ["Light hands", "Full foot on step", "Hips under ribs"],
    watch: ["Leaning on rails", "Toe-only stepping"],
  },
  {
    title: "Row machine",
    variant: "rower",
    equipment: "Cardio",
    phases: ["Legs", "Hips", "Arms"],
    keep: ["Legs first", "Strong hip swing", "Smooth return"],
    watch: ["Yanking early", "Rounded finish"],
  },
  {
    title: "Lat pulldown",
    variant: "pulldown",
    equipment: "Machine",
    phases: ["Set", "Pull", "Control"],
    keep: ["Chest tall", "Elbows to ribs", "Slow return"],
    watch: ["Shrugging", "Leaning too far back"],
  },
  {
    title: "Leg press",
    variant: "legpress",
    equipment: "Machine",
    phases: ["Brace", "Lower", "Press"],
    keep: ["Feet even", "Controlled depth", "Soft lockout"],
    watch: ["Knees caving", "Hard knee lock"],
  },
  {
    title: "Push-up",
    variant: "pushup",
    equipment: "Bodyweight",
    phases: ["Stack", "Lower", "Press"],
    keep: ["Hands under shoulders", "Straight body line", "Chest moves as one"],
    watch: ["Sagging hips", "Half reps"],
  },
  {
    title: "Bodyweight squat",
    variant: "squat",
    equipment: "Bodyweight",
    phases: ["Root", "Sit", "Stand"],
    keep: ["Feet rooted", "Knees track toes", "Own the bottom"],
    watch: ["Heels lifting", "Knees collapsing"],
  },
  {
    title: "Dumbbell row",
    variant: "row",
    equipment: "Dumbbell",
    phases: ["Brace", "Pull", "Pause"],
    keep: ["Brace on bench", "Elbow to hip", "Quiet torso"],
    watch: ["Twisting open", "Shrugging"],
  },
  {
    title: "Bench press",
    variant: "bench",
    equipment: "Barbell",
    phases: ["Pack", "Touch", "Press"],
    keep: ["Shoulders packed", "Feet planted", "Controlled descent"],
    watch: ["Bouncing", "Loose upper back"],
  },
  {
    title: "Shoulder press",
    variant: "press",
    equipment: "Dumbbell",
    phases: ["Brace", "Press", "Stack"],
    keep: ["Ribs down", "Wrists stacked", "Head through"],
    watch: ["Leaning back", "Flared ribs"],
  },
  {
    title: "Kettlebell hinge",
    variant: "kettlebell",
    equipment: "Kettlebell",
    phases: ["Hinge", "Snap", "Float"],
    keep: ["Hips back", "Neutral spine", "Power from hips"],
    watch: ["Squatting the swing", "Lifting with arms"],
  },
  {
    title: "Freestyle swim",
    variant: "swim",
    equipment: "Pool",
    phases: ["Line", "Rotate", "Exhale"],
    keep: ["Long body line", "Exhale in water", "Gentle rotation"],
    watch: ["Head lifting", "Holding breath"],
  },
  {
    title: "Yoga downshift",
    variant: "yoga",
    equipment: "Recovery",
    phases: ["Breathe", "Lengthen", "Release"],
    keep: ["Slow nasal breath", "Long spine", "Soft range"],
    watch: ["Forcing depth", "Rushing transitions"],
  },
] as const;

type Visual = (typeof visuals)[number];
type VisualVariant = Visual["variant"];
type FormMapCue = {
  detail: string;
  label: string;
  tone: "keep" | "watch";
};

export function FormVisuals() {
  const [expandedVisual, setExpandedVisual] = useState<Visual | null>(null);

  useEffect(() => {
    if (!expandedVisual) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [expandedVisual]);

  return (
    <Section id="form-visuals" eyebrow="Movement lab" title="Form Visuals">
      <div className="panel p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm leading-5 text-white/48">
            Tap through the movement cards before a set. Use the green cues to lock form, then watch the red flags when fatigue starts talking.
          </p>
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-signal/10 text-signal">
            <Activity size={18} strokeWidth={2.2} aria-hidden />
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {visuals.map((visual) => (
            <article
              key={visual.title}
              className="app-card min-w-[88%] overflow-hidden rounded-[1.6rem]"
            >
              <button
                type="button"
                onClick={() => setExpandedVisual(visual)}
                className="group relative block w-full text-left"
                aria-label={`Open ${visual.title} form map full screen`}
              >
                <MotionStage visual={visual} />
                <span className="absolute right-3 top-3 inline-flex min-h-9 items-center gap-2 rounded-full border border-white/10 bg-black/62 px-3 text-xs font-black uppercase tracking-[0.12em] text-white/72 opacity-90 backdrop-blur transition group-active:scale-[0.97]">
                  <Maximize2 size={14} strokeWidth={2.2} aria-hidden />
                  View
                </span>
              </button>
              <div className="p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="metric-label">{visual.equipment}</p>
                    <h3 className="mt-1 text-xl font-semibold text-porcelain">{visual.title}</h3>
                  </div>
                  <div className="flex gap-1">
                    {visual.phases.map((phase) => (
                      <span key={phase} className="app-chip-active rounded-full px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em]">
                        {phase}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3">
                  <CueBlock icon="keep" title="Keep" items={visual.keep} />
                  <CueBlock icon="watch" title="Watch" items={visual.watch} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {expandedVisual ? (
        <div className="fixed inset-0 z-[95] bg-black/92 p-3 backdrop-blur-xl">
          <div className="mx-auto flex h-full max-w-4xl flex-col">
            <div className="flex items-center justify-between gap-3 pb-3 pt-[env(safe-area-inset-top)]">
              <div>
                <p className="metric-label">Form map</p>
                <h3 className="text-2xl font-semibold text-porcelain">{expandedVisual.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setExpandedVisual(null)}
                className="app-secondary-action grid size-12 place-items-center rounded-full"
                aria-label="Close form map"
              >
                <X size={21} strokeWidth={2.2} aria-hidden />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto pb-[calc(7rem+env(safe-area-inset-bottom))]">
              <div className="overflow-hidden rounded-[1.75rem] border border-white/10 shadow-panel">
                <MotionStage visual={expandedVisual} fullScreen />
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <CueBlock icon="keep" title="Keep" items={expandedVisual.keep} />
                <CueBlock icon="watch" title="Watch" items={expandedVisual.watch} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Section>
  );
}

function CueBlock({ icon, items, title }: { icon: "keep" | "watch"; items: readonly string[]; title: string }) {
  const Icon = icon === "keep" ? CheckCircle2 : AlertTriangle;
  const tone = icon === "keep" ? "text-signal bg-signal/10" : "text-ember bg-ember/10";

  return (
    <div className="app-card rounded-2xl p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className={`grid size-7 place-items-center rounded-full ${tone}`}>
          <Icon size={14} strokeWidth={2.2} aria-hidden />
        </span>
        <p className={`text-xs font-bold uppercase tracking-[0.14em] ${icon === "watch" ? "text-ember" : "text-signal"}`}>{title}</p>
      </div>
      <div className="grid gap-1">
        {items.map((item) => (
          <p key={item} className="app-secondary text-sm leading-5">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function MotionStage({ fullScreen = false, visual }: { fullScreen?: boolean; visual: Visual }) {
  const cuePoints = formMapCues(visual);

  return (
    <svg
      viewBox="0 0 520 320"
      className={`${fullScreen ? "max-h-[68vh]" : ""} aspect-[520/320] w-full bg-carbon`}
      role="img"
      aria-label={`${visual.title} form map`}
    >
      <defs>
        <radialGradient id={`aura-${visual.variant}`} cx="50%" cy="40%" r="70%">
          <stop stopColor="#2ee6a8" stopOpacity=".20" />
          <stop offset=".48" stopColor="#d8b15f" stopOpacity=".15" />
          <stop offset="1" stopColor="#08090a" stopOpacity="1" />
        </radialGradient>
        <linearGradient id={`limb-${visual.variant}`} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#f2eee7" />
          <stop offset="1" stopColor="#cfc7b8" />
        </linearGradient>
        <linearGradient id={`gold-${visual.variant}`} x1="0" x2="1">
          <stop stopColor="#d8b15f" />
          <stop offset="1" stopColor="#e15f3f" />
        </linearGradient>
        <linearGradient id={`human-${visual.variant}`} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#f3d18a" />
          <stop offset=".45" stopColor="#d8b15f" />
          <stop offset="1" stopColor="#8f6330" />
        </linearGradient>
        <linearGradient id={`steel-${visual.variant}`} x1="0" x2="1">
          <stop stopColor="#f2eee7" stopOpacity=".75" />
          <stop offset="1" stopColor="#52565b" stopOpacity=".8" />
        </linearGradient>
        <filter id={`soft-${visual.variant}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="14" stdDeviation="9" floodColor="#000000" floodOpacity=".45" />
        </filter>
      </defs>
      <rect width="520" height="320" fill={`url(#aura-${visual.variant})`} />
      <rect x="8" y="8" width="504" height="304" rx="28" fill="none" stroke="#ffffff" strokeOpacity=".16" />
      <Grid />

      <g transform="translate(24 24)">
        <rect width="132" height="48" rx="18" fill="#08090a" fillOpacity=".58" stroke="#ffffff" strokeOpacity=".12" />
        <text x="18" y="25" fill="#d8b15f" fontSize="15" fontWeight="800" letterSpacing="3.2">
          FORM MAP
        </text>
        <text x="18" y="43" fill="#2ee6a8" fontSize="10" fontWeight="800" letterSpacing="3">
          {shortMapTitle(visual.title)}
        </text>
      </g>

      <g transform="translate(26 94)">
        <rect width="112" height="122" rx="16" fill="#08090a" fillOpacity=".42" stroke="#ffffff" strokeOpacity=".12" />
        <text x="16" y="25" fill="#f2eee7" fontSize="9" fontWeight="900" letterSpacing="1.6">
          READ THE MAP
        </text>
        <g transform="translate(18 52)">
          <circle cx="0" cy="0" r="8" fill="#06150f" stroke="#2ee6a8" strokeOpacity=".62" strokeWidth="2" />
          <text x="18" y="-2" fill="#2ee6a8" fontSize="8.5" fontWeight="900" letterSpacing="1.1">
            GREEN
          </text>
          <text x="18" y="12" fill="#f2eee7" fillOpacity=".58" fontSize="7.4" fontWeight="700">
            hold form
          </text>
        </g>
        <g transform="translate(18 86)">
          <circle cx="0" cy="0" r="8" fill="#1e110d" stroke="#e15f3f" strokeOpacity=".7" strokeWidth="2" />
          <text x="18" y="-2" fill="#e15f3f" fontSize="8.5" fontWeight="900" letterSpacing="1.1">
            EMBER
          </text>
          <text x="18" y="12" fill="#f2eee7" fillOpacity=".58" fontSize="7.4" fontWeight="700">
            fix early
          </text>
        </g>
      </g>

      <g transform="translate(148 74) scale(.82)">
        <path d="M26 174H294" stroke="#f2eee7" strokeOpacity=".12" strokeWidth="2" />
        <path d="M44 182C98 165 214 165 276 182" stroke="#d8b15f" strokeOpacity=".28" strokeWidth="2" fill="none" />
        <VariantDrawing variant={visual.variant} />
      </g>

      <g transform="translate(374 58)">
        {cuePoints.slice(0, 5).map((cue, index) => {
          const y = index * 45;
          const labelLines = splitCueLines(cue.label, 12);
          const tone = cueTone(cue.tone);
          return (
            <g key={`${cue.label}-${index}`} transform={`translate(0 ${y})`}>
              <path d="M-66 16H-12" stroke={tone.stroke} strokeDasharray="4 6" strokeOpacity=".6" />
              <circle cx="0" cy="16" r="9" fill={tone.fill} stroke={tone.stroke} strokeOpacity=".68" strokeWidth="2" />
              <text x="-3.5" y="20" fill={tone.stroke} fontSize="9" fontWeight="900">
                {index + 1}
              </text>
              <SvgTextLines x={16} y={labelLines.length > 1 ? 9 : 19} lines={labelLines} tone={cue.tone} />
            </g>
          );
        })}
      </g>

      <g transform="translate(26 268)">
        <circle cx="12" cy="12" r="9" fill="none" stroke="#2ee6a8" strokeWidth="4" />
        <text x="34" y="11" fill="#2ee6a8" fontSize="10" fontWeight="900" letterSpacing="2">
          IDEAL ZONE
        </text>
        <text x="34" y="28" fill="#f2eee7" fillOpacity=".62" fontSize="9" fontWeight="600">
          Stay inside the green cues under fatigue.
        </text>
      </g>
    </svg>
  );
}

function Grid() {
  return (
    <g opacity=".13">
      {[0, 1, 2, 3, 4, 5, 6].map((index) => (
        <path key={`h-${index}`} d={`M154 ${62 + index * 34}H370`} stroke="#ffffff" strokeWidth=".8" />
      ))}
      {[0, 1, 2, 3, 4, 5, 6].map((index) => (
        <path key={`v-${index}`} d={`M${166 + index * 34} 42V272`} stroke="#ffffff" strokeWidth=".8" strokeDasharray="7 9" />
      ))}
    </g>
  );
}

function formMapCues(visual: Visual) {
  return [
    ...visual.keep.slice(0, 3).map((detail) => cueFromDetail(detail, "keep")),
    ...visual.watch.slice(0, 2).map((detail) => cueFromDetail(detail, "watch")),
  ];
}

function cueFromDetail(detail: string, tone: FormMapCue["tone"]): FormMapCue {
  return {
    detail,
    label: cueLabel(detail),
    tone,
  };
}

function cueTone(tone: FormMapCue["tone"]) {
  return tone === "watch"
    ? { fill: "#1e110d", stroke: "#e15f3f" }
    : { fill: "#06150f", stroke: "#2ee6a8" };
}

function cueLabel(value: string) {
  const clean = value.replace(/[^a-zA-Z0-9 /-]/g, "").trim();
  const words = clean.split(/\s+/).filter(Boolean);
  return words.slice(0, Math.min(words.length, 3)).join(" ");
}

function shortMapTitle(value: string) {
  return value
    .replace("Bodyweight ", "")
    .replace("Freestyle ", "")
    .replace("Kettlebell ", "KB ")
    .toUpperCase()
    .slice(0, 15);
}

function splitCueLines(value: string, maxLength: number) {
  const words = value.toUpperCase().split(/\s+/).filter(Boolean);
  const lines: string[] = [];

  words.forEach((word) => {
    const current = lines[lines.length - 1];
    if (!current || `${current} ${word}`.length > maxLength) {
      lines.push(word);
      return;
    }
    lines[lines.length - 1] = `${current} ${word}`;
  });

  return lines.slice(0, 3);
}

function SvgTextLines({ lines, tone, x, y }: { lines: string[]; tone: FormMapCue["tone"]; x: number; y: number }) {
  const color = cueTone(tone).stroke;
  return (
    <text x={x} y={y} fill={color} fontSize="8" fontWeight="900" letterSpacing=".7">
      {lines.map((line, index) => (
        <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : 11}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function VariantDrawing({ variant }: { variant: VisualVariant }) {
  return (
    <g filter={`url(#soft-${variant})`}>
      {variant === "bike" ? (
        <>
          <Wheel cx={92} cy={158} />
          <Wheel cx={232} cy={158} />
          <path d="M92 158L154 112L232 158M154 112L142 158M154 112H214M214 112L232 158" stroke="#08090a" strokeOpacity=".36" strokeWidth="11" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M92 158L154 112L232 158M154 112L142 158M154 112H214M214 112L232 158" stroke="#d8b15f" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M134 96H160M206 105C218 94 229 96 239 106M142 158L158 158M150 148L134 168" stroke={`url(#steel-${variant})`} strokeWidth="5" fill="none" strokeLinecap="round" />
          <circle cx="142" cy="158" r="13" fill="#08090a" stroke="#d8b15f" strokeWidth="3" />
          <path d="M134 168H119M158 148H173" stroke="#f2eee7" strokeOpacity=".52" strokeWidth="4" strokeLinecap="round" />
          <Human variant={variant} head={[166, 70]} body="M166 86L154 112L130 145M154 112L205 109M154 112L190 151" />
          <Joint x={154} y={112} />
          <Joint x={130} y={145} />
          <Joint x={190} y={151} />
        </>
      ) : null}
      {variant === "stair" ? (
        <>
          <path d="M58 174H105V146H152V118H199V90H266" stroke="#d8b15f" strokeWidth="8" fill="none" strokeLinejoin="round" />
          <path d="M76 74H242" stroke="#ffffff" strokeOpacity=".20" strokeWidth="5" />
          <Human variant={variant} head={[148, 58]} body="M148 74L146 110L119 146M146 110L184 110M146 110L177 146" />
          <Joint x={146} y={110} />
          <Joint x={119} y={146} />
        </>
      ) : null}
      {variant === "rower" ? (
        <>
          <path d="M48 170H270M96 150L220 92M212 88L270 74" stroke="#d8b15f" strokeWidth="8" fill="none" strokeLinecap="round" />
          <Human variant={variant} head={[126, 76]} body="M126 92L160 124L214 92M160 124L118 160M160 124L205 160" />
          <Joint x={160} y={124} />
          <Joint x={214} y={92} />
        </>
      ) : null}
      {variant === "pulldown" ? (
        <>
          <path d="M82 42H238M160 42V76M112 76H208" stroke="#d8b15f" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M238 48V184M224 58H252M224 76H252M224 94H252M224 112H252M224 130H252" stroke={`url(#steel-${variant})`} strokeWidth="3" strokeLinecap="round" opacity=".58" />
          <path d="M116 174H204" stroke="#ffffff" strokeOpacity=".18" strokeWidth="14" strokeLinecap="round" />
          <Human variant={variant} head={[160, 88]} body="M160 104L160 144M160 112L112 76M160 112L208 76M160 144L132 174M160 144L188 174" />
          <Joint x={112} y={76} />
          <Joint x={208} y={76} />
        </>
      ) : null}
      {variant === "legpress" ? (
        <>
          <path d="M76 172L235 68M228 58L270 132" stroke="#d8b15f" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M232 70L272 70M246 94L286 94M260 118L300 118" stroke={`url(#steel-${variant})`} strokeWidth="5" strokeLinecap="round" opacity=".62" />
          <path d="M68 170H132" stroke="#ffffff" strokeOpacity=".16" strokeWidth="14" strokeLinecap="round" />
          <Human variant={variant} head={[90, 108]} body="M106 118L152 140L226 102M152 140L104 166M152 140L214 154" />
          <Joint x={152} y={140} />
          <Joint x={226} y={102} />
        </>
      ) : null}
      {variant === "pushup" ? (
        <>
          <path d="M58 170H268" stroke="#d8b15f" strokeWidth="7" strokeLinecap="round" />
          <Human variant={variant} head={[86, 120]} body="M104 128L172 140L244 144M172 140L136 170M232 144L266 170" />
          <path d="M104 128L244 144" stroke="#2ee6a8" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 7" />
          <Joint x={172} y={140} />
          <Joint x={136} y={170} />
          <Joint x={244} y={144} />
        </>
      ) : null}
      {variant === "squat" ? (
        <>
          <path d="M86 174H236" stroke="#d8b15f" strokeWidth="7" strokeLinecap="round" />
          <path d="M92 78H226" stroke="#ffffff" strokeOpacity=".20" strokeWidth="5" strokeLinecap="round" />
          <Human variant={variant} head={[154, 74]} body="M154 90L146 126L110 168M146 126L206 126M146 126L204 170" />
          <path d="M112 168L204 170" stroke="#2ee6a8" strokeWidth="3" strokeLinecap="round" />
          <Joint x={146} y={126} />
          <Joint x={110} y={168} />
          <Joint x={204} y={170} />
        </>
      ) : null}
      {variant === "row" ? (
        <>
          <path d="M80 150H220M152 106H272" stroke="#d8b15f" strokeWidth="9" strokeLinecap="round" />
          <circle cx="252" cy="145" r="15" fill={`url(#gold-${variant})`} />
          <Human variant={variant} head={[96, 76]} body="M112 88L160 108L250 145M160 108L118 166M160 108L202 166" />
          <Joint x={160} y={108} />
          <Joint x={250} y={145} />
        </>
      ) : null}
      {variant === "bench" ? (
        <>
          <path d="M70 154H224M88 154L66 184M210 154L238 184M96 70H224" stroke="#d8b15f" strokeWidth="8" strokeLinecap="round" />
          <circle cx="88" cy="70" r="14" fill="#08090a" stroke="#d8b15f" strokeWidth="4" />
          <circle cx="232" cy="70" r="14" fill="#08090a" stroke="#d8b15f" strokeWidth="4" />
          <Human variant={variant} head={[110, 118]} body="M128 124L178 132L218 92M178 132L128 154M178 132L230 154" />
          <Joint x={218} y={92} />
          <Joint x={178} y={132} />
        </>
      ) : null}
      {variant === "press" ? (
        <>
          <path d="M114 60H206" stroke="#d8b15f" strokeWidth="8" strokeLinecap="round" />
          <circle cx="106" cy="60" r="12" fill="#08090a" stroke="#d8b15f" strokeWidth="4" />
          <circle cx="214" cy="60" r="12" fill="#08090a" stroke="#d8b15f" strokeWidth="4" />
          <Human variant={variant} head={[160, 86]} body="M160 102L160 146M160 108L116 62M160 108L204 62M160 146L132 176M160 146L188 176" />
          <path d="M160 102V60" stroke="#2ee6a8" strokeWidth="3" strokeDasharray="7 7" />
          <Joint x={160} y={108} />
          <Joint x={116} y={62} />
          <Joint x={204} y={62} />
        </>
      ) : null}
      {variant === "kettlebell" ? (
        <>
          <Kettlebell x={226} y={152} />
          <Human variant={variant} head={[114, 82]} body="M126 96L172 120L228 152M172 120L126 170M172 120L198 172" />
          <path d="M118 96L228 152" stroke="#2ee6a8" strokeWidth="3" strokeDasharray="7 7" />
          <Joint x={172} y={120} />
          <Joint x={228} y={152} />
        </>
      ) : null}
      {variant === "swim" ? (
        <>
          <path d="M28 142C70 116 112 164 160 142S244 116 294 142" stroke="#2ee6a8" strokeOpacity=".7" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M54 164C100 140 130 188 176 164S250 140 294 164" stroke="#ffffff" strokeOpacity=".12" strokeWidth="5" fill="none" strokeLinecap="round" />
          <circle cx="104" cy="104" r="15" fill="#d8b15f" />
          <path d="M120 110L202 126M154 116L100 154M178 122L228 86" stroke={`url(#limb-${variant})`} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Joint x={202} y={126} />
          <Joint x={228} y={86} />
        </>
      ) : null}
      {variant === "yoga" ? (
        <>
          <path d="M82 174H238" stroke="#d8b15f" strokeWidth="7" strokeLinecap="round" />
          <Human variant={variant} head={[160, 70]} body="M160 86L160 120M160 120L92 172M160 120L232 172M160 96L96 122M160 96L224 122" />
          <path d="M160 86V174" stroke="#2ee6a8" strokeWidth="3" strokeDasharray="6 8" />
          <Joint x={160} y={120} />
          <Joint x={92} y={172} />
          <Joint x={232} y={172} />
        </>
      ) : null}
    </g>
  );
}

function Human({ body, head, variant }: { body: string; head: [number, number]; variant: VisualVariant }) {
  const torso = inferTorso(body, head);
  const points = extractBodyPoints(body);
  const extremities = points
    .filter((point) => Math.hypot(point.x - torso.x, point.y - torso.y) > 34)
    .slice(-5);

  return (
    <>
      <path d={body} stroke="#020303" strokeOpacity=".54" strokeWidth="27" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={body} stroke={`url(#human-${variant})`} strokeOpacity=".94" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={body} stroke="#fff3de" strokeOpacity=".26" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <ellipse
        cx={torso.x}
        cy={torso.y}
        rx="18"
        ry="30"
        transform={`rotate(${torso.angle} ${torso.x} ${torso.y})`}
        fill="#151616"
        stroke="#d8b15f"
        strokeOpacity=".72"
        strokeWidth="2"
      />
      <ellipse
        cx={torso.x}
        cy={torso.y - 6}
        rx="11"
        ry="22"
        transform={`rotate(${torso.angle} ${torso.x} ${torso.y - 6})`}
        fill="#23231f"
        opacity=".8"
      />
      {extremities.map((point, index) => (
        <ellipse
          key={`${point.x}-${point.y}-${index}`}
          cx={point.x}
          cy={point.y}
          rx="8"
          ry="5"
          fill={`url(#human-${variant})`}
          stroke="#08090a"
          strokeOpacity=".3"
          strokeWidth="1.4"
        />
      ))}
      <path d={`M${head[0]} ${head[1] + 12}L${torso.x} ${torso.y - 16}`} stroke={`url(#human-${variant})`} strokeWidth="9" strokeLinecap="round" strokeOpacity=".95" />
      <circle cx={head[0]} cy={head[1]} r="15" fill={`url(#human-${variant})`} stroke="#08090a" strokeOpacity=".28" strokeWidth="2" />
      <path d={`M${head[0] + 4} ${head[1] - 3}L${head[0] + 11} ${head[1] - 1}L${head[0] + 4} ${head[1] + 4}`} stroke="#08090a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".42" />
    </>
  );
}

function inferTorso(body: string, head: [number, number]) {
  const points = extractBodyPoints(body);
  const torsoPoints = points.slice(0, Math.min(3, points.length));
  const fallback = { x: head[0], y: head[1] + 42 };
  const center = torsoPoints.length
    ? {
        x: torsoPoints.reduce((sum, point) => sum + point.x, 0) / torsoPoints.length,
        y: torsoPoints.reduce((sum, point) => sum + point.y, 0) / torsoPoints.length,
      }
    : fallback;
  const angle = (Math.atan2(center.y - head[1], center.x - head[0]) * 180) / Math.PI - 90;

  return { ...center, angle };
}

function extractBodyPoints(body: string) {
  const values = body.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  const points: Array<{ x: number; y: number }> = [];

  for (let index = 0; index < values.length - 1; index += 2) {
    points.push({ x: values[index], y: values[index + 1] });
  }

  return points;
}

function Wheel({ cx, cy }: { cx: number; cy: number }) {
  const spokes = Array.from({ length: 10 }, (_, index) => (index * Math.PI) / 5);

  return (
    <>
      <circle cx={cx} cy={cy} r="31" fill="#08090a" stroke="#d8b15f" strokeWidth="7" />
      <circle cx={cx} cy={cy} r="22" fill="none" stroke="#f2eee7" strokeOpacity=".14" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r="8" fill="#d8b15f" />
      {spokes.map((angle) => (
        <path
          key={angle}
          d={`M${cx} ${cy}L${cx + Math.cos(angle) * 24} ${cy + Math.sin(angle) * 24}`}
          stroke="#ffffff"
          strokeOpacity=".13"
          strokeWidth="1.5"
        />
      ))}
    </>
  );
}

function Joint({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="6" fill="#2ee6a8" stroke="#08090a" strokeWidth="3" />;
}

function Kettlebell({ x, y }: { x: number; y: number }) {
  return (
    <>
      <path d={`M${x - 13} ${y - 5}C${x - 13} ${y - 24} ${x + 13} ${y - 24} ${x + 13} ${y - 5}`} stroke="#d8b15f" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d={`M${x - 22} ${y - 2}C${x - 22} ${y - 20} ${x + 22} ${y - 20} ${x + 22} ${y - 2}V${y + 26}H${x - 22}Z`} fill={`url(#gold-kettlebell)`} />
    </>
  );
}
