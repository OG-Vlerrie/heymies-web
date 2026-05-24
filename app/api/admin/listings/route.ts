import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ALLOWED_STATUSES = new Set(["active", "draft", "inactive"]);

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();

    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    if (!ALLOWED_STATUSES.has(String(status))) {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }

    const sb = supabaseAdmin();

    if (status === "active") {
      const { data: listing, error: listingErr } = await sb
        .from("listings")
        .select("images,cover_image")
        .eq("id", id)
        .single();

      if (listingErr) {
        return NextResponse.json({ ok: false, error: listingErr.message }, { status: 500 });
      }

      const images = Array.isArray(listing?.images) ? listing.images : [];
      if (images.length === 0 && !listing?.cover_image) {
        return NextResponse.json(
          { ok: false, error: "A listing needs at least one photo before it can be active." },
          { status: 400 }
        );
      }
    }

    const { error } = await sb.from("listings").update({ status }).eq("id", id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
