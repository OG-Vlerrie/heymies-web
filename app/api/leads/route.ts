import { NextResponse } from "next/server";
import { Resend } from "resend";
import { apiErrorResponse, logApiError } from "@/lib/api-error-logging";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body?.email ?? "").toString().trim().toLowerCase();
    const source = (body?.source ?? "website").toString();
    const fullName = (body?.full_name ?? body?.name ?? "").toString().trim();
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

    if (
      process.env.RESEND_API_KEY &&
      process.env.EMAIL_FROM &&
      process.env.LEAD_NOTIFY_TO
    ) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const isDemoRequest = tag === "demo" || source.includes("demo");
        const adminSubject = isDemoRequest
          ? "New HeyMies demo request"
          : "New HeyMies early-access lead";
        const replySubject = isDemoRequest
          ? "We received your HeyMies demo request"
          : "You're on the HeyMies early access list";
        const replyIntro = isDemoRequest
          ? "we received your HeyMies demo request"
          : "we received your HeyMies request";
        const replyNext = isDemoRequest
          ? "We'll come back to you soon with a useful next step."
          : "We'll come back to you as soon as the next test slot is ready.";

        await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to: [process.env.LEAD_NOTIFY_TO],
          subject: adminSubject,
          html: `
            ${fullName ? `<p><strong>Name:</strong> ${escapeHtml(fullName)}</p>` : ""}
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Source:</strong> ${escapeHtml(source)}</p>
            ${tag ? `<p><strong>Tag:</strong> ${escapeHtml(tag)}</p>` : ""}
            ${message ? `<p><strong>Message:</strong><br />${escapeHtml(message).replaceAll("\n", "<br />")}</p>` : ""}
          `,
        });

        await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to: [email],
          subject: replySubject,
          html: `
            <p>Thanks${fullName ? ` ${escapeHtml(fullName.split(" ")[0])}` : ""} - ${replyIntro}.</p>
            <p>${replyNext}</p>
            <p><strong>HeyMies</strong></p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send lead notification email:", emailError);
        await logApiError({
          req,
          route: "/api/leads",
          status: 502,
          error: emailError,
          metadata: { stage: "email", email, source },
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

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
