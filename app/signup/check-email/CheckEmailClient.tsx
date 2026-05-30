"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function CheckEmailClient() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const next = searchParams.get("next");
  const role = searchParams.get("role");
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    if (next) {
      localStorage.setItem("auth_redirect_after_verify", next);
    }
  }, [next]);

  const loginHref = useMemo(() => {
    const params = new URLSearchParams();
    if (next) params.set("next", next);
    if (role) params.set("role", role);
    const query = params.toString();
    return `/login${query ? `?${query}` : ""}`;
  }, [next, role]);

  function confirmationRedirect() {
    const params = new URLSearchParams();
    if (next) params.set("next", next);
    if (role) params.set("role", role);
    const query = params.toString();
    return `${window.location.origin}/login${query ? `?${query}` : ""}`;
  }

  async function resendConfirmation() {
    if (!email) {
      setResendStatus("error");
      setResendMessage("Enter your email again on signup so we can send a new confirmation link.");
      return;
    }

    setResendStatus("sending");
    setResendMessage(null);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: confirmationRedirect(),
      },
    });

    if (error) {
      setResendStatus("error");
      setResendMessage(error.message);
      return;
    }

    setResendStatus("sent");
    setResendMessage("Confirmation email sent again. Please check your inbox and spam folder.");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="tech-panel rounded-3xl p-6">
        <p className="tech-kicker">Confirm account</p>
        <h1 className="mt-2 text-3xl font-semibold">Check your email</h1>

        <p className="mt-3 text-slate-700">
          {email ? (
            <>
              We sent a confirmation link to{" "}
              <span className="font-semibold">{email}</span>.
            </>
          ) : (
            <>We sent a confirmation link to your email address.</>
          )}
        </p>

        <p className="mt-3 text-sm text-slate-600">
          Once you confirm your email, return here and log in to continue. If
          you do not see the email, please check your spam or junk folder.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-4">
          <p className="text-sm font-semibold text-slate-800">Did not receive it?</p>
          <p className="mt-1 text-sm text-slate-600">
            Send a fresh confirmation link to the same address.
          </p>
          <button
            type="button"
            onClick={resendConfirmation}
            disabled={resendStatus === "sending"}
            className="mt-4 tech-button-secondary rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {resendStatus === "sending" ? "Sending..." : "Resend confirmation"}
          </button>
          {resendMessage ? (
            <p
              className={`mt-3 text-sm ${
                resendStatus === "error" ? "text-red-600" : "text-emerald-700"
              }`}
            >
              {resendMessage}
            </p>
          ) : null}
        </div>

        <div className="mt-8 flex gap-3">
          <Link
            href={loginHref}
            className="tech-button-primary rounded-xl px-4 py-2 font-semibold"
          >
            Go to login
          </Link>

          <Link
            href="/"
            className="tech-button-secondary rounded-xl px-4 py-2 font-semibold"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
