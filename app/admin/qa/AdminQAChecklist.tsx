"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type QAStatus = "untested" | "pass" | "fail" | "blocked";

type QAItem = {
  id: string;
  title: string;
  expected: string;
  link?: string;
};

type QASection = {
  id: string;
  title: string;
  purpose: string;
  items: QAItem[];
};

type QAState = Record<string, { status: QAStatus; note: string; updatedAt: string | null }>;

const STORAGE_KEY = "heymies.admin.qa.v1";

const SECTIONS: QASection[] = [
  {
    id: "health",
    title: "System Health",
    purpose: "Confirm the platform can send emails, run jobs, and read core tables before testing user journeys.",
    items: [
      {
        id: "health-page-green",
        title: "Open System Health and review all warnings",
        expected: "Critical config checks pass. Any warning has a known reason or fix.",
        link: "/admin/health",
      },
      {
        id: "cron-secret-present",
        title: "Confirm nurture cron secret is configured",
        expected: "CRON_SECRET or NURTURE_JOB_SECRET shows as configured.",
        link: "/admin/health",
      },
      {
        id: "email-from-domain",
        title: "Confirm email sender uses verified domain",
        expected: "EMAIL_FROM uses a heymies.co.za sender, preferably Mia from HeyMies.",
        link: "/admin/health",
      },
    ],
  },
  {
    id: "buyer",
    title: "Buyer Signup and Enquiry",
    purpose: "Prove a buyer can register, confirm email, enquire, and appear in Mia's pipeline.",
    items: [
      {
        id: "buyer-signup",
        title: "Create a new buyer account",
        expected: "Buyer signup completes and sends the Supabase confirmation email.",
        link: "/signup/buyer",
      },
      {
        id: "buyer-confirm-email",
        title: "Confirm buyer email and check spam copy",
        expected: "Buyer can confirm email, and the check-email page reminds them to check spam.",
        link: "/signup/check-email",
      },
      {
        id: "buyer-profile-created",
        title: "Check buyer profile row exists",
        expected: "Buyer appears in Admin Users with role buyer and email preferences present.",
        link: "/admin/users",
      },
      {
        id: "buyer-enquiry-submit",
        title: "Submit an enquiry on an active listing",
        expected: "Enquiry succeeds only while logged in and creates a pipeline card.",
        link: "/listings",
      },
      {
        id: "buyer-memory-populated",
        title: "Open Buyer Memory",
        expected: "Buyer memory shows profile, enquiry, activity, preferences, and matches if present.",
        link: "/admin/pipeline",
      },
    ],
  },
  {
    id: "seller-agent-listings",
    title: "Seller, Agent, and Listings",
    purpose: "Prove listings can be created, checked for Mia-readiness, published, and searched publicly.",
    items: [
      {
        id: "seller-signup-draft",
        title: "Create a private seller signup",
        expected: "Seller confirms email and is taken toward the listing flow with a draft listing.",
        link: "/signup/private-seller",
      },
      {
        id: "agent-signup-profile",
        title: "Create or review an agent signup",
        expected: "Agent application appears in admin and can be approved/rejected.",
        link: "/signup/agent",
      },
      {
        id: "admin-listing-edit",
        title: "Open listing in admin editor",
        expected: "Admin can edit listing content, price, location, photos, and contact route.",
        link: "/admin/listings",
      },
      {
        id: "mia-ready-blocks",
        title: "Test Mia-ready publishing rules",
        expected: "Weak listings cannot publish until required fields are complete.",
        link: "/admin/listings",
      },
      {
        id: "public-search-filters",
        title: "Test public listing filters",
        expected: "Search, bedrooms, and max price filter active listings correctly up to R500,000,000.",
        link: "/listings",
      },
    ],
  },
  {
    id: "mia-nurture",
    title: "Mia Nurture and Handover",
    purpose: "Prove Mia can qualify leads, send follow-ups, receive buyer clicks, and prepare agent handover.",
    items: [
      {
        id: "pipeline-stage",
        title: "Check enquiry stage in Lead Pipeline",
        expected: "Enquiry appears in the correct stage with readiness and fit scores.",
        link: "/admin/pipeline",
      },
      {
        id: "send-mia-now",
        title: "Use Send Mia now",
        expected: "Manual follow-up sends or reports a useful error; event appears in timeline.",
        link: "/admin/pipeline",
      },
      {
        id: "buyer-click-response",
        title: "Click a Mia email response link",
        expected: "Buyer response is recorded and readiness/qualification update correctly.",
        link: "/admin/mia",
      },
      {
        id: "handover-pack",
        title: "Open and copy Agent Handover Pack",
        expected: "Pack contains buyer, listing, readiness, fit, finance, timeline, latest message, and contact route.",
        link: "/admin/pipeline",
      },
      {
        id: "won-lost-close",
        title: "Mark lead won and lost in test cases",
        expected: "Lead moves to correct pipeline column and nurture is completed.",
        link: "/admin/pipeline",
      },
    ],
  },
  {
    id: "email-preferences",
    title: "Email Preferences and Unsubscribe",
    purpose: "Confirm HeyMies respects email controls and keeps POPIA-sensitive operations tidy.",
    items: [
      {
        id: "preferences-page",
        title: "Open email preferences from email link",
        expected: "Preferences page loads using token and can update nurture/match options.",
        link: "/email-preferences",
      },
      {
        id: "unsubscribe-link",
        title: "Use unsubscribe link",
        expected: "Unsubscribe disables relevant email and System/Buyer Memory reflects preference state.",
        link: "/admin/users",
      },
      {
        id: "nurture-respects-preferences",
        title: "Check nurture respects unsubscribed buyer",
        expected: "Mia skips buyers whose nurture emails are disabled.",
        link: "/admin/health",
      },
    ],
  },
  {
    id: "matching",
    title: "Matching and Alerts",
    purpose: "Prove new active listings can generate match events and buyer alert emails.",
    items: [
      {
        id: "buyer-alert-create",
        title: "Create a buyer alert",
        expected: "Alert saves areas, property types, budget, bedrooms, and bathrooms.",
        link: "/dashboard/buyer/alerts",
      },
      {
        id: "matching-run",
        title: "Run matching from Quality Engine",
        expected: "Matcher checks listings and alerts; events/emails count is reported.",
        link: "/admin",
      },
      {
        id: "match-email-memory",
        title: "Check match event in Buyer Memory",
        expected: "Match appears with score, reasons, and sent/pending status.",
        link: "/admin/pipeline",
      },
    ],
  },
];

export default function AdminQAChecklist() {
  const [state, setState] = useState<QAState>(() => initialState());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState(), ...JSON.parse(raw) });
    } catch {
      setState(initialState());
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [loaded, state]);

  const summary = useMemo(() => {
    const items = SECTIONS.flatMap((section) => section.items);
    const counts = items.reduce(
      (acc, item) => {
        acc[state[item.id]?.status ?? "untested"] += 1;
        return acc;
      },
      { pass: 0, fail: 0, blocked: 0, untested: 0 } as Record<QAStatus, number>
    );
    const complete = counts.pass + counts.fail + counts.blocked;
    return {
      total: items.length,
      complete,
      percent: Math.round((complete / items.length) * 100),
      counts,
    };
  }, [state]);

  function setStatus(id: string, status: QAStatus) {
    setState((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? { note: "", updatedAt: null }),
        status,
        updatedAt: new Date().toISOString(),
      },
    }));
  }

  function setNote(id: string, note: string) {
    setState((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? { status: "untested", updatedAt: null }),
        note,
        updatedAt: new Date().toISOString(),
      },
    }));
  }

  function reset() {
    if (!window.confirm("Reset the QA checklist on this device?")) return;
    setState(initialState());
  }

  function exportReport() {
    const lines = [
      `HeyMies QA Report`,
      `Generated: ${new Date().toLocaleString("en-ZA")}`,
      `Progress: ${summary.complete}/${summary.total} (${summary.percent}%)`,
      `Pass: ${summary.counts.pass} / Fail: ${summary.counts.fail} / Blocked: ${summary.counts.blocked} / Untested: ${summary.counts.untested}`,
      "",
      ...SECTIONS.flatMap((section) => [
        section.title,
        "-".repeat(section.title.length),
        ...section.items.map((item) => {
          const row = state[item.id] ?? { status: "untested", note: "", updatedAt: null };
          return `${row.status.toUpperCase()} - ${item.title}\nExpected: ${item.expected}${row.note ? `\nNote: ${row.note}` : ""}`;
        }),
        "",
      ]),
    ];

    navigator.clipboard.writeText(lines.join("\n"));
  }

  return (
    <>
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">QA Progress</h2>
            <p className="mt-1 text-sm text-slate-600">
              Stored locally in this browser so you can retest after every deployment.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={exportReport}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Copy report
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="Complete" value={`${summary.percent}%`} tone="neutral" />
          <Metric label="Passed" value={summary.counts.pass} tone="good" />
          <Metric label="Failed" value={summary.counts.fail} tone="bad" />
          <Metric label="Blocked" value={summary.counts.blocked} tone="warn" />
          <Metric label="Untested" value={summary.counts.untested} tone="muted" />
        </div>
      </section>

      <section className="mt-8 space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{section.title}</h2>
                <p className="mt-1 max-w-3xl text-sm text-slate-600">{section.purpose}</p>
              </div>
              <SectionProgress section={section} state={state} />
            </div>

            <div className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200">
              {section.items.map((item) => {
                const row = state[item.id] ?? { status: "untested", note: "", updatedAt: null };
                return (
                  <div key={item.id} className="grid gap-4 bg-white p-4 lg:grid-cols-[1fr_340px]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill status={row.status} />
                        <h3 className="font-semibold">{item.title}</h3>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.expected}</p>
                      {item.link ? (
                        <Link
                          href={item.link}
                          className="mt-3 inline-flex text-sm font-semibold text-emerald-700"
                        >
                          Open test area
                        </Link>
                      ) : null}
                    </div>

                    <div className="grid gap-3">
                      <div className="grid grid-cols-4 gap-2">
                        <StatusButton status="pass" current={row.status} onClick={() => setStatus(item.id, "pass")} />
                        <StatusButton status="fail" current={row.status} onClick={() => setStatus(item.id, "fail")} />
                        <StatusButton status="blocked" current={row.status} onClick={() => setStatus(item.id, "blocked")} />
                        <StatusButton status="untested" current={row.status} onClick={() => setStatus(item.id, "untested")} />
                      </div>
                      <textarea
                        value={row.note}
                        onChange={(event) => setNote(item.id, event.target.value)}
                        placeholder="QA notes, bug link, production observation..."
                        className="min-h-20 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-slate-400"
                      />
                      {row.updatedAt ? (
                        <p className="text-xs text-slate-500">Updated {formatDate(row.updatedAt)}</p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}

function initialState(): QAState {
  return Object.fromEntries(
    SECTIONS.flatMap((section) => section.items).map((item) => [
      item.id,
      { status: "untested" as QAStatus, note: "", updatedAt: null },
    ])
  );
}

function SectionProgress({ section, state }: { section: QASection; state: QAState }) {
  const complete = section.items.filter((item) => (state[item.id]?.status ?? "untested") !== "untested").length;
  return (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
      {complete}/{section.items.length}
    </span>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "neutral" | "good" | "bad" | "warn" | "muted";
}) {
  const cls =
    tone === "good"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "bad"
        ? "border-red-200 bg-red-50 text-red-700"
        : tone === "warn"
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : tone === "muted"
            ? "border-slate-200 bg-slate-50 text-slate-700"
            : "border-sky-200 bg-sky-50 text-sky-800";
  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${cls}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function StatusButton({
  status,
  current,
  onClick,
}: {
  status: QAStatus;
  current: QAStatus;
  onClick: () => void;
}) {
  const active = status === current;
  const label =
    status === "pass" ? "Pass" : status === "fail" ? "Fail" : status === "blocked" ? "Block" : "Clear";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl border px-2 py-2 text-xs font-semibold",
        active ? statusClass(status) : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function StatusPill({ status }: { status: QAStatus }) {
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(status)}`}>
      {status === "untested" ? "Untested" : status}
    </span>
  );
}

function statusClass(status: QAStatus) {
  if (status === "pass") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "fail") return "border-red-200 bg-red-50 text-red-700";
  if (status === "blocked") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function formatDate(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
