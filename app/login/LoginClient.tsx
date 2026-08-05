"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

type LoginRole = "agent" | "seller" | "buyer";
type UserRole = LoginRole | "admin";

export default function LoginClient() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");
  const requestedRole = roleFromQuery(search.get("role"));
  const safeNext = safeRedirectPath(next);
  const registerHref = safeNext ? `/signup?next=${encodeURIComponent(safeNext)}` : "/signup";
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const sessionRes = await withTimeout(supabase.auth.getSession(), 2500);
        const session = sessionRes?.data.session;

        if (!session) return;

        if (session.access_token) {
          void createAdminSession(session.access_token);
        }

        if (!cancelled) {
          await redirectAfterLogin(session.user.id);
        }
      } catch {
        // Leave the login form available if session recovery fails.
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // The redirect helper intentionally reads localStorage at navigation time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeNext, supabase]);

  async function onLogin() {
    setError(null);
    setLoading(true);

    try {
      const { data: loginData, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authErr) {
        setError(authErr.message);
        return;
      }

      if (loginData.session?.access_token) {
        await withTimeout(createAdminSession(loginData.session.access_token), 1500);
      }

      await redirectAfterLogin(loginData.user?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function redirectAfterLogin(userId: string | null) {
    const fallbackNext =
      typeof window !== "undefined"
        ? localStorage.getItem("auth_redirect_after_verify")
        : null;
    const safeFallbackNext = safeRedirectPath(fallbackNext);

    if (fallbackNext) {
      localStorage.removeItem("auth_redirect_after_verify");
    }

    const dashboardPath =
      userId ? await dashboardPathForUser(supabase, userId, requestedRole) : dashboardPathForRole(requestedRole);

    router.replace(safeNext || safeFallbackNext || dashboardPath);
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
            {checkingSession && (
              <p className="text-sm text-slate-600">Checking your verification status...</p>
            )}

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

async function createAdminSession(accessToken: string) {
  await fetch("/api/auth/admin-session", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).catch(() => null);
}

async function dashboardPathForUser(
  supabase: ReturnType<typeof supabaseBrowser>,
  userId: string,
  fallbackRole: UserRole | null
) {
  const profileRes = await withTimeout(
    supabase.from("profiles").select("role").eq("id", userId).maybeSingle(),
    2500
  );
  const data = profileRes?.data;

  if (data?.role === "buyer") return "/dashboard/buyer";
  if (data?.role === "admin") return "/admin";

  return dashboardPathForRole(fallbackRole);
}

function safeRedirectPath(value: string | null) {
  if (!value) return null;

  try {
    const decoded = decodeURIComponent(value);
    if (!decoded.startsWith("/") || decoded.startsWith("//")) return null;
    if (decoded.includes("\\") || decoded.includes("\n") || decoded.includes("\r")) return null;
    return decoded;
  } catch {
    return null;
  }
}

function roleFromQuery(value: string | null): UserRole | null {
  if (value === "agent" || value === "seller" || value === "buyer" || value === "admin") {
    return value;
  }

  return null;
}

function dashboardPathForRole(role: UserRole | null) {
  if (role === "buyer") return "/dashboard/buyer";
  if (role === "admin") return "/admin";
  return "/dashboard";
}

async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number) {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<null>((resolve) => {
      window.setTimeout(() => resolve(null), timeoutMs);
    }),
  ]);
}
