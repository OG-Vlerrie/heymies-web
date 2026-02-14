"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Listing = {
  id: string;
  title: string;
  price: number | null;
  suburb: string | null;
  city: string | null;
  status: string;
  created_at: string;
  cover_image: string | null;
};

export default function ListingsPage() {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) return router.push("/login");

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", userRes.user.id).single();
      if (profile?.role === "buyer") return router.push("/dashboard");

      const { data, error: lErr } = await supabase
  .from("listings")
  .select("id, title, price, suburb, city, status, created_at, cover_image")
  .eq("agent_id", userRes.user.id)
  .neq("status", "inactive")
  .order("created_at", { ascending: false })
  .limit(200);


      if (lErr) setError(lErr.message);
      setListings((data ?? []) as Listing[]);
      setLoading(false);
    })();
  }, [router, supabase]);

  if (loading) return <main className="mx-auto max-w-6xl p-6">Loading listings…</main>;

 async function onDelete(id: string) {
  const ok = window.confirm("Delete this listing? It will be removed from the public site.");
  if (!ok) return;

  const { error: delErr } = await supabase
    .from("listings")
    .update({ status: "inactive" })
    .eq("id", id);

  if (delErr) {
    setError(delErr.message);
    return;
  }

  setListings((prev) => prev.filter((x) => x.id !== id));
}


 return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Listings</h1>
          <p className="mt-1 text-sm text-slate-600">Your active listings</p>
        </div>

        <div className="flex gap-2">
          <Link href="/dashboard" className="rounded-xl border px-4 py-2 text-sm">
            Back
          </Link>
          <Link href="/dashboard/listings/new" className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">
            Add Listing
          </Link>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-4 overflow-hidden rounded-2xl border bg-white">
        {listings.length === 0 ? (
          <div className="p-4 text-sm text-slate-600">No listings yet.</div>
        ) : (
          <ul className="divide-y">
            {listings.map((l) => (
              <li key={l.id} className="p-4">
                <div className="flex items-center justify-between gap-4">
  <div className="flex items-center gap-4">
    <div className="h-14 w-20 overflow-hidden rounded-xl border bg-slate-50">
      {l.cover_image ? (
        <img
          src={l.cover_image}
          alt={l.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
          No photo
        </div>
      )}
    </div>

    <div>
      <p className="font-medium text-slate-900">{l.title}</p>
      <p className="mt-1 text-sm text-slate-600">
        {(l.suburb ?? "—")}, {(l.city ?? "—")} • {l.status}
      </p>
    </div>
  </div>

  <div className="flex items-center gap-2">
  <div className="mr-2 text-sm text-slate-700">
    {l.price ? `R ${Number(l.price).toLocaleString()}` : "—"}
  </div>

  <Link
    href={`/dashboard/listings/${l.id}/edit`}
    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
  >
    Edit
  </Link>

  <button
    type="button"
    onClick={() => onDelete(l.id)}
    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
  >
    Delete
  </button>
</div>

</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
