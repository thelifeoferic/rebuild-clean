import type {
  BehaviorWin,
  BikeSession,
  DumbbellCurlSession,
  FarmerCarrySession,
  JacobsLadderSession,
  KettlebellSession,
  MealLog,
  PushUpSession,
  RebuildData,
  TimelineItem,
  WeightEntry,
} from "@/types/rebuild";

export const tidalPlaylistUrl =
  "https://tidal.com/playlist/f3b43d55-8ea8-45f5-9e99-a29e2385600f";

export const weights: WeightEntry[] = [
  { id: "weight-today", date: "Today", weight: 227.0 },
  { id: "weight-mon", date: "Mon", weight: 226.6 },
  { id: "weight-sun", date: "Sun", weight: 225.8 },
  { id: "weight-sat", date: "Sat", weight: 226.4 },
  { id: "weight-fri", date: "Fri", weight: 226.9 },
  { id: "weight-thu", date: "Thu", weight: 227.4 },
  { id: "weight-wed", date: "Wed", weight: 228.0 },
];

export const bikeSessions: BikeSession[] = [
  {
    id: "bike-today",
    date: "Today",
    minutes: 44,
    resistance: 8,
    calories: 418,
    notes: "Stayed locked in after the first ten minutes.",
  },
  {
    id: "bike-mon",
    date: "Mon",
    minutes: 31,
    resistance: 7,
    calories: 291,
    notes: "Short reset ride.",
  },
  {
    id: "bike-sat",
    date: "Sat",
    minutes: 38,
    resistance: 8,
    calories: 355,
    notes: "Pushed cadence late.",
  },
];

export const jacobsLadderSessions: JacobsLadderSession[] = [
  {
    id: "ladder-today",
    date: "Today",
    duration: "8:00",
    longestContinuous: "3:30",
  },
];

export const pushUpSessions: PushUpSession[] = [
  {
    id: "push-today",
    date: "Today",
    sets: [14, 12, 10],
  },
];

export const dumbbellCurlSessions: DumbbellCurlSession[] = [
  {
    id: "curl-today",
    date: "Today",
    weight: 35,
    repsEachArm: 20,
  },
];

export const kettlebellSessions: KettlebellSession[] = [
  { id: "kb-25-pass", date: "Today", exercise: "Pass-arounds", weight: 25, reps: 60 },
  { id: "kb-20-world", date: "Today", exercise: "Around-the-worlds", weight: 20, reps: 200 },
  { id: "kb-20-pass", date: "Today", exercise: "Pass-arounds", weight: 20, reps: 50 },
];

export const farmerCarrySessions: FarmerCarrySession[] = [
  {
    id: "carry-today",
    date: "Today",
    weightEachHand: 20,
    distanceFeet: 60,
    rounds: 4,
  },
];

export const meals: MealLog[] = [
  {
    id: "meal-1",
    name: "Protein-forward dinner",
    calories: 620,
    protein: 48,
    notes: "Kept it simple and logged rough numbers.",
  },
  {
    id: "meal-2",
    name: "Post-ride shake",
    calories: 260,
    protein: 32,
    notes: "Fast recovery calories.",
  },
];

export const behaviorWins: BehaviorWin[] = [
  {
    id: "win-1",
    label: "Chose gym instead of weed/video games when upset",
    reason: "heartbreak",
    didntSmoke: true,
    didntSpiral: true,
    date: "Today",
  },
  {
    id: "win-2",
    label: "Reset with a walk and music",
    reason: "stress",
    didntSmoke: true,
    didntSpiral: true,
    date: "Yesterday",
  },
];

export const timeline: TimelineItem[] = [
  {
    id: "tl-1",
    date: "Today",
    title: "Converted emotion into motion",
    detail: "Gym over weed and video games. That is the rebuild rep.",
    tone: "green",
  },
  {
    id: "tl-2",
    date: "Today",
    title: "Bike session logged",
    detail: "44 minutes at resistance 8 with 418 calories burned.",
    tone: "gold",
  },
  {
    id: "tl-3",
    date: "Recent low",
    title: "225.8 lb",
    detail: "Low point captured. Next target is consistency, not panic.",
    tone: "steel",
  },
  {
    id: "tl-4",
    date: "Best",
    title: "Jacob's Ladder 3:30 continuous",
    detail: "Benchmark locked for the next attempt.",
    tone: "ember",
  },
];

export const sevenDayAverageWeight =
  Math.round((weights.reduce((sum, item) => sum + item.weight, 0) / weights.length) * 10) / 10;

export const weeklyBikeMinutes = bikeSessions.reduce((sum, session) => sum + session.minutes, 0);

export const pushUpMaxSet = Math.max(...pushUpSessions.flatMap((session) => session.sets));

export const seedData: RebuildData = {
  weights,
  bikeSessions,
  jacobsLadderSessions,
  pushUpSessions,
  dumbbellCurlSessions,
  kettlebellSessions,
  farmerCarrySessions,
  meals,
  behaviorWins,
};
