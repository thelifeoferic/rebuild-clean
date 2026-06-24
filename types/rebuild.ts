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

export type MealLog = {
  id: string;
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
  meals: MealLog[];
  behaviorWins: BehaviorWin[];
};

export type LogKind =
  | "weight"
  | "bike"
  | "jacobsLadder"
  | "pushUps"
  | "dumbbellCurls"
  | "kettlebell"
  | "farmerCarries"
  | "meal"
  | "mood";

export type AppView = "home" | "log" | "training" | "progress" | "reset" | "library";

export type OnboardingProfile = {
  firstName?: string;
  goal: string;
  goals?: string[];
  currentWeight?: number;
  targetWeight?: number;
  why?: string;
  equipment: string[];
  behaviorFocus: string[];
  pressurePlan?: string;
  resetPlan?: string;
  completed: boolean;
};
