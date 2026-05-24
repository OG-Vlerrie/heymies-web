"use client";

import { useState } from "react";

type Props = {
  enquiryId: string;
  initialStatus: string | null;
  initialQualificationStatus: string | null;
  initialNurtureStatus: string | null;
};

export default function AdminEnquiryActions({
  enquiryId,
  initialStatus,
  initialQualificationStatus,
  initialNurtureStatus,
}: Props) {
  const [status, setStatusValue] = useState(initialStatus ?? "new");
  const [qualificationStatus, setQualificationStatusValue] = useState(
    initialQualificationStatus ?? "needs_confirmation"
  );
  const [nurtureStatus, setNurtureStatusValue] = useState(initialNurtureStatus ?? "pending");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function update(payload: Record<string, string>) {
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: enquiryId, ...payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to update enquiry.");

      if (payload.status) setStatusValue(payload.status);
      if (payload.qualification_status) setQualificationStatusValue(payload.qualification_status);
      if (payload.nurture_status) setNurtureStatusValue(payload.nurture_status);
      setMessage("Updated.");
    } catch (e: any) {
      setError(e?.message ?? "Failed to update enquiry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Admin Actions</h2>
      <p className="mt-1 text-sm text-slate-600">
        Adjust handover status, qualification, or Mia nurture without impersonating the owner.
      </p>

      {message ? <p className="mt-4 text-sm font-semibold text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}

      <div className="mt-5 grid gap-5">
        <ActionGroup
          title={`Lead status: ${status}`}
          disabled={busy}
          actions={[
            ["new", "New"],
            ["contacted", "Contacted"],
            ["qualified", "Qualified"],
            ["viewing", "Viewing"],
            ["offer", "Offer"],
            ["won", "Won"],
            ["lost", "Lost"],
          ]}
          onPick={(next) => update({ status: next })}
        />

        <ActionGroup
          title={`Qualification: ${qualificationStatus.replaceAll("_", " ")}`}
          disabled={busy}
          actions={[
            ["agent_ready", "Agent-ready"],
            ["needs_confirmation", "Needs confirmation"],
            ["needs_finance_nurture", "Finance nurture"],
            ["nurture_for_better_fit", "Better fit"],
            ["not_ready", "Not ready"],
          ]}
          onPick={(next) => update({ qualification_status: next })}
        />

        <ActionGroup
          title={`Mia nurture: ${nurtureStatus}`}
          disabled={busy}
          actions={[
            ["pending", "Pending"],
            ["nurturing", "Resume"],
            ["paused", "Pause"],
            ["completed", "Complete"],
          ]}
          onPick={(next) => update({ nurture_status: next })}
        />
      </div>
    </section>
  );
}

function ActionGroup({
  title,
  actions,
  disabled,
  onPick,
}: {
  title: string;
  actions: [string, string][];
  disabled: boolean;
  onPick: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {actions.map(([value, label]) => (
          <button
            key={value}
            type="button"
            disabled={disabled}
            onClick={() => onPick(value)}
            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
