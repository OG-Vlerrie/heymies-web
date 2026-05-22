import { Suspense } from "react";
import CheckEmailClient from "./CheckEmailClient";

export default function CheckEmailPage() {
  return (
    <main className="tech-page text-slate-900">
      <Suspense
        fallback={<div className="mx-auto max-w-2xl px-4 py-16">Loading…</div>}
      >
        <CheckEmailClient />
      </Suspense>
    </main>
  );
}
