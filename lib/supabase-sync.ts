import type { SupabaseClient } from "@supabase/supabase-js";
import type { OnboardingProfile, RebuildData } from "@/types/rebuild";

type ProfileRow = {
  accent_color: OnboardingProfile["accentColor"] | null;
  avatar_url?: string | null;
  behavior_focus: string[] | null;
  coaching_tone: OnboardingProfile["coachingTone"] | null;
  completed: boolean | null;
  current_weight: number | null;
  default_location: OnboardingProfile["defaultLocation"] | null;
  equipment: string[] | null;
  first_name: string | null;
  goal: string | null;
  goals: string[] | null;
  height: string | null;
  home_gym_address?: string | null;
  home_gym_equipment?: string[] | null;
  home_gym_id?: string | null;
  home_gym_name?: string | null;
  preferred_training_minutes: number | null;
  quote_style: OnboardingProfile["quoteStyle"] | null;
  reset_plan: string | null;
  target_weight: number | null;
  theme_preference: OnboardingProfile["themePreference"] | null;
  why: string | null;
};

type SnapshotRow = {
  data: RebuildData | null;
};

export async function saveCloudSnapshot({
  client,
  data,
  profile,
}: {
  client: SupabaseClient;
  data: RebuildData;
  profile: OnboardingProfile | null;
}) {
  const {
    data: { session },
    error: sessionError,
  } = await client.auth.getSession();

  if (sessionError) throw sessionError;
  if (!session?.user?.id) throw new Error("Sign in before syncing.");

  const userId = session.user.id;

  if (profile) {
    await upsertProfile(client, userId, profile, true);
  }

  const { error: snapshotError } = await client.from("rebuild_data_snapshots").upsert(
    {
      data,
      updated_at: new Date().toISOString(),
      user_id: userId,
    },
    { onConflict: "user_id" },
  );

  if (snapshotError) throw snapshotError;
}

export async function saveCloudProfile({
  client,
  profile,
}: {
  client: SupabaseClient;
  profile: OnboardingProfile;
}) {
  const {
    data: { session },
    error: sessionError,
  } = await client.auth.getSession();

  if (sessionError) throw sessionError;
  if (!session?.user?.id) throw new Error("Sign in before saving your profile to cloud.");

  await upsertProfile(client, session.user.id, profile, true);
}

async function upsertProfile(client: SupabaseClient, userId: string, profile: OnboardingProfile, allowLegacyFallback: boolean) {
  const row = profileToRow(userId, profile);
  const { error } = await client.from("rebuild_profiles").upsert(row, {
    onConflict: "user_id",
  });

  if (!error) return;
  if (!allowLegacyFallback || !isMissingNewProfileColumn(error)) throw error;

  const legacyRow = withoutNewProfileColumns(row);
  const { error: legacyError } = await client.from("rebuild_profiles").upsert(legacyRow, {
    onConflict: "user_id",
  });

  if (legacyError) throw legacyError;
}

export async function loadCloudSnapshot(client: SupabaseClient) {
  const {
    data: { session },
    error: sessionError,
  } = await client.auth.getSession();

  if (sessionError) throw sessionError;
  if (!session?.user?.id) throw new Error("Sign in before loading cloud data.");

  const userId = session.user.id;

  const [profileResult, snapshotResult] = await Promise.all([
    client.from("rebuild_profiles").select("*").eq("user_id", userId).limit(1),
    client.from("rebuild_data_snapshots").select("data").eq("user_id", userId).limit(1),
  ]);

  if (profileResult.error) throw profileResult.error;
  if (snapshotResult.error) throw snapshotResult.error;

  const profileRows = (profileResult.data ?? []) as ProfileRow[];
  const snapshotRows = (snapshotResult.data ?? []) as SnapshotRow[];

  return {
    data: snapshotRows[0]?.data ?? null,
    profile: profileRows[0] ? rowToProfile(profileRows[0]) : null,
  };
}

function profileToRow(userId: string, profile: OnboardingProfile) {
  return {
    accent_color: profile.accentColor ?? "ember",
    avatar_url: profile.avatarUrl ?? null,
    behavior_focus: profile.behaviorFocus,
    coaching_tone: profile.coachingTone ?? "calm",
    completed: profile.completed,
    current_weight: profile.currentWeight ?? null,
    default_location: profile.defaultLocation ?? "gym",
    equipment: profile.equipment,
    first_name: profile.firstName ?? null,
    goal: profile.goal,
    goals: profile.goals ?? [],
    height: profile.height ?? null,
    home_gym_address: profile.homeGymAddress ?? null,
    home_gym_equipment: profile.homeGymEquipment ?? [],
    home_gym_id: profile.homeGymId ?? null,
    home_gym_name: profile.homeGymName ?? null,
    preferred_training_minutes: profile.preferredTrainingMinutes ?? 25,
    quote_style: profile.quoteStyle ?? "goggins",
    reset_plan: profile.resetPlan ?? null,
    target_weight: profile.targetWeight ?? null,
    theme_preference: profile.themePreference ?? "dark",
    updated_at: new Date().toISOString(),
    user_id: userId,
    why: profile.why ?? null,
  };
}

function rowToProfile(row: ProfileRow): OnboardingProfile {
  return {
    accentColor: row.accent_color ?? "ember",
    avatarUrl: row.avatar_url ?? undefined,
    behaviorFocus: row.behavior_focus ?? [],
    coachingTone: row.coaching_tone ?? "calm",
    completed: row.completed ?? true,
    currentWeight: row.current_weight ?? undefined,
    defaultLocation: row.default_location ?? "gym",
    equipment: row.equipment ?? [],
    firstName: row.first_name ?? undefined,
    goal: row.goal ?? "Rebuild discipline",
    goals: row.goals ?? [],
    height: row.height ?? undefined,
    homeGymAddress: row.home_gym_address ?? undefined,
    homeGymEquipment: row.home_gym_equipment ?? [],
    homeGymId: row.home_gym_id ?? undefined,
    homeGymName: row.home_gym_name ?? undefined,
    preferredTrainingMinutes: row.preferred_training_minutes ?? 25,
    quoteStyle: row.quote_style ?? "goggins",
    resetPlan: row.reset_plan ?? undefined,
    targetWeight: row.target_weight ?? undefined,
    themePreference: row.theme_preference ?? "dark",
    why: row.why ?? undefined,
  };
}

function isMissingNewProfileColumn(error: unknown) {
  const message = error instanceof Error ? error.message : String((error as { message?: unknown })?.message ?? error);
  const lower = message.toLowerCase();
  return lower.includes("avatar_url") || lower.includes("home_gym_");
}

function withoutNewProfileColumns<T extends {
  avatar_url?: string | null;
  home_gym_address?: string | null;
  home_gym_equipment?: string[] | null;
  home_gym_id?: string | null;
  home_gym_name?: string | null;
}>(row: T) {
  const legacyRow = { ...row };
  delete legacyRow.avatar_url;
  delete legacyRow.home_gym_address;
  delete legacyRow.home_gym_equipment;
  delete legacyRow.home_gym_id;
  delete legacyRow.home_gym_name;
  return legacyRow;
}
