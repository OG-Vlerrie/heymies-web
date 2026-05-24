import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const LEAD_STATUSES = new Set(["new", "contacted", "qualified", "viewing", "offer", "won", "lost"]);
const QUALIFICATION_STATUSES = new Set([
  "agent_ready",
  "needs_confirmation",
  "needs_finance_nurture",
  "nurture_for_better_fit",
  "not_ready",
]);
const NURTURE_STATUSES = new Set(["pending", "nurturing", "paused", "completed"]);

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const id = body?.id;

    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const update: Record<string, unknown> = {};

    if (body.status !== undefined) {
      if (!LEAD_STATUSES.has(String(body.status))) {
        return NextResponse.json({ ok: false, error: "Invalid lead status" }, { status: 400 });
      }
      update.status = String(body.status);
    }

    if (body.qualification_status !== undefined) {
      if (!QUALIFICATION_STATUSES.has(String(body.qualification_status))) {
        return NextResponse.json({ ok: false, error: "Invalid qualification status" }, { status: 400 });
      }
      update.qualification_status = String(body.qualification_status);
      if (body.qualification_status === "agent_ready") {
        update.agent_ready_at = new Date().toISOString();
      }
    }

    if (body.nurture_status !== undefined) {
      if (!NURTURE_STATUSES.has(String(body.nurture_status))) {
        return NextResponse.json({ ok: false, error: "Invalid nurture status" }, { status: 400 });
      }
      update.nurture_status = String(body.nurture_status);
      if (body.nurture_status === "nurturing") {
        update.next_nurture_at = new Date().toISOString();
      }
      if (body.nurture_status === "paused" || body.nurture_status === "completed") {
        update.next_nurture_at = null;
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ ok: false, error: "No supported fields supplied" }, { status: 400 });
    }

    const sb = supabaseAdmin();
    const { error } = await sb.from("enquiries").update(update).eq("id", id);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    await sb.from("enquiry_events").insert({
      enquiry_id: id,
      event_type: "admin_updated",
      message: "Admin updated lead state.",
      metadata: update,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
