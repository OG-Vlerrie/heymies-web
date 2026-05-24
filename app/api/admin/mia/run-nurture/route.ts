import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = process.env.NURTURE_JOB_SECRET || process.env.CRON_SECRET;

  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "NURTURE_JOB_SECRET or CRON_SECRET is not configured." },
      { status: 500 }
    );
  }

  const origin = requestOrigin(req);
  const res = await fetch(`${origin}/api/nurture/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({ limit: 50 }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json(
      { ok: false, error: data?.error ?? "Mia nurture run failed." },
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
