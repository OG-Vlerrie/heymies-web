"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CheckEmailPage() {
  const search = useSearchParams();
  const role = search.get("role") ?? "buyer";

  const next =
    role === "buyer"
      ? "/dashboard/buyer/profile"
      : role === "agent"
      ? "/dashboard"
      : "/dashboard";

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold">Check your email</h1>
          <p className="mt-3 text-slate-600">
            We’ve sent you a confirmation link. Open it to verify your email, then log in to finish setup.
          </p>

          <div className="mt-8 space-y-3">
            <Link
              href={`/login?next=${encodeURIComponent(next)}`}
              className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
            >
              I’ve confirmed — take me to login
            </Link>

            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm hover:bg-slate-50"
            >
              Go to login
            </Link>
          </div>

          <div className="mt-8 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold">Didn’t get the email?</p>
            <ul className="mt-2 list-disc pl-5 text-slate-600">
              <li>Check spam/junk</li>
              <li>Wait 1–2 minutes and refresh</li>
              <li>Make sure the email address is correct</li>
            </ul>
          </div>

          <p className="mt-6 text-sm text-slate-600">
            Back to{" "}
            <Link className="text-emerald-700 underline" href="/">
              home
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}