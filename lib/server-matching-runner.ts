import { NextRequest, NextResponse } from "next/server";

export async function runMatchingJob(
  req: NextRequest,
  body: { listingId?: string; minScore?: number; sendEmails?: boolean }
) {
  const secret = process.env.MATCHING_JOB_SECRET?.trim();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (secret) headers["x-matching-secret"] = secret;

  const res = await fetch(`${requestOrigin(req)}/api/matching/run`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json(
      { ok: false, error: data?.error ?? "Matching run failed." },
      { status: res.status }
    );
  }

  return NextResponse.json(data);
}

function requestOrigin(req: NextRequest) {
  const url = new URL(req.url);
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");

  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  return url.origin;
}
