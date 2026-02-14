<<<<<<< HEAD
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [signupRole, setSignupRole] = useState<"agent" | "private-seller" | "buyer">("agent");

  async function onLogin() {
    setError(null);
    setLoading(true);

    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });

    if (authErr) {
      setLoading(false);
      return setError(authErr.message);
    }

    if (next) {
      setLoading(false);
      router.push(next);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const uid = user?.id;

    if (!uid) {
      setLoading(false);
      return setError("Logged in but no user returned.");
    }

    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", uid)
      .single();

    if (profErr || !profile) {
      setLoading(false);
      return setError(profErr?.message ?? "Missing profile.");
    }

    setLoading(false);
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

            {/* Signup dropdown */}
            <div className="pt-2">
              <p className="text-sm text-slate-600">No account? Please select one.</p>

              <div className="mt-2 flex gap-2">
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value as typeof signupRole)}
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
=======
import { redirect } from "next/navigation";

export default function LoginRedirect() {
  redirect("/signup");
>>>>>>> de317c9451e18b44415fb345ed03f23a18805a36
}
