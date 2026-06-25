import { CirclePlus, Home, Play, Trophy, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import type { AppView, OnboardingProfile } from "@/types/rebuild";

const navigation = [
  { view: "home", label: "Home", icon: Home },
  { view: "records", label: "Records", icon: Trophy },
  { view: "log", label: "Log", icon: CirclePlus, elevated: true },
  { view: "programs", label: "Programs", icon: Play },
  { view: "me", label: "Me", icon: UserRound },
];

export function AppShell({
  activeView,
  children,
  onNavigate,
  profile,
  showNavigation = true,
}: {
  activeView: AppView;
  children: ReactNode;
  onNavigate: (view: AppView) => void;
  profile?: OnboardingProfile | null;
  showNavigation?: boolean;
}) {
  const themePreference = profile?.themePreference ?? "dark";
  const themeClass = themePreference === "light" ? "theme-light" : "theme-dark";
  const accentClass = `accent-${profile?.accentColor ?? "champagne"}`;

  return (
    <main className={`mx-auto min-h-screen w-full max-w-md ${themeClass} ${accentClass} ${showNavigation ? "pb-24" : "pb-8"}`}>
      {children}
      {showNavigation ? (
      <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md border-t border-white/10 bg-carbon/90 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
        <div className="grid grid-cols-5 items-end gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.view;
            const isElevated = item.elevated;
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => onNavigate(item.view as AppView)}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl font-medium transition active:scale-[0.97] ${
                  isElevated
                    ? `-mt-7 min-h-16 shadow-glow ${isActive ? "bg-champagne text-carbon" : "bg-champagne text-carbon"}`
                    : `min-h-12 text-[0.56rem] ${isActive ? "text-champagne" : "text-white/54 hover:bg-white/10 hover:text-porcelain"}`
                }`}
                aria-label={item.label}
              >
                <Icon size={isElevated ? 23 : 18} strokeWidth={2.2} aria-hidden="true" />
                <span className={isElevated ? "text-[0.62rem] font-black" : ""}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      ) : null}
    </main>
  );
}
