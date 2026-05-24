import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getListingQuality } from "@/lib/listing-quality";
import { logAdminActivity } from "@/lib/admin-activity";

const ALLOWED_STATUSES = new Set(["active", "draft", "inactive"]);
const EDITABLE_FIELDS = new Set([
  "title",
  "description",
  "status",
  "sale_type",
  "listing_type",
  "price",
  "price_per_month",
  "deposit",
  "available_from",
  "bedrooms",
  "bathrooms",
  "garages",
  "parking",
  "floor_size_m2",
  "erf_size_m2",
  "levy",
  "rates_taxes",
  "pets_allowed",
  "furnished",
  "street_address",
  "suburb",
  "city",
  "province",
  "postal_code",
  "features",
  "contact_name",
  "contact_email",
  "contact_phone",
  "images",
  "cover_image",
]);

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    if (status !== undefined && !ALLOWED_STATUSES.has(String(status))) {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }

    const sb = supabaseAdmin();
    const update: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(body)) {
      if (!EDITABLE_FIELDS.has(key)) continue;
      update[key] = cleanValue(key, value);
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ ok: false, error: "No supported fields supplied" }, { status: 400 });
    }

    if (update.status === "active") {
      const { data: currentListing, error: listingErr } = await sb
        .from("listings")
        .select(
          "id,agent_id,title,description,sale_type,listing_type,price,price_per_month,suburb,city,province,bedrooms,bathrooms,contact_email,contact_phone,images,cover_image"
        )
        .eq("id", id)
        .single();

      if (listingErr) {
        return NextResponse.json({ ok: false, error: listingErr.message }, { status: 500 });
      }

      const nextListing = { ...(currentListing ?? {}), ...update };
      const quality = getListingQuality(nextListing);
      if (!quality.isPublishable) {
        return NextResponse.json(
          { ok: false, error: `Listing is not Mia-ready. Missing: ${quality.blocking.join(", ")}.` },
          { status: 400 }
        );
      }
    }

    const { error } = await sb.from("listings").update(update).eq("id", id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    await logAdminActivity({
      req,
      action: update.status ? `listing_${String(update.status)}` : "listing_update",
      entityType: "listing",
      entityId: String(id),
      summary: update.status
        ? `Admin changed listing status to ${String(update.status)}.`
        : "Admin updated listing.",
      metadata: update,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}

function cleanValue(key: string, value: unknown) {
  if (["images", "features"].includes(key)) {
    return Array.isArray(value) ? value.map(String).map((item) => item.trim()).filter(Boolean).slice(0, 50) : [];
  }

  if (
    [
      "price",
      "price_per_month",
      "deposit",
      "bathrooms",
      "floor_size_m2",
      "erf_size_m2",
      "levy",
      "rates_taxes",
    ].includes(key)
  ) {
    if (value === "" || value === null || value === undefined) return null;
    const next = Number(value);
    return Number.isFinite(next) ? next : null;
  }

  if (["bedrooms", "garages", "parking"].includes(key)) {
    if (value === "" || value === null || value === undefined) return null;
    const next = Number(value);
    return Number.isFinite(next) ? Math.trunc(next) : null;
  }

  if (["pets_allowed", "furnished"].includes(key)) {
    return Boolean(value);
  }

  if (value === "") return null;
  return value;
}
