import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Topic = "marketing" | "nurture" | "match_alerts" | "all";

const TOPICS = ["marketing", "nurture", "match_alerts", "all"] as const;

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim() || "";
  const topicParam = req.nextUrl.searchParams.get("topic")?.trim() || "all";
  const topic = TOPICS.includes(topicParam as Topic) ? (topicParam as Topic) : "all";
  const origin = requestOrigin(req);

  if (!token) {
    return NextResponse.redirect(`${origin}/email-preferences?status=invalid`);
  }

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (topic === "all") {
    update.marketing_emails = false;
    update.nurture_emails = false;
    update.match_alert_emails = false;
    update.unsubscribed_at = new Date().toISOString();
  } else {
    update[
      topic === "match_alerts"
        ? "match_alert_emails"
        : topic === "nurture"
          ? "nurture_emails"
          : "marketing_emails"
    ] = false;
  }

  const { error } = await supabaseAdmin()
    .from("email_preferences")
    .update(update)
    .eq("token", token);

  const status = error ? "error" : "unsubscribed";
  return NextResponse.redirect(
    `${origin}/email-preferences?token=${encodeURIComponent(token)}&status=${status}&topic=${encodeURIComponent(topic)}`
  );
}

function requestOrigin(req: NextRequest) {
  const url = new URL(req.url);
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");

  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  return url.origin;
}
