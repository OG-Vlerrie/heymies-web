export type ListingQualityInput = {
  id?: string | null;
  title?: string | null;
  description?: string | null;
  agent_id?: string | null;
  sale_type?: string | null;
  listing_type?: string | null;
  price?: number | null;
  price_per_month?: number | null;
  suburb?: string | null;
  city?: string | null;
  province?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  images?: string[] | null;
  cover_image?: string | null;
};

export type ListingQualityCheck = {
  key: string;
  label: string;
  passed: boolean;
  required: boolean;
  detail: string;
};

export type ListingQuality = {
  score: number;
  isPublishable: boolean;
  blocking: string[];
  recommendations: string[];
  checks: ListingQualityCheck[];
};

export function getListingQuality(listing: ListingQualityInput): ListingQuality {
  const images = Array.isArray(listing.images) ? listing.images.filter(Boolean) : [];
  const price = listing.sale_type === "rent" ? listing.price_per_month : listing.price;

  const checks: ListingQualityCheck[] = [
    {
      key: "title",
      label: "Clear listing title",
      passed: Boolean(listing.title?.trim()),
      required: true,
      detail: "Used in public cards, Mia emails, and agent handover.",
    },
    {
      key: "sale_type",
      label: "Sale or rental type",
      passed: listing.sale_type === "sale" || listing.sale_type === "rent",
      required: true,
      detail: "Mia needs this to price and phrase the lead correctly.",
    },
    {
      key: "listing_type",
      label: "Property type",
      passed: Boolean(listing.listing_type?.trim()),
      required: true,
      detail: "Used for buyer matching against property preferences.",
    },
    {
      key: "price",
      label: "Price",
      passed: typeof price === "number" && Number.isFinite(price) && price > 0,
      required: true,
      detail: "Used for budget matching and buyer alert emails.",
    },
    {
      key: "location",
      label: "Suburb, city, and province",
      passed: Boolean(listing.suburb?.trim() && listing.city?.trim() && listing.province?.trim()),
      required: true,
      detail: "Used for area matching, listing search, and email context.",
    },
    {
      key: "beds_baths",
      label: "Bedrooms and bathrooms",
      passed:
        typeof listing.bedrooms === "number" &&
        Number.isFinite(listing.bedrooms) &&
        typeof listing.bathrooms === "number" &&
        Number.isFinite(listing.bathrooms),
      required: true,
      detail: "Used to score buyer fit and reduce poor handovers.",
    },
    {
      key: "photos",
      label: "At least one photo",
      passed: images.length > 0 || Boolean(listing.cover_image?.trim()),
      required: true,
      detail: "Buyers need visual confidence before Mia can create useful interest.",
    },
    {
      key: "handover",
      label: "Handover route",
      passed: Boolean(listing.agent_id || listing.contact_email?.trim()),
      required: true,
      detail: "Mia needs an owner account or contact email for agent-ready leads.",
    },
    {
      key: "description",
      label: "Useful description",
      passed: (listing.description?.trim().length ?? 0) >= 80,
      required: false,
      detail: "Helps buyers decide and gives Mia better context for follow-up.",
    },
    {
      key: "contact_phone",
      label: "Contact phone",
      passed: Boolean(listing.contact_phone?.trim()),
      required: false,
      detail: "Makes handover faster when a ready buyer wants a viewing.",
    },
  ];

  const blocking = checks
    .filter((check) => check.required && !check.passed)
    .map((check) => check.label);
  const recommendations = checks
    .filter((check) => !check.required && !check.passed)
    .map((check) => check.label);
  const score = Math.round((checks.filter((check) => check.passed).length / checks.length) * 100);

  return {
    score,
    isPublishable: blocking.length === 0,
    blocking,
    recommendations,
    checks,
  };
}
