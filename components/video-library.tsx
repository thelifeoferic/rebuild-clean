"use client";

import { ExternalLink, Headphones, Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { tidalPlaylistUrl } from "@/data/mock-data";
import { ActionButton } from "@/components/action-button";
import { Section } from "@/components/section";
import type { OnboardingProfile } from "@/types/rebuild";

const videos = [
  {
    title: "Cycle & Arms Workout - Cycle Bike Cardio + Dumbbells | 25 Minutes",
    category: "Featured",
    meta: "Bike + dumbbell session",
    id: "6lFv6vveUOw",
  },
  {
    title: "30 minute Cycling Workout for Beginners",
    category: "Bike",
    meta: "Kaleigh Cohen Cycling",
    id: "i5WE0AghY_s",
  },
  {
    title: "Kettlebell Around the World Exercise Explained",
    category: "Kettlebell",
    meta: "Shane Heins / Onnit",
    id: "N4mMVG8S5Kg",
  },
  {
    title: "How to Perform the Farmer's Carry",
    category: "Carries",
    meta: "Dr. Carl Baird",
    id: "z7E_YU9P1jU",
  },
  {
    title: "10 Minute Push-Up Progression Workout",
    category: "Push-ups",
    meta: "Juice & Toya",
    id: "eiMOxvZKyvM",
  },
  {
    title: "Yoga For Complete Beginners",
    category: "Yoga",
    meta: "Yoga With Adriene",
    id: "v7AYKMP6rOE",
  },
  {
    title: "Learn To Swim Freestyle",
    category: "Swim",
    meta: "Global Triathlon Network",
    id: "6_vXycbD2TM",
  },
  {
    title: "How To Swim Freestyle",
    category: "Swim",
    meta: "Global Triathlon Network",
    id: "AQy_c30lNjI",
  },
  {
    title: "Freestyle Breathing Technique",
    category: "Swim",
    meta: "Rocket Swimming",
    id: "Gq2asyrI0MI",
  },
  {
    title: "How to Do a Dumbbell Biceps Curl",
    category: "Curls",
    meta: "Howcast",
    id: "ykJmrZ5v0Oo",
  },
  {
    title: "Squats for Beginners",
    category: "Squat",
    meta: "Bowflex",
    id: "aclHkVaku9U",
  },
  {
    title: "How to Perform the Deadlift",
    category: "Deadlift",
    meta: "Jeremy Ethier",
    id: "ytGaGIn3SjE",
  },
  {
    title: "Kettlebell Swing",
    category: "Kettlebell",
    meta: "Men's Health",
    id: "YSxHifyI6s8",
  },
  {
    title: "30-Minute HIIT Cardio Workout",
    category: "HIIT",
    meta: "SELF",
    id: "ml6cT4AZdqI",
  },
  {
    title: "20 MIN FULL BODY WORKOUT - Beginner Version",
    category: "Bodyweight",
    meta: "Pamela Reif",
    id: "UItWltVZZmE",
  },
  {
    title: "Yoga For Anxiety and Stress",
    category: "Yoga",
    meta: "Yoga With Adriene",
    id: "hJbRpHZr_d0",
  },
];

const quickSearches = [
  { label: "StairMaster", href: "https://www.youtube.com/results?search_query=beginner+stairmaster+workout" },
  { label: "Jacob's Ladder", href: "https://www.youtube.com/results?search_query=jacobs+ladder+machine+workout" },
  { label: "Air bike", href: "https://www.youtube.com/results?search_query=beginner+air+bike+workout" },
  { label: "Dumbbell curls", href: "https://www.youtube.com/results?search_query=dumbbell+curl+proper+form" },
  { label: "Swim drills", href: "https://www.youtube.com/results?search_query=freestyle+swim+drills+beginner" },
  { label: "Yoga mobility", href: "https://www.youtube.com/results?search_query=beginner+yoga+mobility" },
];

export function VideoLibrary({ profile }: { profile: OnboardingProfile | null }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = videos[activeIndex];
  const videoUrl = `https://www.youtube.com/watch?v=${active.id}`;
  const embedUrl = `https://www.youtube.com/embed/${active.id}`;
  const activeImage = imageForCategory(active.category);
  const preferredTone = profile?.coachingTone ?? "calm";

  return (
    <Section
      id="library"
      eyebrow="Media room"
      title="Watch, then work"
      action={<ActionButton label="TIDAL" icon={ExternalLink} href={tidalPlaylistUrl} variant="gold" />}
    >
      <div className="panel overflow-hidden">
        <div className="relative min-h-52 bg-black">
          <Image
            src={activeImage}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 448px"
            className="object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="metric-label text-white/60">Featured session</p>
            <p className="mt-1 text-2xl font-semibold leading-tight text-white">{active.title}</p>
            <p className="mt-2 text-sm font-semibold text-white/62">
              {active.meta} · {preferredTone} coaching mode
            </p>
          </div>
        </div>

        <div className="p-4">
          <a
            href={tidalPlaylistUrl}
            target="_blank"
            rel="noreferrer"
            className="mb-4 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-signal px-4 text-base font-bold text-carbon"
          >
            <Headphones size={18} strokeWidth={2.2} aria-hidden />
            Start TIDAL playlist
          </a>

          <div className="overflow-hidden rounded-2xl bg-black">
            <div className="aspect-video">
              <iframe
                className="h-full w-full"
                src={embedUrl}
                title={active.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-porcelain">{active.title}</p>
                  <p className="text-sm text-white/50">{active.meta}</p>
                </div>
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-champagne"
                  aria-label={`Open ${active.title} on YouTube`}
                >
                  <ExternalLink size={17} strokeWidth={2.1} aria-hidden />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.055] p-3">
            <p className="metric-label">For your profile</p>
            <p className="mt-1 text-sm leading-5 text-white/50">
              REBUILD can lean media toward {profile?.defaultLocation ?? "gym"} sessions, {profile?.preferredTrainingMinutes ?? 25}-minute blocks, and {profile?.goals?.[0] ?? profile?.goal ?? "discipline"}.
            </p>
          </div>

          <div className="mt-4 grid max-h-[30rem] grid-cols-2 gap-2 overflow-y-auto pr-1">
            {videos.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`overflow-hidden rounded-2xl border text-left transition ${
                  activeIndex === index
                    ? "border-champagne bg-champagne text-carbon"
                    : "border-white/10 bg-white/[0.055] text-white/64"
                }`}
              >
                <span className="relative block h-20 bg-black">
                  <Image
                    src={imageForCategory(item.category)}
                    alt=""
                    fill
                    sizes="180px"
                    className="object-cover object-center opacity-75"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white">
                    {item.category}
                  </span>
                </span>
                <span className="block px-3 py-3">
                  <span className="block text-sm font-semibold leading-tight">{item.title}</span>
                  <span className="mt-1 block text-xs font-semibold opacity-70">{item.meta}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-white/[0.055] p-3">
            <p className="metric-label mb-3">More searches</p>
            <div className="flex flex-wrap gap-2">
              {quickSearches.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/10 px-3 text-xs font-bold text-white/62"
                >
                  <Play size={13} strokeWidth={2.2} aria-hidden />
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function imageForCategory(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes("featured") || normalized.includes("bike") || normalized.includes("hiit")) return "/rebuild-air-bike.jpg";
  if (normalized.includes("swim")) return "/rebuild-swim-lane.jpg";
  if (normalized.includes("yoga")) return "/rebuild-yoga-light.jpg";
  if (normalized.includes("kettlebell")) return "/rebuild-kettlebell-pushup.jpg";
  if (normalized.includes("squat") || normalized.includes("deadlift")) return "/rebuild-leg-press-side.jpg";
  if (normalized.includes("curl") || normalized.includes("carr")) return "/rebuild-kettlebell-outdoor.jpg";
  return "/rebuild-bodyweight.jpg";
}
