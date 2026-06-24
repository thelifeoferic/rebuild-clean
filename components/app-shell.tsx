import { Activity, Dumbbell, Flame, Home, Library, LineChart, TimerReset } from "lucide-react";
import type { ReactNode } from "react";

const navigation = [
  { href: "#home", label: "Home", icon: Home },
  { href: "#quick-add", label: "Add", icon: Flame },
  { href: "#bike", label: "Bike", icon: Activity },
  { href: "#kettlebell", label: "Bell", icon: Dumbbell },
  { href: "#trends", label: "Trends", icon: LineChart },
  { href: "#timeline", label: "Rebuild", icon: TimerReset },
  { href: "#library", label: "Media", icon: Library },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md pb-24">
      {children}
      <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md border-t border-white/10 bg-carbon/90 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
        <div className="grid grid-cols-7 gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[0.62rem] font-medium text-white/54 transition hover:bg-white/10 hover:text-porcelain"
              >
                <Icon size={17} strokeWidth={2} aria-hidden="true" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
