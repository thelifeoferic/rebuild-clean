import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
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

export function FormVisuals() {
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
              className="min-w-[88%] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] shadow-panel"
            >
              <MotionStage visual={visual} />
              <div className="p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="metric-label">{visual.equipment}</p>
                    <h3 className="mt-1 text-xl font-semibold text-porcelain">{visual.title}</h3>
                  </div>
                  <div className="flex gap-1">
                    {visual.phases.map((phase) => (
                      <span key={phase} className="rounded-full bg-carbon px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-champagne">
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
    </Section>
  );
}

function CueBlock({ icon, items, title }: { icon: "keep" | "watch"; items: readonly string[]; title: string }) {
  const Icon = icon === "keep" ? CheckCircle2 : AlertTriangle;
  const tone = icon === "keep" ? "text-signal bg-signal/10" : "text-ember bg-ember/10";

  return (
    <div className="rounded-2xl bg-carbon/70 p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className={`grid size-7 place-items-center rounded-full ${tone}`}>
          <Icon size={14} strokeWidth={2.2} aria-hidden />
        </span>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/38">{title}</p>
      </div>
      <div className="grid gap-1">
        {items.map((item) => (
          <p key={item} className="text-sm leading-5 text-white/62">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function MotionStage({ visual }: { visual: Visual }) {
  return (
    <svg viewBox="0 0 320 210" className="h-56 w-full bg-carbon" role="img" aria-label={`${visual.title} form visual`}>
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
        <filter id={`soft-${visual.variant}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="14" stdDeviation="9" floodColor="#000000" floodOpacity=".45" />
        </filter>
      </defs>
      <rect width="320" height="210" fill={`url(#aura-${visual.variant})`} />
      <Grid />
      <path d="M26 174H294" stroke="#f2eee7" strokeOpacity=".12" strokeWidth="2" />
      <path d="M44 182C98 165 214 165 276 182" stroke="#d8b15f" strokeOpacity=".28" strokeWidth="2" fill="none" />
      <VariantDrawing variant={visual.variant} />
      <g transform="translate(20 18)">
        <rect width="92" height="28" rx="14" fill="#08090a" fillOpacity=".62" stroke="#ffffff" strokeOpacity=".10" />
        <text x="14" y="18" fill="#d8b15f" fontSize="10" fontWeight="700" letterSpacing="1.6">
          FORM MAP
        </text>
      </g>
    </svg>
  );
}

function Grid() {
  return (
    <g opacity=".16">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <path key={`h-${index}`} d={`M22 ${54 + index * 24}H298`} stroke="#ffffff" strokeWidth=".8" />
      ))}
      {[0, 1, 2, 3, 4, 5, 6].map((index) => (
        <path key={`v-${index}`} d={`M${42 + index * 40} 38V176`} stroke="#ffffff" strokeWidth=".8" />
      ))}
    </g>
  );
}

function VariantDrawing({ variant }: { variant: VisualVariant }) {
  return (
    <g filter={`url(#soft-${variant})`}>
      {variant === "bike" ? (
        <>
          <Wheel cx={92} cy={158} />
          <Wheel cx={232} cy={158} />
          <path d="M92 158L154 112L232 158M154 112L142 158M154 112H214M214 112L232 158" stroke="#d8b15f" strokeWidth="7" fill="none" strokeLinecap="round" />
          <Human head={[166, 70]} body="M166 86L154 112L130 145M154 112L205 109M154 112L190 151" />
          <Joint x={154} y={112} />
          <Joint x={130} y={145} />
          <Joint x={190} y={151} />
        </>
      ) : null}
      {variant === "stair" ? (
        <>
          <path d="M58 174H105V146H152V118H199V90H266" stroke="#d8b15f" strokeWidth="8" fill="none" strokeLinejoin="round" />
          <path d="M76 74H242" stroke="#ffffff" strokeOpacity=".20" strokeWidth="5" />
          <Human head={[148, 58]} body="M148 74L146 110L119 146M146 110L184 110M146 110L177 146" />
          <Joint x={146} y={110} />
          <Joint x={119} y={146} />
        </>
      ) : null}
      {variant === "rower" ? (
        <>
          <path d="M48 170H270M96 150L220 92M212 88L270 74" stroke="#d8b15f" strokeWidth="8" fill="none" strokeLinecap="round" />
          <Human head={[126, 76]} body="M126 92L160 124L214 92M160 124L118 160M160 124L205 160" />
          <Joint x={160} y={124} />
          <Joint x={214} y={92} />
        </>
      ) : null}
      {variant === "pulldown" ? (
        <>
          <path d="M82 42H238M160 42V76M112 76H208" stroke="#d8b15f" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M116 174H204" stroke="#ffffff" strokeOpacity=".18" strokeWidth="14" strokeLinecap="round" />
          <Human head={[160, 88]} body="M160 104L160 144M160 112L112 76M160 112L208 76M160 144L132 174M160 144L188 174" />
          <Joint x={112} y={76} />
          <Joint x={208} y={76} />
        </>
      ) : null}
      {variant === "legpress" ? (
        <>
          <path d="M76 172L235 68M228 58L270 132" stroke="#d8b15f" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M68 170H132" stroke="#ffffff" strokeOpacity=".16" strokeWidth="14" strokeLinecap="round" />
          <Human head={[90, 108]} body="M106 118L152 140L226 102M152 140L104 166M152 140L214 154" />
          <Joint x={152} y={140} />
          <Joint x={226} y={102} />
        </>
      ) : null}
      {variant === "pushup" ? (
        <>
          <path d="M58 170H268" stroke="#d8b15f" strokeWidth="7" strokeLinecap="round" />
          <Human head={[86, 120]} body="M104 128L172 140L244 144M172 140L136 170M232 144L266 170" />
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
          <Human head={[154, 74]} body="M154 90L146 126L110 168M146 126L206 126M146 126L204 170" />
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
          <Human head={[96, 76]} body="M112 88L160 108L250 145M160 108L118 166M160 108L202 166" />
          <Joint x={160} y={108} />
          <Joint x={250} y={145} />
        </>
      ) : null}
      {variant === "bench" ? (
        <>
          <path d="M70 154H224M88 154L66 184M210 154L238 184M96 70H224" stroke="#d8b15f" strokeWidth="8" strokeLinecap="round" />
          <Human head={[110, 118]} body="M128 124L178 132L218 92M178 132L128 154M178 132L230 154" />
          <Joint x={218} y={92} />
          <Joint x={178} y={132} />
        </>
      ) : null}
      {variant === "press" ? (
        <>
          <path d="M114 60H206" stroke="#d8b15f" strokeWidth="8" strokeLinecap="round" />
          <Human head={[160, 86]} body="M160 102L160 146M160 108L116 62M160 108L204 62M160 146L132 176M160 146L188 176" />
          <path d="M160 102V60" stroke="#2ee6a8" strokeWidth="3" strokeDasharray="7 7" />
          <Joint x={160} y={108} />
          <Joint x={116} y={62} />
          <Joint x={204} y={62} />
        </>
      ) : null}
      {variant === "kettlebell" ? (
        <>
          <Kettlebell x={226} y={152} />
          <Human head={[114, 82]} body="M126 96L172 120L228 152M172 120L126 170M172 120L198 172" />
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
          <Human head={[160, 70]} body="M160 86L160 120M160 120L92 172M160 120L232 172M160 96L96 122M160 96L224 122" />
          <path d="M160 86V174" stroke="#2ee6a8" strokeWidth="3" strokeDasharray="6 8" />
          <Joint x={160} y={120} />
          <Joint x={92} y={172} />
          <Joint x={232} y={172} />
        </>
      ) : null}
    </g>
  );
}

function Human({ body, head }: { body: string; head: [number, number] }) {
  return (
    <>
      <circle cx={head[0]} cy={head[1]} r="15" fill="#d8b15f" />
      <path d={body} stroke="#08090a" strokeOpacity=".34" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={body} stroke="#f2eee7" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  );
}

function Wheel({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r="31" fill="#08090a" stroke="#d8b15f" strokeWidth="7" />
      <circle cx={cx} cy={cy} r="8" fill="#d8b15f" />
      <path d={`M${cx - 20} ${cy}H${cx + 20}M${cx} ${cy - 20}V${cy + 20}`} stroke="#ffffff" strokeOpacity=".18" strokeWidth="3" />
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
