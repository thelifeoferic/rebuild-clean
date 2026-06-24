import { ExternalLink, Headphones, Play } from "lucide-react";
import { tidalPlaylistUrl } from "@/data/mock-data";
import { ActionButton } from "@/components/action-button";
import { Section } from "@/components/section";

const videos = [
  {
    title: "Stationary bike endurance",
    meta: "30-45 minute indoor cycling options",
    query: "stationary bike endurance workout 30 minutes",
  },
  {
    title: "Kettlebell around-the-worlds",
    meta: "Rotational core and pass-around technique",
    query: "kettlebell around the world pass around workout",
  },
  {
    title: "Farmer carry form",
    meta: "Loaded carry technique and programming",
    query: "farmer carry proper form kettlebell",
  },
  {
    title: "Push-up progression",
    meta: "Simple sets, form, and progression plans",
    query: "push up progression beginner workout",
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
            const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(item.query)}`;
            const embedUrl = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(item.query)}`;
            return (
              <article key={item.title} className="overflow-hidden rounded-2xl bg-white/[0.055]">
                <div className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-porcelain">{item.title}</p>
                      <p className="text-sm text-white/50">{item.meta}</p>
                    </div>
                    <a
                      href={searchUrl}
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
