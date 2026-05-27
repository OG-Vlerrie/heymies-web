import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

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

    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { ok: false, error: "Server misconfigured (Supabase env missing)" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { error: dbError } = await supabase
      .from("leads")
      .upsert(
        {
          email,
          source,
          tag: tag || (source.includes("contact") ? "contact" : null),
        },
        { onConflict: "email" }
      );

    if (dbError) {
      return NextResponse.json(
        { ok: false, error: "DB error" },
        { status: 500 }
      );
    }

    if (
      process.env.RESEND_API_KEY &&
      process.env.EMAIL_FROM &&
      process.env.LEAD_NOTIFY_TO
    ) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: [process.env.LEAD_NOTIFY_TO],
        subject: "New HeyMies early-access lead",
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
        subject: "You're on the HeyMies early access list",
        html: `
          <p>Thanks${fullName ? ` ${escapeHtml(fullName.split(" ")[0])}` : ""} - we received your HeyMies request.</p>
          <p>We'll come back to you as soon as the next test slot is ready.</p>
          <p><strong>HeyMies</strong></p>
        `,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Bad request" },
      { status: 400 }
    );
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
