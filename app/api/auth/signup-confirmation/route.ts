import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ROLES = new Set(["buyer", "seller", "agent"]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const role = String(body?.role ?? "").trim();
    const next = sanitizeNext(body?.next);
    const metadata = body?.data && typeof body.data === "object" ? body.data : {};

    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Valid email required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ ok: false, error: "Password must be at least 6 characters." }, { status: 400 });
    }

    if (!ROLES.has(role)) {
      return NextResponse.json({ ok: false, error: "Invalid signup role." }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
      return NextResponse.json(
        { ok: false, error: "Email sending is not configured." },
        { status: 500 }
      );
    }

    const origin = req.headers.get("origin") || req.nextUrl.origin;
    const redirectTo = `${origin}/login?next=${encodeURIComponent(next)}&role=${encodeURIComponent(role)}`;

    const { data, error } = await supabaseAdmin().auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        data: {
          ...metadata,
          role,
        },
        redirectTo,
      },
    });

    if (error || !data.properties?.action_link) {
      return NextResponse.json(
        { ok: false, error: error?.message || "Could not create confirmation link." },
        { status: 500 }
      );
    }

    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [email],
      subject: "Confirm your HeyMies account",
      html: confirmationHtml({
        role,
        confirmationUrl: data.properties.action_link,
      }),
      text: confirmationText({
        role,
        confirmationUrl: data.properties.action_link,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Could not send confirmation email." },
      { status: 500 }
    );
  }
}

function sanitizeNext(input: unknown) {
  const value = String(input || "").trim();
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function roleLabel(role: string) {
  if (role === "buyer") return "buyer profile";
  if (role === "seller") return "private seller profile";
  if (role === "agent") return "agent profile";
  return "account";
}

function confirmationText({
  role,
  confirmationUrl,
}: {
  role: string;
  confirmationUrl: string;
}) {
  return [
    "Welcome to HeyMies.",
    "",
    `Confirm your ${roleLabel(role)} by opening this link:`,
    confirmationUrl,
    "",
    "If you did not create this account, you can ignore this email.",
  ].join("\n");
}

function confirmationHtml({
  role,
  confirmationUrl,
}: {
  role: string;
  confirmationUrl: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
      <p style="margin: 0 0 16px;">Welcome to HeyMies.</p>
      <p style="margin: 0 0 24px;">Confirm your ${escapeHtml(roleLabel(role))} so you can continue.</p>
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
