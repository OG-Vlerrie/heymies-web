"use client";

import { useMemo, useState } from "react";

export default function AdminHandoverPack({ pack }: { pack: string }) {
  const [copied, setCopied] = useState(false);
  const preview = useMemo(() => pack.trim(), [pack]);

  async function copy() {
    await navigator.clipboard.writeText(preview);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Agent Handover Pack</h2>
          <p className="mt-1 text-sm text-slate-600">
            Copy this into WhatsApp, email, or your agent notes when a lead is ready.
          </p>
        </div>
        <button
          type="button"
          onClick={copy}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          {copied ? "Copied" : "Copy pack"}
        </button>
      </div>
      <pre className="mt-5 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-800">
        {preview}
      </pre>
    </section>
  );
}
