import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { apiErrorResponse } from "@/lib/api-error-logging";

const ALLOWED_ROLES = new Set(["buyer", "agent", "seller", "admin"]);

export async function PATCH(req: Request) {
  let body: Record<string, any>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const role = body.role;

    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    if (!ALLOWED_ROLES.has(String(role))) {
      return NextResponse.json({ ok: false, error: "Invalid role" }, { status: 400 });
    }

    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("profiles")
      .upsert({ id, role }, { onConflict: "id" })
      .select("id,role,full_name,phone")
      .maybeSingle();

    if (error) {
      return apiErrorResponse({
        req,
        route: "/api/admin/users",
        status: 500,
        error,
        publicMessage: "Could not update user role.",
        metadata: { id, role },
      });
    }

    return NextResponse.json({ ok: true, profile: data });
  } catch (error) {
    return apiErrorResponse({
      req,
      route: "/api/admin/users",
      status: 500,
      error,
      publicMessage: "Could not update user role.",
    });
  }
}
