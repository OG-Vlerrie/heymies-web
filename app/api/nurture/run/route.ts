import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { supabaseAdmin } from "@/lib/supabase/admin";

type QualificationStatus =
  | "agent_ready"
  | "needs_finance_nurture"
  | "needs_confirmation"
  | "nurture_for_better_fit"
  | "not_ready";

type BuyerResponseAction =
  | "finance_ready"
  | "needs_preapproval"
  | "wants_viewing"
  | "still_comparing"
  | "better_matches";

type DueEnquiry = {
  id: string;
  user_id: string | null;
  listing_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  latest_message: string | null;
  request_viewing: boolean;
  enquiry_count: number | null;
  readiness_score: number | null;
  property_fit_score: number | null;
  qualification_status: QualificationStatus;
  qualification_summary: string | null;
  next_action: string | null;
  nurture_status: string | null;
  next_nurture_at: string | null;
  last_nurtured_at: string | null;
  last_buyer_response: string | null;
  buyer_response_token: string | null;
  buyer_response_token_created_at: string | null;
  listing?: {
    id: string;
    title: string;
    suburb: string | null;
    city: string | null;
    price: number | null;
    price_per_month: number | null;
    sale_type: string | null;
  };
};

const BUYER_RESPONSE_ACTIONS: Record<BuyerResponseAction, string> = {
  finance_ready: "I'm pre-approved or paying cash",
  needs_preapproval: "I'd like help with pre-approval",
  wants_viewing: "I'd like to arrange a viewing",
  still_comparing: "I'm still comparing options",
  better_matches: "Please send me better matches",
};

const DUE_STATUSES: QualificationStatus[] = [
  "needs_finance_nurture",
  "needs_confirmation",
  "nurture_for_better_fit",
  "not_ready",
];

const MAX_FOLLOW_UPS = 4;

export async function GET(req: NextRequest) {
  return run(req);
}

export async function POST(req: NextRequest) {
  return run(req);
}

async function run(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
  const limitParam = req.nextUrl.searchParams.get("limit") ?? body?.limit;
  const dryRunParam = req.nextUrl.searchParams.get("dryRun") ?? body?.dryRun;
  const limit = Math.max(1, Math.min(Number(limitParam) || 50, 100));
  const dryRun = dryRunParam === true || dryRunParam === "true";
  const now = new Date();
  const nowIso = now.toISOString();
  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("enquiries")
    .select(
      "id,user_id,listing_id,full_name,email,phone,latest_message,request_viewing,enquiry_count,readiness_score,property_fit_score,qualification_status,qualification_summary,next_action,nurture_status,next_nurture_at,last_nurtured_at,last_buyer_response,buyer_response_token,buyer_response_token_created_at,listing:listings(id,title,suburb,city,price,price_per_month,sale_type)"
    )
    .in("qualification_status", DUE_STATUSES)
    .or("nurture_status.eq.nurturing,nurture_status.eq.pending")
    .not("next_nurture_at", "is", null)
    .lte("next_nurture_at", nowIso)
    .order("next_nurture_at", { ascending: true })
    .limit(limit);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const enquiries = ((data ?? []) as unknown as DueEnquiry[]).map((enquiry) => ({
    ...enquiry,
    listing: Array.isArray(enquiry.listing) ? enquiry.listing[0] : enquiry.listing,
  }));
  const nurtureCounts = await loadNurtureCounts(enquiries.map((enquiry) => enquiry.id));

  let sent = 0;
  let paused = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const enquiry of enquiries) {
    const sentCount = nurtureCounts.get(enquiry.id) ?? 0;

    if (sentCount >= MAX_FOLLOW_UPS) {
      if (!dryRun) {
        await pauseEnquiry(enquiry, "max_followups_reached");
      }
      paused += 1;
      continue;
    }

    if (wasNurturedRecently(enquiry.last_nurtured_at, now)) {
      skipped += 1;
      continue;
    }

    const buyer = await loadBuyerContact(enquiry);
    if (!buyer.email) {
      errors.push(`No buyer email for enquiry ${enquiry.id}`);
      skipped += 1;
      continue;
    }

    if (buyer.isUnconfirmed) {
      skipped += 1;
      continue;
    }

    const responseToken = enquiry.buyer_response_token || createResponseToken();
    const message = buildNurtureMessage(enquiry, sentCount);
    const emailSent = dryRun
      ? true
      : await sendNurtureEmail({
          to: buyer.email,
          buyerName: buyer.name ?? enquiry.full_name,
          enquiry,
          message,
          responseToken,
          origin: requestOrigin(req),
        });

    if (!emailSent) {
      errors.push(`Failed to send nurture email for enquiry ${enquiry.id}`);
      continue;
    }

    const nextCount = sentCount + 1;
    const nextNurtureAt = nextCount >= MAX_FOLLOW_UPS ? null : nextNurtureDate(nextCount);
    const nextNurtureStatus = nextCount >= MAX_FOLLOW_UPS ? "paused" : "nurturing";

    if (!dryRun) {
      const { error: updateError } = await sb
        .from("enquiries")
        .update({
          last_nurtured_at: nowIso,
          next_nurture_at: nextNurtureAt,
          nurture_status: nextNurtureStatus,
          buyer_response_token: responseToken,
          buyer_response_token_created_at: enquiry.buyer_response_token_created_at || nowIso,
          updated_at: nowIso,
        })
        .eq("id", enquiry.id);

      if (updateError) {
        errors.push(`Failed to update enquiry ${enquiry.id}: ${updateError.message}`);
        continue;
      }

      await sb.from("enquiry_events").insert({
        enquiry_id: enquiry.id,
        user_id: enquiry.user_id,
        listing_id: enquiry.listing_id,
        event_type: "nurture_sent",
        message: message.subject,
        metadata: {
          followup_number: nextCount,
          qualification_status: enquiry.qualification_status,
          next_nurture_at: nextNurtureAt,
          nurture_status: nextNurtureStatus,
        },
      });
    }

    sent += 1;
    if (nextNurtureStatus === "paused") paused += 1;
  }

  return NextResponse.json({
    ok: errors.length === 0,
    dryRun,
    checked: enquiries.length,
    sent,
    paused,
    skipped,
    errors,
  });
}

function authorize(req: NextRequest) {
  const secrets = [process.env.NURTURE_JOB_SECRET, process.env.CRON_SECRET]
    .map((secret) => secret?.trim())
    .filter(Boolean) as string[];

  if (secrets.length === 0) {
    return process.env.NODE_ENV !== "production";
  }

  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const headerSecret = req.headers.get("x-nurture-secret")?.trim();
  return secrets.some((secret) => secret === bearer || secret === headerSecret);
}

async function loadNurtureCounts(enquiryIds: string[]) {
  const counts = new Map<string, number>();
  if (enquiryIds.length === 0) return counts;

  const { data, error } = await supabaseAdmin()
    .from("enquiry_events")
    .select("enquiry_id")
    .in("enquiry_id", enquiryIds)
    .eq("event_type", "nurture_sent");

  if (error) {
    console.error("Failed to load nurture event counts:", error);
    return counts;
  }

  for (const event of data ?? []) {
    const id = event.enquiry_id as string;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return counts;
}

async function loadBuyerContact(enquiry: DueEnquiry) {
  if (!enquiry.user_id) {
    return { email: enquiry.email, name: enquiry.full_name, isUnconfirmed: false };
  }

  const { data, error } = await supabaseAdmin().auth.admin.getUserById(enquiry.user_id);
  if (error) {
    console.error("Failed to load buyer auth user for nurture:", error);
    return { email: enquiry.email, name: enquiry.full_name, isUnconfirmed: false };
  }

  const user = data.user;
  return {
    email: user?.email ?? enquiry.email,
    name:
      (user?.user_metadata?.full_name as string | undefined) ??
      (user?.user_metadata?.name as string | undefined) ??
      enquiry.full_name,
    isUnconfirmed: Boolean(user?.email && !user.email_confirmed_at),
  };
}

async function pauseEnquiry(enquiry: DueEnquiry, reason: string) {
  const now = new Date().toISOString();
  const sb = supabaseAdmin();

  await sb
    .from("enquiries")
    .update({
      nurture_status: "paused",
      next_nurture_at: null,
      updated_at: now,
    })
    .eq("id", enquiry.id);

  await sb.from("enquiry_events").insert({
    enquiry_id: enquiry.id,
    user_id: enquiry.user_id,
    listing_id: enquiry.listing_id,
    event_type: "nurture_paused",
    message: reason,
    metadata: {
      reason,
      qualification_status: enquiry.qualification_status,
    },
  });
}

function wasNurturedRecently(lastNurturedAt: string | null, now: Date) {
  if (!lastNurturedAt) return false;
  const last = new Date(lastNurturedAt).getTime();
  if (Number.isNaN(last)) return false;
  return now.getTime() - last < 22 * 60 * 60 * 1000;
}

function nextNurtureDate(sentCount: number) {
  const days = sentCount === 1 ? 2 : sentCount === 2 ? 4 : 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function buildNurtureMessage(enquiry: DueEnquiry, sentCount: number) {
  const listingTitle = enquiry.listing?.title ?? "the property you asked about";
  const location = [enquiry.listing?.suburb, enquiry.listing?.city].filter(Boolean).join(", ");
  const finalFollowUp =
    sentCount + 1 >= MAX_FOLLOW_UPS
      ? "If now is not the right time, that is completely fine. I will pause after this so your inbox stays quiet."
      : "";

  const base = copyForStatus(enquiry.qualification_status, listingTitle);
  const prefix =
    sentCount === 0
      ? "I wanted to quickly follow up while this is still fresh."
      : sentCount === 1
        ? "Just checking in once more, gently."
        : "One last useful check from my side.";

  return {
    subject: base.subject,
    heading: base.heading,
    body: [prefix, base.body, location ? `Listing area: ${location}.` : "", finalFollowUp]
      .filter(Boolean)
      .join("\n\n"),
    nextAction: base.nextAction,
    responseActions: base.responseActions,
  };
}

function copyForStatus(status: QualificationStatus, listingTitle: string) {
  switch (status) {
    case "needs_finance_nurture":
      return {
        subject: `Quick finance check for ${listingTitle}`,
        heading: "Should I help with the finance step?",
        body: `You showed interest in ${listingTitle}. Before I hand you over as a ready buyer, I want to understand whether finance is sorted or whether pre-approval would help.`,
        nextAction: "Pick the closest answer below and I will update your enquiry.",
        responseActions: ["finance_ready", "needs_preapproval", "still_comparing"] as BuyerResponseAction[],
      };
    case "nurture_for_better_fit":
      return {
        subject: `Should I find closer matches?`,
        heading: "Let's keep the search useful",
        body: `${listingTitle} may not perfectly match the profile you gave HeyMies. You can still chase it, but I can also watch for homes that sit closer to your budget, area, and property needs.`,
        nextAction: "Tell me whether to keep this one moving or focus on better matches.",
        responseActions: ["better_matches", "wants_viewing", "still_comparing"] as BuyerResponseAction[],
      };
    case "not_ready":
      return {
        subject: `Want me to keep watching quietly?`,
        heading: "No pressure from my side",
        body: `It looks like you may still be early in the buying journey after asking about ${listingTitle}. I can keep the search warm without sending you to agents too soon.`,
        nextAction: "Let me know what would be most useful right now.",
        responseActions: ["still_comparing", "needs_preapproval", "better_matches"] as BuyerResponseAction[],
      };
    case "needs_confirmation":
    default:
      return {
        subject: `Should I connect you on ${listingTitle}?`,
        heading: "Quick intent check",
        body: `You asked about ${listingTitle}. I do not want to send your details to an agent unless you actually want that conversation.`,
        nextAction: "One click is enough and I will take it from there.",
        responseActions: ["wants_viewing", "still_comparing", "better_matches"] as BuyerResponseAction[],
      };
  }
}

async function sendNurtureEmail({
  to,
  buyerName,
  enquiry,
  message,
  responseToken,
  origin,
}: {
  to: string;
  buyerName: string | null;
  enquiry: DueEnquiry;
  message: ReturnType<typeof buildNurtureMessage>;
  responseToken: string;
  origin: string;
}) {
  const firstName = buyerName?.trim().split(" ")[0] || "there";
  const listingUrl = `${origin}/listings/${enquiry.listing_id}`;
  const actionLinks = message.responseActions
    .map((action) => {
      const href = `${origin}/api/enquiries?token=${encodeURIComponent(
        responseToken
      )}&action=${encodeURIComponent(action)}`;
      return `<p style="margin: 10px 0;"><a href="${escapeHtml(
        href
      )}" style="color:#047857;font-weight:700;">${escapeHtml(
        BUYER_RESPONSE_ACTIONS[action]
      )}</a></p>`;
    })
    .join("");

  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM?.trim() || "Mia from HeyMies <mia@heymies.co.za>",
      to,
      subject: message.subject,
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
          <h2 style="margin-bottom: 8px;">${escapeHtml(message.heading)}</h2>
          <p>Hi ${escapeHtml(firstName)},</p>
          <p>${escapeHtml(message.body).replaceAll("\n", "<br />")}</p>
          <p>${escapeHtml(message.nextAction)}</p>
          <div style="margin: 18px 0; padding: 14px; border: 1px solid #d1fae5; border-radius: 12px; background: #ecfdf5;">
            <p style="margin-top: 0;"><strong>You can reply with one click:</strong></p>
            ${actionLinks}
          </div>
          <p><a href="${escapeHtml(listingUrl)}" style="color:#047857;font-weight:700;">View the listing again</a></p>
          <p>Warmly,<br />Mia from HeyMies</p>
        </div>
      `,
    });

    if (response.error) {
      console.error("Failed to send scheduled nurture email:", response.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send scheduled nurture email:", error);
    return false;
  }
}

function createResponseToken() {
  return `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll("-", "");
}

function requestOrigin(req: NextRequest) {
  const url = new URL(req.url);
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");

  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  return url.origin;
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
