import { NextResponse } from "next/server";
import { scoreListingForBuyer, type BuyerMatchProfile, type MatchListing } from "@/lib/matching";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend } from "@/lib/resend";
import { ensureEmailPreference } from "@/lib/email-preferences";

type BuyerAlert = {
  id: string;
  buyer_id: string;
  user_id: string;
  name: string;
  areas: string[] | null;
  property_types: string[] | null;
  max_price: number | null;
  bedrooms_min: number | null;
  bathrooms_min: number | null;
  enabled: boolean;
  buyer?: (BuyerMatchProfile & { full_name?: string | null }) | (BuyerMatchProfile & { full_name?: string | null })[] | null;
};

type ListingRow = MatchListing & {
  price_per_month: number | null;
  sale_type: string | null;
  listing_type: string | null;
  status: string | null;
  cover_image: string | null;
};

function authorize(req: Request) {
  const expected = process.env.MATCHING_JOB_SECRET;
  if (!expected) return true;
  return req.headers.get("x-matching-secret") === expected;
}

export async function POST(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const sb = supabaseAdmin();
  const body = await req.json().catch(() => ({}));
  const listingId = typeof body?.listingId === "string" ? body.listingId : null;
  const minScore = Number.isFinite(Number(body?.minScore)) ? Number(body.minScore) : 55;
  const sendEmails = body?.sendEmails !== false;

  const listingsQuery = sb
    .from("listings")
    .select(
      "id,title,price,price_per_month,sale_type,listing_type,suburb,city,bedrooms,bathrooms,status,cover_image"
    )
    .eq("status", "active")
    .limit(listingId ? 1 : 100);

  if (listingId) listingsQuery.eq("id", listingId);

  const [{ data: listings, error: listingsErr }, { data: alerts, error: alertsErr }] =
    await Promise.all([
      listingsQuery,
      sb
        .from("buyer_alerts")
        .select(
          "id,buyer_id,user_id,name,areas,property_types,max_price,bedrooms_min,bathrooms_min,enabled,buyer:buyers(full_name,budget_min,budget_max,property_types,areas,areas_multi,bedrooms_min,bathrooms_min)"
        )
        .eq("enabled", true)
        .limit(500),
    ]);

  if (listingsErr) {
    return NextResponse.json({ ok: false, error: listingsErr.message }, { status: 500 });
  }

  if (alertsErr) {
    return NextResponse.json({ ok: false, error: alertsErr.message }, { status: 500 });
  }

  const events = [];
  for (const alert of (alerts ?? []) as unknown as BuyerAlert[]) {
    const alertBuyer = Array.isArray(alert.buyer) ? alert.buyer[0] : alert.buyer;
    const buyerProfile: BuyerMatchProfile = {
      budget_min: alertBuyer?.budget_min ?? null,
      budget_max: alert.max_price ?? alertBuyer?.budget_max ?? null,
      property_types: alert.property_types?.length
        ? alert.property_types
        : alertBuyer?.property_types ?? null,
      areas: alert.areas?.length ? alert.areas : alertBuyer?.areas ?? null,
      areas_multi: alertBuyer?.areas_multi ?? null,
      bedrooms_min: alert.bedrooms_min ?? alertBuyer?.bedrooms_min ?? null,
      bathrooms_min: alert.bathrooms_min ?? alertBuyer?.bathrooms_min ?? null,
    };

    for (const listing of (listings ?? []) as ListingRow[]) {
      const match = scoreListingForBuyer(listing, buyerProfile);
      if (match.score < minScore) continue;

      events.push({
        buyer_alert_id: alert.id,
        buyer_id: alert.buyer_id,
        user_id: alert.user_id,
        listing_id: listing.id,
        score: match.score,
        reasons: match.reasons,
        status: "pending",
      });
    }
  }

  if (events.length > 0) {
    const { error: insertErr } = await sb
      .from("match_events")
      .upsert(events, { onConflict: "buyer_alert_id,listing_id", ignoreDuplicates: true });

    if (insertErr) {
      return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
    }
  }

  let emailsSent = 0;
  if (sendEmails && events.length > 0) {
    const listingMap = new Map(
      ((listings ?? []) as ListingRow[]).map((listing) => [listing.id, listing])
    );
    const alertMap = new Map(
      ((alerts ?? []) as unknown as BuyerAlert[]).map((alert) => [alert.id, alert])
    );

    const { data: pendingEvents, error: pendingErr } = await sb
      .from("match_events")
      .select("id,buyer_alert_id,buyer_id,user_id,listing_id,score,reasons,status,sent_at")
      .is("sent_at", null)
      .eq("status", "pending")
      .in(
        "listing_id",
        ((listings ?? []) as ListingRow[]).map((listing) => listing.id)
      )
      .in(
        "buyer_alert_id",
        ((alerts ?? []) as unknown as BuyerAlert[]).map((alert) => alert.id)
      )
      .limit(200);

    if (pendingErr) {
      return NextResponse.json({ ok: false, error: pendingErr.message }, { status: 500 });
    }

    for (const event of pendingEvents ?? []) {
      const listing = listingMap.get(event.listing_id);
      const alert = alertMap.get(event.buyer_alert_id);
      if (!listing || !alert) continue;

      const { data: buyerUser, error: buyerUserErr } =
        await sb.auth.admin.getUserById(event.user_id);

      if (buyerUserErr || !buyerUser.user?.email) {
        console.error("Could not load buyer email for match event:", buyerUserErr);
        continue;
      }

      const alertBuyer = Array.isArray(alert.buyer) ? alert.buyer[0] : alert.buyer;
      const sent = await sendMatchEmail({
        to: buyerUser.user.email,
        userId: event.user_id,
        buyerName: alertBuyer?.full_name ?? buyerUser.user.user_metadata?.full_name ?? null,
        alertName: alert.name,
        listing,
        score: event.score,
        reasons: event.reasons ?? [],
        origin: requestOrigin(req),
      });

      if (!sent) continue;

      const now = new Date().toISOString();
      const { error: markErr } = await sb
        .from("match_events")
        .update({ sent_at: now, status: "sent" })
        .eq("id", event.id)
        .is("sent_at", null);

      if (!markErr) emailsSent += 1;
    }
  }

  if ((alerts ?? []).length > 0) {
    await sb
      .from("buyer_alerts")
      .update({ last_checked_at: new Date().toISOString() })
      .in(
        "id",
        ((alerts ?? []) as unknown as BuyerAlert[]).map((alert) => alert.id)
      );
  }

  return NextResponse.json({
    ok: true,
    listingsChecked: listings?.length ?? 0,
    alertsChecked: alerts?.length ?? 0,
    eventsCreated: events.length,
    emailsSent,
  });
}

async function sendMatchEmail({
  to,
  userId,
  buyerName,
  alertName,
  listing,
  score,
  reasons,
  origin,
}: {
  to: string;
  userId: string;
  buyerName: string | null;
  alertName: string;
  listing: ListingRow;
  score: number;
  reasons: string[];
  origin: string;
}) {
  const firstName = buyerName?.trim().split(" ")[0] || "there";
  const price = listing.sale_type === "rent" ? listing.price_per_month : listing.price;
  const priceText =
    price !== null && price !== undefined
      ? new Intl.NumberFormat("en-ZA", {
          style: "currency",
          currency: "ZAR",
          maximumFractionDigits: 0,
        }).format(price)
      : "price on request";
  const location = [listing.suburb, listing.city].filter(Boolean).join(", ");
  const listingUrl = `${origin}/listings/${listing.id}`;
  const preferences = await ensureEmailPreference({
    userId,
    email: to,
    topic: "match_alerts",
    origin,
  });

  if (!preferences.allowed) return false;

  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM?.trim() || "Mia from HeyMies <mia@heymies.co.za>",
      to,
      subject: `Mia found a ${score}% match: ${listing.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
          <p>Hi ${escapeHtml(firstName)},</p>
          <p>I found a new listing that looks like it could fit your saved search.</p>
          <div style="margin: 18px 0; padding: 16px; border: 1px solid #d1fae5; border-radius: 12px; background: #ecfdf5;">
            <h2 style="margin: 0 0 8px;">${escapeHtml(listing.title)}</h2>
            <p style="margin: 4px 0;"><strong>${escapeHtml(priceText)}</strong>${listing.sale_type === "rent" ? " / month" : ""}</p>
            <p style="margin: 4px 0;">${escapeHtml(location || "Location not listed")}</p>
            <p style="margin: 4px 0;">Match score: <strong>${score}%</strong></p>
            ${
              reasons.length
                ? `<p style="margin: 4px 0;">Why it matched: ${escapeHtml(reasons.join(", "))}</p>`
                : ""
            }
          </div>
          <p>This came from your alert: <strong>${escapeHtml(alertName)}</strong>.</p>
          <p><a href="${escapeHtml(listingUrl)}" style="color:#047857;font-weight:700;">View the listing</a></p>
          <p>If it feels right, you can enquire from the listing and I will help check whether it is ready for agent handover.</p>
          <p style="margin-top: 24px; font-size: 12px; color: #64748b;">
            <a href="${escapeHtml(preferences.manageUrl)}" style="color:#64748b;">Manage email preferences</a>
            &nbsp;|&nbsp;
            <a href="${escapeHtml(preferences.unsubscribeUrl)}" style="color:#64748b;">Unsubscribe from match alerts</a>
          </p>
          <p>Warmly,<br />Mia from HeyMies</p>
        </div>
      `,
    });

    if (response.error) {
      console.error("Failed to send match email:", response.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send match email:", error);
    return false;
  }
}

function requestOrigin(req: Request) {
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
