"use client";

import { useState } from "react";
import { event as gaEvent } from "@/lib/marketing/ga";
import { track } from "@/lib/marketing/metaPixel";

type Status = "idle" | "loading" | "ok" | "error";

const agencySizes = ["1-5", "6-20", "21-50", "50+"];
const requestTypes = [
  "Product demo",
  "Pricing discussion",
  "Workflow advice",
  "Partnership",
  "Other",
];

export default function DemoRequestForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [city, setCity] = useState("");
  const [agencySize, setAgencySize] = useState(agencySizes[1]);
  const [requestType, setRequestType] = useState(requestTypes[0]);
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [notice, setNotice] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setNotice("");

    const demoMessage = [
      `Agency: ${agencyName || "-"}`,
      `Phone: ${phone || "-"}`,
      `City: ${city || "-"}`,
      `Agency size: ${agencySize}`,
      `Request type: ${requestType}`,
      `Website: ${website || "-"}`,
      "",
      message || "No extra notes provided.",
    ].join("\n");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          city,
          agency_name: agencyName,
          message: demoMessage,
          source: "landing-demo-form",
          lead_source: getDemoLeadSource(),
          tag: "demo",
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.ok) {
        setStatus("error");
        setNotice(data?.error || "Could not send your demo request.");
        return;
      }

      setStatus("ok");
      setNotice("Demo request received. We'll come back with next steps soon.");
      track("Lead", {
        content_name: "Demo request",
        content_category: "agent_demo",
        request_type: requestType,
        agency_size: agencySize,
      });
      gaEvent("generate_lead", {
        source: getDemoLeadSource(),
      });
      setFullName("");
      setEmail("");
      setPhone("");
      setAgencyName("");
      setCity("");
      setAgencySize(agencySizes[1]);
      setRequestType(requestTypes[0]);
      setWebsite("");
      setMessage("");
    } catch {
      setStatus("error");
      setNotice("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Name
          <input
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="tech-input w-full rounded-xl px-4 py-3 text-sm text-slate-950"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Work email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="tech-input w-full rounded-xl px-4 py-3 text-sm text-slate-950"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Phone
          <input
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="tech-input w-full rounded-xl px-4 py-3 text-sm text-slate-950"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          City
          <input
            type="text"
            autoComplete="address-level2"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="tech-input w-full rounded-xl px-4 py-3 text-sm text-slate-950"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Agency name
        <input
          type="text"
          autoComplete="organization"
          required
          value={agencyName}
          onChange={(event) => setAgencyName(event.target.value)}
          className="tech-input w-full rounded-xl px-4 py-3 text-sm text-slate-950"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Agency size
          <select
            value={agencySize}
            onChange={(event) => setAgencySize(event.target.value)}
            className="tech-input w-full rounded-xl px-4 py-3 text-sm text-slate-950"
          >
            {agencySizes.map((size) => (
              <option key={size} value={size}>
                {size} agents
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          What are you looking for?
          <select
            value={requestType}
            onChange={(event) => setRequestType(event.target.value)}
            className="tech-input w-full rounded-xl px-4 py-3 text-sm text-slate-950"
          >
            {requestTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Website
        <input
          type="url"
          autoComplete="url"
          placeholder="https://"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          className="tech-input w-full rounded-xl px-4 py-3 text-sm text-slate-950"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Goals or meeting notes
        <textarea
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Tell us what your team wants to improve."
          className="tech-input w-full rounded-xl px-4 py-3 text-sm text-slate-950"
        />
      </label>

      <button
        type="submit"
        disabled={status === "loading"}
        className="tech-button-primary mt-2 rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-60"
      >
        {status === "loading" ? "Sending..." : "Request demo"}
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

function getDemoLeadSource() {
  if (typeof window === "undefined") return "homepage-demo-form";

  const source = new URLSearchParams(window.location.search).get("source");
  return source || "homepage-demo-form";
}
