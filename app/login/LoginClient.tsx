"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function LoginClient() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    setError(null);
    setLoading(true);

    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });

    if (authErr) {
      setLoading(false);
      setError(authErr.message);
      return;
    }

    setLoading(false);
    router.push(next || "/dashboard");
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-blue-50">
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-semibold">Log in</h1>
          <p className="mt-2 text-sm text-slate-700">Welcome back. Enter your details to continue.</p>

          <div className="mt-6 space-y-3">
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              className="w-full rounded-xl bg-slate-900 p-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              onClick={onLogin}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Log in"}
            </button>
          </div>
        </div>

        <p className="mt-10 text-center text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
          Smart. Simple. Sorted.
        </p>
      </div>
    </main>
  );
}
