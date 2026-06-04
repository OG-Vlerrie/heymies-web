import { NextResponse } from "next/server";
import { apiErrorResponse, logApiError } from "@/lib/api-error-logging";
import { sendDemoLeadEmails } from "@/lib/email/sendDemoLeadEmails";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body?.email ?? "").toString().trim().toLowerCase();
    const source = (body?.source ?? "website").toString();
    const leadSource = (body?.lead_source ?? body?.source_detail ?? source).toString();
    const fullName = (body?.full_name ?? body?.name ?? "").toString().trim();
    const agencyName = (body?.agency_name ?? body?.agencyName ?? "").toString().trim();
    const phone = (body?.phone ?? "").toString().trim();
    const city = (body?.city ?? "").toString().trim();
    const message = (body?.message ?? "").toString().trim();
    const tag = (body?.tag ?? "").toString().trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "Invalid email" },
        { status: 400 }
      );
    }

    let supabase;
    try {
      supabase = supabaseAdmin();
    } catch (error) {
      console.error("Lead API misconfigured:", error);
      return apiErrorResponse({
        req,
        route: "/api/leads",
        status: 500,
        error,
        publicMessage: "Server misconfigured. Please try again later.",
      });
    }

    if (shouldAttemptLeadStorage(source)) {
      const dbError = await saveLead(supabase, {
        email,
        source,
        tag: tag || (source.includes("contact") ? "contact" : null),
      });

      if (dbError) {
        await logApiError({
          req,
          route: "/api/leads",
          status: 500,
          error: dbError,
          metadata: { email, source },
        });

        if (!canContinueWithoutLeadStorage(dbError)) {
          return NextResponse.json(
            { ok: false, error: "DB error" },
            { status: 500 }
          );
        }
      }
    }

    const isDemoRequest = tag === "demo" || source.includes("demo");

    if (isDemoRequest) {
      try {
        const emailResult = await sendDemoLeadEmails({
          name: fullName,
          agencyName,
          email,
          phone,
          city,
          message,
          source: leadSource,
        });

        if (!emailResult.ok) {
          console.error("Failed to send demo lead email:", emailResult.errors);
          await logApiError({
            req,
            route: "/api/leads",
            status: 502,
            error: new Error("Failed to send demo lead email"),
            metadata: { stage: "demo-email", email, source: leadSource, errors: emailResult.errors },
          });
        }
      } catch (emailError) {
        console.error("Failed to send demo lead email:", emailError);
        await logApiError({
          req,
          route: "/api/leads",
          status: 502,
          error: emailError,
          metadata: { stage: "demo-email", email, source: leadSource },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Lead API error:", error);
    return apiErrorResponse({
      req,
      route: "/api/leads",
      status: 400,
      error,
      publicMessage: "Bad request",
    });
  }
}

async function saveLead(
  supabase: ReturnType<typeof supabaseAdmin>,
  lead: { email: string; source: string; tag: string | null }
) {
  const upsertResult = await writeLead(supabase, lead, "upsert");
  if (!upsertResult.error) return null;

  if (isMissingEmailConflict(upsertResult.error)) {
    const insertResult = await writeLead(supabase, lead, "insert");
    return insertResult.error ?? null;
  }

  return upsertResult.error;
}

async function writeLead(
  supabase: ReturnType<typeof supabaseAdmin>,
  lead: { email: string; source: string; tag: string | null },
  mode: "insert" | "upsert"
) {
  const row =
    lead.tag === null
      ? { email: lead.email, source: lead.source }
      : { email: lead.email, source: lead.source, tag: lead.tag };
  const result =
    mode === "upsert"
      ? await supabase.from("leads").upsert(row, { onConflict: "email" })
      : await supabase.from("leads").insert(row);

  if (!isMissingTagColumn(result.error)) return result;

  const rowWithoutTag = { email: lead.email, source: lead.source };
  return mode === "upsert"
    ? await supabase.from("leads").upsert(rowWithoutTag, { onConflict: "email" })
    : await supabase.from("leads").insert(rowWithoutTag);
}

function isMissingTagColumn(error: { code?: string; message?: string } | null) {
  return (
    error?.code === "PGRST204" &&
    error.message?.includes("'tag' column") &&
    error.message?.includes("'leads'")
  );
}

function isMissingEmailConflict(error: { code?: string; message?: string } | null) {
  return (
    error?.code === "42P10" &&
    error.message?.includes("ON CONFLICT")
  );
}

function canContinueWithoutLeadStorage(error: { code?: string; message?: string } | null) {
  return (
    isMissingTagColumn(error) ||
    isMissingEmailConflict(error) ||
    (error?.code === "23502" &&
      error.message?.includes("agent_id") &&
      error.message?.includes("leads"))
  );
}

function shouldAttemptLeadStorage(source: string) {
  return !new Set([
    "website",
    "homepage-cta",
    "contact-page",
    "landing-demo-form",
  ]).has(source);
}
