"use client";

import { AccountPanel } from "@/components/account-panel";

type LoginPanelProps = {
  className?: string;
  compact?: boolean;
};

export function LoginPanel({ className = "", compact = false }: LoginPanelProps) {
  return <AccountPanel className={className} compact={compact} variant="auth" />;
}
