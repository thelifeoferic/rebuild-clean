import type { OnboardingProfile, RebuildData } from "@/types/rebuild";

export type LocalHikeDifficulty = "Easy" | "Moderate" | "Strenuous";

export type LocalHike = {
  area: string;
  difficulty: LocalHikeDifficulty;
  distanceMiles: number;
  durationMinutes: [number, number];
  elevationFeet: number;
  id: string;
  image: string;
  name: string;
  notes: string;
  route: string;
  sourceName: string;
  sourceUrl: string;
};

const joshuaTreeSource = {
  sourceName: "Joshua Tree National Park hiking guide",
  sourceUrl: "https://www.nps.gov/jotr/planyourvisit/hiking.htm",
};

export const localHikes: LocalHike[] = [
  {
    ...joshuaTreeSource,
    area: "Joshua Tree",
    difficulty: "Easy",
    distanceMiles: 0.5,
    durationMinutes: [30, 45],
    elevationFeet: 0,
    id: "oasis-of-mara",
    image: "/rebuild-run.jpg",
    name: "Oasis of Mara",
    notes: "A low-friction walk from Twentynine Palms with a paved loop and desert-oasis history.",
    route: "Loop",
  },
  {
    ...joshuaTreeSource,
    area: "Joshua Tree",
    difficulty: "Easy",
    distanceMiles: 0.4,
    durationMinutes: [20, 40],
    elevationFeet: 20,
    id: "cap-rock",
    image: "/rebuild-run.jpg",
    name: "Cap Rock",
    notes: "A short nature loop that works well as an easy sunset walk or active recovery day.",
    route: "Loop",
  },
  {
    ...joshuaTreeSource,
    area: "Joshua Tree",
    difficulty: "Easy",
    distanceMiles: 1,
    durationMinutes: [45, 60],
    elevationFeet: 100,
    id: "hidden-valley",
    image: "/rebuild-class-metcon.jpg",
    name: "Hidden Valley",
    notes: "A short rock-ringed valley loop with steady footing and quick payoff.",
    route: "Loop",
  },
  {
    ...joshuaTreeSource,
    area: "Joshua Tree",
    difficulty: "Easy",
    distanceMiles: 1.1,
    durationMinutes: [45, 60],
    elevationFeet: 50,
    id: "barker-dam",
    image: "/rebuild-kettlebell-outdoor.jpg",
    name: "Barker Dam",
    notes: "A short loop through boulder country and old water infrastructure.",
    route: "Loop",
  },
  {
    ...joshuaTreeSource,
    area: "Joshua Tree",
    difficulty: "Easy",
    distanceMiles: 1.7,
    durationMinutes: [60, 120],
    elevationFeet: 160,
    id: "skull-rock",
    image: "/rebuild-class-metcon.jpg",
    name: "Skull Rock",
    notes: "A boulder-heavy loop with enough distance to count as a real outdoor session.",
    route: "Loop",
  },
  {
    ...joshuaTreeSource,
    area: "Joshua Tree",
    difficulty: "Easy",
    distanceMiles: 1.4,
    durationMinutes: [45, 60],
    elevationFeet: 100,
    id: "arch-rock",
    image: "/rebuild-run.jpg",
    name: "Arch Rock",
    notes: "A compact lollipop route through sandy and rocky terrain near White Tank.",
    route: "Lollipop",
  },
  {
    ...joshuaTreeSource,
    area: "Joshua Tree",
    difficulty: "Moderate",
    distanceMiles: 1.4,
    durationMinutes: [45, 90],
    elevationFeet: 400,
    id: "hi-view",
    image: "/rebuild-run.jpg",
    name: "Hi-View",
    notes: "A short climb with a stronger leg demand than the distance suggests.",
    route: "Loop",
  },
  {
    ...joshuaTreeSource,
    area: "Joshua Tree",
    difficulty: "Moderate",
    distanceMiles: 2.5,
    durationMinutes: [90, 150],
    elevationFeet: 150,
    id: "split-rock-loop",
    image: "/rebuild-class-metcon.jpg",
    name: "Split Rock Loop",
    notes: "A longer boulder-country loop with steady exposure and a natural halfway checkpoint.",
    route: "Loop",
  },
  {
    ...joshuaTreeSource,
    area: "Joshua Tree",
    difficulty: "Moderate",
    distanceMiles: 3,
    durationMinutes: [90, 150],
    elevationFeet: 375,
    id: "mastodon-peak",
    image: "/rebuild-kettlebell-outdoor.jpg",
    name: "Mastodon Peak",
    notes: "A bigger loop from Cottonwood with views, history, and enough work to feel earned.",
    route: "Loop",
  },
  {
    ...joshuaTreeSource,
    area: "Joshua Tree",
    difficulty: "Moderate",
    distanceMiles: 4,
    durationMinutes: [120, 180],
    elevationFeet: 550,
    id: "lost-horse-mine",
    image: "/rebuild-run.jpg",
    name: "Lost Horse Mine",
    notes: "A historic mine route with a longer aerobic pull and meaningful elevation.",
    route: "Out and back",
  },
  {
    ...joshuaTreeSource,
    area: "Joshua Tree",
    difficulty: "Moderate",
    distanceMiles: 4.7,
    durationMinutes: [150, 240],
    elevationFeet: 785,
    id: "west-side-loop",
    image: "/rebuild-run.jpg",
    name: "West Side Loop",
    notes: "A longer Black Rock route for building time on feet without needing a summit objective.",
    route: "Loop",
  },
  {
    ...joshuaTreeSource,
    area: "Joshua Tree",
    difficulty: "Strenuous",
    distanceMiles: 3,
    durationMinutes: [90, 150],
    elevationFeet: 1050,
    id: "ryan-mountain",
    image: "/rebuild-kettlebell-outdoor.jpg",
    name: "Ryan Mountain",
    notes: "A short but serious summit climb. Avoid heat and bring more water than feels necessary.",
    route: "Out and back",
  },
  {
    ...joshuaTreeSource,
    area: "Joshua Tree",
    difficulty: "Strenuous",
    distanceMiles: 3,
    durationMinutes: [120, 180],
    elevationFeet: 300,
    id: "fortynine-palms-oasis",
    image: "/rebuild-run.jpg",
    name: "Fortynine Palms Oasis",
    notes: "Close to Twentynine Palms, exposed, and not a heat-day route.",
    route: "Out and back",
  },
  {
    ...joshuaTreeSource,
    area: "Joshua Tree",
    difficulty: "Strenuous",
    distanceMiles: 6.3,
    durationMinutes: [180, 300],
    elevationFeet: 1110,
    id: "warren-peak",
    image: "/rebuild-class-metcon.jpg",
    name: "Warren Peak",
    notes: "A serious Black Rock climb for cooler weather, strong legs, and deliberate pacing.",
    route: "Out and back",
  },
  {
    ...joshuaTreeSource,
    area: "Joshua Tree",
    difficulty: "Strenuous",
    distanceMiles: 7.2,
    durationMinutes: [210, 270],
    elevationFeet: 500,
    id: "lost-palms-oasis",
    image: "/rebuild-kettlebell-outdoor.jpg",
    name: "Lost Palms Oasis",
    notes: "A long Cottonwood route. Treat it like a major desert outing, not a casual walk.",
    route: "Out and back",
  },
];

export function suggestedHikeMinutes(hike: LocalHike) {
  return Math.round((hike.durationMinutes[0] + hike.durationMinutes[1]) / 2);
}

export function formatHikeDuration(hike: LocalHike) {
  const [min, max] = hike.durationMinutes;
  if (max < 60) return `${min}-${max} min`;
  const minHours = min / 60;
  const maxHours = max / 60;
  return `${formatHours(minHours)}-${formatHours(maxHours)} hr`;
}

export function estimateHikeCalories(hike: LocalHike, weightLb: number) {
  return caloriesFromMinutes(suggestedHikeMinutes(hike), hikeMet(hike), weightLb);
}

export function estimateHikeCaloriesRange(hike: LocalHike, weightLb: number) {
  return [
    caloriesFromMinutes(hike.durationMinutes[0], hikeMet(hike), weightLb),
    caloriesFromMinutes(hike.durationMinutes[1], hikeMet(hike), weightLb),
  ] as const;
}

export function getReferenceWeightForHikes(data?: RebuildData, profile?: OnboardingProfile | null) {
  return data?.weights[0]?.weight || profile?.currentWeight || 200;
}

function hikeMet(hike: LocalHike) {
  if (hike.difficulty === "Strenuous") return 6.7;
  if (hike.difficulty === "Moderate") return 5.3;
  return 3.8;
}

function caloriesFromMinutes(minutes: number, met: number, weightLb: number) {
  const weightKg = weightLb * 0.453592;
  return Math.round((met * 3.5 * weightKg * minutes) / 200);
}

function formatHours(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}
