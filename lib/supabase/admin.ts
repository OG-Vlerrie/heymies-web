import { createClient } from "@supabase/supabase-js";

export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    ""
  ).trim();

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function describeSupabaseAdminKey() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    ""
  ).trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

  return {
    projectRef: projectRefFromUrl(url),
    keyType: keyType(key),
    keyLength: key.length,
    jwtRole: jwtClaim(key, "role"),
    jwtRef: jwtClaim(key, "ref"),
    anonRef: jwtClaim(anon, "ref"),
  };
}

function projectRefFromUrl(url: string) {
  const match = url.match(/^https:\/\/([^.]+)\.supabase\.co$/);
  return match?.[1] ?? "unknown";
}

function keyType(key: string) {
  if (!key) return "missing";
  if (key.startsWith("eyJ")) return "jwt";
  if (key.startsWith("sb_secret_")) return "secret";
  if (key.startsWith("sb_publishable_")) return "publishable";
  return "unknown";
}

function jwtClaim(key: string, claim: string) {
  if (!key.startsWith("eyJ") || key.split(".").length !== 3) return null;

  try {
    const payload = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString());
    return typeof payload?.[claim] === "string" ? payload[claim] : null;
  } catch {
    return null;
  }
}
