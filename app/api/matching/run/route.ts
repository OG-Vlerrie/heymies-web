import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scoreListingForBuyer, type BuyerMatchProfile, type MatchListing } from "@/lib/matching";

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
  buyer?: BuyerMatchProfile | BuyerMatchProfile[] | null;
};

type ListingRow = MatchListing & {
  price_per_month: number | null;
  sale_type: string | null;
  listing_type: string | null;
  status: string | null;
};

function supabaseAdmin() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

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

  const listingsQuery = sb
    .from("listings")
    .select(
      "id,title,price,price_per_month,sale_type,listing_type,suburb,city,bedrooms,bathrooms,status"
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
          "id,buyer_id,user_id,name,areas,property_types,max_price,bedrooms_min,bathrooms_min,enabled,buyer:buyers(budget_min,budget_max,property_types,areas,areas_multi,bedrooms_min,bathrooms_min)"
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
  });
}
