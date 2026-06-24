"use client";

import type { Session } from "@supabase/supabase-js";
import { CheckCircle2, LockKeyhole, LogOut, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

type LoginPanelProps = {
  className?: string;
  compact?: boolean;
};

export function LoginPanel({ className = "", compact = false }: LoginPanelProps) {
  const client = useMemo(() => getSupabaseClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState(isSupabaseConfigured ? "Sign in with your email and password." : "Cloud login needs Supabase keys.");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    if (!client) {
      setIsCheckingSession(false);
      return;
    }

    client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user?.email) setStatus("Cloud account connected.");
      setIsCheckingSession(false);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setStatus(nextSession?.user?.email ? "Cloud account connected." : "Sign in with your email and password.");
      setIsCheckingSession(false);
    });

    return () => subscription.unsubscribe();
  }, [client]);

  async function signIn() {
    if (!client || !email.trim() || !password) return;

    setIsWorking(true);
    try {
      const { error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      setStatus("Signed in.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setIsWorking(false);
    }
  }

  async function createAccount() {
    if (!client || !email.trim() || !password) return;

    setIsWorking(true);
    try {
      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;
      setStatus(data.session ? "Account created and signed in." : "Account created. Confirm email once if Supabase asks, then use your password.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not create account.");
    } finally {
      setIsWorking(false);
    }
  }

  async function resetPassword() {
    if (!client || !email.trim()) return;

    setIsWorking(true);
    try {
      const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });

      if (error) throw error;
      setStatus("Password reset email sent.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not send password reset.");
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
      setStatus("Signed out. Local data stayed on this device.");
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <section className={`rounded-2xl border border-white/10 bg-white/[0.045] p-4 ${className}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="metric-label">Account</p>
          <h3 className="mt-1 text-lg font-semibold text-porcelain">
            {session ? "Signed in" : "Sign in or create account"}
          </h3>
          <p className="mt-1 text-sm leading-5 text-white/45">{status}</p>
        </div>
        <div className={`grid size-10 shrink-0 place-items-center rounded-full ${session ? "bg-signal/10 text-signal" : "bg-champagne/10 text-champagne"}`}>
          {session ? <CheckCircle2 size={18} strokeWidth={2.2} aria-hidden /> : <ShieldCheck size={18} strokeWidth={2.2} aria-hidden />}
        </div>
      </div>

      {!isSupabaseConfigured ? (
        <p className="rounded-2xl bg-carbon/70 p-3 text-xs leading-5 text-white/45">
          Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel to enable login.
        </p>
      ) : isCheckingSession ? (
        <div className="rounded-2xl bg-carbon/70 p-3 text-sm font-semibold text-white/45">
          Checking account...
        </div>
      ) : session ? (
        <div className={`grid gap-2 ${compact ? "grid-cols-[1fr_auto] items-center" : ""}`}>
          <div className="min-w-0 rounded-2xl border border-signal/20 bg-signal/10 p-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">Cloud login active</p>
            <p className="mt-1 break-all text-sm font-semibold text-porcelain">{session.user.email}</p>
          </div>
          <button
            type="button"
            onClick={signOut}
            disabled={isWorking}
            className={`${compact ? "size-12 px-0" : "min-h-11 w-full px-3"} inline-flex items-center justify-center gap-2 rounded-2xl bg-white/[0.055] text-sm font-bold text-white/62 disabled:opacity-50`}
            aria-label="Sign out"
          >
            <LogOut size={16} strokeWidth={2.2} aria-hidden />
            {compact ? null : "Sign out"}
          </button>
        </div>
      ) : (
        <div className={compact ? "grid gap-2 sm:grid-cols-[1fr_auto]" : "space-y-2"}>
          <div className="space-y-2">
            <label className="flex min-h-11 items-center rounded-2xl border border-white/10 bg-carbon px-3 focus-within:border-champagne">
              <Mail size={16} className="mr-2 shrink-0 text-white/35" aria-hidden />
              <input
                value={email}
                inputMode="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-porcelain outline-none placeholder:text-white/28"
              />
            </label>
            <label className="flex min-h-11 items-center rounded-2xl border border-white/10 bg-carbon px-3 focus-within:border-champagne">
              <LockKeyhole size={16} className="mr-2 shrink-0 text-white/35" aria-hidden />
              <input
                value={password}
                type="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-porcelain outline-none placeholder:text-white/28"
              />
            </label>
          </div>
          <div className={`grid gap-2 ${compact ? "grid-cols-2 sm:grid-cols-1" : "grid-cols-2"}`}>
            <button
              type="button"
              onClick={signIn}
              disabled={isWorking || !email.trim() || !password}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-champagne px-3 text-sm font-bold text-carbon disabled:opacity-50"
            >
              <ShieldCheck size={16} strokeWidth={2.2} aria-hidden />
              Sign in
            </button>
            <button
              type="button"
              onClick={createAccount}
              disabled={isWorking || !email.trim() || password.length < 6}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white/[0.075] px-3 text-sm font-bold text-porcelain disabled:opacity-50"
            >
              <UserPlus size={16} strokeWidth={2.2} aria-hidden />
              Create
            </button>
          </div>
          <button
            type="button"
            onClick={resetPassword}
            disabled={isWorking || !email.trim()}
            className="min-h-9 text-center text-xs font-bold text-white/42 underline-offset-4 hover:text-white/70 hover:underline disabled:opacity-40"
          >
            Forgot password?
          </button>
        </div>
      )}
    </section>
  );
}
