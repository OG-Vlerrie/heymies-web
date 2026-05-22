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

  const [openLeadsCount, setOpenLeadsCount] = useState(0);
  const [activeListingsCount, setActiveListingsCount] = useState(0);
  const [weekViewingsCount, setWeekViewingsCount] = useState(0);

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

  useEffect(() => {
    if (!profile) return;

    (async () => {
      if (profile.role === "buyer") return;

      const { count: listingsCount, error: listErr } = await supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("agent_id", profile.id)
        .eq("status", "active");

      if (!listErr && typeof listingsCount === "number") {
        setActiveListingsCount(listingsCount);
      }

      const { count: leadsCount } = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("agent_id", profile.id)
        .eq("status", "open");

      if (typeof leadsCount === "number") setOpenLeadsCount(leadsCount);

      const startOfWeek = new Date();
      const day = startOfWeek.getDay();
      const diffToMonday = (day + 6) % 7;
      startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      const { count: viewingsCount } = await supabase
        .from("viewings")
        .select("id", { count: "exact", head: true })
        .eq("agent_id", profile.id)
        .gte("scheduled_at", startOfWeek.toISOString());

      if (typeof viewingsCount === "number") {
        setWeekViewingsCount(viewingsCount);
      }
    })();
  }, [profile, supabase]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return <main className="tech-page mx-auto max-w-6xl p-6">Loading dashboard...</main>;
  }

  if (error) {
    return (
      <main className="tech-page">
        <div className="mx-auto max-w-5xl p-6">
          <div className="tech-card rounded-2xl p-5">
            <p className="text-sm text-red-600">{error}</p>
            <button
              className="tech-button-secondary mt-4 rounded-xl px-4 py-2 text-sm font-semibold"
              onClick={() => router.push("/login")}
            >
              Back to login
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) return null;

  const name = profile.full_name ?? "Welcome";
  const roleLabel =
    profile.role === "agent"
      ? "Agent"
      : profile.role === "seller"
      ? "Private Seller"
      : profile.role === "buyer"
      ? "Buyer"
      : "Admin";

  const isBuyer = profile.role === "buyer";

  return (
    <main className="tech-page">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <section className="tech-hero rounded-3xl px-5 py-6 md:px-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
                Command centre
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Dashboard</h1>
              <p className="mt-2 text-sm text-slate-300">
                {name} <span className="text-slate-500">/</span> {roleLabel}
              </p>
            </div>

            <button
              className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/16"
              onClick={logout}
            >
              Log out
            </button>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap gap-2">
          {!isBuyer && (
            <button
              onClick={() => router.push("/dashboard/listings")}
              className="tech-button-primary rounded-xl px-4 py-2 text-sm font-semibold"
            >
              View listings
            </button>
          )}

          {!isBuyer && (
            <button
              onClick={() => router.push("/dashboard/listings/new")}
              className="tech-button-primary rounded-xl px-4 py-2 text-sm font-semibold"
            >
              Add listing
            </button>
          )}

          <button
            onClick={() => router.push("/dashboard/leads")}
            className="tech-button-secondary rounded-xl px-4 py-2 text-sm font-semibold"
          >
            Leads
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <MetricCard
            label={isBuyer ? "Saved Homes" : "Open Leads"}
            value={isBuyer ? "0" : String(openLeadsCount)}
            accent="emerald"
          />
          <MetricCard
            label={isBuyer ? "Viewing Requests" : "Active Listings"}
            value={isBuyer ? "0" : String(activeListingsCount)}
            accent="sky"
          />
          <MetricCard
            label="This Week"
            value={isBuyer ? "0 matches" : `${weekViewingsCount} viewings`}
            accent="slate"
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Panel title={isBuyer ? "Suggested Listings" : "Recent Leads"}>
            {isBuyer
              ? "Once you set preferences, we'll show matched homes here."
              : "Once leads are routed, they'll show here."}
          </Panel>

          <Panel title={isBuyer ? "Your Shortlist" : "Your Listings"}>
            {isBuyer
              ? "Save properties to build your shortlist."
              : "Create your first listing to start receiving better matched leads."}

            {!isBuyer && (
              <button
                onClick={() => router.push("/dashboard/listings/new")}
                className="tech-button-primary mt-4 rounded-xl px-4 py-2 text-sm font-semibold"
              >
                Add listing
              </button>
            )}
          </Panel>
        </div>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "emerald" | "sky" | "slate";
}) {
  const accentClass =
    accent === "emerald"
      ? "bg-emerald-500"
      : accent === "sky"
      ? "bg-sky-500"
      : "bg-slate-500";

  return (
    <div className="tech-card rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{label}</p>
        <span className={`h-2.5 w-2.5 rounded-full ${accentClass}`} />
      </div>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="tech-panel rounded-2xl p-5">
      <h2 className="font-semibold text-slate-950">{title}</h2>
      <div className="mt-2 text-sm text-slate-600">{children}</div>
    </div>
  );
}
