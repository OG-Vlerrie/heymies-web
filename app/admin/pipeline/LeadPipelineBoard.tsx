"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PipelineEnquiry } from "./page";

type StageKey =
  | "new"
  | "needs_confirmation"
  | "finance"
  | "better_fit"
  | "agent_ready"
  | "paused"
  | "won"
  | "lost";

const STAGES: { key: StageKey; title: string; hint: string }[] = [
  { key: "new", title: "New", hint: "Fresh enquiries awaiting a first decision." },
  { key: "needs_confirmation", title: "Needs Confirmation", hint: "Mia should check intent before handover." },
  { key: "finance", title: "Finance Nurture", hint: "Good fit, but finance needs clarity." },
  { key: "better_fit", title: "Better-Fit Nurture", hint: "Buyer may need better matched listings." },
  { key: "agent_ready", title: "Agent-Ready", hint: "Ready for owner or agent action." },
  { key: "paused", title: "Paused", hint: "Mia is not currently following up." },
  { key: "won", title: "Won", hint: "Successful outcome." },
  { key: "lost", title: "Lost", hint: "Closed without a win." },
];

export default function LeadPipelineBoard({
  initialEnquiries,
  eventCounts,
}: {
  initialEnquiries: PipelineEnquiry[];
  eventCounts: Record<string, number>;
}) {
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const search = q.trim().toLowerCase();
    const next = Object.fromEntries(STAGES.map((stage) => [stage.key, [] as PipelineEnquiry[]])) as Record<
      StageKey,
      PipelineEnquiry[]
    >;

    enquiries
      .filter((enquiry) => {
        if (!search) return true;
        return [
          enquiry.full_name ?? "",
          enquiry.email ?? "",
          enquiry.phone ?? "",
          enquiry.latest_message ?? "",
          enquiry.qualification_summary ?? "",
          enquiry.next_action ?? "",
          enquiry.listing?.title ?? "",
          enquiry.listing?.suburb ?? "",
          enquiry.listing?.city ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(search);
      })
      .forEach((enquiry) => {
        next[stageFor(enquiry)].push(enquiry);
      });

    return next;
  }, [enquiries, q]);

  async function updateEnquiry(id: string, payload: Record<string, string>) {
    setBusyId(id);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to update lead.");

      if (payload.action !== "send_followup_now") {
        setEnquiries((prev) =>
          prev.map((enquiry) =>
            enquiry.id === id
              ? {
                  ...enquiry,
                  ...payload,
                  agent_ready_at:
                    payload.qualification_status === "agent_ready"
                      ? new Date().toISOString()
                      : enquiry.agent_ready_at,
                  next_nurture_at:
                    payload.nurture_status === "paused" ||
                    payload.nurture_status === "completed" ||
                    payload.qualification_status === "agent_ready"
                      ? null
                      : payload.nurture_status === "nurturing"
                        ? new Date().toISOString()
                        : enquiry.next_nurture_at,
                }
              : enquiry
          )
        );
      }
      setMessage(
        payload.action === "send_followup_now"
          ? `Mia follow-up sent (${data?.nurture?.sent ?? 0}).`
          : "Pipeline updated."
      );
    } catch (e: any) {
      setError(e?.message ?? "Failed to update lead.");
    } finally {
      setBusyId(null);
    }
  }

  async function addNote(id: string, note: string) {
    const trimmed = note.trim();
    if (!trimmed) return;

    setBusyId(id);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, internal_note: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to add note.");
      setMessage("Note added.");
    } catch (e: any) {
      setError(e?.message ?? "Failed to add note.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mt-8">
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Working Board</h2>
          <p className="mt-1 text-sm text-slate-600">
            Use quick actions for obvious moves, or open a lead for full context.
          </p>
        </div>
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search buyer, listing, area, message..."
          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400 lg:w-96"
        />
      </div>

      {message ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 overflow-x-auto pb-4">
        <div className="grid min-w-[1420px] grid-cols-8 gap-4">
          {STAGES.map((stage) => (
            <div key={stage.key} className="rounded-3xl border border-slate-200 bg-white/85 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{stage.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{stage.hint}</p>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">
                  {grouped[stage.key].length}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {grouped[stage.key].map((enquiry) => (
                  <LeadCard
                    key={enquiry.id}
                    enquiry={enquiry}
                    busy={busyId === enquiry.id}
                    eventCount={eventCounts[enquiry.id] ?? 0}
                    onUpdate={(payload) => updateEnquiry(enquiry.id, payload)}
                    onNote={(note) => addNote(enquiry.id, note)}
                  />
                ))}
                {grouped[stage.key].length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                    Nothing here.
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LeadCard({
  enquiry,
  busy,
  eventCount,
  onUpdate,
  onNote,
}: {
  enquiry: PipelineEnquiry;
  busy: boolean;
  eventCount: number;
  onUpdate: (payload: Record<string, string>) => void;
  onNote: (note: string) => void;
}) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  const buyerName = enquiry.full_name || enquiry.email || "Unnamed buyer";
  const due = enquiry.next_nurture_at && new Date(enquiry.next_nurture_at).getTime() <= Date.now();

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/admin/enquiries/${enquiry.id}`}
            className="block truncate font-semibold text-slate-900 underline-offset-4 hover:underline"
          >
            {buyerName}
          </Link>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
            {enquiry.listing?.title ?? "Listing"} /{" "}
            {[enquiry.listing?.suburb, enquiry.listing?.city].filter(Boolean).join(", ") || "Area pending"}
          </p>
        </div>
        {due ? (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">
            Due
          </span>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <MiniMetric label="Ready" value={`${enquiry.readiness_score ?? 0}/100`} />
        <MiniMetric label="Fit" value={`${enquiry.property_fit_score ?? 0}%`} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
        <Pill>{(enquiry.qualification_status ?? "needs_confirmation").replaceAll("_", " ")}</Pill>
        <Pill>{enquiry.nurture_status ?? "pending"}</Pill>
        <Pill>{eventCount} events</Pill>
      </div>

      {enquiry.next_action ? (
        <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-700">{enquiry.next_action}</p>
      ) : null}

      <div className="mt-4 grid gap-2">
        <button
          disabled={busy}
          onClick={() =>
            onUpdate({
              qualification_status: "agent_ready",
              nurture_status: "handover_ready",
              status: "qualified",
            })
          }
          className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          Mark agent-ready
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            disabled={busy}
            onClick={() => onUpdate({ nurture_status: "paused" })}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"
          >
            Pause Mia
          </button>
          <button
            disabled={busy}
            onClick={() => onUpdate({ nurture_status: "nurturing" })}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"
          >
            Resume
          </button>
        </div>
        <button
          disabled={busy}
          onClick={() => onUpdate({ action: "send_followup_now" })}
          className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-100 disabled:opacity-60"
        >
          Send Mia now
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            disabled={busy}
            onClick={() => onUpdate({ status: "won", nurture_status: "completed" })}
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 disabled:opacity-60"
          >
            Won
          </button>
          <button
            disabled={busy}
            onClick={() => onUpdate({ status: "lost", nurture_status: "completed" })}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"
          >
            Lost
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setNoteOpen((value) => !value)}
        className="mt-3 text-xs font-semibold text-emerald-700"
      >
        {noteOpen ? "Close note" : "Add internal note"}
      </button>

      {noteOpen ? (
        <div className="mt-3">
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="min-h-20 w-full rounded-xl border border-slate-200 p-3 text-xs"
            placeholder="Private admin note..."
          />
          <button
            type="button"
            disabled={busy || !note.trim()}
            onClick={() => {
              onNote(note);
              setNote("");
              setNoteOpen(false);
            }}
            className="mt-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"
          >
            Save note
          </button>
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-slate-500">
        <span>{enquiry.last_enquired_at ? formatDate(enquiry.last_enquired_at) : "No date"}</span>
        <span className="flex gap-2">
          {enquiry.user_id ? (
            <Link href={`/admin/buyers/${enquiry.user_id}`} className="font-semibold text-slate-700 underline">
              Memory
            </Link>
          ) : null}
          <Link href={`/admin/enquiries/${enquiry.id}`} className="font-semibold text-slate-700 underline">
            Details
          </Link>
        </span>
      </div>
    </article>
  );
}

function stageFor(enquiry: PipelineEnquiry): StageKey {
  if (enquiry.status === "won") return "won";
  if (enquiry.status === "lost") return "lost";
  if (enquiry.nurture_status === "paused") return "paused";
  if (enquiry.qualification_status === "agent_ready" || enquiry.nurture_status === "handover_ready") {
    return "agent_ready";
  }
  if (enquiry.qualification_status === "needs_finance_nurture") return "finance";
  if (enquiry.qualification_status === "nurture_for_better_fit") return "better_fit";
  if (enquiry.status === "new") return "new";
  return "needs_confirmation";
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="font-semibold text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-600">
      {children}
    </span>
  );
}

function formatDate(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
