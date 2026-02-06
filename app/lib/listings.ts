// app/lib/listings.ts
import { createClient } from "@supabase/supabase-js";

export type ListingMode = "buy" | "rent";
export type PropertyType = "house" | "apartment" | "townhouse";

export type ListingSearchParams = {
  mode?: ListingMode;              // buy/rent
  q?: string;                      // area search (city/suburb)
  priceMin?: number;
  priceMax?: number;
  bedsMin?: number;                // 0..5 (treat 5 as 5+ in UI)
  types?: PropertyType[];          // multi-select
  sort?: "new" | "price_asc" | "price_desc";
  page?: number;                   // 1-based
  pageSize?: number;               // default 12
};

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server only
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Queries only LIVE listings with filters + pagination.
 * Returns rows + total count.
 */
export async function searchListings(params: ListingSearchParams) {
  const supabase = getSupabaseServer();

  const pageSize = Math.min(Math.max(params.pageSize ?? 12, 1), 50);
  const page = Math.max(params.page ?? 1, 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("listings")
    .select(
      `
      id,
      title,
      mode,
      status,
      price,
      city,
      suburb,
      property_type,
      bedrooms,
      bathrooms,
      parking,
      description,
      cover_image_url,
      created_at
    `,
      { count: "exact" }
    )
    .eq("status", "live");

  // Buy/Rent
  if (params.mode) query = query.eq("mode", params.mode);

  // Area search across city/suburb (basic ILIKE; upgrade later with full-text)
  if (params.q && params.q.trim().length > 0) {
    const q = params.q.trim();
    query = query.or(`city.ilike.%${q}%,suburb.ilike.%${q}%`);
  }

  // Price
  if (typeof params.priceMin === "number") query = query.gte("price", params.priceMin);
  if (typeof params.priceMax === "number") query = query.lte("price", params.priceMax);

  // Beds min (UI can treat 5 as "5+")
  if (typeof params.bedsMin === "number") query = query.gte("bedrooms", params.bedsMin);

  // Property types
  if (params.types && params.types.length > 0) query = query.in("property_type", params.types);

  // Sorting
  switch (params.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "new":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw new Error(error.message);

  return {
    rows: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    hasMore: (from + (data?.length ?? 0)) < (count ?? 0),
  };
}
