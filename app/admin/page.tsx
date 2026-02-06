import { createClient } from "@supabase/supabase-js";
import LeadTable from "./LeadTable";
import AgentTable from "./AgentTable";

type Lead = {
  id: string;
  email: string;
  source: string | null;
  tag: string | null;
  created_at: string;
};

type Agent = {
  id: string;
  created_at: string;
  status: "pending" | "approved" | "rejected";
  full_name: string;
  email: string;
  phone: string | null;
  agency: string | null;
  areas: string | null;
  property_types: string | null;
  max_leads_per_week: number | null;
  preferred_contact_time: string | null;
};

export default async function AdminPage() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const [{ data: leads, error: leadsErr }, { data: agents, error: agentsErr }] =
    await Promise.all([
      supabase
        .from("leads")
        .select("id,email,source,tag,created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("agents")
        .select(
          "id,created_at,status,full_name,email,phone,agency,areas,property_types,max_leads_per_week,preferred_contact_time"
        )
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

  if (leadsErr || agentsErr) {
    return (
      <main className="min-h-screen bg-white text-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h1 className="text-2xl font-semibold">Admin</h1>
          <p className="mt-4 text-red-600">Failed to load admin data.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-2xl font-semibold">Admin</h1>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Leads</h2>
          <p className="mt-1 text-sm text-slate-600">Latest 200 leads (tag + delete)</p>
          <LeadTable initialLeads={(leads || []) as Lead[]} />
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-semibold">Agents</h2>
          <p className="mt-1 text-sm text-slate-600">Latest 200 applications (approve / reject)</p>
          <AgentTable initialAgents={(agents || []) as Agent[]} />
        </section>
      </div>
    </main>
  );
}
