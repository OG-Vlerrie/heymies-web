"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

const LISTING_TYPES = ["house", "apartment", "townhouse", "duplex", "cluster", "land", "commercial"] as const;
const SALE_TYPES = ["sale", "rent"] as const;

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

type ListingRow = {
  id: string;
  agent_id: string;

  sale_type: (typeof SALE_TYPES)[number] | null;
  listing_type: (typeof LISTING_TYPES)[number] | string | null;

  title: string;
  description: string | null;

  price: number | null;
  price_per_month: number | null;
  deposit: number | null;
  available_from: string | null;

  bedrooms: number | null;
  bathrooms: number | null;
  garages: number | null;
  parking: number | null;
  floor_size_m2: number | null;
  erf_size_m2: number | null;

  levy: number | null;
  rates_taxes: number | null;

  pets_allowed: boolean | null;
  furnished: boolean | null;

  street_address: string | null;
  suburb: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;

  lat: number | null;
  lng: number | null;

  features: string[] | null;

  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;

  images: string[] | null;
  cover_image: string | null;

  status: string;
	show_on_public?: boolean | null;
};

export default function EditListingPage() {
  const params = useParams<{ id: string }>();
  const listingId = params?.id;

  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);

  // Core
  const [saleType, setSaleType] = useState<(typeof SALE_TYPES)[number]>("sale");
  const [listingType, setListingType] = useState<(typeof LISTING_TYPES)[number]>("house");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Price
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [availableFrom, setAvailableFrom] = useState(""); // YYYY-MM-DD
  const [levy, setLevy] = useState("");
  const [ratesTaxes, setRatesTaxes] = useState("");

  // Property
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
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);

  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!listingId) return;

    (async () => {
      setError(null);
      setLoading(true);

      // 1) Ensure logged in
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);

      // 2) Block buyers from dashboard edits
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (prof?.role === "buyer") {
        router.push("/dashboard");
        return;
      }

      // 3) Load listing
      const { data, error: lErr } = await supabase
        .from("listings")
        .select(
          [
            "id",
            "agent_id",
            "sale_type",
            "listing_type",
            "title",
            "description",
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
            "lat",
            "lng",
            "features",
            "contact_name",
            "contact_phone",
            "contact_email",
            "images",
            "cover_image",
            "status",
          ].join(",")
        )
        .eq("id", listingId)
        .single();

      if (lErr || !data) {
        setError(lErr?.message ?? "Listing not found.");
        setLoading(false);
        return;
      }

      const row = data as ListingRow;

      // 4) Ownership check
      if (row.agent_id !== user.id) {
        setError("You do not have access to edit this listing.");
        setLoading(false);
        return;
      }

      // Prefill state
      const sType = (row.sale_type ?? "sale") as (typeof SALE_TYPES)[number];
      setSaleType(sType);

      const lType = (row.listing_type ?? "house") as (typeof LISTING_TYPES)[number];
      setListingType(lType);

      setTitle(row.title ?? "");
      setDescription(row.description ?? "");

      // price field shows sale price OR rent per month
      setPrice(String(sType === "rent" ? row.price_per_month ?? "" : row.price ?? ""));
      setDeposit(String(row.deposit ?? ""));
      setAvailableFrom(row.available_from ?? "");
      setLevy(String(row.levy ?? ""));
      setRatesTaxes(String(row.rates_taxes ?? ""));

      setBedrooms(row.bedrooms != null ? String(row.bedrooms) : "");
      setBathrooms(row.bathrooms != null ? String(row.bathrooms) : "");
      setGarages(row.garages != null ? String(row.garages) : "");
      setParking(row.parking != null ? String(row.parking) : "");
      setFloorSize(row.floor_size_m2 != null ? String(row.floor_size_m2) : "");
      setErfSize(row.erf_size_m2 != null ? String(row.erf_size_m2) : "");

      setPetsAllowed(!!row.pets_allowed);
      setFurnished(!!row.furnished);

      setStreetAddress(row.street_address ?? "");
      setSuburb(row.suburb ?? "");
      setCity(row.city ?? "");
      setProvince(row.province ?? "");
      setPostalCode(row.postal_code ?? "");

      setLat(row.lat != null ? String(row.lat) : "");
      setLng(row.lng != null ? String(row.lng) : "");

      setFeatures(row.features ?? []);

      setContactName(row.contact_name ?? "");
      setContactPhone(row.contact_phone ?? "");
      setContactEmail(row.contact_email ?? "");

      const imgs = row.images ?? [];
      setExistingImages(imgs);
      setCoverImage(row.cover_image ?? imgs[0] ?? null);

      setLoading(false);
    })();

    // cleanup previews on unmount
    return () => {
      setNewPreviews((prev) => {
        prev.forEach((u) => URL.revokeObjectURL(u));
        return [];
      });
    };
  }, [listingId, router, supabase]);

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

    const picked = Array.from(selected).filter((f) => f.type.startsWith("image/"));

    // limit total to 12 (existing + new)
    const allowed = Math.max(0, 12 - existingImages.length - newFiles.length);
    const toAdd = picked.slice(0, allowed);

    if (toAdd.length === 0) return;

    setNewFiles((prev) => [...prev, ...toAdd]);

    const next = toAdd.map((f) => URL.createObjectURL(f));
    setNewPreviews((prev) => [...prev, ...next]);
  }

  function removeNewImage(idx: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(idx, 1);
      if (removed) URL.revokeObjectURL(removed);
      return copy;
    });
  }

  function removeExistingImage(url: string) {
    setExistingImages((prev) => {
      const next = prev.filter((x) => x !== url);

      // if we removed cover, pick next best
      setCoverImage((cur) => {
        if (cur !== url) return cur;
        return next[0] ?? null;
      });

      return next;
    });
  }

  function setAsCover(url: string) {
    setCoverImage(url);
  }

  async function uploadNewImages(uid: string, listingId: string) {
    if (newFiles.length === 0) return [] as string[];

    const bucket = supabase.storage.from("listing-images");
    const urls: string[] = [];

    for (const f of newFiles) {
      const ext = (f.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const path = `${uid}/${listingId}/${fileName}`;

      const { error: upErr } = await bucket.upload(path, f, {
        upsert: false,
        contentType: f.type,
      });

      if (upErr) throw upErr;

      const { data: pub } = bucket.getPublicUrl(path);
      urls.push(pub.publicUrl);
    }

    return urls;
  }

  async function onSave() {
    if (!listingId) return;

    setError(null);

    // Required
    if (!title.trim()) return setError("Title is required.");
    if (!suburb.trim() || !city.trim() || !province.trim()) return setError("Suburb, City, and Province are required.");

    const priceNum = cleanNumber(price);
    if (priceNum === null) return setError(saleType === "sale" ? "Sale price is required." : "Rent per month is required.");

    if (!userId) return setError("Not authenticated.");

    setSaving(true);

    try {
      // 1) Upload new images
      const uploaded = await uploadNewImages(userId, listingId);

      // 2) Merge images
      const mergedImages = [...existingImages, ...uploaded];

      // 3) Determine cover
      const finalCover = coverImage && mergedImages.includes(coverImage) ? coverImage : mergedImages[0] ?? null;

      // 4) Build price fields
      const salePrice = saleType === "sale" ? priceNum : null;
      const rentPerMonth = saleType === "rent" ? priceNum : null;

      // 5) Update listing
      const { error: upErr } = await supabase
        .from("listings")
        .update({
          title: title.trim(),
          description: description.trim() || null,

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

          images: mergedImages,
          cover_image: finalCover,
        })
        .eq("id", listingId);

      if (upErr) throw upErr;

      // clear new uploads UI
      setNewFiles([]);
      setNewPreviews((prev) => {
        prev.forEach((u) => URL.revokeObjectURL(u));
        return [];
      });

      setExistingImages(mergedImages);
      setCoverImage(finalCover);

      setSaving(false);
      router.push("/dashboard/listings");
    } catch (e: any) {
      setSaving(false);
      setError(e?.message ?? "Failed to update listing.");
    }
  }

  if (loading) return <main className="mx-auto max-w-3xl p-6">Loading listing…</main>;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Edit Listing</h1>
            <p className="mt-1 text-sm text-slate-600">Update property details</p>
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
            <h2 className="font-semibold text-slate-900">Core</h2>

            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Sale type">
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

              <Field label="Listing type">
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

            <Field label="Title *">
              <input className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>

            <Field label="Description">
              <textarea className="min-h-[140px] w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900" value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
          </section>

          {/* Photos */}
          <section className="grid gap-3">
            <h2 className="font-semibold text-slate-900">Photos</h2>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Current images</p>
              <p className="mt-1 text-xs text-slate-600">
                Click “Set cover” on an image to choose the cover photo.
              </p>

              {existingImages.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600">No images yet.</p>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {existingImages.map((url) => (
                    <div key={url} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <img src={url} alt="Listing" className="h-28 w-full object-cover" />
                      {coverImage === url ? (
                        <span className="absolute left-2 top-2 rounded-lg bg-emerald-700 px-2 py-1 text-xs text-white">
                          Cover
                        </span>
                      ) : null}

                      <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAsCover(url)}
                          className="flex-1 rounded-lg bg-white/90 px-2 py-1 text-xs font-semibold"
                        >
                          Set cover
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(url)}
                          className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Add new images</p>
              <p className="mt-1 text-xs text-slate-600">Max 12 total images (existing + new).</p>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => onPickImages(e.target.files)}
                className="mt-3 block w-full text-sm text-slate-900"
              />

              {newPreviews.length > 0 ? (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {newPreviews.map((src, idx) => (
                    <div key={src} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <img src={src} alt="New preview" className="h-28 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute right-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          {/* Pricing */}
          <section className="grid gap-3">
            <h2 className="font-semibold text-slate-900">Pricing</h2>

            <div className="grid gap-3 md:grid-cols-2">
              <Field label={saleType === "sale" ? "Sale price (ZAR) *" : "Rent per month (ZAR) *"}>
                <input className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900" value={price} onChange={(e) => setPrice(e.target.value)} />
              </Field>

              {saleType === "rent" ? (
                <Field label="Deposit (ZAR)">
                  <input className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900" value={deposit} onChange={(e) => setDeposit(e.target.value)} />
                </Field>
              ) : (
                <div />
              )}

              {saleType === "rent" ? (
                <Field label="Available from">
                  <input className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900" type="date" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} />
                </Field>
              ) : (
                <div />
              )}

              <Field label="Levy (monthly)">
                <input className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900" value={levy} onChange={(e) => setLevy(e.target.value)} />
              </Field>

              <Field label="Rates & Taxes (monthly)">
                <input className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900" value={ratesTaxes} onChange={(e) => setRatesTaxes(e.target.value)} />
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

            <div className="grid gap-3 md:grid-cols-5">
              <Field label="Bedrooms">
                <select className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}>
                  <option value="">—</option>
                  {["0", "1", "2", "3", "4", "5", "6", "7", "8+"].map((v) => (
                    <option key={v} value={v === "8+" ? "8" : v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Bathrooms">
                <select className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)}>
                  <option value="">—</option>
                  {["1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5+"].map((v) => (
                    <option key={v} value={v === "5+" ? "5" : v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Garages">
                <select className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900" value={garages} onChange={(e) => setGarages(e.target.value)}>
                  <option value="">—</option>
                  {["0", "1", "2", "3", "4+"].map((v) => (
                    <option key={v} value={v === "4+" ? "4" : v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Parking">
                <input className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900" value={parking} onChange={(e) => setParking(e.target.value)} placeholder="e.g. 2" />
              </Field>

              <div />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Floor size (m²)">
                <input className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900" value={floorSize} onChange={(e) => setFloorSize(e.target.value)} placeholder="e.g. 98" />
              </Field>

              <Field label="Erf size (m²)">
                <input className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900" value={erfSize} onChange={(e) => setErfSize(e.target.value)} placeholder="e.g. 420" />
              </Field>
            </div>
          </section>

          {/* Features */}
          <section className="grid gap-3">
            <h2 className="font-semibold text-slate-900">Features</h2>
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

            <Field label="Street address">
              <input className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} />
            </Field>

            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Suburb *">
                <input className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900" value={suburb} onChange={(e) => setSuburb(e.target.value)} />
              </Field>
              <Field label="City *">
                <input className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900" value={city} onChange={(e) => setCity(e.target.value)} />
              </Field>
              <Field label="Province *">
                <input className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900" value={province} onChange={(e) => setProvince(e.target.value)} />
              </Field>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Postal code">
                <input className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
              </Field>
              <Field label="Latitude (optional)">
                <input className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900" value={lat} onChange={(e) => setLat(e.target.value)} />
              </Field>
              <Field label="Longitude (optional)">
                <input className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900" value={lng} onChange={(e) => setLng(e.target.value)} />
              </Field>
            </div>
          </section>

          {/* Contact */}
          <section className="grid gap-3">
            <h2 className="font-semibold text-slate-900">Contact (optional)</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Contact name">
                <input className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900" value={contactName} onChange={(e) => setContactName(e.target.value)} />
              </Field>
              <Field label="Contact phone">
                <input className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
              </Field>
              <Field label="Contact email">
                <input className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </Field>
            </div>
          </section>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            className="rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
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
