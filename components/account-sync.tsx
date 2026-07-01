"use client";

import { AccountPanel } from "@/components/account-panel";
import type { OnboardingProfile, RebuildData } from "@/types/rebuild";

type AccountSyncProps = {
  data: RebuildData;
  onRestore: (profile: OnboardingProfile | null, data: RebuildData | null) => void;
  profile: OnboardingProfile | null;
};

export function AccountSync({ data, onRestore, profile }: AccountSyncProps) {
  return (
    <AccountPanel
      className="mx-4 mt-4"
      data={data}
      onRestore={onRestore}
      profile={profile}
      variant="sync"
    />
  );
}
