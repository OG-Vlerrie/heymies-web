import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

const ADMIN_SESSION_COOKIE = "hm_admin_session";

export async function middleware(req: NextRequest) {
  const sessionSecret = adminSessionSecret();
  const session = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (sessionSecret && session && (await verifyAdminSession(session, sessionSecret))) {
    return NextResponse.next();
  }

  const requireRole = process.env.ADMIN_REQUIRE_ROLE === "true";

  if (requireRole) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false, error: "Admin access required" }, { status: 401 });
    }

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  const user = (process.env.ADMIN_USER || "").trim();
  const pass = (process.env.ADMIN_PASS || "").trim();

  // If creds not set, block access (safer default)
  if (!user || !pass) {
    return new NextResponse("Admin credentials not configured", { status: 500 });
  }

  const auth = req.headers.get("authorization");

  if (!auth?.startsWith("Basic ")) {
    return unauthorized();
  }

  const base64 = auth.split(" ")[1] || "";
  let decoded = "";
  try {
    decoded = atob(base64);
  } catch {
    return unauthorized();
  }

  const [u, p] = decoded.split(":");

  if (u !== user || p !== pass) {
    return unauthorized();
  }

  return NextResponse.next();
}

function unauthorized() {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="HeyMies Admin"',
    },
  });
}

function adminSessionSecret() {
  return (process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASS || "").trim();
}

async function verifyAdminSession(value: string, secret: string) {
  const [payloadPart, signaturePart] = value.split(".");
  if (!payloadPart || !signaturePart) return false;

  const expected = await sign(payloadPart, secret);
  if (!timingSafeEqual(signaturePart, expected)) return false;

  const payload = parsePayload(payloadPart);
  if (!payload || payload.role !== "admin") return false;
  if (payload.exp < Math.floor(Date.now() / 1000)) return false;

  return true;
}

function parsePayload(payloadPart: string) {
  try {
    const json = new TextDecoder().decode(base64UrlDecode(payloadPart));
    return JSON.parse(json) as { role?: string; exp: number };
  } catch {
    return null;
  }
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

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return result === 0;
}

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlDecode(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(
    Math.ceil(value.length / 4) * 4,
    "="
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}
