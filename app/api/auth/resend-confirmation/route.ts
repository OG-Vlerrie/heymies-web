import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const role = String(body?.role ?? "").trim();
    const next = sanitizeNext(body?.next);

    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Valid email required." }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
      return NextResponse.json(
        { ok: false, error: "Email sending is not configured." },
        { status: 500 }
      );
    }

    const origin = req.headers.get("origin") || req.nextUrl.origin;
    const params = new URLSearchParams({ next });
    if (role) params.set("role", role);

    const { data, error } = await supabaseAdmin().auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: `${origin}/login?${params.toString()}`,
      },
    });

    if (error || !data.properties?.action_link) {
      console.error("Supabase resend link generation failed:", error);
      return NextResponse.json(
        {
          ok: false,
          error: error?.message
            ? `Supabase auth error: ${error.message}`
            : "Supabase auth error: Could not create confirmation link.",
        },
        { status: 500 }
      );
    }

    const emailResult = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [email],
      subject: "Your HeyMies confirmation link",
      html: confirmationHtml(data.properties.action_link),
      text: confirmationText(data.properties.action_link),
    });

    if (emailResult.error) {
      console.error("Resend confirmation resend failed:", emailResult.error);
      return NextResponse.json(
        { ok: false, error: `Resend email error: ${emailResult.error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Resend confirmation failed:", error);
    return NextResponse.json(
      { ok: false, error: `Resend confirmation error: ${error?.message || "Could not resend confirmation email."}` },
      { status: 500 }
    );
  }
}

function sanitizeNext(input: unknown) {
  const value = String(input || "").trim();
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function confirmationText(confirmationUrl: string) {
  return [
    "Open this HeyMies confirmation link to continue:",
    confirmationUrl,
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");
}

function confirmationHtml(confirmationUrl: string) {
  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
      <p style="margin: 0 0 24px;">Open this HeyMies confirmation link to continue.</p>
      <p style="margin: 0 0 24px;">
        <a href="${escapeHtml(confirmationUrl)}" style="display: inline-block; background: #059669; color: #ffffff; padding: 12px 18px; border-radius: 10px; text-decoration: none; font-weight: 700;">
          Confirm account
        </a>
      </p>
      <p style="margin: 0 0 8px; color: #475569; font-size: 14px;">If the button does not work, paste this link into your browser:</p>
      <p style="margin: 0; word-break: break-all; color: #475569; font-size: 14px;">${escapeHtml(confirmationUrl)}</p>
    </div>
  `;
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
