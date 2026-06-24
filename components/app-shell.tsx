import { Dumbbell, Flame, Home, Library, LineChart, TimerReset } from "lucide-react";
import type { ReactNode } from "react";
import type { AppView } from "@/types/rebuild";

const navigation = [
  { view: "home", label: "Home", icon: Home },
  { view: "log", label: "Log", icon: Flame },
  { view: "training", label: "Train", icon: Dumbbell },
  { view: "progress", label: "Progress", icon: LineChart },
  { view: "reset", label: "Reset", icon: TimerReset },
  { view: "library", label: "Media", icon: Library },
];

export function AppShell({
  activeView,
  children,
  onNavigate,
  showNavigation = true,
}: {
  activeView: AppView;
  children: ReactNode;
  onNavigate: (view: AppView) => void;
  showNavigation?: boolean;
}) {
  return (
    <main className={`mx-auto min-h-screen w-full max-w-md ${showNavigation ? "pb-24" : "pb-8"}`}>
      {children}
      {showNavigation ? (
      <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md border-t border-white/10 bg-carbon/90 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
        <div className="grid grid-cols-6 gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => onNavigate(item.view as AppView)}
                className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[0.62rem] font-medium transition ${
                  isActive ? "bg-champagne text-carbon" : "text-white/54 hover:bg-white/10 hover:text-porcelain"
                }`}
              >
                <Icon size={17} strokeWidth={2} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      ) : null}
    </main>
  );
}
