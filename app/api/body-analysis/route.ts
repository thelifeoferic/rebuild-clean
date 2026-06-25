import { NextResponse } from "next/server";

export const runtime = "nodejs";

type BodyAnalysis = {
  summary: string;
  observations: string[];
  trainingPriorities: string[];
  nextActions: string[];
  progressPhotoTips: string[];
  disclaimer: string;
};

const demoAnalysis: BodyAnalysis = {
  summary: "Use this as a calm baseline. The most useful next step is consistent photos, consistent training, and simple weekly checkpoints.",
  observations: [
    "Look for posture, shoulder position, waistline trend, and muscle tone changes across repeat photos rather than one-off judgment.",
    "A single image can be distorted by lighting, pump, hydration, camera angle, and time of day.",
    "The strongest signal will come from comparing the same pose every 2-4 weeks.",
  ],
  trainingPriorities: [
    "Keep strength work progressive: push, pull, squat or hinge, carry, and core each week.",
    "Pair bike, swim, or walking volume with 2-4 weekly resistance sessions.",
    "Track the weights used on key lifts so the visual progress has numbers behind it.",
  ],
  nextActions: [
    "Take front, side, and back photos in the same lighting.",
    "Log today's weigh-in and one training session before judging progress.",
    "Choose one anchor habit for the next 7 days: protein target, daily steps, or scheduled workouts.",
  ],
  progressPhotoTips: [
    "Use the same mirror or wall, same distance, same pose, and similar lighting.",
    "Avoid flexing in one photo and relaxing in another if you want a fair comparison.",
    "Take photos every 2-4 weeks, not multiple times a day.",
  ],
  disclaimer: "This is non-medical coaching feedback. It is not a diagnosis, body-fat measurement, or substitute for a qualified professional.",
};

export async function POST(request: Request) {
  let body: { imageData?: string; context?: string };

  try {
    body = (await request.json()) as { imageData?: string; context?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const imageData = String(body.imageData ?? "");
  const context = String(body.context ?? "").slice(0, 1800);

  if (!imageData.startsWith("data:image/")) {
    return NextResponse.json({ error: "Upload a valid image first." }, { status: 400 });
  }

  if (imageData.length > 5_500_000) {
    return NextResponse.json({ error: "That image is too large. Try a smaller photo." }, { status: 413 });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ analysis: demoAnalysis, mock: true });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
        max_output_tokens: 1000,
        input: [
          {
            role: "developer",
            content: [
              {
                type: "input_text",
                text: [
                  "You are REBUILD Body Check, a supportive fitness progress coach.",
                  "Analyze only visible, non-sensitive fitness-relevant cues: posture, symmetry, muscular balance, training focus, and progress-photo quality.",
                  "Do not estimate body-fat percentage, attractiveness, age, ethnicity, health conditions, diagnoses, or identity.",
                  "Do not shame the user. Do not use insulting language. Do not make sexual comments.",
                  "If the image appears nude, sexualized, unsafe, or depicts a child, refuse briefly and ask for an appropriate clothed adult progress photo.",
                  "Return valid JSON only with this exact shape:",
                  '{"summary":"string","observations":["string"],"trainingPriorities":["string"],"nextActions":["string"],"progressPhotoTips":["string"],"disclaimer":"string"}',
                  "Keep each array to 3-5 concise items. Make it practical and encouraging.",
                ].join("\n"),
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: [
                  "Give a non-medical fitness progress analysis for this progress photo.",
                  context ? `User context:\n${context}` : "No extra user context.",
                ].join("\n\n"),
              },
              {
                type: "input_image",
                image_url: imageData,
                detail: "low",
              },
            ],
          },
        ],
      }),
    });

    const payload = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      return NextResponse.json(
        { error: readApiError(payload) ?? "AI analysis failed. Check your OpenAI key and try again." },
        { status: response.status },
      );
    }

    const text = extractOutputText(payload);
    const analysis = parseAnalysis(text);

    return NextResponse.json({ analysis });
  } catch {
    return NextResponse.json(
      { error: "AI analysis is unavailable right now. Try again in a moment." },
      { status: 500 },
    );
  }
}

function readApiError(payload: Record<string, unknown>) {
  const error = payload.error;
  if (!error || typeof error !== "object") return null;
  const message = (error as { message?: unknown }).message;
  return typeof message === "string" ? message : null;
}

function extractOutputText(payload: Record<string, unknown>) {
  if (typeof payload.output_text === "string") return payload.output_text;

  const output = Array.isArray(payload.output) ? payload.output : [];
  return output
    .flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const content = (item as { content?: unknown }).content;
      return Array.isArray(content) ? content : [];
    })
    .map((content) => {
      if (!content || typeof content !== "object") return "";
      const block = content as { text?: unknown; output_text?: unknown };
      return typeof block.text === "string"
        ? block.text
        : typeof block.output_text === "string"
          ? block.output_text
          : "";
    })
    .filter(Boolean)
    .join("\n");
}

function parseAnalysis(text: string): BodyAnalysis {
  const fallback: BodyAnalysis = {
    ...demoAnalysis,
    summary: text.trim() || demoAnalysis.summary,
  };

  try {
    const jsonText = text.match(/\{[\s\S]*\}/)?.[0] ?? text;
    const parsed = JSON.parse(jsonText) as Partial<BodyAnalysis>;

    return {
      summary: stringOr(parsed.summary, fallback.summary),
      observations: stringArray(parsed.observations, fallback.observations),
      trainingPriorities: stringArray(parsed.trainingPriorities, fallback.trainingPriorities),
      nextActions: stringArray(parsed.nextActions, fallback.nextActions),
      progressPhotoTips: stringArray(parsed.progressPhotoTips, fallback.progressPhotoTips),
      disclaimer: stringOr(parsed.disclaimer, fallback.disclaimer),
    };
  } catch {
    return fallback;
  }
}

function stringOr(value: unknown, fallback: string) {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function stringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const items = value.map((item) => String(item).trim()).filter(Boolean).slice(0, 5);
  return items.length ? items : fallback;
}
