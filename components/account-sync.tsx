"use client";

import type { Session } from "@supabase/supabase-js";
import { CheckCircle2, Cloud, DownloadCloud, LogOut, Mail, Send, ShieldCheck, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { loadCloudSnapshot, saveCloudSnapshot } from "@/lib/supabase-sync";
import type { OnboardingProfile, RebuildData } from "@/types/rebuild";

type AccountSyncProps = {
  data: RebuildData;
  onRestore: (profile: OnboardingProfile | null, data: RebuildData | null) => void;
  profile: OnboardingProfile | null;
};

const lastSyncKey = "rebuild:last-sync";

export function AccountSync({ data, onRestore, profile }: AccountSyncProps) {
  const client = useMemo(() => getSupabaseClient(), []);
  const [email, setEmail] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState(isSupabaseConfigured ? "Cloud sync ready" : "Add Supabase keys to enable cloud sync");
  const [isWorking, setIsWorking] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  useEffect(() => {
    setLastSynced(window.localStorage.getItem(lastSyncKey));
  }, []);

  useEffect(() => {
    if (!client) return;

    client.auth.getSession().then(({ data: sessionData }) => {
      setSession(sessionData.session);
      if (sessionData.session?.user?.email) setStatus("Signed in. Ready to back up or restore logs.");
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setStatus(nextSession?.user?.email ? "Signed in. Ready to back up or restore logs." : "Cloud sync ready");
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
      setStatus(error instanceof Error ? error.message : "Could not send sign-in link.");
    } finally {
      setIsWorking(false);
    }
  }

  async function syncNow() {
    if (!client) return;

    setIsWorking(true);
    try {
      await saveCloudSnapshot({ client, data, profile });
      const stamp = new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date());
      window.localStorage.setItem(lastSyncKey, stamp);
      setLastSynced(stamp);
      setStatus("Cloud backup saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not sync right now.");
    } finally {
      setIsWorking(false);
    }
  }

  async function pullCloud() {
    if (!client) return;

    setIsWorking(true);
    try {
      const cloud = await loadCloudSnapshot(client);
      onRestore(cloud.profile, cloud.data);
      setStatus(cloud.data ? "Cloud data loaded on this device." : "No cloud data found yet.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load cloud data.");
    } finally {
      setIsWorking(false);
    }
  }

  async function signOut() {
    if (!client) return;
    await client.auth.signOut();
    setSession(null);
    setStatus("Signed out. Local data stayed on this device.");
  }

  return (
    <div className="mx-4 mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="metric-label">Account and backup</p>
          <h3 className="mt-1 text-lg font-semibold text-porcelain">{session ? "Signed in" : "Sign in to sync"}</h3>
          <p className="mt-1 text-sm leading-5 text-white/45">{status}</p>
        </div>
        <div className={`grid size-10 shrink-0 place-items-center rounded-full ${session ? "bg-signal/10 text-signal" : "bg-champagne/10 text-champagne"}`}>
          {session ? <CheckCircle2 size={18} strokeWidth={2.2} aria-hidden /> : <Cloud size={18} strokeWidth={2.2} aria-hidden />}
        </div>
      </div>

      {!isSupabaseConfigured ? (
        <p className="rounded-2xl bg-carbon/70 p-3 text-xs leading-5 text-white/45">
          Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel, then run `supabase/schema.sql` in Supabase.
        </p>
      ) : session ? (
        <div className="space-y-3">
          <div className="rounded-2xl border border-signal/20 bg-signal/10 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-signal">
              <ShieldCheck size={16} strokeWidth={2.2} aria-hidden />
              Cloud account active
            </div>
            <p className="break-all text-sm font-semibold text-porcelain">{session.user.email}</p>
            <p className="mt-2 text-xs leading-5 text-white/45">
              Logs still save instantly on this device. Use Back up now to copy them into Supabase.
            </p>
          </div>

          <div className="rounded-2xl bg-carbon/70 p-3">
            <p className="metric-label">Last backup</p>
            <p className="mt-1 text-sm font-semibold text-porcelain">{lastSynced ?? "Not backed up from this device yet"}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={syncNow}
              disabled={isWorking}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-champagne px-2 text-sm font-bold text-carbon disabled:opacity-50"
            >
              <UploadCloud size={16} aria-hidden />
              Back up now
            </button>
            <button
              type="button"
              onClick={pullCloud}
              disabled={isWorking}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white/10 px-2 text-sm font-bold text-porcelain disabled:opacity-50"
            >
              <DownloadCloud size={16} aria-hidden />
              Restore
            </button>
          </div>
          <button
            type="button"
            onClick={signOut}
            disabled={isWorking}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white/[0.055] px-2 text-sm font-bold text-white/58 disabled:opacity-50"
          >
            <LogOut size={16} aria-hidden />
            Sign out
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="rounded-2xl bg-carbon/70 p-3 text-xs leading-5 text-white/45">
            Sign in by email to back up this device and restore your logs on another phone or browser. New members can use the same email link to create an account.
          </p>
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
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-champagne px-3 text-sm font-bold text-carbon disabled:opacity-50"
          >
            <Send size={16} strokeWidth={2.2} aria-hidden />
            Send secure link
          </button>
        </div>
      )}
    </div>
  );
}
