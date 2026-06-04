import { NextResponse } from "next/server";
import { Resend } from "resend";
import { apiErrorResponse, logApiError } from "@/lib/api-error-logging";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const full_name = (body?.full_name ?? "").toString().trim();
    const email = (body?.email ?? "").toString().trim().toLowerCase();
    const phone = (body?.phone ?? "").toString().trim();
    const agency = (body?.agency ?? "").toString().trim();
    const areas = (body?.areas ?? "").toString().trim();
    const property_types = (body?.property_types ?? "").toString().trim();
    const max_leads_per_week = Number(body?.max_leads_per_week ?? 0) || null;
    const preferred_contact_time = (body?.preferred_contact_time ?? "").toString().trim();

    if (!full_name) {
      return NextResponse.json({ ok: false, error: "Name required" }, { status: 400 });
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Valid email required" }, { status: 400 });
    }

    let supabase;
    try {
      supabase = supabaseAdmin();
    } catch (error) {
      console.error("Agent application API misconfigured:", error);
      return apiErrorResponse({
        req,
        route: "/api/agents/apply",
        status: 500,
        error,
        publicMessage: "Server misconfigured. Please try again later.",
      });
    }

    // Insert (or ignore if email already exists)
    const { error: insertErr } = await supabase.from("agents").upsert(
      {
        full_name,
        email,
        phone: phone || null,
        agency: agency || null,
        areas: areas || null,
        property_types: property_types || null,
        max_leads_per_week,
        preferred_contact_time: preferred_contact_time || null,
        status: "pending",
      },
      { onConflict: "email" }
    );

    if (insertErr) {
      await logApiError({
        req,
        route: "/api/agents/apply",
        status: 500,
        error: insertErr,
        metadata: { email },
      });
      return NextResponse.json({ ok: false, error: "DB error" }, { status: 500 });
    }

    // Optional: notify you (uses your existing Resend envs)
    // If you don't want this, delete this block.
    if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM && process.env.LEAD_NOTIFY_TO) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to: [process.env.LEAD_NOTIFY_TO],
          subject: "New agent application (HeyMies)",
          html: `
            <p><strong>Name:</strong> ${escapeHtml(full_name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(phone || "-")}</p>
            <p><strong>Agency:</strong> ${escapeHtml(agency || "-")}</p>
            <p><strong>Areas:</strong> ${escapeHtml(areas || "-")}</p>
            <p><strong>Types:</strong> ${escapeHtml(property_types || "-")}</p>
            <p><strong>Max/week:</strong> ${max_leads_per_week ?? "-"}</p>
            <p><strong>Preferred time:</strong> ${escapeHtml(preferred_contact_time || "-")}</p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send agent application notification:", emailError);
        await logApiError({
          req,
          route: "/api/agents/apply",
          status: 502,
          error: emailError,
          metadata: { stage: "email", email },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Agent application API error:", error);
    return apiErrorResponse({
      req,
      route: "/api/agents/apply",
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
