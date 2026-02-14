"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

type SignupRole = "agent" | "private-seller" | "buyer";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");

  const supabase = useMemo(() => supabaseBrowser(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [signupRole, setSignupRole] = useState<SignupRole>("agent");

  async function onLogin() {
    setError(null);
    setLoading(true);

    const { error: authErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authErr) {
      setLoading(false);
      setError(authErr.message);
      return;
    }

    if (next) {
      setLoading(false);
      router.push(next);
      return;
    }

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) {
      setLoading(false);
      setError(userErr.message);
      return;
    }

    const uid = user?.id;
    if (!uid) {
      setLoading(false);
      setError("Logged in but no user returned.");
      return;
    }

    // Optional: keep for later role-based redirect, but don't block login if profile missing
    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", uid)
      .single();

    setLoading(false);

    if (profErr || !profile) {
      router.push("/dashboard");
      return;
    }

    router.push("/dashboard");
  }

  function onGoToSignup() {
    router.push(`/signup/${signupRole}`);
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-blue-50">
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-semibold">Log in</h1>
          <p className="mt-2 text-sm text-slate-700">
            Welcome back. Enter your details to continue.
          </p>

          <div className="mt-6 space-y-3">
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              className="w-full rounded-xl bg-slate-900 p-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              onClick={onLogin}
              disabled={loading || !email || !password}
            >
              {loading ? "Signing in..." : "Log in"}
            </button>

            {/* Signup dropdown */}
            <div className="pt-2">
              <p className="text-sm text-slate-600">No account? Select a role.</p>

              <div className="mt-2 flex gap-2">
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value as SignupRole)}
                >
                  <option value="agent">Agent</option>
                  <option value="private-seller">Private Seller</option>
                  <option value="buyer">Buyer</option>
                </select>

                <button
                  type="button"
                  className="shrink-0 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  onClick={onGoToSignup}
                >
                  Create one
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
          Smart. Simple. Sorted.
        </p>
      </div>
    </main>
  );
}
