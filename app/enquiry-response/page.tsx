import Link from "next/link";

const ACTION_COPY: Record<string, string> = {
  finance_ready:
    "Thanks. I have marked your finance, deposit, or cash position as stronger for this enquiry.",
  needs_preapproval:
    "Thanks. I have noted that pre-approval help may be useful before agent handover.",
  wants_viewing:
    "Thanks. I have marked that you would like to arrange a viewing.",
  still_comparing:
    "Thanks. I have noted that you are still comparing options.",
  better_matches:
    "Thanks. I have noted that you would prefer better-fit matches.",
};

export default function EnquiryResponsePage({
  searchParams,
}: {
  searchParams?: { result?: string; action?: string; status?: string };
}) {
  const result = searchParams?.result;
  const action = searchParams?.action ?? "";
  const status = searchParams?.status ?? "";
  const isRecorded = result === "recorded";

  return (
    <main className="tech-page text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="tech-panel rounded-3xl p-6">
          <p className="tech-kicker">Mia from HeyMies</p>
          <h1 className="mt-3 text-3xl font-semibold">
            {isRecorded ? "Got it, thank you." : "This link could not be used."}
          </h1>

          <p className="mt-3 text-slate-700">
            {isRecorded
              ? ACTION_COPY[action] ?? "Thanks. I have recorded your response."
              : "The response link may be invalid or expired. You can still log in and enquire again from the listing."}
          </p>

          {isRecorded && status === "agent_ready" ? (
            <p className="mt-3 text-sm text-slate-600">
              This now looks ready for an agent conversation, so the agent can
              follow up with you.
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/buyer"
              className="tech-button-primary rounded-xl px-4 py-2 text-center font-semibold"
            >
              Go to buyer dashboard
            </Link>
            <Link
              href="/listings"
              className="tech-button-secondary rounded-xl px-4 py-2 text-center font-semibold"
            >
              Browse listings
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
