import { Apple, Beef, Coffee, Droplets } from "lucide-react";
import { Section } from "@/components/section";

const fuelCards = [
  {
    title: "Pre-workout",
    icon: Coffee,
    detail: "30-90 minutes before: easy carbs plus a little protein. Banana, yogurt, oats, or rice cakes work.",
  },
  {
    title: "Post-workout",
    icon: Beef,
    detail: "Within a few hours: 30-45g protein plus carbs. Huel, chicken bowl, eggs and beans, or Greek yogurt.",
  },
  {
    title: "Low-friction fruit",
    icon: Apple,
    detail: "Fruit is useful when discipline is low: banana before training, berries with protein, watermelon for hydration.",
  },
  {
    title: "Hydration",
    icon: Droplets,
    detail: "If cardio volume is high, pair water with sodium. Lightheaded, flat, or headache often means under-fueled.",
  },
];

export function FuelGuide() {
  return (
    <Section id="fuel-guide" eyebrow="Nutrition" title="Fuel Guide">
      <div className="grid grid-cols-2 gap-2">
        {fuelCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="min-h-[12rem] rounded-2xl border border-white/10 bg-white/[0.045] p-3">
              <Icon className="mb-3 text-champagne" size={18} strokeWidth={2.1} aria-hidden />
              <p className="font-semibold text-porcelain">{card.title}</p>
              <p className="mt-2 text-sm leading-5 text-white/52">{card.detail}</p>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
