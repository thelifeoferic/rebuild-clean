"use client";

import type { Session } from "@supabase/supabase-js";
import { CheckCircle2, LogOut, Mail, Send, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

type LoginPanelProps = {
  className?: string;
  compact?: boolean;
};

export function LoginPanel({ className = "", compact = false }: LoginPanelProps) {
  const client = useMemo(() => getSupabaseClient(), []);
  const [email, setEmail] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState(isSupabaseConfigured ? "Use one secure email link to sign in." : "Cloud login needs Supabase keys.");
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    if (!client) return;

    client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user?.email) setStatus("Cloud account connected.");
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setStatus(nextSession?.user?.email ? "Cloud account connected." : "Use one secure email link to sign in.");
    });

    return () => subscription.unsubscribe();
  }, [client]);

  async function sendMagicLink() {
    if (!client || !email.trim()) return;

    setIsWorking(true);
    try {
      const { error } = await client.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;
      setStatus("Check your email for the sign-in link.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not send the sign-in link.");
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
          <h3 className="mt-1 text-lg font-semibold text-porcelain">{session ? "Signed in" : "Sign in or create account"}</h3>
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
          <button
            type="button"
            onClick={sendMagicLink}
            disabled={isWorking || !email.trim()}
            className={`${compact ? "px-4" : "w-full px-3"} inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-champagne text-sm font-bold text-carbon disabled:opacity-50`}
          >
            <Send size={16} strokeWidth={2.2} aria-hidden />
            Send link
          </button>
        </div>
      )}
    </section>
  );
}
