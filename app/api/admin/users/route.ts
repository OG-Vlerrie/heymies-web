import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ALLOWED_ROLES = new Set(["buyer", "agent", "seller"]);

export async function PATCH(req: Request) {
  try {
    const { id, role } = await req.json();

    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    if (!ALLOWED_ROLES.has(String(role))) {
      return NextResponse.json({ ok: false, error: "Invalid role" }, { status: 400 });
    }

    const sb = supabaseAdmin();
    const { error } = await sb
      .from("profiles")
      .upsert({ id, role }, { onConflict: "id" });

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
