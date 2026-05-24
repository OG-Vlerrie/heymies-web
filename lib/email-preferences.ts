import { supabaseAdmin } from "@/lib/supabase/admin";

export type EmailTopic = "marketing" | "nurture" | "match_alerts";

type PreferenceRow = {
  id: string;
  user_id: string | null;
  email: string | null;
  token: string;
  marketing_emails: boolean;
  nurture_emails: boolean;
  match_alert_emails: boolean;
  unsubscribed_at: string | null;
};

export type EmailPreferenceResult = {
  allowed: boolean;
  token: string;
  manageUrl: string;
  unsubscribeUrl: string;
};

export async function ensureEmailPreference({
  userId,
  email,
  topic,
  origin,
}: {
  userId?: string | null;
  email: string;
  topic: EmailTopic;
  origin: string;
}): Promise<EmailPreferenceResult> {
  const sb = supabaseAdmin();
  const normalizedEmail = email.trim().toLowerCase();

  let row: PreferenceRow | null = null;

  if (userId) {
    const { data, error } = await sb
      .from("email_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) console.error("Failed to load email preference by user:", error);
    row = (data as PreferenceRow | null) ?? null;
  }

  if (!row) {
    const { data, error } = await sb
      .from("email_preferences")
      .select("*")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (error) console.error("Failed to load email preference by email:", error);
    row = (data as PreferenceRow | null) ?? null;
  }

  if (!row) {
    const { data, error } = await sb
      .from("email_preferences")
      .insert({ user_id: userId ?? null, email: normalizedEmail })
      .select("*")
      .single();

    if (error || !data) {
      console.error("Failed to create email preference:", error);
      const fallbackToken = "";
      return {
        allowed: true,
        token: fallbackToken,
        manageUrl: `${origin}/email-preferences`,
        unsubscribeUrl: `${origin}/email-preferences`,
      };
    }

    row = data as PreferenceRow;
  }

  const topicAllowed =
    topic === "nurture"
      ? row.nurture_emails
      : topic === "match_alerts"
        ? row.match_alert_emails
        : row.marketing_emails;

  const allowed = !row.unsubscribed_at && topicAllowed;
  const query = `token=${encodeURIComponent(row.token)}&topic=${encodeURIComponent(topic)}`;

  return {
    allowed,
    token: row.token,
    manageUrl: `${origin}/email-preferences?token=${encodeURIComponent(row.token)}`,
    unsubscribeUrl: `${origin}/api/email-preferences/unsubscribe?${query}`,
  };
}
