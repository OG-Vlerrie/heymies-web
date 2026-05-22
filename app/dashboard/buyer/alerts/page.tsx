"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

type BuyerAlert = {
  id: string;
  buyer_id?: string;
  user_id?: string;
  name: string;
  areas: string[];
  property_types?: string[];
  max_price: number | null;
  bedrooms_min: number | null;
  bathrooms_min?: number | null;
  delivery_channel?: string;
  last_checked_at?: string | null;
  created_at: string;
  enabled: boolean;
};

type Buyer = {
  id: string;
  user_id: string;
  budget_max: number | null;
  areas: string[] | null;
  areas_multi: string[] | null;
  bedrooms_min: number | null;
};

const STORAGE_KEY = "heymies.buyer.alerts";

function readAlerts(): BuyerAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BuyerAlert[]) : [];
  } catch {
    return [];
  }
}

function writeAlerts(alerts: BuyerAlert[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

function formatZAR(n: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function BuyerAlertsPage() {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [alerts, setAlerts] = useState<BuyerAlert[]>([]);
  const [usesLocalFallback, setUsesLocalFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [areaInput, setAreaInput] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;

      if (!user) {
        router.push("/login?next=/dashboard/buyer/alerts");
        return;
      }

      const { data } = await supabase
        .from("buyers")
        .select("id,user_id,budget_max,areas,areas_multi,bedrooms_min")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!cancelled) {
        const currentBuyer = data as Buyer | null;
        setBuyer(currentBuyer);
        if (currentBuyer) {
          const { data: alertRows, error: alertErr } = await supabase
            .from("buyer_alerts")
            .select("*")
            .eq("buyer_id", currentBuyer.id)
            .order("created_at", { ascending: false });

          if (alertErr) {
            setUsesLocalFallback(true);
            setAlerts(readAlerts());
          } else {
            setUsesLocalFallback(false);
            setAlerts((alertRows ?? []) as BuyerAlert[]);
          }
        } else {
          setAlerts(readAlerts());
        }
        setAreaInput(((currentBuyer?.areas?.length ? currentBuyer.areas : currentBuyer?.areas_multi) ?? []).join(", "));
        setMaxPrice(currentBuyer?.budget_max ? String(currentBuyer.budget_max) : "");
        setBedrooms(currentBuyer?.bedrooms_min ? String(currentBuyer.bedrooms_min) : "");
        setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  async function createAlert() {
    const areas = areaInput
      .split(",")
      .map((area) => area.trim())
      .filter(Boolean);

    const nextPayload = {
      buyer_id: buyer?.id,
      user_id: buyer?.user_id,
      name: areas.length ? `${areas.slice(0, 2).join(", ")} match alert` : "Buyer match alert",
      areas,
      property_types: [],
      max_price: maxPrice.trim() ? Number(maxPrice) : buyer?.budget_max ?? null,
      bedrooms_min: bedrooms.trim() ? Number(bedrooms) : buyer?.bedrooms_min ?? null,
      bathrooms_min: null,
      delivery_channel: "email",
      enabled: true,
    };

    if (buyer && !usesLocalFallback) {
      const { data, error } = await supabase
        .from("buyer_alerts")
        .insert(nextPayload)
        .select("*")
        .single();

      if (!error && data) {
        setAlerts((prev) => [data as BuyerAlert, ...prev]);
        return;
      }

      setUsesLocalFallback(true);
    }

    const next: BuyerAlert = {
      id: crypto.randomUUID(),
      ...nextPayload,
      buyer_id: buyer?.id,
      user_id: buyer?.user_id,
      max_price: nextPayload.max_price,
      bedrooms_min: nextPayload.bedrooms_min,
      created_at: new Date().toISOString(),
    };

    const nextAlerts = [next, ...alerts].slice(0, 8);
    setAlerts(nextAlerts);
    writeAlerts(nextAlerts);
  }

  async function toggleAlert(id: string) {
    const current = alerts.find((alert) => alert.id === id);
    if (!current) return;

    if (!usesLocalFallback) {
      const { error } = await supabase
        .from("buyer_alerts")
        .update({ enabled: !current.enabled })
        .eq("id", id);

      if (error) setUsesLocalFallback(true);
    }

    const nextAlerts = alerts.map((alert) =>
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    );
    setAlerts(nextAlerts);
    if (usesLocalFallback) writeAlerts(nextAlerts);
  }

  async function deleteAlert(id: string) {
    if (!usesLocalFallback) {
      const { error } = await supabase.from("buyer_alerts").delete().eq("id", id);
      if (error) setUsesLocalFallback(true);
    }

    const nextAlerts = alerts.filter((alert) => alert.id !== id);
    setAlerts(nextAlerts);
    if (usesLocalFallback) writeAlerts(nextAlerts);
  }

  return (
    <main className="tech-page text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="tech-kicker">Buyer workspace</p>
            <h1 className="mt-3 text-3xl font-semibold">Match alerts</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Save the kind of homes you want to watch. This is ready for email delivery once backend alert jobs are added.
            </p>
            {usesLocalFallback ? (
              <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Alerts are stored in this browser until the Supabase alert migration is applied.
              </p>
            ) : null}
          </div>

          <Link href="/dashboard/buyer" className="tech-button-secondary rounded-xl px-4 py-2 text-sm">
            Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 h-64 animate-pulse rounded-3xl border border-slate-200 bg-white" />
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <section className="tech-card rounded-3xl p-6 lg:col-span-1">
              <h2 className="text-lg font-semibold">Create alert</h2>
              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Areas</span>
                  <input
                    value={areaInput}
                    onChange={(e) => setAreaInput(e.target.value)}
                    className="tech-input mt-2 w-full rounded-xl px-4 py-3 text-sm"
                    placeholder="Sandton, Bryanston"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Max price</span>
                  <input
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="tech-input mt-2 w-full rounded-xl px-4 py-3 text-sm"
                    inputMode="numeric"
                    placeholder="2500000"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Bedrooms</span>
                  <input
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="tech-input mt-2 w-full rounded-xl px-4 py-3 text-sm"
                    inputMode="numeric"
                    placeholder="3"
                  />
                </label>
                <button
                  type="button"
                  onClick={createAlert}
                  className="tech-button-primary w-full rounded-xl px-4 py-3 text-sm"
                >
                  Save alert
                </button>
              </div>
            </section>

            <section className="space-y-4 lg:col-span-2">
              {alerts.length === 0 ? (
                <div className="tech-card rounded-3xl p-8">
                  <h2 className="text-xl font-semibold">No alerts yet</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Create your first alert from your current buyer profile, then tune the filters.
                  </p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <article key={alert.id} className="tech-card rounded-3xl p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold">{alert.name}</h2>
                          <span
                            className={[
                              "rounded-full border px-2 py-1 text-xs font-semibold",
                              alert.enabled
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : "border-slate-200 bg-slate-50 text-slate-600",
                            ].join(" ")}
                          >
                            {alert.enabled ? "Active" : "Paused"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          {alert.areas.length ? alert.areas.join(", ") : "Any area"} /{" "}
                          {alert.max_price ? `up to ${formatZAR(alert.max_price)}` : "any budget"} /{" "}
                          {alert.bedrooms_min ? `${alert.bedrooms_min}+ beds` : "any beds"}
                        </p>
                        {alert.last_checked_at ? (
                          <p className="mt-1 text-xs text-slate-500">
                            Last checked {new Date(alert.last_checked_at).toLocaleString("en-ZA")}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => toggleAlert(alert.id)}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {alert.enabled ? "Pause" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAlert(alert.id)}
                          className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
