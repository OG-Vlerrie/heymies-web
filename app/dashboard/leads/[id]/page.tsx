"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import Link from "next/link";

type Lead = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  score: number;
  notes: string | null;
  created_at: string;
};

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState<Lead | null>(null);
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

      const leadId = params?.id as string;

      const { data, error: lErr } = await supabase
        .from("leads")
        .select("id, full_name, email, phone, status, score, notes, created_at")
        .eq("id", leadId)
        .eq("agent_id", user.id) // security filter
        .single();

      if (lErr || !data) {
        setError(lErr?.message ?? "Lead not found.");
        setLoading(false);
        return;
      }

      setLead(data as Lead);
      setLoading(false);
    })();
  }, [params, router, supabase]);

  if (loading)
    return <main className="mx-auto max-w-6xl p-6">Loading lead…</main>;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {lead?.full_name ?? "Lead"}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Created {new Date(lead!.created_at).toLocaleDateString()}
            </p>
          </div>

          <Link
            href="/dashboard/leads"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 hover:bg-slate-50"
          >
            Back
          </Link>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}

        {lead && (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Contact Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Contact Information
              </h2>

              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div>
                  <p className="text-slate-500">Email</p>
                  <p>{lead.email ?? "—"}</p>
                </div>

                <div>
                  <p className="text-slate-500">Phone</p>
                  <p>{lead.phone ?? "—"}</p>
                </div>

                <div>
                  <p className="text-slate-500">Status</p>
                  <p className="mt-1 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                    {lead.status}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Score</p>
                  <p>{lead.score}</p>
                </div>
              </div>
            </div>

            {/* Notes Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Notes
              </h2>

              <p className="mt-4 text-sm text-slate-700 whitespace-pre-wrap">
                {lead.notes ?? "No notes yet."}
              </p>

              <button
                className="mt-6 rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Update Status
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}