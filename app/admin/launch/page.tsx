export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";

type ReadinessStatus = "ready" | "watch" | "blocked";

type ReadinessCheck = {
  label: string;
  status: ReadinessStatus;
  detail: string;
  action: string;
};

type CountResult = {
  count: number;
  error: string | null;
};

type ListingHealthRow = {
  id: string;
  title: string | null;
  status: string | null;
  cover_image: string | null;
  images: string[] | null;
  price: number | null;
  price_per_month: number | null;
  suburb: string | null;
  city: string | null;
  description: string | null;
  contact_email: string | null;
};

export default async function AdminLaunchPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  const resendKey = process.env.RESEND_API_KEY?.trim() ?? "";
  const emailFrom = process.env.EMAIL_FROM?.trim() ?? "";
  const openAiKey = process.env.OPENAI_API_KEY?.trim() ?? "";
  const adminUser = process.env.ADMIN_USER?.trim() ?? "";
  const adminPass = process.env.ADMIN_PASS?.trim() ?? "";
  const adminSessionSecret = process.env.ADMIN_SESSION_SECRET?.trim() ?? "";
  const adminRequireRole = process.env.ADMIN_REQUIRE_ROLE === "true";
  const cronSecret = process.env.CRON_SECRET?.trim() ?? "";
  const nurtureSecret = process.env.NURTURE_JOB_SECRET?.trim() ?? "";
  const matchingSecret = process.env.MATCHING_JOB_SECRET?.trim() ?? "";

  let activeListings: CountResult = { count: 0, error: "Not checked." };
  let buyers: CountResult = { count: 0, error: "Not checked." };
  let agents: CountResult = { count: 0, error: "Not checked." };
  let sellers: CountResult = { count: 0, error: "Not checked." };
  let enquiries: CountResult = { count: 0, error: "Not checked." };
  let preferences: CountResult = { count: 0, error: "Not checked." };
  let alerts: CountResult = { count: 0, error: "Not checked." };
  let matchEvents: CountResult = { count: 0, error: "Not checked." };
  let listingRows: ListingHealthRow[] = [];
  let dueNurture: CountResult = { count: 0, error: "Not checked." };
  let staleNurture: CountResult = { count: 0, error: "Not checked." };

  if (supabaseUrl && serviceRole) {
    const supabase = supabaseAdmin();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    [
      activeListings,
      buyers,
      agents,
      sellers,
      enquiries,
      preferences,
      alerts,
      matchEvents,
      dueNurture,
      staleNurture,
    ] = await Promise.all([
      safeCount(
        supabase
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
        "active listings"
      ),
      safeCount(supabase.from("buyers").select("id", { count: "exact", head: true }), "buyers"),
      safeCount(supabase.from("agents").select("id", { count: "exact", head: true }), "agents"),
      safeCount(
        supabase.from("private_sellers").select("id", { count: "exact", head: true }),
        "private sellers"
      ),
      safeCount(
        supabase.from("enquiries").select("id", { count: "exact", head: true }),
        "enquiries"
      ),
      safeCount(
        supabase.from("email_preferences").select("id", { count: "exact", head: true }),
        "email preferences"
      ),
      safeCount(
        supabase.from("buyer_alerts").select("id", { count: "exact", head: true }),
        "buyer alerts"
      ),
      safeCount(
        supabase.from("match_events").select("id", { count: "exact", head: true }),
        "match events"
      ),
      safeCount(
        supabase
          .from("enquiries")
          .select("id", { count: "exact", head: true })
          .not("next_nurture_at", "is", null)
          .lte("next_nurture_at", now)
          .in("nurture_status", ["pending", "nurturing"]),
        "due nurture"
      ),
      safeCount(
        supabase
          .from("enquiries")
          .select("id", { count: "exact", head: true })
          .not("next_nurture_at", "is", null)
          .lte("next_nurture_at", yesterday)
          .in("nurture_status", ["pending", "nurturing"]),
        "stale nurture"
      ),
    ]);

    const listingHealth = await safeRows<ListingHealthRow>(
      supabase
        .from("listings")
        .select(
          "id,title,status,cover_image,images,price,price_per_month,suburb,city,description,contact_email"
        )
        .eq("status", "active")
        .limit(50),
      "listing health"
    );
    listingRows = listingHealth.data;
  }

  const listingIssues = listingRows.filter(hasListingIssue);
  const configChecks: ReadinessCheck[] = [
    presentCheck("Supabase URL", supabaseUrl, "Set NEXT_PUBLIC_SUPABASE_URL in production."),
    presentCheck("Supabase anon key", anonKey, "Set NEXT_PUBLIC_SUPABASE_ANON_KEY in production."),
    presentCheck(
      "Supabase service role",
      serviceRole,
      "Set SUPABASE_SERVICE_ROLE_KEY in production. Rotate it first if it was exposed."
    ),
    presentCheck("Resend API key", resendKey, "Set RESEND_API_KEY and verify the sender domain."),
    {
      label: "Email sender",
      status: emailFrom && emailFrom.includes("@heymies.co.za") ? "ready" : emailFrom ? "watch" : "blocked",
      detail: emailFrom || "EMAIL_FROM is missing.",
      action: emailFrom.includes("@heymies.co.za")
        ? "Send one inbox and one spam-folder test before inviting users."
        : "Use a verified heymies.co.za sender before real-user email.",
    },
    presentCheck("OpenAI key", openAiKey, "Set OPENAI_API_KEY for listing description generation."),
    {
      label: "Admin credentials",
      status: adminUser && adminPass ? "watch" : "blocked",
      detail: adminUser && adminPass ? "Basic auth fallback is configured." : "ADMIN_USER or ADMIN_PASS is missing.",
      action: adminUser && adminPass
        ? "Keep alpha fallback private; use role-based admin sessions for real users."
        : "Set strong admin credentials before exposing admin routes.",
    },
    {
      label: "Admin session secret",
      status: adminSessionSecret ? "ready" : "watch",
      detail: adminSessionSecret
        ? "Signed admin session cookies are configured."
        : "ADMIN_SESSION_SECRET is missing; admin cookies fall back to ADMIN_PASS for signing.",
      action: "Set a long random ADMIN_SESSION_SECRET before public beta.",
    },
    {
      label: "Admin role enforcement",
      status: adminRequireRole ? "ready" : "watch",
      detail: adminRequireRole
        ? "Admin routes require a signed admin-role session."
        : "Basic auth fallback is still allowed for alpha.",
      action: "Set ADMIN_REQUIRE_ROLE=true after creating your admin profile row.",
    },
    {
      label: "Job secrets",
      status: cronSecret || nurtureSecret || matchingSecret ? "watch" : "blocked",
      detail:
        cronSecret || nurtureSecret || matchingSecret
          ? "At least one job secret is configured."
          : "No cron, nurture, or matching job secret is configured.",
      action: "Set CRON_SECRET, NURTURE_JOB_SECRET, and MATCHING_JOB_SECRET before public beta.",
    },
  ];

  const dataChecks: ReadinessCheck[] = [
    tableCheck("Buyer profiles", buyers, "Buyer signup data is reachable.", "Run buyer signup smoke test."),
    tableCheck("Agent profiles", agents, "Agent data is reachable.", "Create or verify one test agent."),
    tableCheck(
      "Private seller profiles",
      sellers,
      "Private seller data is reachable.",
      "Create or verify one test private seller."
    ),
    tableCheck(
      "Email preferences",
      preferences,
      "Email preferences table is reachable.",
      "Test preference update and unsubscribe."
    ),
    tableCheck("Buyer alerts", alerts, "Buyer alerts table is reachable.", "Create one buyer alert."),
    tableCheck(
      "Match events",
      matchEvents,
      "Match events table is reachable.",
      "Run one matching dry run or manual match."
    ),
  ];

  const productChecks: ReadinessCheck[] = [
    {
      label: "Active listings",
      status: activeListings.error ? "blocked" : activeListings.count >= 3 ? "ready" : "watch",
      detail: activeListings.error ?? `${activeListings.count} active listings found.`,
      action:
        activeListings.count >= 3
          ? "Keep at least 3 realistic listings live for testers."
          : "Add 3-10 realistic active listings with photos before inviting broader testers.",
    },
    {
      label: "Listing completeness",
      status: listingIssues.length === 0 && activeListings.count > 0 ? "ready" : listingIssues.length > 0 ? "watch" : "blocked",
      detail:
        activeListings.count === 0
          ? "No active listings to inspect."
          : `${listingIssues.length} active listings appear incomplete.`,
      action: "Complete photos, price, area, description, and contact email for active listings.",
    },
    {
      label: "Enquiry pipeline",
      status: enquiries.error ? "blocked" : enquiries.count > 0 ? "ready" : "watch",
      detail: enquiries.error ?? `${enquiries.count} enquiries found.`,
      action: "Run one buyer enquiry from a test account and verify it appears in admin.",
    },
    {
      label: "Mia nurture backlog",
      status: staleNurture.error ? "blocked" : staleNurture.count > 0 ? "watch" : "ready",
      detail:
        staleNurture.error ??
        `${dueNurture.count} due now. ${staleNurture.count} older than 24 hours.`,
      action: "Run Mia manually from admin if nurture becomes stale.",
    },
  ];

  const allChecks = [...configChecks, ...dataChecks, ...productChecks];
  const summary = summarize(allChecks);

  return (
    <main className="tech-page text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link href="/admin" className="text-sm font-semibold text-emerald-700">
              Back to admin
            </Link>
            <p className="tech-kicker mt-6">Launch readiness</p>
            <h1 className="mt-2 text-3xl font-semibold">Live User Readiness</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              A practical gate before HeyMies moves from friendly alpha testing to real user
              traffic. Fix blocked items first, then reduce watch items before public beta.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/health" className="tech-button-secondary rounded-xl px-4 py-2 text-sm font-semibold">
              System health
            </Link>
            <Link href="/admin/qa" className="tech-button-primary rounded-xl px-4 py-2 text-sm font-semibold">
              QA checklist
            </Link>
          </div>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <Metric label="Ready" value={summary.ready} tone="ready" />
          <Metric label="Watch" value={summary.watch} tone="watch" />
          <Metric label="Blocked" value={summary.blocked} tone="blocked" />
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">{launchVerdict(summary)}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Friendly alpha can continue with watch items. Public beta should wait until blocked
                items are gone and email/listing checks are green.
              </p>
            </div>
            <span className={`rounded-full border px-4 py-2 text-sm font-semibold ${verdictClass(summary)}`}>
              {summary.blocked > 0 ? "Not public-beta ready" : summary.watch > 0 ? "Alpha-ready" : "Beta-ready"}
            </span>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Panel title="Configuration">
            <CheckList checks={configChecks} />
          </Panel>
          <Panel title="Data Shape">
            <CheckList checks={dataChecks} />
          </Panel>
          <Panel title="Product Flow">
            <CheckList checks={productChecks} />
          </Panel>
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Next Best Actions</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {allChecks
              .filter((check) => check.status !== "ready")
              .slice(0, 8)
              .map((check) => (
                <div key={check.label} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{check.label}</p>
                    <StatusPill status={check.status} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{check.action}</p>
                </div>
              ))}
          </div>
          {allChecks.every((check) => check.status === "ready") ? (
            <p className="mt-4 text-sm text-emerald-700">
              No readiness blockers found. Run the manual alpha script before inviting broader users.
            </p>
          ) : null}
        </section>

        {listingIssues.length > 0 ? (
          <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
            <h2 className="text-xl font-semibold">Listings To Fix</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {listingIssues.slice(0, 8).map((listing) => (
                <div key={listing.id} className="rounded-2xl border border-amber-200 bg-white/70 p-4">
                  <p className="font-semibold">{listing.title ?? "Untitled listing"}</p>
                  <p className="mt-2 text-sm leading-6">{listingIssueText(listing)}</p>
                  <Link
                    href={`/admin/listings/${listing.id}`}
                    className="mt-3 inline-flex text-sm font-semibold text-emerald-800"
                  >
                    Open listing
                  </Link>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function presentCheck(label: string, value: string, action: string): ReadinessCheck {
  return {
    label,
    status: value ? "ready" : "blocked",
    detail: value ? "Configured." : "Missing.",
    action,
  };
}

function tableCheck(
  label: string,
  result: CountResult,
  reachableDetail: string,
  action: string
): ReadinessCheck {
  if (result.error) {
    return {
      label,
      status: "blocked",
      detail: result.error,
      action: "Apply the required Supabase migration and recheck this page.",
    };
  }

  return {
    label,
    status: "ready",
    detail: `${reachableDetail} ${result.count} rows found.`,
    action,
  };
}

async function safeCount(query: PromiseLike<any>, label: string): Promise<CountResult> {
  const result = await query;
  if (result.error) return { count: 0, error: `${label}: ${result.error.message}` };
  return { count: result.count ?? 0, error: null };
}

async function safeRows<T>(query: PromiseLike<any>, label: string) {
  const result = await query;
  if (result.error) return { data: [] as T[], error: `${label}: ${result.error.message}` };
  return { data: (result.data ?? []) as T[], error: null };
}

function hasListingIssue(listing: ListingHealthRow) {
  return listingIssueText(listing).length > 0;
}

function listingIssueText(listing: ListingHealthRow) {
  const issues = [
    !(Array.isArray(listing.images) && listing.images.length > 0) && !listing.cover_image
      ? "missing photos"
      : null,
    !listing.price && !listing.price_per_month ? "missing price" : null,
    !listing.suburb || !listing.city ? "missing area" : null,
    !listing.description || listing.description.trim().length < 80 ? "thin description" : null,
    !listing.contact_email ? "missing contact email" : null,
  ].filter(Boolean);

  return issues.join(", ");
}

function summarize(checks: ReadinessCheck[]) {
  return checks.reduce(
    (acc, check) => {
      acc[check.status] += 1;
      return acc;
    },
    { ready: 0, watch: 0, blocked: 0 } as Record<ReadinessStatus, number>
  );
}

function launchVerdict(summary: Record<ReadinessStatus, number>) {
  if (summary.blocked > 0) return "Keep this in alpha.";
  if (summary.watch > 0) return "Good for controlled alpha, not broad beta.";
  return "Ready for a broader beta pass.";
}

function verdictClass(summary: Record<ReadinessStatus, number>) {
  if (summary.blocked > 0) return "border-red-200 bg-red-50 text-red-700";
  if (summary.watch > 0) return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: ReadinessStatus;
}) {
  const cls =
    tone === "ready"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "watch"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-red-200 bg-red-50 text-red-700";

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${cls}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function CheckList({ checks }: { checks: ReadinessCheck[] }) {
  return (
    <div className="space-y-3">
      {checks.map((check) => (
        <div key={check.label} className="rounded-2xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="font-semibold">{check.label}</p>
            <StatusPill status={check.status} />
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{check.detail}</p>
          <p className="mt-2 text-xs font-semibold text-slate-500">{check.action}</p>
        </div>
      ))}
    </div>
  );
}

function StatusPill({ status }: { status: ReadinessStatus }) {
  const cls =
    status === "ready"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "watch"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-red-200 bg-red-50 text-red-700";

  const label = status === "ready" ? "Ready" : status === "watch" ? "Watch" : "Blocked";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}
