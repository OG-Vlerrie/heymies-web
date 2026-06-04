import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type ApiErrorInput = {
  req?: Request;
  route?: string;
  status?: number;
  error: unknown;
  userId?: string | null;
  metadata?: Record<string, unknown>;
};

export function apiErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  return "Unexpected API error";
}

export function apiErrorCode(error: unknown) {
  if (typeof error === "object" && error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string" && code.trim()) return code;
  }

  return null;
}

export async function logApiError({
  req,
  route,
  status = 500,
  error,
  userId,
  metadata = {},
}: ApiErrorInput) {
  const url = req ? new URL(req.url) : null;

  try {
    const { error: insertError } = await supabaseAdmin().from("api_error_events").insert({
      route: route ?? url?.pathname ?? "unknown",
      method: req?.method ?? "UNKNOWN",
      status,
      error_message: apiErrorMessage(error),
      error_code: apiErrorCode(error),
      user_id: userId ?? null,
      request_id: req?.headers.get("x-vercel-id") ?? req?.headers.get("x-request-id"),
      user_agent: req?.headers.get("user-agent"),
      ip_address:
        req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        req?.headers.get("x-real-ip"),
      metadata,
    });

    if (insertError) {
      console.error("Failed to record API error event:", insertError.message);
    }
  } catch (loggingError) {
    console.error("Failed to record API error event:", loggingError);
  }
}

export async function apiErrorResponse({
  req,
  route,
  status = 500,
  error,
  userId,
  metadata,
  publicMessage,
}: ApiErrorInput & { publicMessage?: string }) {
  await logApiError({ req, route, status, error, userId, metadata });

  return NextResponse.json(
    { ok: false, error: publicMessage ?? apiErrorMessage(error) },
    { status }
  );
}
