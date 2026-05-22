"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function CheckEmailClient() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const next = searchParams.get("next");

  useEffect(() => {
    if (next) {
      localStorage.setItem("auth_redirect_after_verify", next);
    }
  }, [next]);

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
          Once you confirm your email, return here and log in to continue.
        </p>

        <div className="mt-8 flex gap-3">
          <Link
            href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
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
