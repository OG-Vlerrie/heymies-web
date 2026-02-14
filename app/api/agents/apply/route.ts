import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

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

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

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
      return NextResponse.json({ ok: false, error: "DB error" }, { status: 500 });
    }

    // Optional: notify you (uses your existing Resend envs)
    // If you don't want this, delete this block.
    if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM && process.env.LEAD_NOTIFY_TO) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: [process.env.LEAD_NOTIFY_TO!],
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
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
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
