"use client";

import { Download, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

    setShowPrompt(!standalone);
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-start gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-full bg-champagne/10 text-champagne">
          <Smartphone size={19} strokeWidth={2.2} aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="metric-label">Gym mode</p>
          <h3 className="mt-1 text-lg font-semibold text-porcelain">Install REBUILD on your phone.</h3>
          <p className="mt-1 text-sm leading-5 text-white/48">
            Add it to your Home Screen for a faster launch between sets.
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-2xl bg-carbon/70 px-3 py-2 text-xs font-semibold text-white/45">
        <Download size={14} strokeWidth={2.2} aria-hidden />
        iPhone: Share, then Add to Home Screen.
      </div>
    </div>
  );
}
