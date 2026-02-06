"use client";

import { useState } from "react";

export default function LeadForm({ source = "homepage-cta" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMsg("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        setStatus("error");
        setMsg(data?.error || "Something went wrong.");
        return;
      }

      setStatus("ok");
      setMsg("Added. We’ll be in touch.");
      setEmail("");
    } catch {
      setStatus("error");
      setMsg("Network error.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-sm space-y-3">
      <input
        placeholder="Email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-xl px-4 py-3 text-slate-900 outline-none ring-1 ring-white/20 focus:ring-2 focus:ring-emerald-400"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
      >
        {status === "loading" ? "Saving..." : "Request access"}
      </button>

      {msg ? (
        <p className={`text-sm ${status === "ok" ? "text-emerald-200" : "text-red-200"}`}>
          {msg}
        </p>
      ) : null}
    </form>
  );
}
