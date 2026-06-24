import { ExternalLink, Headphones, Play, Radio } from "lucide-react";
import { tidalPlaylistUrl } from "@/data/mock-data";
import { ActionButton } from "@/components/action-button";
import { Section } from "@/components/section";

const videos = [
  { title: "Bike endurance block", meta: "44-minute ride pattern", icon: Radio },
  { title: "Kettlebell flow", meta: "Pass-arounds and around-the-worlds", icon: Play },
  { title: "Reset playlist", meta: "TIDAL one-tap launch", icon: Headphones },
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
        <div className="mb-4 aspect-video overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#111315,#202429_42%,#D8B15F_43%,#E15F3F_58%,#08090A_59%)]">
          <div className="flex h-full items-end p-4">
            <div>
              <p className="metric-label text-white/70">Now queued</p>
              <p className="mt-1 max-w-52 text-2xl font-semibold leading-tight text-porcelain">Aggressive reset energy</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {videos.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="flex items-center gap-3 rounded-2xl bg-white/[0.055] p-3">
                <div className="grid size-10 place-items-center rounded-full bg-white/10 text-champagne">
                  <Icon size={18} strokeWidth={2.1} aria-hidden />
                </div>
                <div>
                  <p className="font-semibold text-porcelain">{item.title}</p>
                  <p className="text-sm text-white/50">{item.meta}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
