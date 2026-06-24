import { ExternalLink, Headphones, Play } from "lucide-react";
import Image from "next/image";
import { tidalPlaylistUrl } from "@/data/mock-data";
import { ActionButton } from "@/components/action-button";
import { Section } from "@/components/section";

const videos = [
  {
    title: "30 minute Cycling Workout for Beginners",
    meta: "Kaleigh Cohen Cycling",
    id: "i5WE0AghY_s",
  },
  {
    title: "Kettlebell Around the World Exercise Explained",
    meta: "Shane Heins / Onnit",
    id: "N4mMVG8S5Kg",
  },
  {
    title: "How to Perform the Farmer's Carry",
    meta: "Dr. Carl Baird",
    id: "z7E_YU9P1jU",
  },
  {
    title: "10 Minute Push-Up Progression Workout",
    meta: "Juice & Toya",
    id: "eiMOxvZKyvM",
  },
];

export function VideoLibrary() {
  return (
    <Section
      id="library"
      eyebrow="Fuel"
      title="Video / Playlist Library"
      action={<ActionButton label="TIDAL" icon={ExternalLink} href={tidalPlaylistUrl} variant="gold" />}
    >
      <div className="panel p-4">
        <div className="relative mb-4 min-h-44 overflow-hidden rounded-2xl bg-black">
          <Image
            src="/rebuild-cardio.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 448px"
            className="object-cover object-[52%_42%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="metric-label text-white/60">Training cues</p>
            <p className="mt-1 text-2xl font-semibold leading-tight text-porcelain">Watch, then work.</p>
          </div>
        </div>
        <a
          href={tidalPlaylistUrl}
          target="_blank"
          rel="noreferrer"
          className="mb-4 block overflow-hidden rounded-2xl border border-champagne/30 bg-champagne p-4 text-carbon"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-carbon/60">One tap fuel</p>
              <p className="mt-1 text-2xl font-bold leading-tight">Open TIDAL playlist</p>
            </div>
            <Headphones size={28} strokeWidth={2.3} aria-hidden />
          </div>
        </a>
        <div className="space-y-4">
          {videos.map((item) => {
            const videoUrl = `https://www.youtube.com/watch?v=${item.id}`;
            const embedUrl = `https://www.youtube.com/embed/${item.id}`;
            return (
              <article key={item.title} className="overflow-hidden rounded-2xl bg-white/[0.055]">
                <div className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-porcelain">{item.title}</p>
                      <p className="text-sm text-white/50">{item.meta}</p>
                    </div>
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-champagne"
                      aria-label={`Open ${item.title} on YouTube`}
                    >
                      <ExternalLink size={17} strokeWidth={2.1} aria-hidden />
                    </a>
                  </div>
                </div>
                <div className="aspect-video bg-black">
                  <iframe
                    className="h-full w-full"
                    src={embedUrl}
                    title={item.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </article>
            );
          })}
          <a
            href={tidalPlaylistUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-2xl bg-white/[0.055] p-3 transition hover:bg-white/10"
          >
            <div className="grid size-10 place-items-center rounded-full bg-white/10 text-champagne">
              <Headphones size={18} strokeWidth={2.1} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-porcelain">Reset playlist</p>
              <p className="text-sm text-white/50">Open TIDAL for the workout mix</p>
            </div>
            <Play className="text-white/35" size={17} strokeWidth={2.1} aria-hidden />
          </a>
        </div>
      </div>
    </Section>
  );
}
