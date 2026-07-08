"use client";

import type { Session } from "@supabase/supabase-js";
import {
  AlertCircle,
  CheckCircle2,
  Cloud,
  DownloadCloud,
  Eye,
  EyeOff,
  LockKeyhole,
  LogOut,
  Mail,
  ShieldCheck,
  UploadCloud,
  UserPlus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getAuthRedirectUrl, getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { loadCloudSnapshot, saveCloudSnapshot } from "@/lib/supabase-sync";
import type { OnboardingProfile, RebuildData } from "@/types/rebuild";

type AccountPanelProps =
  | {
      className?: string;
      compact?: boolean;
      variant?: "auth";
    }
  | {
      className?: string;
      compact?: boolean;
      data: RebuildData;
      onRestore: (profile: OnboardingProfile | null, data: RebuildData | null) => void;
      profile: OnboardingProfile | null;
      variant: "sync";
    };

type AuthMode = "sign-in" | "create";
type NoticeTone = "neutral" | "success" | "error";

const lastSyncKey = "rebuild:last-sync";

function readableError(error: unknown) {
  const message = error instanceof Error ? error.message : String((error as { message?: unknown })?.message ?? error);
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials")) return "That email and password did not match.";
  if (lower.includes("email not confirmed")) return "Check your email once, then sign in with your password.";
  if (lower.includes("user already registered")) return "That email already has an account. Use Sign in instead.";
  if (lower.includes("password")) return "Use a password with at least 6 characters.";
  if (lower.includes("rate limit")) return "Too many attempts. Give it a minute, then try again.";

  return message || "Something got in the way. Try again.";
}

function statusClasses(tone: NoticeTone) {
  if (tone === "success") return "border-signal/25 bg-signal/10 text-signal";
  if (tone === "error") return "border-ember/30 bg-ember/10 text-ember";
  return "app-card app-secondary";
}

export function AccountPanel(props: AccountPanelProps) {
  const { className = "", compact = false } = props;
  const variant = props.variant ?? "auth";
  const client = useMemo(() => getSupabaseClient(), []);
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [notice, setNotice] = useState(isSupabaseConfigured ? "Use your email and password. No email link needed." : "Cloud login needs Supabase keys.");
  const [noticeTone, setNoticeTone] = useState<NoticeTone>("neutral");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isWorking, setIsWorking] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  useEffect(() => {
    setLastSynced(window.localStorage.getItem(lastSyncKey));
  }, []);

  useEffect(() => {
    if (!client) {
      setIsCheckingSession(false);
      return;
    }

    client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user?.email) {
        setNotice("Signed in. Your local data is still private on this device until you back it up.");
        setNoticeTone("success");
      }
      setIsCheckingSession(false);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user?.email) {
        setNotice("Signed in. Your local data is still private on this device until you back it up.");
        setNoticeTone("success");
      } else {
        setNotice("Use your email and password. No email link needed.");
        setNoticeTone("neutral");
      }
      setIsCheckingSession(false);
    });

    return () => subscription.unsubscribe();
  }, [client]);

  async function signIn() {
    if (!client || !email.trim() || !password) return;

    setIsWorking(true);
    setNotice("Checking your account...");
    setNoticeTone("neutral");
    try {
      const { error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      setNotice("Signed in. You can back up or restore whenever you want.");
      setNoticeTone("success");
    } catch (error) {
      setNotice(readableError(error));
      setNoticeTone("error");
    } finally {
      setIsWorking(false);
    }
  }

  async function createAccount() {
    if (!client || !email.trim() || !password) return;

    setIsWorking(true);
    setNotice("Creating your REBUILD account...");
    setNoticeTone("neutral");
    try {
      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: getAuthRedirectUrl("signup"),
        },
      });

      if (error) throw error;
      setNotice(
        data.session
          ? "Account created. You are signed in."
          : "Account created. If Supabase sends a confirmation email, it now returns to REBUILD cleanly.",
      );
      setNoticeTone("success");
    } catch (error) {
      setNotice(readableError(error));
      setNoticeTone("error");
    } finally {
      setIsWorking(false);
    }
  }

  async function resetPassword() {
    if (!client || !email.trim()) return;

    setIsWorking(true);
    setNotice("Sending password reset...");
    setNoticeTone("neutral");
    try {
      const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: getAuthRedirectUrl("reset"),
      });

      if (error) throw error;
      setNotice("Password reset sent. The email now opens a clean REBUILD reset screen.");
      setNoticeTone("success");
    } catch (error) {
      setNotice(readableError(error));
      setNoticeTone("error");
    } finally {
      setIsWorking(false);
    }
  }

  async function syncNow() {
    if (!client || props.variant !== "sync") return;

    setIsWorking(true);
    setNotice("Backing up this device...");
    setNoticeTone("neutral");
    try {
      await saveCloudSnapshot({ client, data: props.data, profile: props.profile });
      const stamp = new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date());
      window.localStorage.setItem(lastSyncKey, stamp);
      setLastSynced(stamp);
      setNotice("Cloud backup saved.");
      setNoticeTone("success");
    } catch (error) {
      setNotice(readableError(error));
      setNoticeTone("error");
    } finally {
      setIsWorking(false);
    }
  }

  async function pullCloud() {
    if (!client || props.variant !== "sync") return;

    setIsWorking(true);
    setNotice("Looking for your cloud backup...");
    setNoticeTone("neutral");
    try {
      const cloud = await loadCloudSnapshot(client);
      props.onRestore(cloud.profile, cloud.data);
      setNotice(cloud.data ? "Cloud data loaded on this device." : "No cloud data found yet.");
      setNoticeTone(cloud.data ? "success" : "neutral");
    } catch (error) {
      setNotice(readableError(error));
      setNoticeTone("error");
    } finally {
      setIsWorking(false);
    }
  }

  async function signOut() {
    if (!client) return;
    setIsWorking(true);
    try {
      await client.auth.signOut();
      setSession(null);
      setNotice("Signed out. Local data stayed on this device.");
      setNoticeTone("neutral");
    } finally {
      setIsWorking(false);
    }
  }

  const primaryDisabled = isWorking || !email.trim() || !password || (mode === "create" && password.length < 6);

  return (
    <section className={`app-card rounded-[1.75rem] p-4 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="metric-label">{variant === "sync" ? "Account and backup" : "Private account"}</p>
          <h3 className="mt-1 text-xl font-black tracking-tight text-porcelain">
            {session ? "Signed in" : mode === "create" ? "Create your account" : "Sign in"}
          </h3>
          <p className="app-subtle mt-1 text-sm leading-5">
            {variant === "sync"
              ? "Back up your phone, restore on another device, and keep ownership of your rebuild."
              : "Password-first login. Email links only confirm or reset when needed."}
          </p>
        </div>
        <div className={`grid size-11 shrink-0 place-items-center rounded-full ${session ? "bg-signal/10 text-signal" : "app-icon-soft"}`}>
          {session ? <CheckCircle2 size={20} strokeWidth={2.3} aria-hidden /> : <ShieldCheck size={20} strokeWidth={2.3} aria-hidden />}
        </div>
      </div>

      <div className={`mb-4 rounded-2xl border p-3 text-sm font-semibold leading-5 ${statusClasses(noticeTone)}`}>
        <div className="flex items-start gap-2">
          {noticeTone === "error" ? <AlertCircle className="mt-0.5 shrink-0" size={16} strokeWidth={2.3} aria-hidden /> : null}
          <span>{notice}</span>
        </div>
      </div>

      {!isSupabaseConfigured ? (
        <p className="app-card rounded-2xl p-3 text-sm leading-6">
          Add the Supabase URL and publishable key in Vercel to enable login.
        </p>
      ) : isCheckingSession ? (
        <div className="app-card rounded-2xl p-3 text-sm font-semibold">Checking account...</div>
      ) : session ? (
        <div className="space-y-3">
          <div className="rounded-2xl border border-signal/20 bg-signal/10 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-black text-signal">
              <Cloud size={16} strokeWidth={2.3} aria-hidden />
              Cloud account active
            </div>
            <p className="break-all text-base font-bold text-porcelain">{session.user.email}</p>
            <p className="app-subtle mt-2 text-sm leading-5">
              This does not erase local storage. You choose when to back up or restore.
            </p>
          </div>

          {variant === "sync" ? (
            <>
              <div className="app-card rounded-2xl p-3">
                <p className="metric-label">Last backup</p>
                <p className="mt-1 text-sm font-semibold text-porcelain">{lastSynced ?? "Not backed up from this device yet"}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={syncNow}
                  disabled={isWorking}
                  className="app-primary-action inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-3 text-base font-black disabled:opacity-50"
                >
                  <UploadCloud size={17} strokeWidth={2.3} aria-hidden />
                  Back up
                </button>
                <button
                  type="button"
                  onClick={pullCloud}
                  disabled={isWorking}
                  className="app-secondary-action inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-3 text-base font-black disabled:opacity-50"
                >
                  <DownloadCloud size={17} strokeWidth={2.3} aria-hidden />
                  Restore
                </button>
              </div>
            </>
          ) : null}

          <button
            type="button"
            onClick={signOut}
            disabled={isWorking}
            className={`${compact ? "min-h-12" : "min-h-12"} app-secondary-action inline-flex w-full items-center justify-center gap-2 rounded-2xl px-3 text-base font-black disabled:opacity-50`}
          >
            <LogOut size={17} strokeWidth={2.3} aria-hidden />
            Sign out
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 rounded-full bg-carbon/70 p-1">
            {(["sign-in", "create"] as const).map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setMode(item)}
                className={`min-h-11 rounded-full text-sm font-black transition ${mode === item ? "app-chip-active" : "app-subtle"}`}
              >
                {item === "sign-in" ? "Sign in" : "Create"}
              </button>
            ))}
          </div>

          <label className="flex min-h-14 items-center rounded-2xl border border-white/10 bg-carbon px-4 focus-within:border-champagne">
            <Mail size={18} className="mr-3 shrink-0 text-white/38" aria-hidden />
            <input
              value={email}
              autoComplete="email"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              className="min-w-0 flex-1 bg-transparent text-base font-bold text-porcelain outline-none placeholder:text-white/35"
            />
          </label>

          <label className="flex min-h-14 items-center rounded-2xl border border-white/10 bg-carbon px-4 focus-within:border-champagne">
            <LockKeyhole size={18} className="mr-3 shrink-0 text-white/38" aria-hidden />
            <input
              value={password}
              autoComplete={mode === "create" ? "new-password" : "current-password"}
              minLength={6}
              type={showPassword ? "text" : "password"}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={mode === "create" ? "Create password" : "Password"}
              className="min-w-0 flex-1 bg-transparent text-base font-bold text-porcelain outline-none placeholder:text-white/35"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="app-secondary-action ml-2 grid size-10 place-items-center rounded-full"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={17} strokeWidth={2.3} aria-hidden /> : <Eye size={17} strokeWidth={2.3} aria-hidden />}
            </button>
          </label>

          <button
            type="button"
            onClick={mode === "create" ? createAccount : signIn}
            disabled={primaryDisabled}
            className="app-primary-action inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-4 text-base font-black disabled:opacity-45"
          >
            {mode === "create" ? <UserPlus size={18} strokeWidth={2.3} aria-hidden /> : <ShieldCheck size={18} strokeWidth={2.3} aria-hidden />}
            {mode === "create" ? "Create account" : "Sign in"}
          </button>

          <div className="flex items-center justify-between gap-3">
            <p className="app-subtle text-xs font-semibold leading-5">
              {mode === "create" ? "Use at least 6 characters." : "Forgot it? Send a reset email."}
            </p>
            <button
              type="button"
              onClick={resetPassword}
              disabled={isWorking || !email.trim()}
              className="min-h-10 shrink-0 text-sm font-black text-champagne underline-offset-4 hover:underline disabled:opacity-40"
            >
              Reset password
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
