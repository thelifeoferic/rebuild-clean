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
  distanceMiles?: number;
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
  exercise?: string;
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

export type MachineWorkoutSession = {
  id: string;
  date: string;
  gymName?: string;
  machine: string;
  category?: string;
  weight?: number;
  sets?: number;
  reps?: number;
  minutes?: number;
  distanceMiles?: number;
  calories?: number;
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

export type WaterLog = {
  id: string;
  date: string;
  ounces: number;
};

export type SleepLog = {
  id: string;
  date: string;
  hours: number;
  quality: "low" | "okay" | "good" | "great";
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
  editable?: {
    kind: LogKind;
    id: string;
  };
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
  machineWorkoutSessions: MachineWorkoutSession[];
  swimSessions: SwimSession[];
  yogaSessions: YogaSession[];
  meals: MealLog[];
  waterLogs: WaterLog[];
  sleepLogs: SleepLog[];
  behaviorWins: BehaviorWin[];
};

export type LogKind =
  | "weight"
  | "bike"
  | "jacobsLadder"
  | "pushUps"
  | "dumbbellCurls"
  | "strength"
  | "machine"
  | "kettlebell"
  | "farmerCarries"
  | "swim"
  | "yoga"
  | "meal"
  | "water"
  | "sleep"
  | "mood";

export type AppView = "home" | "log" | "records" | "programs" | "me";

export type OnboardingProfile = {
  accentColor?: "champagne" | "white" | "ember" | "volt" | "teal" | "cobalt";
  avatarDataUrl?: string;
  avatarUrl?: string;
  firstName?: string;
  goal: string;
  goals?: string[];
  coachingTone?: "calm" | "intense" | "minimal" | "tactical";
  currentWeight?: number;
  defaultLocation?: "home" | "gym" | "travel" | "pool";
  height?: string;
  homeGymAddress?: string;
  homeGymEquipment?: string[];
  homeGymId?: string;
  homeGymName?: string;
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
