"use client";

import { ExternalLink, Headphones, Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { tidalPlaylistUrl } from "@/data/mock-data";
import { ActionButton } from "@/components/action-button";
import { Section } from "@/components/section";

const videos = [
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
];

const quickSearches = [
  { label: "StairMaster", href: "https://www.youtube.com/results?search_query=beginner+stairmaster+workout" },
  { label: "Jacob's Ladder", href: "https://www.youtube.com/results?search_query=jacobs+ladder+machine+workout" },
  { label: "Air bike", href: "https://www.youtube.com/results?search_query=beginner+air+bike+workout" },
  { label: "Dumbbell curls", href: "https://www.youtube.com/results?search_query=dumbbell+curl+proper+form" },
];

export function VideoLibrary() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = videos[activeIndex];
  const videoUrl = `https://www.youtube.com/watch?v=${active.id}`;
  const embedUrl = `https://www.youtube.com/embed/${active.id}`;

  return (
    <Section
      id="library"
      eyebrow="Fuel"
      title="Video / Playlist Library"
      action={<ActionButton label="TIDAL" icon={ExternalLink} href={tidalPlaylistUrl} variant="gold" />}
    >
      <div className="panel overflow-hidden">
        <div className="relative min-h-44 bg-black">
          <Image
            src="/rebuild-air-bike.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 448px"
            className="object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="metric-label text-white/60">Watch, then work</p>
            <p className="mt-1 text-2xl font-semibold leading-tight text-porcelain">{active.category}</p>
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

          <div className="mt-4 grid grid-cols-2 gap-2">
            {videos.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`min-h-14 rounded-2xl border px-3 text-left transition ${
                  activeIndex === index
                    ? "border-champagne bg-champagne text-carbon"
                    : "border-white/10 bg-white/[0.055] text-white/64"
                }`}
              >
                <span className="block text-xs font-bold uppercase tracking-[0.14em]">{item.category}</span>
                <span className="mt-1 block text-xs font-semibold">{item.meta}</span>
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
