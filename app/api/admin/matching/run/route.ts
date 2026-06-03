import { NextRequest } from "next/server";
import { runMatchingJob } from "@/lib/server-matching-runner";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  return runMatchingJob(req, {
    listingId: typeof body?.listingId === "string" ? body.listingId : undefined,
    minScore: Number.isFinite(Number(body?.minScore)) ? Number(body.minScore) : 55,
    sendEmails: body?.sendEmails !== false,
  });
}
