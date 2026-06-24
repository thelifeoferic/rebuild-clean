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
  StrengthAccessorySession,
  TimelineItem,
  WeightEntry,
} from "@/types/rebuild";

export const tidalPlaylistUrl =
  "https://tidal.com/playlist/f3b43d55-8ea8-45f5-9e99-a29e2385600f";

export const weights: WeightEntry[] = [
  { id: "weight-june-24-bed", date: "June 24, 2026", weight: 229.2, moment: "bedtime" },
  { id: "weight-today", date: "June 24, 2026", weight: 227.0, moment: "morning" },
  { id: "weight-mon", date: "Mon", weight: 226.6 },
  { id: "weight-sun", date: "Sun", weight: 225.8 },
  { id: "weight-sat", date: "Sat", weight: 226.4 },
  { id: "weight-fri", date: "Fri", weight: 226.9 },
  { id: "weight-thu", date: "Thu", weight: 227.4 },
  { id: "weight-wed", date: "Wed", weight: 228.0 },
];

export const bikeSessions: BikeSession[] = [
  {
    id: "bike-june-24-home-1",
    date: "June 24, 2026",
    minutes: 20,
    resistance: 8,
    calories: 190,
    notes: "Home bike session #1.",
    location: "home",
  },
  {
    id: "bike-june-24-home-2",
    date: "June 24, 2026",
    minutes: 24,
    resistance: 8,
    calories: 228,
    notes: "Home bike session #2 with additional 4-minute extension.",
    location: "home",
  },
  {
    id: "bike-june-24-gym",
    date: "June 24, 2026",
    minutes: 30,
    resistance: 8,
    calories: 285,
    notes: "Continuous cardio while rotating between machines with no extended breaks.",
    location: "gym",
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
    id: "ladder-june-24-1",
    date: "June 24, 2026",
    duration: "2:00",
    longestContinuous: "2:00",
    rounds: 1,
    notes: "First Jacob's Ladder effort.",
  },
  {
    id: "ladder-june-24-2",
    date: "June 24, 2026",
    duration: "8:30",
    longestContinuous: "2:30",
    rounds: 3,
    notes: "Completed over 3 separate rounds.",
  },
];

export const pushUpSessions: PushUpSession[] = [
  {
    id: "push-june-24",
    date: "June 24, 2026",
    sets: [5, 7, 8, 8, 8],
  },
];

export const dumbbellCurlSessions: DumbbellCurlSession[] = [
  {
    id: "curl-june-24",
    date: "June 24, 2026",
    weight: 35,
    repsEachArm: 20,
  },
];

export const kettlebellSessions: KettlebellSession[] = [
  { id: "kb-25-pass", date: "June 24, 2026", exercise: "Pass-arounds", weight: 25, reps: 60 },
  { id: "kb-20-world", date: "June 24, 2026", exercise: "Around-the-worlds", weight: 20, reps: 200 },
  { id: "kb-20-pass", date: "June 24, 2026", exercise: "Pass-arounds", weight: 20, reps: 50 },
];

export const farmerCarrySessions: FarmerCarrySession[] = [
  {
    id: "carry-june-24",
    date: "June 24, 2026",
    weightEachHand: 20,
    distanceFeet: 60,
    rounds: 4,
  },
];

export const strengthAccessorySessions: StrengthAccessorySession[] = [
  {
    id: "goblet-squat-june-24",
    date: "June 24, 2026",
    exercise: "Goblet squats",
    weight: 20,
    reps: 15,
    notes: "Added after carries and kettlebell rotational work.",
  },
];

export const meals: MealLog[] = [
  {
    id: "meal-june-24-poke",
    name: "Spicy tuna poke bowl",
    calories: 650,
    protein: 42,
    notes: "Notable meal after significant cardio volume day.",
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
    id: "win-june-24",
    label: "Upset after interaction with Brianne; chose gym and training instead of smoking weed or playing video games.",
    reason: "stress",
    didntSmoke: true,
    didntSpiral: true,
    date: "June 24, 2026",
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
  strengthAccessorySessions,
  meals,
  behaviorWins,
};
