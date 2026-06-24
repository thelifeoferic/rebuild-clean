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

export const weights: WeightEntry[] = [];

export const bikeSessions: BikeSession[] = [];

export const jacobsLadderSessions: JacobsLadderSession[] = [];

export const pushUpSessions: PushUpSession[] = [];

export const dumbbellCurlSessions: DumbbellCurlSession[] = [];

export const kettlebellSessions: KettlebellSession[] = [];

export const farmerCarrySessions: FarmerCarrySession[] = [];

export const strengthAccessorySessions: StrengthAccessorySession[] = [];

export const meals: MealLog[] = [];

export const behaviorWins: BehaviorWin[] = [];

export const timeline: TimelineItem[] = [];

export const sevenDayAverageWeight =
  Math.round((weights.reduce((sum, item) => sum + item.weight, 0) / weights.length) * 10) / 10;

export const weeklyBikeMinutes = bikeSessions.reduce((sum, session) => sum + session.minutes, 0);

export const pushUpMaxSet = pushUpSessions.length ? Math.max(...pushUpSessions.flatMap((session) => session.sets)) : 0;

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
