import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse, logApiError } from "@/lib/api-error-logging";

export async function POST(req: NextRequest) {
  const secret = process.env.NURTURE_JOB_SECRET || process.env.CRON_SECRET;

  if (!secret) {
    return apiErrorResponse({
      req,
      route: "/api/admin/mia/run-nurture",
      status: 500,
      error: "NURTURE_JOB_SECRET or CRON_SECRET is not configured.",
      publicMessage: "Mia nurture job secret is not configured.",
      metadata: { stage: "configuration" },
    });
  }

  const origin = requestOrigin(req);
  let res: Response;
  try {
    res = await fetch(`${origin}/api/nurture/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ limit: 50 }),
      cache: "no-store",
    });
  } catch (error) {
    return apiErrorResponse({
      req,
      route: "/api/admin/mia/run-nurture",
      status: 502,
      error,
      publicMessage: "Could not reach Mia nurture job.",
      metadata: { proxiedRoute: "/api/nurture/run", origin },
    });
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data?.ok === false) {
    await logApiError({
      req,
      route: "/api/admin/mia/run-nurture",
      status: res.status || 500,
      error: data?.error ?? "Mia nurture run failed.",
      metadata: { proxiedRoute: "/api/nurture/run", details: data },
    });

    return NextResponse.json(
      { ok: false, error: data?.error ?? "Mia nurture run failed." },
      { status: res.ok ? 500 : res.status || 500 }
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
