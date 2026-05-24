import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { supabaseAdmin } from "@/lib/supabase/admin";

type SignupRole = "agent" | "seller" | "buyer";

type RegisterBody = {
  role?: SignupRole;
  email?: string;
  password?: string;
  next?: string | null;
  metadata?: Record<string, unknown>;
  profile?: Record<string, unknown>;
};

const ROLE_LABELS: Record<SignupRole, string> = {
  agent: "Agent",
  seller: "Private Seller",
  buyer: "Buyer",
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RegisterBody;
    const role = body.role;
    const email = normalizeEmail(body.email);
    const password = typeof body.password === "string" ? body.password : "";
    const metadata = isRecord(body.metadata) ? body.metadata : {};
    const profile = isRecord(body.profile) ? body.profile : {};

    if (!role || !(role in ROLE_LABELS)) {
      return badRequest("Invalid signup role.");
    }

    if (!email || !email.includes("@")) {
      return badRequest("Enter a valid email.");
    }

    if (password.length < 6) {
      return badRequest("Password must be at least 6 characters.");
    }

    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
      return NextResponse.json(
        { ok: false, error: "Email service is not configured." },
        { status: 500 }
      );
    }

    const origin = requestOrigin(req);
    const next = sanitizeNext(body.next);
    const redirectTo = `${origin}/login?verified=1${
      next ? `&next=${encodeURIComponent(next)}` : ""
    }`;

    const authMetadata = {
      ...metadata,
      role,
      email,
    };

    const supabase = supabaseAdmin();
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        data: authMetadata,
        redirectTo,
      },
    });

    if (error || !data.properties?.action_link || !data.user?.id) {
      return NextResponse.json(
        { ok: false, error: error?.message ?? "Could not create confirmation link." },
        { status: 400 }
      );
    }

    const userId = data.user.id;
    const fullName = stringOrNull(profile.full_name ?? metadata.full_name);
    const phone = stringOrNull(profile.phone ?? metadata.phone);

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      role,
      full_name: fullName,
      phone,
    });

    if (profileError) {
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { ok: false, error: profileError.message },
        { status: 500 }
      );
    }

    if (role === "agent") {
      const { error: agentError } = await supabase.from("agents").insert({
        ...profile,
        user_id: userId,
      });

      if (agentError) {
        await supabase.auth.admin.deleteUser(userId);
        return NextResponse.json(
          { ok: false, error: agentError.message },
          { status: 500 }
        );
      }
    }

    if (role === "seller") {
      const { error: sellerError } = await supabase.from("private_sellers").insert({
        ...profile,
        user_id: userId,
      });

      if (sellerError) {
        await supabase.auth.admin.deleteUser(userId);
        return NextResponse.json(
          { ok: false, error: sellerError.message },
          { status: 500 }
        );
      }
    }

    const emailResponse = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [email],
      subject: "Confirm your HeyMies account",
      html: confirmationEmailHtml({
        actionLink: data.properties.action_link,
        roleLabel: ROLE_LABELS[role],
      }),
    });

    if (emailResponse.error) {
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { ok: false, error: emailResponse.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json(
      { ok: false, error: "Could not complete registration." },
      { status: 500 }
    );
  }
}

function badRequest(error: string) {
  return NextResponse.json({ ok: false, error }, { status: 400 });
}

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function requestOrigin(req: Request) {
  const url = new URL(req.url);
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return url.origin;
}

function sanitizeNext(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  return value;
}

function confirmationEmailHtml({
  actionLink,
  roleLabel,
}: {
  actionLink: string;
  roleLabel: string;
}) {
  const safeActionLink = escapeHtml(actionLink);
  const safeRoleLabel = escapeHtml(roleLabel);

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
      <p>Welcome to HeyMies.</p>
      <p>Please confirm your ${safeRoleLabel} account to finish registration.</p>
      <p>
        <a href="${safeActionLink}" style="display:inline-block;background:#059669;color:#ffffff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700">
          Confirm account
        </a>
      </p>
      <p>If the button does not work, copy and paste this link into your browser:</p>
      <p><a href="${safeActionLink}">${safeActionLink}</a></p>
      <p><strong>HeyMies</strong></p>
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
