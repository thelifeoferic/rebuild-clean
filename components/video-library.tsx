import { ExternalLink, Headphones, Play, Radio } from "lucide-react";
import { tidalPlaylistUrl } from "@/data/mock-data";
import { ActionButton } from "@/components/action-button";
import { Section } from "@/components/section";

const videos = [
  {
    title: "Stationary bike endurance",
    meta: "YouTube training videos for 30-45 minute rides",
    icon: Radio,
    url: "https://www.youtube.com/results?search_query=stationary+bike+endurance+workout+30+minutes",
  },
  {
    title: "Kettlebell around-the-worlds",
    meta: "Technique and rotational core drills",
    icon: Play,
    url: "https://www.youtube.com/results?search_query=kettlebell+around+the+world+pass+around+workout",
  },
  {
    title: "Farmer carry form",
    meta: "Loaded carry technique and programming",
    icon: Play,
    url: "https://www.youtube.com/results?search_query=farmer+carry+proper+form+kettlebell",
  },
  {
    title: "Push-up progression",
    meta: "Simple sets, form, and progression plans",
    icon: Play,
    url: "https://www.youtube.com/results?search_query=push+up+progression+beginner+workout",
  },
  {
    title: "Reset playlist",
    meta: "TIDAL one-tap launch",
    icon: Headphones,
    url: tidalPlaylistUrl,
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
        <div className="space-y-2">
          {videos.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.title}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl bg-white/[0.055] p-3 transition hover:bg-white/10"
              >
                <div className="grid size-10 place-items-center rounded-full bg-white/10 text-champagne">
                  <Icon size={18} strokeWidth={2.1} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-porcelain">{item.title}</p>
                  <p className="text-sm text-white/50">{item.meta}</p>
                </div>
                <ExternalLink className="text-white/35" size={17} strokeWidth={2.1} aria-hidden />
              </a>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
