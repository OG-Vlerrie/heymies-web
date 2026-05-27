"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function LoginClient() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");
  const registerHref = next ? `/signup?next=${encodeURIComponent(next)}` : "/signup";
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    setError(null);
    setLoading(true);

    const { data: loginData, error: authErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authErr) {
      setLoading(false);
      setError(authErr.message);
      return;
    }

    if (loginData.session?.access_token) {
      await fetch("/api/auth/admin-session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${loginData.session.access_token}`,
        },
      }).catch(() => null);
    }

    setLoading(false);

    const fallbackNext =
      typeof window !== "undefined"
        ? localStorage.getItem("auth_redirect_after_verify")
        : null;

    if (fallbackNext) {
      localStorage.removeItem("auth_redirect_after_verify");
    }

    router.push(next || fallbackNext || "/dashboard");
  }

  return (
    <main className="tech-page min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="tech-panel rounded-2xl p-6">
          <p className="tech-kicker">Secure access</p>
          <h1 className="text-2xl font-semibold">Log in</h1>
          <p className="mt-2 text-sm text-slate-700">
            Welcome back. Enter your details to continue.
          </p>

          <div className="mt-6 space-y-3">
            <input
              className="tech-input w-full rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="tech-input w-full rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              className="tech-button-primary w-full rounded-xl p-3 text-sm font-semibold disabled:opacity-60"
              onClick={onLogin}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Log in"}
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-4 text-center">
            <p className="text-sm text-slate-600">New to HeyMies?</p>
            <Link
              href={registerHref}
              className="mt-2 inline-flex font-semibold text-emerald-700 underline"
            >
              Register for an account
            </Link>
          </div>
        </div>

        <p className="mt-10 text-center text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Smart. Simple. Sorted.
        </p>
      </div>
    </main>
  );
}
