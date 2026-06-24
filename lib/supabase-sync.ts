import type { SupabaseClient } from "@supabase/supabase-js";
import type { OnboardingProfile, RebuildData } from "@/types/rebuild";

type ProfileRow = {
  behavior_focus: string[] | null;
  completed: boolean | null;
  current_weight: number | null;
  equipment: string[] | null;
  first_name: string | null;
  goal: string | null;
  goals: string[] | null;
  height: string | null;
  reset_plan: string | null;
  target_weight: number | null;
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
    const { error: profileError } = await client.from("rebuild_profiles").upsert(profileToRow(userId, profile), {
      onConflict: "user_id",
    });

    if (profileError) throw profileError;
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
    behavior_focus: profile.behaviorFocus,
    completed: profile.completed,
    current_weight: profile.currentWeight ?? null,
    equipment: profile.equipment,
    first_name: profile.firstName ?? null,
    goal: profile.goal,
    goals: profile.goals ?? [],
    height: profile.height ?? null,
    reset_plan: profile.resetPlan ?? null,
    target_weight: profile.targetWeight ?? null,
    updated_at: new Date().toISOString(),
    user_id: userId,
    why: profile.why ?? null,
  };
}

function rowToProfile(row: ProfileRow): OnboardingProfile {
  return {
    behaviorFocus: row.behavior_focus ?? [],
    completed: row.completed ?? true,
    currentWeight: row.current_weight ?? undefined,
    equipment: row.equipment ?? [],
    firstName: row.first_name ?? undefined,
    goal: row.goal ?? "Rebuild discipline",
    goals: row.goals ?? [],
    height: row.height ?? undefined,
    resetPlan: row.reset_plan ?? undefined,
    targetWeight: row.target_weight ?? undefined,
    why: row.why ?? undefined,
  };
}
