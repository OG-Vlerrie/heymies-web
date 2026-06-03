import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { runMatchingJob } from "@/lib/server-matching-runner";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const token = bearerToken(req);
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

  const body = await req.json().catch(() => ({}));
  const listingId = typeof body?.listingId === "string" ? body.listingId : null;
  if (!listingId) {
    return NextResponse.json({ ok: false, error: "listingId is required." }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const [{ data: profile, error: profileError }, { data: listing, error: listingError }] =
    await Promise.all([
      sb.from("profiles").select("role").eq("id", user.id).maybeSingle(),
      sb.from("listings").select("id,agent_id,status").eq("id", listingId).maybeSingle(),
    ]);

  if (profileError) {
    return NextResponse.json({ ok: false, error: profileError.message }, { status: 500 });
  }

  if (listingError) {
    return NextResponse.json({ ok: false, error: listingError.message }, { status: 500 });
  }

  if (!listing) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  const isOwner = listing.agent_id === user.id;
  const isAdmin = profile?.role === "admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  if (listing.status !== "active") {
    return NextResponse.json({ ok: true, skipped: true, reason: "listing_not_active" });
  }

  return runMatchingJob(req, {
    listingId,
    minScore: Number.isFinite(Number(body?.minScore)) ? Number(body.minScore) : 55,
    sendEmails: body?.sendEmails !== false,
  });
}

function bearerToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  return authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "").trim() : null;
}
