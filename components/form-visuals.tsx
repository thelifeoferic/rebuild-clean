import { Section } from "@/components/section";

const visuals = [
  {
    title: "Bike",
    variant: "bike",
    cues: ["Tall chest", "Knees track forward", "Push through full pedal stroke"],
  },
  {
    title: "StairMaster",
    variant: "stair",
    cues: ["Light hands", "Full foot on step", "Do not fold over rails"],
  },
  {
    title: "Row machine",
    variant: "rower",
    cues: ["Legs first", "Hips then arms", "Smooth return"],
  },
  {
    title: "Lat pulldown",
    variant: "pulldown",
    cues: ["Chest tall", "Elbows to ribs", "No shrugging"],
  },
  {
    title: "Leg press",
    variant: "legpress",
    cues: ["Feet even", "Control depth", "Soft lockout"],
  },
  {
    title: "Push-up",
    variant: "pushup",
    cues: ["Hands under shoulders", "Straight body line", "Stop before sagging"],
  },
  {
    title: "Bodyweight squat",
    variant: "squat",
    cues: ["Feet rooted", "Knees track toes", "Own the bottom"],
  },
  {
    title: "Dumbbell row",
    variant: "row",
    cues: ["Brace on bench", "Elbow to hip", "No torso twist"],
  },
  {
    title: "Bench press",
    variant: "bench",
    cues: ["Shoulders packed", "Feet planted", "Control the descent"],
  },
  {
    title: "Shoulder press",
    variant: "press",
    cues: ["Ribs down", "Wrists stacked", "Do not lean back"],
  },
  {
    title: "Kettlebell hinge",
    variant: "kettlebell",
    cues: ["Hips back", "Neutral spine", "Snap, do not squat"],
  },
  {
    title: "Freestyle swim",
    variant: "swim",
    cues: ["Long line", "Exhale in water", "Rotate gently"],
  },
  {
    title: "Yoga downshift",
    variant: "yoga",
    cues: ["Slow nasal breath", "Long spine", "No forcing range"],
  },
] as const;

export function FormVisuals() {
  return (
    <Section id="form-visuals" eyebrow="Form library" title="Visual Cues">
      <div className="panel p-4">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {visuals.map((visual) => (
            <article key={visual.title} className="min-w-[78%] overflow-hidden rounded-2xl bg-white/[0.055]">
              <FormSvg variant={visual.variant} />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-porcelain">{visual.title}</h3>
                <div className="mt-3 space-y-2">
                  {visual.cues.map((cue) => (
                    <p key={cue} className="rounded-xl bg-carbon/70 px-3 py-2 text-sm text-white/58">
                      {cue}
                    </p>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}

function FormSvg({ variant }: { variant: (typeof visuals)[number]["variant"] }) {
  return (
    <svg viewBox="0 0 180 112" className="h-36 w-full bg-carbon" role="img" aria-label={`${variant} form diagram`}>
      <defs>
        <linearGradient id={`gold-${variant}`} x1="0" x2="1">
          <stop stopColor="#d8b15f" />
          <stop offset="1" stopColor="#e15f3f" />
        </linearGradient>
      </defs>
      <rect width="180" height="112" fill="#101113" />
      <path d="M18 92H162" stroke="#ffffff" strokeOpacity=".16" strokeWidth="2" />
      {variant === "bike" ? (
        <>
          <circle cx="50" cy="84" r="18" stroke="#d8b15f" strokeWidth="4" fill="none" />
          <circle cx="128" cy="84" r="18" stroke="#d8b15f" strokeWidth="4" fill="none" />
          <path d="M50 84L86 60L128 84M86 60L76 84M86 60H116" stroke="#ffffff" strokeOpacity=".55" strokeWidth="4" fill="none" />
          <Figure head={[92, 34]} body="M92 44L86 60L72 76M86 60L110 58M86 60L104 80" />
        </>
      ) : null}
      {variant === "stair" ? (
        <>
          <path d="M35 92H62V76H89V60H116V44H150" stroke="#d8b15f" strokeWidth="5" fill="none" />
          <Figure head={[83, 25]} body="M83 35L82 54L69 75M82 54L101 55M82 54L96 76" />
        </>
      ) : null}
      {variant === "rower" ? (
        <>
          <path d="M28 88H150M58 76L128 52" stroke="#d8b15f" strokeWidth="5" fill="none" />
          <path d="M118 48L146 40" stroke="#ffffff" strokeOpacity=".45" strokeWidth="4" />
          <Figure head={[75, 36]} body="M75 46L93 60L118 48M93 60L72 80M93 60L112 80" />
        </>
      ) : null}
      {variant === "pulldown" ? (
        <>
          <path d="M45 20H135M90 20V42" stroke="#d8b15f" strokeWidth="5" />
          <path d="M62 42H118" stroke="#ffffff" strokeOpacity=".55" strokeWidth="4" />
          <path d="M70 92H110" stroke="#ffffff" strokeOpacity=".18" strokeWidth="8" />
          <Figure head={[90, 48]} body="M90 58L90 78M90 62L68 42M90 62L112 42M90 78L78 92M90 78L102 92" />
        </>
      ) : null}
      {variant === "legpress" ? (
        <>
          <path d="M45 88L132 35M126 29L150 68" stroke="#d8b15f" strokeWidth="6" />
          <Figure head={[56, 52]} body="M64 60L86 72L122 52M86 72L60 84M86 72L118 72" />
        </>
      ) : null}
      {variant === "pushup" ? (
        <>
          <path d="M40 84H140" stroke="#d8b15f" strokeWidth="5" />
          <Figure head={[48, 62]} body="M58 66L96 72L132 74M96 72L78 88M126 74L142 88" />
        </>
      ) : null}
      {variant === "squat" ? (
        <>
          <path d="M58 88H130" stroke="#d8b15f" strokeWidth="5" />
          <Figure head={[86, 36]} body="M86 46L82 66L66 86M82 66L112 66M82 66L110 88" />
        </>
      ) : null}
      {variant === "row" ? (
        <>
          <path d="M42 78H118M84 58H142" stroke="#d8b15f" strokeWidth="6" />
          <circle cx="132" cy="74" r="8" fill="#d8b15f" />
          <Figure head={[58, 42]} body="M66 50L92 60L128 74M92 60L70 84M92 60L112 84" />
        </>
      ) : null}
      {variant === "bench" ? (
        <>
          <path d="M42 82H126M54 82L44 96M118 82L134 96M58 38H124" stroke="#d8b15f" strokeWidth="5" />
          <Figure head={[66, 62]} body="M76 66L102 70L122 50M102 70L74 82M102 70L126 82" />
        </>
      ) : null}
      {variant === "press" ? (
        <>
          <path d="M65 30H115" stroke="#d8b15f" strokeWidth="5" />
          <Figure head={[90, 42]} body="M90 52L90 76M90 56L68 32M90 56L112 32M90 76L76 92M90 76L104 92" />
        </>
      ) : null}
      {variant === "kettlebell" ? (
        <>
          <path d="M118 82C118 72 132 72 132 82V90H118Z" fill="#d8b15f" />
          <path d="M121 80C121 74 129 74 129 80" stroke="#101113" strokeWidth="3" fill="none" />
          <Figure head={[63, 42]} body="M70 50L94 62L123 82M94 62L72 84M94 62L106 86" />
        </>
      ) : null}
      {variant === "swim" ? (
        <>
          <path d="M20 74C45 60 60 88 88 74S130 60 160 74" stroke="#2ee6a8" strokeOpacity=".7" strokeWidth="4" fill="none" />
          <circle cx="62" cy="53" r="8" fill="#d8b15f" />
          <path d="M70 56L116 64M88 60L62 80M100 62L126 45" stroke="#ffffff" strokeOpacity=".65" strokeWidth="5" fill="none" />
        </>
      ) : null}
      {variant === "yoga" ? (
        <>
          <Figure head={[90, 34]} body="M90 44L90 62M90 62L55 88M90 62L130 88M90 50L56 62M90 50L126 62" />
          <path d="M52 88H132" stroke="#d8b15f" strokeWidth="4" />
        </>
      ) : null}
    </svg>
  );
}

function Figure({ body, head }: { body: string; head: [number, number] }) {
  return (
    <>
      <circle cx={head[0]} cy={head[1]} r="8" fill="#d8b15f" />
      <path d={body} stroke="#f2eee7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  );
}
