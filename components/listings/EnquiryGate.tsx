"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Profile = {
  full_name?: string | null;
  phone?: string | null;
};

export default function EnquiryGate({ listingId }: { listingId: string }) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const pathname = usePathname();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");

  const [message, setMessage] = useState("");
  const [viewing, setViewing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<null | "created" | "updated">(null);
  const [qualificationStatus, setQualificationStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nextUrl = `${pathname}#enquire`;

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setIsLoggedIn(false);
        setCheckingAuth(false);
        return;
      }

      setIsLoggedIn(true);
      setProfileEmail(session.user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", session.user.id)
        .maybeSingle<Profile>();

      setProfileName(profile?.full_name || "");
      setProfilePhone(profile?.phone || "");
      setCheckingAuth(false);
    }

    load();
  }, [supabase]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError("Please log in to enquire about this property.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          listingId,
          message,
          request_viewing: viewing,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Something went wrong.");
      }

      setDone(json.mode === "updated" ? "updated" : "created");
      setQualificationStatus(json.qualification_status ?? null);
      setMessage("");
      setViewing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-600">Loading enquiry options...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">
          Log in to enquire about this property
        </h3>

        <p className="mt-2 text-sm text-slate-600">
          Create an account or log in to request more information, book a viewing,
          and track your enquiries in one place.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/login?next=${encodeURIComponent(nextUrl)}`}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Log In
          </Link>

          <Link
            href={`/signup/buyer?next=${encodeURIComponent(nextUrl)}`}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  if (done === "created") {
    const agentReady = qualificationStatus === "agent_ready";

    return (
      <div className="rounded-2xl border border-emerald-200 bg-white p-5">
        <h3 className="text-base font-semibold text-slate-900">
          Enquiry sent
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          {agentReady
            ? "Your enquiry has been qualified and sent to the agent. They should contact you soon."
            : "Your enquiry has been received. HeyMies is checking your buyer profile and will guide the next step."}
        </p>
      </div>
    );
  }

  if (done === "updated") {
    const agentReady = qualificationStatus === "agent_ready";

    return (
      <div className="rounded-2xl border border-emerald-200 bg-white p-5">
        <h3 className="text-base font-semibold text-slate-900">
          Enquiry updated
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          {agentReady
            ? "Your updated enquiry has been qualified and sent to the agent again."
            : "Your enquiry has been updated. HeyMies will keep helping you move toward an agent-ready handover."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-900">
          Request more information
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Your account details will be used automatically. Add your message below and send your enquiry directly to the agent.
        </p>
      </div>

      <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <div><span className="font-medium">Name:</span> {profileName || "Not set yet"}</div>
        <div className="mt-1"><span className="font-medium">Email:</span> {profileEmail || "Not set yet"}</div>
        <div className="mt-1"><span className="font-medium">Phone:</span> {profilePhone || "Not set yet"}</div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="message"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hi, I’m interested in this property and would like more information."
            rows={5}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
          />
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={viewing}
            onChange={(e) => setViewing(e.target.checked)}
            className="mt-1"
          />
          <span>I would like the agent to contact me to arrange a viewing.</span>
        </label>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Sending enquiry..." : "Send Enquiry"}
        </button>
      </form>
    </div>
  );
}
