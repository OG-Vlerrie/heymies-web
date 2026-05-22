export type BuyerMatchProfile = {
  budget_min: number | null;
  budget_max: number | null;
  property_types: string[] | null;
  areas?: string[] | null;
  areas_multi?: string[] | null;
  bedrooms_min: number | null;
  bathrooms_min: number | null;
};

export type MatchListing = {
  id: string;
  title: string;
  price: number | null;
  price_per_month?: number | null;
  sale_type?: string | null;
  listing_type?: string | null;
  suburb: string | null;
  city: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
};

export type ListingMatch = {
  score: number;
  reasons: string[];
};

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase().replaceAll("_", " ");
}

function preferredAreas(buyer: BuyerMatchProfile) {
  return [...(buyer.areas ?? []), ...(buyer.areas_multi ?? [])]
    .map(normalize)
    .filter(Boolean);
}

function preferredTypes(buyer: BuyerMatchProfile) {
  return (buyer.property_types ?? []).map(normalize).filter(Boolean);
}

function listingPrice(listing: MatchListing) {
  if (listing.sale_type === "rent") return listing.price_per_month ?? null;
  return listing.price ?? null;
}

export function scoreListingForBuyer(
  listing: MatchListing,
  buyer: BuyerMatchProfile
): ListingMatch {
  let score = 0;
  const reasons: string[] = [];
  const price = listingPrice(listing);

  if (price !== null && buyer.budget_min !== null && buyer.budget_max !== null) {
    if (price >= buyer.budget_min && price <= buyer.budget_max) {
      score += 35;
      reasons.push("Inside budget");
    } else if (price <= buyer.budget_max * 1.1) {
      score += 18;
      reasons.push("Near budget");
    }
  } else if (price !== null && buyer.budget_max !== null) {
    if (price <= buyer.budget_max) {
      score += 30;
      reasons.push("Under max budget");
    } else if (price <= buyer.budget_max * 1.1) {
      score += 18;
      reasons.push("Near budget");
    }
  } else {
    score += 10;
  }

  const areas = preferredAreas(buyer);
  const listingArea = [listing.suburb, listing.city].map(normalize).filter(Boolean);
  if (areas.length === 0) {
    score += 8;
  } else if (
    areas.some((area) =>
      listingArea.some((candidate) => candidate.includes(area) || area.includes(candidate))
    )
  ) {
    score += 25;
    reasons.push("Preferred area");
  }

  const types = preferredTypes(buyer);
  const listingType = normalize(listing.listing_type);
  if (types.length === 0) {
    score += 5;
  } else if (
    listingType &&
    types.some((type) => listingType.includes(type) || type.includes(listingType))
  ) {
    score += 15;
    reasons.push("Property type match");
  }

  if (buyer.bedrooms_min !== null && listing.bedrooms !== null) {
    if (listing.bedrooms >= buyer.bedrooms_min) {
      score += 10;
      reasons.push(`${listing.bedrooms}+ beds`);
    }
  } else {
    score += 4;
  }

  if (buyer.bathrooms_min !== null && listing.bathrooms !== null) {
    if (listing.bathrooms >= buyer.bathrooms_min) {
      score += 8;
      reasons.push(`${listing.bathrooms}+ baths`);
    }
  } else {
    score += 3;
  }

  if (listing.sale_type === "sale") score += 7;
  if (reasons.length === 0) reasons.push("Worth reviewing");

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    reasons: reasons.slice(0, 3),
  };
}
