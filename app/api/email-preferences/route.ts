import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim() || "";
  if (!token) return NextResponse.json({ ok: false, error: "Missing token" }, { status: 400 });

  const { data, error } = await supabaseAdmin()
    .from("email_preferences")
    .select("email,marketing_emails,nurture_emails,match_alert_emails,unsubscribed_at")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: "Preferences not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, preferences: data });
}

export async function PATCH(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim() || "";
  if (!token) return NextResponse.json({ ok: false, error: "Missing token" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (typeof body.marketing_emails === "boolean") update.marketing_emails = body.marketing_emails;
  if (typeof body.nurture_emails === "boolean") update.nurture_emails = body.nurture_emails;
  if (typeof body.match_alert_emails === "boolean") update.match_alert_emails = body.match_alert_emails;

  const allOff =
    update.marketing_emails === false &&
    update.nurture_emails === false &&
    update.match_alert_emails === false;

  if (allOff) update.unsubscribed_at = new Date().toISOString();
  else update.unsubscribed_at = null;

  const { data, error } = await supabaseAdmin()
    .from("email_preferences")
    .update(update)
    .eq("token", token)
    .select("email,marketing_emails,nurture_emails,match_alert_emails,unsubscribed_at")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: "Could not update preferences" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, preferences: data });
}
