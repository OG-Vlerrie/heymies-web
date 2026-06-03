"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { getListingQuality } from "@/lib/listing-quality";

const LISTING_TYPES = ["house", "apartment", "townhouse", "duplex", "cluster", "land", "commercial"] as const;
const SALE_TYPES = ["sale", "rent"] as const;
const MAX_LISTING_IMAGES = 50;

const FEATURE_OPTIONS = [
  "pool",
  "garden",
  "balcony",
  "security",
  "electric_fence",
  "cctv",
  "solar",
  "inverter",
  "generator",
  "borehole",
  "fibre",
  "aircon",
  "fireplace",
  "braai",
  "gym",
] as const;

/* ------------------ Description Generator Helpers ------------------ */

function formatZAR(n: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(n);
}

function titleCase(s: string) {
  return s
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function generateListingDescription(input: {
  saleType: "sale" | "rent";
  listingType: string;
  title: string;

  suburb: string;
  city: string;
  province: string;

  priceNum: number | null;
  depositNum: number | null;
  availableFrom: string;

  bedroomsNum: number | null;
  bathroomsNum: number | null;
  garagesNum: number | null;
  parkingNum: number | null;
  floorSizeNum: number | null;
  erfSizeNum: number | null;

  petsAllowed: boolean;
  furnished: boolean;
  features: string[];

  levyNum: number | null;
  ratesTaxesNum: number | null;
}) {
  const loc = [input.suburb, input.city].filter(Boolean).join(", ");

  const lines: string[] = [];

  const bedBath = [
    input.bedroomsNum != null ? `${input.bedroomsNum} bedroom` : null,
    input.bathroomsNum != null ? `${input.bathroomsNum} bathroom` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const type = titleCase(input.listingType);

  lines.push(`${type}${bedBath ? ` • ${bedBath}` : ""} in ${loc}${input.province ? `, ${input.province}` : ""}.`);

  if (input.title?.trim()) lines.push(input.title.trim());

  if (input.priceNum != null) {
    if (input.saleType === "sale") {
      lines.push(`Asking price: ${formatZAR(input.priceNum)}.`);
    } else {
      const rentBits = [`Rent: ${formatZAR(input.priceNum)} per month`];
      if (input.depositNum != null) rentBits.push(`Deposit: ${formatZAR(input.depositNum)}`);
      if (input.availableFrom) rentBits.push(`Available: ${input.availableFrom}`);
      lines.push(rentBits.join(" • ") + ".");
    }
  }

  const specs: string[] = [];
  if (input.garagesNum != null) specs.push(`${input.garagesNum} garage${input.garagesNum === 1 ? "" : "s"}`);
  if (input.parkingNum != null) specs.push(`${input.parkingNum} parking`);
  if (input.floorSizeNum != null) specs.push(`${input.floorSizeNum}m² floor size`);
  if (input.erfSizeNum != null) specs.push(`${input.erfSizeNum}m² erf`);
  if (specs.length) lines.push(`Property features: ${specs.join(" • ")}.`);

  const costs: string[] = [];
  if (input.levyNum != null) costs.push(`Levy: ${formatZAR(input.levyNum)} p/m`);
  if (input.ratesTaxesNum != null) costs.push(`Rates & taxes: ${formatZAR(input.ratesTaxesNum)} p/m`);
  if (costs.length) lines.push(costs.join(" • ") + ".");

  const flags: string[] = [];
  if (input.furnished) flags.push("Furnished");
  if (input.petsAllowed) flags.push("Pets allowed");
  if (flags.length) lines.push(flags.join(" • ") + ".");

  if (input.features?.length) {
    const pretty = input.features.map(titleCase);
    lines.push(`Extras: ${pretty.join(", ")}.`);
  }

  return lines.join("\n\n").trim();
}

/* ------------------------------ Page ------------------------------ */

export default function NewListingPage() {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);

  // Core
  const [saleType, setSaleType] = useState<(typeof SALE_TYPES)[number]>("sale");
  const [listingType, setListingType] = useState<(typeof LISTING_TYPES)[number]>("house");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Price
  const [price, setPrice] = useState(""); // sale price OR rent per month
  const [deposit, setDeposit] = useState("");
  const [availableFrom, setAvailableFrom] = useState(""); // YYYY-MM-DD
  const [levy, setLevy] = useState("");
  const [ratesTaxes, setRatesTaxes] = useState("");

  // Property details
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [garages, setGarages] = useState("");
  const [parking, setParking] = useState("");
  const [floorSize, setFloorSize] = useState("");
  const [erfSize, setErfSize] = useState("");

  // Flags
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [furnished, setFurnished] = useState(false);

  // Location
  const [streetAddress, setStreetAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Optional coords
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  // Features
  const [features, setFeatures] = useState<string[]>([]);

  // Contact
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // Photos
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);

  // Separate loading states (AI vs Create Listing)
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  function cleanNumber(input: string) {
    const v = input.trim().replace(/[^\d.]/g, "");
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function cleanInt(input: string) {
    const v = input.trim().replace(/[^\d]/g, "");
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  }

  function toggleFeature(f: string) {
    setFeatures((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  }

  function onPickImages(selected: FileList | null) {
    if (!selected) return;

    const picked = Array.from(selected)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, MAX_LISTING_IMAGES);

    setFiles(picked);
    setCoverIndex(0);

    const nextPreviews = picked.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => {
      prev.forEach((u) => URL.revokeObjectURL(u));
      return nextPreviews;
    });
  }

  function removeImage(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setCoverIndex((current) => {
      if (current === idx) return 0;
      if (current > idx) return current - 1;
      return current;
    });
    setPreviews((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(idx, 1);
      if (removed) URL.revokeObjectURL(removed);
      return copy;
    });
  }

  async function uploadImages(userId: string, listingId: string) {
    if (files.length === 0) return { urls: [] as string[], cover: null as string | null };

    const bucket = supabase.storage.from("listing-images");
    const urls: string[] = [];

    for (const f of files) {
      const ext = (f.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const path = `${userId}/${listingId}/${fileName}`;

      const { error: upErr } = await bucket.upload(path, f, {
        upsert: false,
        contentType: f.type,
      });

      if (upErr) throw upErr;

      const { data: pub } = bucket.getPublicUrl(path);
      urls.push(pub.publicUrl);
    }

    return { urls, cover: urls[coverIndex] ?? urls[0] ?? null };
  }

  function onGenerateDescription() {
    const priceNum = cleanNumber(price);
    const depositNum = cleanNumber(deposit);

    const next = generateListingDescription({
      saleType,
      listingType,
      title,

      suburb,
      city,
      province,

      priceNum,
      depositNum,
      availableFrom,

      bedroomsNum: cleanInt(bedrooms),
      bathroomsNum: cleanNumber(bathrooms),
      garagesNum: cleanInt(garages),
      parkingNum: cleanInt(parking),
      floorSizeNum: cleanInt(floorSize),
      erfSizeNum: cleanInt(erfSize),

      petsAllowed,
      furnished,
      features,

      levyNum: cleanNumber(levy),
      ratesTaxesNum: cleanNumber(ratesTaxes),
    });

    setDescription(next);
  }

  async function onGenerateDescriptionAI() {
    setError(null);

    const priceNum = cleanNumber(price);
    if (priceNum == null) return setError("Please enter a price first.");
    if (!suburb.trim() || !city.trim() || !province.trim())
      return setError("Please fill Suburb, City, and Province first.");

    const payload = {
      saleType,
      listingType,
      title: title.trim(),

      suburb: suburb.trim(),
      city: city.trim(),
      province: province.trim(),

      price: priceNum,
      deposit: cleanNumber(deposit),
      availableFrom: availableFrom || null,

      bedrooms: cleanInt(bedrooms),
      bathrooms: cleanNumber(bathrooms),
      garages: cleanInt(garages),
      parking: cleanInt(parking),
      floorSize: cleanInt(floorSize),
      erfSize: cleanInt(erfSize),

      petsAllowed,
      furnished,
      features,
    };

    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/listing-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "AI generation failed.");

      setDescription(data.description || "");
    } catch (e: any) {
      setDescription(
        generateListingDescription({
          saleType,
          listingType,
          title,

          suburb,
          city,
          province,

          priceNum,
          depositNum: cleanNumber(deposit),
          availableFrom,

          bedroomsNum: cleanInt(bedrooms),
          bathroomsNum: cleanNumber(bathrooms),
          garagesNum: cleanInt(garages),
          parkingNum: cleanInt(parking),
          floorSizeNum: cleanInt(floorSize),
          erfSizeNum: cleanInt(erfSize),

          petsAllowed,
          furnished,
          features,

          levyNum: cleanNumber(levy),
          ratesTaxesNum: cleanNumber(ratesTaxes),
        })
      );
      setError("AI generation is unavailable, so I added a draft description from the listing details.");
    } finally {
      setAiLoading(false);
    }
  }

  async function createListing() {
    setError(null);

    if (!title.trim()) return setError("Title is required.");
    if (!suburb.trim() || !city.trim() || !province.trim()) return setError("Suburb, City, and Province are required.");

    const priceNum = cleanNumber(price);
    if (priceNum === null) return setError(saleType === "sale" ? "Sale price is required." : "Rent per month is required.");

    if (files.length === 0) return setError("Please select at least 1 photo.");

    const finalDescription =
      description.trim() ||
      generateListingDescription({
        saleType,
        listingType,
        title,

        suburb,
        city,
        province,

        priceNum,
        depositNum: cleanNumber(deposit),
        availableFrom,

        bedroomsNum: cleanInt(bedrooms),
        bathroomsNum: cleanNumber(bathrooms),
        garagesNum: cleanInt(garages),
        parkingNum: cleanInt(parking),
        floorSizeNum: cleanInt(floorSize),
        erfSizeNum: cleanInt(erfSize),

        petsAllowed,
        furnished,
        features,

        levyNum: cleanNumber(levy),
        ratesTaxesNum: cleanNumber(ratesTaxes),
      });

    setLoading(true);

    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) {
      setLoading(false);
      router.push("/login");
      return;
    }

    const salePrice = saleType === "sale" ? priceNum : null;
    const rentPerMonth = saleType === "rent" ? priceNum : null;
    const quality = getListingQuality({
      agent_id: user.id,
      title,
      description: finalDescription,
      sale_type: saleType,
      listing_type: listingType,
      price: salePrice,
      price_per_month: rentPerMonth,
      suburb,
      city,
      province,
      bedrooms: cleanInt(bedrooms),
      bathrooms: cleanNumber(bathrooms),
      contact_email: contactEmail,
      contact_phone: contactPhone,
      images: files.map((file) => file.name),
    });

    if (!quality.isPublishable) {
      setLoading(false);
      return setError(`This listing is not Mia-ready yet. Missing: ${quality.blocking.join(", ")}.`);
    }

    const { data: inserted, error: insErr } = await supabase
      .from("listings")
      .insert({
        agent_id: user.id,

        title: title.trim(),
        description: finalDescription || null,
        status: "active",

        sale_type: saleType,
        listing_type: listingType,

        street_address: streetAddress.trim() || null,
        suburb: suburb.trim(),
        city: city.trim(),
        province: province.trim(),
        postal_code: postalCode.trim() || null,

        price: salePrice,
        price_per_month: rentPerMonth,
        deposit: saleType === "rent" ? cleanNumber(deposit) : null,
        available_from: saleType === "rent" && availableFrom ? availableFrom : null,

        bedrooms: cleanInt(bedrooms),
        bathrooms: cleanNumber(bathrooms),
        garages: cleanInt(garages),
        parking: cleanInt(parking),
        floor_size_m2: cleanInt(floorSize),
        erf_size_m2: cleanInt(erfSize),

        levy: cleanNumber(levy),
        rates_taxes: cleanNumber(ratesTaxes),

        pets_allowed: petsAllowed,
        furnished: furnished,

        features: features,

        lat: cleanNumber(lat),
        lng: cleanNumber(lng),

        contact_name: contactName.trim() || null,
        contact_phone: contactPhone.trim() || null,
        contact_email: contactEmail.trim() || null,

        images: [],
        cover_image: null,
      })
      .select("id")
      .single();

    if (insErr || !inserted?.id) {
      setLoading(false);
      return setError(insErr?.message ?? "Failed to create listing.");
    }

    const listingId = inserted.id as string;

    try {
      const { urls, cover } = await uploadImages(user.id, listingId);

      const { error: upErr } = await supabase.from("listings").update({ images: urls, cover_image: cover }).eq("id", listingId);
      if (upErr) throw upErr;

      const { data: sessionRes } = await supabase.auth.getSession();
      const accessToken = sessionRes.session?.access_token;

      if (accessToken) {
        fetch("/api/listings/run-matching", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ listingId, minScore: 55 }),
        }).catch((matchError) => {
          console.error("Failed to run buyer matching:", matchError);
        });
      }

      setLoading(false);
      router.push("/dashboard/listings");
    } catch (e: any) {
      setLoading(false);
      setError(e?.message ?? "Upload failed.");
    }
  }

  return (
    <main className="tech-page">
      <div className="mx-auto max-w-3xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Add Listing</h1>
            <p className="mt-1 text-sm text-slate-600">Create a property listing</p>
          </div>

          <button
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 hover:bg-slate-50"
            onClick={() => router.push("/dashboard/listings")}
          >
            Back
          </button>
        </div>

        <div className="mt-6 grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* Core */}
          <section className="grid gap-3">
            <h2 className="font-semibold text-slate-900">Listing basics</h2>
            <p className="text-sm text-slate-600">
              Start with the public category, transaction type, and a clear headline buyers can scan.
            </p>

            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Sale or rental type" help="Choose whether this property is for sale or to rent.">
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                  value={saleType}
                  onChange={(e) => setSaleType(e.target.value as any)}
                >
                  {SALE_TYPES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Property type" help="Pick the closest property category for buyer filters and matching.">
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value as any)}
                >
                  {LISTING_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Listing title *" help="Example: 3 bedroom family home in Parkhurst.">
              <input
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>

            {false ? (
            <Field label="Description">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">Optional: auto-generate from fields</span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onGenerateDescription}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    Generate (template)
                  </button>

                  <button
                    type="button"
                    onClick={onGenerateDescriptionAI}
                    className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                    disabled={aiLoading}
                  >
                    {aiLoading ? "Generating…" : "Generate (AI)"}
                  </button>
                </div>
              </div>

              <textarea
                className="min-h-[140px] w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
            ) : null}
          </section>

          {/* Photos */}
          <section className="grid gap-3">
            <h2 className="font-semibold text-slate-900">Photos *</h2>
            <p className="text-sm text-slate-600">
              Add clear photos of the exterior, main rooms, kitchen, bathrooms, and standout features.
            </p>

            <div>
              <label
                htmlFor="listing-photos"
                className="inline-flex cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Add Photos
              </label>
              <input
                id="listing-photos"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => onPickImages(e.target.files)}
                className="sr-only"
              />
            </div>

            <p className="text-xs text-slate-600">Up to 50 images. Choose one selected photo as the listing cover.</p>

            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
                {previews.map((src, idx) => (
                  <div key={src} className="relative overflow-hidden rounded-xl border border-slate-200">
                    <img src={src} alt={`Preview ${idx + 1}`} className="h-28 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute right-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-xs"
                    >
                      Remove
                    </button>
                    {idx === coverIndex && (
                      <span className="absolute left-2 top-2 rounded-lg bg-emerald-700 px-2 py-1 text-xs text-white">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setCoverIndex(idx)}
                      className="absolute bottom-2 left-2 right-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-semibold"
                    >
                      {idx === coverIndex ? "Cover photo" : "Set as cover"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pricing */}
          <section className="grid gap-3">
            <h2 className="font-semibold text-slate-900">Pricing</h2>
            <p className="text-sm text-slate-600">
              Enter the amount buyers or tenants will see. Monthly costs help people compare homes accurately.
            </p>

            <div className="grid gap-3 md:grid-cols-2">
              <Field
                label={saleType === "sale" ? "Sale price (ZAR) *" : "Rent per month (ZAR) *"}
                help={saleType === "sale" ? "Use the asking price before any negotiation." : "Use the monthly rental amount, excluding deposit."}
              >
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </Field>

              {saleType === "rent" ? (
                <Field label="Deposit (ZAR)" help="Usually one or two months' rent. Leave blank if not set yet.">
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                  />
                </Field>
              ) : (
                <div />
              )}

              {saleType === "rent" ? (
                <Field label="Available from" help="When a tenant can move in.">
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                    type="date"
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                  />
                </Field>
              ) : (
                <div />
              )}

              <Field label="Levies (monthly)" help="Monthly body corporate or HOA levies, if applicable.">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                  value={levy}
                  onChange={(e) => setLevy(e.target.value)}
                />
              </Field>

              <Field label="Rates and taxes (monthly)" help="Municipal rates and taxes, if known.">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                  value={ratesTaxes}
                  onChange={(e) => setRatesTaxes(e.target.value)}
                />
              </Field>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <Toggle label="Pets allowed" checked={petsAllowed} onChange={setPetsAllowed} />
              <Toggle label="Furnished" checked={furnished} onChange={setFurnished} />
            </div>
          </section>

          {/* Property details */}
          <section className="grid gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Property details</h2>
            <p className="text-sm text-slate-600">
              Add the practical specs buyers use to shortlist and compare properties.
            </p>

            <div className="grid gap-3 md:grid-cols-5">
              <Field label="Bedrooms" help="Use 0 for studio, bachelor, land, or commercial listings.">
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                >
                  <option value="">—</option>
                  {["0", "1", "2", "3", "4", "5", "6", "7", "8+"].map((v) => (
                    <option key={v} value={v === "8+" ? "8" : v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Bathrooms" help="Half bathrooms can be selected where relevant.">
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                >
                  <option value="">—</option>
                  {["1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5+"].map((v) => (
                    <option key={v} value={v === "5+" ? "5" : v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Garages" help="Covered lock-up garages only.">
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                  value={garages}
                  onChange={(e) => setGarages(e.target.value)}
                >
                  <option value="">—</option>
                  {["0", "1", "2", "3", "4+"].map((v) => (
                    <option key={v} value={v === "4+" ? "4" : v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Open parking bays" help="Carports, driveway spaces, or open bays.">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                  value={parking}
                  onChange={(e) => setParking(e.target.value)}
                  placeholder="e.g. 2"
                />
              </Field>

              <div />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Floor size (m²)">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                  value={floorSize}
                  onChange={(e) => setFloorSize(e.target.value)}
                  placeholder="e.g. 98"
                />
              </Field>

              <Field label="Erf size (m²)">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                  value={erfSize}
                  onChange={(e) => setErfSize(e.target.value)}
                  placeholder="e.g. 420"
                />
              </Field>
            </div>
          </section>

          {/* Features */}
          <section className="grid gap-3">
            <h2 className="font-semibold text-slate-900">Features</h2>
            <p className="text-sm text-slate-600">
              Select the standout features that should appear in matching and the generated description.
            </p>
            <div className="flex flex-wrap gap-2">
              {FEATURE_OPTIONS.map((f) => {
                const active = features.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFeature(f)}
                    className={
                      active
                        ? "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800"
                        : "rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    }
                  >
                    {f.replaceAll("_", " ")}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Location */}
          <section className="grid gap-3">
            <h2 className="font-semibold text-slate-900">Location</h2>
            <p className="text-sm text-slate-600">
              Suburb, city, and province are public. Street address can stay private until enquiry if needed.
            </p>

            <Field label="Street address" help="Optional, but useful for accurate internal records.">
              <input
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
              />
            </Field>

            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Suburb or area *" help="Example: Sandton, Parkhurst, Umhlanga.">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                />
              </Field>

              <Field label="City *" help="Example: Johannesburg, Cape Town, Durban.">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </Field>

              <Field label="Province *" help="Use the South African province name.">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                />
              </Field>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Postal code" help="Optional.">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </Field>

              <Field label="Latitude (optional)" help="Only needed if you already have exact map coordinates.">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                />
              </Field>

              <Field label="Longitude (optional)" help="Only needed if you already have exact map coordinates.">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                />
              </Field>
            </div>
          </section>

          {/* Contact */}
          <section className="grid gap-3">
            <h2 className="font-semibold text-slate-900">Contact (optional)</h2>
            <p className="text-sm text-slate-600">
              Add the person buyers or agents should contact about this listing. Leave blank to use account details later.
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Contact name" help="The public or handover contact for this listing.">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </Field>

              <Field label="Contact phone" help="Use a WhatsApp-friendly number if possible.">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </Field>

              <Field label="Contact email" help="Enquiry notifications can use this address.">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </Field>
            </div>
          </section>

          {/* Description */}
          <section className="grid gap-3 border-t border-slate-200 pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Listing description</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Write the public description last, once the facts above are complete.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onGenerateDescription}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Generate template
                </button>

                <button
                  type="button"
                  onClick={onGenerateDescriptionAI}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                  disabled={aiLoading}
                >
                  {aiLoading ? "Generating..." : "Generate with AI"}
                </button>
              </div>
            </div>

            <Field label="Description" help="Include layout, condition, standout features, access, and anything buyers should know before enquiring.">
              <textarea
                className="min-h-[160px] w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
          </section>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            className="rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
            onClick={createListing}
            disabled={loading}
          >
            {loading ? "Creating…" : "Create Listing"}
          </button>
        </div>
      </div>
    </main>
  );
}

/* ---------------------------- Components --------------------------- */

function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {help ? <span className="text-xs text-slate-500">{help}</span> : null}
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5" />
    </label>
  );
}
