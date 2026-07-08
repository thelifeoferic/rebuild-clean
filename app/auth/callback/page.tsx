"use client";

import { AlertCircle, CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

type CallbackView = "checking" | "success" | "reset" | "error";

function getCallbackError(url: URL) {
  return url.searchParams.get("error_description") || url.searchParams.get("error") || "";
}

export default function AuthCallbackPage() {
  const client = useMemo(() => getSupabaseClient(), []);
  const [view, setView] = useState<CallbackView>("checking");
  const [message, setMessage] = useState("Finishing your secure account step...");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function finishAuth() {
      if (!isSupabaseConfigured || !client) {
        setView("error");
        setMessage("Supabase is not configured for this deployment yet.");
        return;
      }

      try {
        const url = new URL(window.location.href);
        const callbackError = getCallbackError(url);
        if (callbackError) throw new Error(callbackError.replace(/\+/g, " "));

        const intent = url.searchParams.get("intent");
        const code = url.searchParams.get("code");

        if (code) {
          const { error } = await client.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        const {
          data: { session },
          error: sessionError,
        } = await client.auth.getSession();

        if (sessionError) throw sessionError;
        if (!isMounted) return;

        if (intent === "reset") {
          if (!session) {
            setView("error");
            setMessage("The reset link opened, but Supabase did not return an active reset session. Send yourself a fresh reset email from REBUILD.");
            return;
          }

          setView("reset");
          setMessage("Choose a new password for your REBUILD account.");
          return;
        }

        setView("success");
        setMessage(session?.user?.email ? "You are signed in. Returning to REBUILD..." : "Email confirmed. Return to REBUILD and sign in with your password.");
        window.setTimeout(() => window.location.replace("/"), 1600);
      } catch (error) {
        if (!isMounted) return;
        setView("error");
        setMessage(error instanceof Error ? error.message : "Could not finish this account step.");
      }
    }

    finishAuth();

    return () => {
      isMounted = false;
    };
  }, [client]);

  async function updatePassword() {
    if (!client || newPassword.length < 6) return;

    setIsWorking(true);
    try {
      const { error } = await client.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setView("success");
      setMessage("Password updated. Returning to REBUILD...");
      window.setTimeout(() => window.location.replace("/"), 1200);
    } catch (error) {
      setView("reset");
      setMessage(error instanceof Error ? error.message : "Could not update password.");
    } finally {
      setIsWorking(false);
    }
  }

  const icon =
    view === "error" ? (
      <AlertCircle size={24} strokeWidth={2.4} aria-hidden />
    ) : view === "success" ? (
      <CheckCircle2 size={24} strokeWidth={2.4} aria-hidden />
    ) : (
      <ShieldCheck size={24} strokeWidth={2.4} aria-hidden />
    );

  return (
    <main className="min-h-screen bg-carbon px-5 py-10 text-porcelain">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <section className="app-card w-full rounded-[2rem] p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="metric-label">REBUILD account</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">
                {view === "reset" ? "Reset password" : view === "error" ? "Account needs attention" : "Secure sign-in"}
              </h1>
              <p className="app-secondary mt-3 text-base font-semibold leading-6">{message}</p>
            </div>
            <div className={`grid size-12 shrink-0 place-items-center rounded-full ${view === "error" ? "bg-ember/10 text-ember" : "app-icon-soft"}`}>
              {icon}
            </div>
          </div>

          {view === "checking" ? (
            <div className="app-card rounded-2xl p-4 text-sm font-bold">Checking the link...</div>
          ) : null}

          {view === "reset" ? (
            <div className="space-y-3">
              <label className="flex min-h-14 items-center rounded-2xl border border-white/10 bg-carbon px-4 focus-within:border-champagne">
                <LockKeyhole size={18} className="mr-3 shrink-0 text-white/38" aria-hidden />
                <input
                  value={newPassword}
                  autoComplete="new-password"
                  minLength={6}
                  type={showPassword ? "text" : "password"}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="New password"
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
                onClick={updatePassword}
                disabled={isWorking || newPassword.length < 6}
                className="app-primary-action min-h-14 w-full rounded-2xl px-4 text-base font-black disabled:opacity-45"
              >
                Save new password
              </button>
              <p className="app-subtle text-sm font-semibold leading-6">Use at least 6 characters. After this, you can sign in with email and password.</p>
            </div>
          ) : null}

          {view === "success" || view === "error" ? (
            <Link
              href="/"
              className="app-primary-action mt-4 inline-flex min-h-14 w-full items-center justify-center rounded-2xl px-4 text-base font-black"
            >
              Return to REBUILD
            </Link>
          ) : null}
        </section>
      </div>
    </main>
  );
}
