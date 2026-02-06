import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function supabaseAdmin() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

export async function PATCH(req: Request) {
  try {
    const { id, tag } = await req.json();

    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const sb = supabaseAdmin();
    const { error } = await sb.from("leads").update({ tag: (tag ?? "").toString() || null }).eq("id", id);

    if (error) return NextResponse.json({ ok: false, error: "DB error" }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const sb = supabaseAdmin();
    const { error } = await sb.from("leads").delete().eq("id", id);

    if (error) return NextResponse.json({ ok: false, error: "DB error" }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
