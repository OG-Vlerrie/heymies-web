"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function EnquiryGate({ listingId }: { listingId: string }) {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setAuthed(!!data.user);
      setLoading(false);
    })();
  }, [supabase]);

  if (loading) {
    return (
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-600">Loading…</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
        <h2 className="text-lg font-semibold text-emerald-900">Interested?</h2>
        <p className="mt-2 text-sm text-emerald-900/80">
          You can browse listings freely, but you need a buyer account to enquire.
        </p>

        <button
          className="mt-4 w-full rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
          onClick={() => router.push(`/signup/buyer?next=/listings/${listingId}`)}
        >
          Sign up to enquire
        </button>

        <button
          className="mt-2 w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
          onClick={() => router.push(`/login?next=/listings/${listingId}`)}
        >
          Log in
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Register interest</h2>
      <p className="mt-2 text-sm text-slate-600">
        You’re logged in. Next we’ll add the enquiry form here.
      </p>

      <button
        disabled
        className="mt-4 w-full rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white opacity-60"
      >
        Submit enquiry (next)
      </button>
    </div>
  );
}
