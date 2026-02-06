"use client";

import { useState } from "react";

export default function AgentOnboardingForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMsg("");

    try {
      const res = await fetch("/api/agents/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name,
          email,
          source: "onboarding-agent",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setStatus("error");
        setMsg(data?.error || "Something went wrong.");
        return;
      }

      setStatus("ok");
      setMsg("Application received.");
      setEmail("");
      setName("");
    } catch {
      setStatus("error");
      setMsg("Network error.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full name"
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
      />
      <button
        disabled={status === "loading"}
        className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
      >
        {status === "loading" ? "Submitting..." : "Submit"}
      </button>

      {msg ? (
        <p className={`text-sm ${status === "ok" ? "text-emerald-700" : "text-red-600"}`}>
          {msg}
        </p>
      ) : null}
    </form>
  );
}
