"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Role = "agent" | "seller" | "buyer" | "admin";

type Profile = {
  id: string;
  role: Role;
  full_name: string | null;
  phone: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setError(null);

      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error: profErr } = await supabase
        .from("profiles")
        .select("id, role, full_name, phone")
        .eq("id", user.id)
        .single();

      if (profErr || !data) {
        setError(profErr?.message ?? "Profile not found.");
        setLoading(false);
        return;
      }

      setProfile(data as Profile);
      setLoading(false);
    })();
  }, [router, supabase]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return <main className="mx-auto max-w-6xl p-6">Loading dashboard…</main>;

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl p-6">
          <p className="text-sm text-red-600">{error}</p>
          <button
            className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 hover:bg-slate-50"
            onClick={() => router.push("/login")}
          >
            Back to login
          </button>
        </div>
      </main>
    );
  }

  if (!profile) return null;

  const name = profile.full_name ?? "Welcome";
  const roleLabel =
    profile.role === "agent" ? "Agent" : profile.role === "seller" ? "Private Seller" : profile.role === "buyer" ? "Buyer" : "Admin";

  const isBuyer = profile.role === "buyer";

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-600">
              {name} <span className="text-slate-400">•</span> {roleLabel}
            </p>
          </div>

          <button
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 hover:bg-slate-50"
            onClick={logout}
          >
            Log out
          </button>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-2">
          {!isBuyer && (
            <button
              onClick={() => router.push("/dashboard/listings")}
              className="rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              View Listings
            </button>
          )}

          {!isBuyer && (
            <button
              onClick={() => router.push("/dashboard/listings/new")}
              className="rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Add Listing
            </button>
          )}

          <button
            onClick={() => router.push("/dashboard/leads")}
            className="rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Leads
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">{isBuyer ? "Saved Homes" : "Open Leads"}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">0</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">{isBuyer ? "Viewing Requests" : "Active Listings"}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">0</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">This Week</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">0 {isBuyer ? "matches" : "viewings"}</p>
          </div>
        </div>

        {/* Panels */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">{isBuyer ? "Suggested Listings" : "Recent Leads"}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {isBuyer
                ? "Once you set preferences, we’ll show matched homes here."
                : "Once leads are routed, they’ll show here."}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">{isBuyer ? "Your Shortlist" : "Your Listings"}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {isBuyer
                ? "Save properties to build your shortlist."
                : "Create your first listing to start receiving better matched leads."}
            </p>

            {!isBuyer && (
              <button
                onClick={() => router.push("/dashboard/listings/new")}
                className="mt-4 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Add Listing
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
