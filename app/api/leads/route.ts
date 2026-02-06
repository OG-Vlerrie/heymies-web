import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body?.email ?? "").toString().trim().toLowerCase();
    const source = (body?.source ?? "website").toString();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { error: dbError } = await supabase
      .from("leads")
      .upsert({ email, source }, { onConflict: "email" });

    if (dbError) {
      return NextResponse.json({ ok: false, error: "DB error" }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.EMAIL_FROM!;
    const notifyTo = process.env.LEAD_NOTIFY_TO!;

    // Notify you
    await resend.emails.send({
      from,
      to: [notifyTo],
      subject: "New HeyMies early-access lead",
      html: `<p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Source:</strong> ${escapeHtml(
        source
      )}</p>`,
    });

    // Optional: confirmation email to the lead
    await resend.emails.send({
      from,
      to: [email],
      subject: "You’re on the HeyMies early access list",
      html: `<p>Thanks — you’re on the list. We’ll email you when onboarding opens.</p><p><strong>HeyMies</strong></p>`,
    });

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
