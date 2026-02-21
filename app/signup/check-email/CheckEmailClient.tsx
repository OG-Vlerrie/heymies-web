"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CheckEmailClient() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email"); // optional

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Check your email</h1>

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

      <div className="mt-8 flex gap-3">
        <Link
          href="/login"
          className="rounded-xl bg-emerald-600 px-4 py-2 text-white font-semibold hover:bg-emerald-700"
        >
          Go to login
        </Link>

        <Link
          href="/"
          className="rounded-xl border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-50"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}