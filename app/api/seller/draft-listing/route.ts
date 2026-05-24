import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";

type PrivateSeller = {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  preferred_contact: string | null;
  intent: string | null;
  property_type: string | null;
  province: string | null;
  city: string | null;
  suburb: string | null;
  street_address: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking: number | null;
  floor_size_m2: number | null;
  erf_size_m2: number | null;
  asking_price: number | null;
  rates_taxes_amount: number | null;
  levies_amount: number | null;
  access_for_viewings: string | null;
  occupancy: string | null;
  available_from: string | null;
  special_features: string | null;
  notes: string | null;
};

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : null;

  if (!token) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const sb = supabaseAdmin();

  const { data: profile, error: profileError } = await sb
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ ok: false, error: profileError.message }, { status: 500 });
  }

  if (profile?.role !== "seller") {
    return NextResponse.json({ ok: true, skipped: true, reason: "not_seller" });
  }

  const { data: sellerData, error: sellerError } = await sb
    .from("private_sellers")
    .select(
      "user_id,full_name,phone,preferred_contact,intent,property_type,province,city,suburb,street_address,bedrooms,bathrooms,parking,floor_size_m2,erf_size_m2,asking_price,rates_taxes_amount,levies_amount,access_for_viewings,occupancy,available_from,special_features,notes"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (sellerError) {
    return NextResponse.json({ ok: false, error: sellerError.message }, { status: 500 });
  }

  if (!sellerData) {
    return NextResponse.json({ ok: true, skipped: true, reason: "seller_profile_missing" });
  }

  const seller = sellerData as PrivateSeller;

  const { data: existing, error: existingError } = await sb
    .from("listings")
    .select("id,status")
    .eq("agent_id", user.id)
    .eq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ ok: false, error: existingError.message }, { status: 500 });
  }

  if (existing?.id) {
    return NextResponse.json({ ok: true, listingId: existing.id, created: false });
  }

  const saleType = seller.intent?.toLowerCase() === "rent" ? "rent" : "sale";
  const propertyType = normalizeListingType(seller.property_type);
  const title = buildListingTitle({
    bedrooms: seller.bedrooms,
    propertyType,
    suburb: seller.suburb,
    city: seller.city,
  });

  const { data: inserted, error: insertError } = await sb
    .from("listings")
    .insert({
      agent_id: user.id,
      title,
      description: buildDescription(seller),
      status: "draft",
      sale_type: saleType,
      listing_type: propertyType,
      street_address: seller.street_address,
      suburb: seller.suburb,
      city: seller.city,
      province: seller.province,
      price: saleType === "sale" ? seller.asking_price : null,
      price_per_month: saleType === "rent" ? seller.asking_price : null,
      available_from: seller.available_from,
      bedrooms: seller.bedrooms,
      bathrooms: seller.bathrooms,
      parking: seller.parking,
      floor_size_m2: seller.floor_size_m2,
      erf_size_m2: seller.erf_size_m2,
      levy: seller.levies_amount,
      rates_taxes: seller.rates_taxes_amount,
      features: splitFeatures(seller.special_features),
      contact_name: seller.full_name,
      contact_phone: seller.phone,
      contact_email: user.email,
      images: [],
      cover_image: null,
    })
    .select("id")
    .single();

  if (insertError || !inserted?.id) {
    return NextResponse.json(
      { ok: false, error: insertError?.message ?? "Could not create draft listing" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, listingId: inserted.id, created: true });
}

function normalizeListingType(type: string | null) {
  const value = (type ?? "house").trim().toLowerCase().replaceAll(" ", "_");
  if (value === "apartment" || value === "townhouse" || value === "land") return value;
  return "house";
}

function buildListingTitle({
  bedrooms,
  propertyType,
  suburb,
  city,
}: {
  bedrooms: number | null;
  propertyType: string;
  suburb: string | null;
  city: string | null;
}) {
  const type = propertyType.replaceAll("_", " ");
  const location = suburb || city;
  const bedroomText = bedrooms ? `${bedrooms} Bedroom ` : "";
  const title = `${bedroomText}${titleCase(type)}${location ? ` in ${location}` : ""}`;
  return title.trim();
}

function buildDescription(seller: PrivateSeller) {
  const parts = [
    seller.notes,
    seller.special_features ? `Special features: ${seller.special_features}.` : null,
    seller.occupancy ? `Occupancy: ${seller.occupancy}.` : null,
    seller.access_for_viewings ? `Viewings: ${seller.access_for_viewings}.` : null,
  ].filter(Boolean);

  return parts.length ? parts.join("\n\n") : null;
}

function splitFeatures(features: string | null) {
  return (features ?? "")
    .split(",")
    .map((feature) => feature.trim().toLowerCase().replaceAll(" ", "_"))
    .filter(Boolean)
    .slice(0, 20);
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}
