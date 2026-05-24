export const dynamic = "force-dynamic";

import Link from "next/link";
import AdminQAChecklist from "./AdminQAChecklist";

export default function AdminQAPage() {
  return (
    <main className="tech-page text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/admin" className="text-sm font-semibold text-emerald-700">
              Back to admin
            </Link>
            <p className="tech-kicker mt-6">Production QA</p>
            <h1 className="mt-2 text-3xl font-semibold">HeyMies Launch Checklist</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Run these checks after deployments so signup, listing, Mia nurture, matching, and admin handover
              stay reliable when real users arrive.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/health" className="tech-button-secondary inline-flex rounded-xl px-4 py-2 text-sm font-semibold">
              System health
            </Link>
            <Link href="/admin/pipeline" className="tech-button-secondary inline-flex rounded-xl px-4 py-2 text-sm font-semibold">
              Lead pipeline
            </Link>
          </div>
        </div>

        <AdminQAChecklist />
      </div>
    </main>
  );
}
