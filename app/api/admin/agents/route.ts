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
    const status = body.status;

    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const allowed = new Set(["pending", "approved", "rejected"]);
    if (!allowed.has(String(status))) {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }

    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("agents")
      .update({ status })
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      return apiErrorResponse({
        req,
        route: "/api/admin/agents",
        status: 500,
        error,
        publicMessage: "Could not update agent application.",
        metadata: { id, status },
      });
    }

    if (!data) return NextResponse.json({ ok: false, error: "Agent application not found" }, { status: 404 });

    return NextResponse.json({ ok: true, agent: data });
  } catch (error) {
    return apiErrorResponse({
      req,
      route: "/api/admin/agents",
      status: 500,
      error,
      publicMessage: "Could not update agent application.",
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
    const { data, error } = await sb.from("agents").delete().eq("id", id).select("id").maybeSingle();

    if (error) {
      return apiErrorResponse({
        req,
        route: "/api/admin/agents",
        status: 500,
        error,
        publicMessage: "Could not delete agent application.",
        metadata: { id },
      });
    }

    if (!data) return NextResponse.json({ ok: false, error: "Agent application not found" }, { status: 404 });

    return NextResponse.json({ ok: true, deletedId: id });
  } catch (error) {
    return apiErrorResponse({
      req,
      route: "/api/admin/agents",
      status: 500,
      error,
      publicMessage: "Could not delete agent application.",
    });
  }
}
