import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { apiErrorResponse } from "@/lib/api-error-logging";

export async function PATCH(req: Request) {
  let body: Record<string, any>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const tag = body.tag;

    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("leads")
      .update({ tag: (tag ?? "").toString() || null })
      .eq("id", id)
      .select("id,email,source,tag,created_at")
      .maybeSingle();

    if (error) {
      return apiErrorResponse({
        req,
        route: "/api/admin/leads",
        status: 500,
        error,
        publicMessage: "Could not update lead.",
        metadata: { id, tag },
      });
    }

    if (!data) return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });

    return NextResponse.json({ ok: true, lead: data });
  } catch (error) {
    return apiErrorResponse({
      req,
      route: "/api/admin/leads",
      status: 500,
      error,
      publicMessage: "Could not update lead.",
    });
  }
}

export async function DELETE(req: Request) {
  let body: Record<string, any>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const id = typeof body.id === "string" ? body.id.trim() : "";

    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const sb = supabaseAdmin();
    const { data, error } = await sb.from("leads").delete().eq("id", id).select("id").maybeSingle();

    if (error) {
      return apiErrorResponse({
        req,
        route: "/api/admin/leads",
        status: 500,
        error,
        publicMessage: "Could not delete lead.",
        metadata: { id },
      });
    }

    if (!data) return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });

    return NextResponse.json({ ok: true, deletedId: id });
  } catch (error) {
    return apiErrorResponse({
      req,
      route: "/api/admin/leads",
      status: 500,
      error,
      publicMessage: "Could not delete lead.",
    });
  }
}
