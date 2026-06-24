export type MoodReason =
  | "stress"
  | "anger"
  | "boredom"
  | "energy"
  | "habit";

export type WeightEntry = {
  id?: string;
  date: string;
  weight: number;
  moment?: "morning" | "bedtime" | "check-in";
};

export type BikeSession = {
  id: string;
  date: string;
  minutes: number;
  resistance: number;
  calories: number;
  notes: string;
  location?: "home" | "gym";
};

export type JacobsLadderSession = {
  id: string;
  date: string;
  duration: string;
  longestContinuous: string;
  rounds?: number;
  notes?: string;
};

export type PushUpSession = {
  id: string;
  date: string;
  sets: number[];
};

export type DumbbellCurlSession = {
  id: string;
  date: string;
  weight: number;
  repsEachArm: number;
};

export type KettlebellSession = {
  id: string;
  date: string;
  exercise: string;
  weight: number;
  reps: number;
};

export type FarmerCarrySession = {
  id: string;
  date: string;
  weightEachHand: number;
  distanceFeet: number;
  rounds: number;
};

export type StrengthAccessorySession = {
  id: string;
  date: string;
  exercise: string;
  weight: number;
  reps: number;
  notes: string;
};

export type SwimSession = {
  id: string;
  date: string;
  minutes: number;
  distance: number;
  stroke: string;
  notes: string;
};

export type YogaSession = {
  id: string;
  date: string;
  minutes: number;
  focus: string;
  notes: string;
};

export type MealLog = {
  id: string;
  date?: string;
  name: string;
  calories: number;
  protein: number;
  notes: string;
};

export type BehaviorWin = {
  id: string;
  label: string;
  reason: MoodReason;
  didntSmoke: boolean;
  didntSpiral: boolean;
  date: string;
};

export type TimelineItem = {
  id: string;
  date: string;
  title: string;
  detail: string;
  tone: "gold" | "green" | "ember" | "steel";
};

export type RebuildData = {
  weights: WeightEntry[];
  bikeSessions: BikeSession[];
  jacobsLadderSessions: JacobsLadderSession[];
  pushUpSessions: PushUpSession[];
  dumbbellCurlSessions: DumbbellCurlSession[];
  kettlebellSessions: KettlebellSession[];
  farmerCarrySessions: FarmerCarrySession[];
  strengthAccessorySessions: StrengthAccessorySession[];
  swimSessions: SwimSession[];
  yogaSessions: YogaSession[];
  meals: MealLog[];
  behaviorWins: BehaviorWin[];
};

export type LogKind =
  | "weight"
  | "bike"
  | "jacobsLadder"
  | "pushUps"
  | "dumbbellCurls"
  | "strength"
  | "kettlebell"
  | "farmerCarries"
  | "swim"
  | "yoga"
  | "meal"
  | "mood";

export type AppView = "home" | "log" | "training" | "progress" | "reset" | "library";

export type OnboardingProfile = {
  accentColor?: "champagne" | "teal" | "cobalt" | "volt";
  firstName?: string;
  goal: string;
  goals?: string[];
  coachingTone?: "calm" | "intense" | "minimal" | "tactical";
  currentWeight?: number;
  defaultLocation?: "home" | "gym" | "travel" | "pool";
  height?: string;
  preferredTrainingMinutes?: number;
  quoteStyle?: "goggins" | "calm" | "athlete" | "none";
  targetWeight?: number;
  themePreference?: "dark" | "light" | "auto";
  why?: string;
  equipment: string[];
  behaviorFocus: string[];
  resetPlan?: string;
  completed: boolean;
};
