import { CirclePlus, Home, Play, Trophy, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import type { AppView, OnboardingProfile } from "@/types/rebuild";

const navigation = [
  { view: "home", label: "Home", icon: Home },
  { view: "records", label: "Rebuild", icon: Trophy },
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
  const themeClass = themePreference === "light" ? "theme-light" : themePreference === "auto" ? "theme-auto" : "theme-dark";
  const accentClass = `accent-${profile?.accentColor ?? "champagne"}`;

  return (
    <main className={`mx-auto min-h-screen w-full max-w-md ${themeClass} ${accentClass} ${showNavigation ? "pb-28" : "pb-8"}`}>
      {children}
      {showNavigation ? (
        <nav className="app-bottom-nav fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md border-t px-3 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-2xl">
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
                  className={`flex flex-col items-center justify-center gap-1 rounded-2xl font-bold transition active:scale-[0.97] ${
                    isElevated
                      ? "-mt-7 min-h-16 border border-white/15 app-primary-action"
                      : `min-h-12 text-[0.56rem] ${
                          isActive
                            ? "bg-champagne/12 text-champagne"
                            : "app-subtle hover:bg-champagne/10 hover:text-champagne"
                        }`
                  }`}
                  aria-label={item.label}
                >
                  <Icon size={isElevated ? 23 : 18} strokeWidth={2.25} aria-hidden="true" />
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
