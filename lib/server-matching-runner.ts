import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/api-error-logging";

export async function runMatchingJob(
  req: NextRequest,
  body: { listingId?: string; minScore?: number; sendEmails?: boolean }
) {
  const secret = process.env.MATCHING_JOB_SECRET?.trim();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (secret) headers["x-matching-secret"] = secret;

  let res: Response;
  try {
    res = await fetch(`${requestOrigin(req)}/api/matching/run`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (error) {
    await logApiError({
      req,
      route: new URL(req.url).pathname,
      status: 502,
      error,
      metadata: {
        proxiedRoute: "/api/matching/run",
        listingId: body.listingId ?? null,
      },
    });

    return NextResponse.json(
      { ok: false, error: "Could not reach matching job." },
      { status: 502 }
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data?.ok === false) {
    await logApiError({
      req,
      route: new URL(req.url).pathname,
      status: res.status,
      error: data?.error ?? "Matching run failed.",
      metadata: {
        proxiedRoute: "/api/matching/run",
        listingId: body.listingId ?? null,
      },
    });

    return NextResponse.json(
      { ok: false, error: data?.error ?? "Matching run failed." },
      { status: res.ok ? 500 : res.status }
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
