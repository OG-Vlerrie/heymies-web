"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "ok" | "error";

export default function ContactForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [notice, setNotice] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setNotice("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          message,
          source: "contact-page",
          tag: "contact",
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.ok) {
        setStatus("error");
        setNotice(data?.error || "Could not send your message.");
        return;
      }

      setStatus("ok");
      setNotice("Message received. We'll come back to you soon.");
      setFullName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
      setNotice("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <input
        type="text"
        placeholder="Full name"
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        className="tech-input w-full rounded-xl px-4 py-3 text-sm"
      />
      <input
        type="email"
        placeholder="Email address"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="tech-input w-full rounded-xl px-4 py-3 text-sm"
      />
      <textarea
        placeholder="Your message"
        rows={5}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        className="tech-input w-full rounded-xl px-4 py-3 text-sm"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="tech-button-primary mt-2 rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-60"
      >
        {status === "loading" ? "Sending..." : "Send message"}
      </button>
      {notice ? (
        <p
          className={`text-sm ${
            status === "ok" ? "text-emerald-700" : "text-red-600"
          }`}
        >
          {notice}
        </p>
      ) : null}
    </form>
  );
}
