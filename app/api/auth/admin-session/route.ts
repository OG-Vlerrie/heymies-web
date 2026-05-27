import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ADMIN_SESSION_COOKIE = "hm_admin_session";
const SESSION_TTL_SECONDS = 8 * 60 * 60;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "").trim()
    : null;

  if (!token) {
    return NextResponse.json({ ok: false, isAdmin: false }, { status: 401 });
  }

  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: { persistSession: false },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ ok: false, isAdmin: false }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabaseAdmin()
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json(
      { ok: false, isAdmin: false, error: profileError.message },
      { status: 500 }
    );
  }

  if (profile?.role !== "admin") {
    const response = NextResponse.json({ ok: true, isAdmin: false });
    response.cookies.delete(ADMIN_SESSION_COOKIE);
    return response;
  }

  const secret = adminSessionSecret();
  if (!secret) {
    return NextResponse.json(
      { ok: false, isAdmin: true, error: "Admin session secret is not configured" },
      { status: 500 }
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.id,
    email: user.email ?? null,
    role: "admin",
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const payloadPart = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await sign(payloadPart, secret);
  const response = NextResponse.json({ ok: true, isAdmin: true });

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: `${payloadPart}.${signature}`,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  return response;
}

function adminSessionSecret() {
  return (process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASS || "").trim();
}

async function sign(payloadPart: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadPart));
  return base64UrlEncode(new Uint8Array(signature));
}

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
