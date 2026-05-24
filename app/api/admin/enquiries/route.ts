import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/admin-activity";

const LEAD_STATUSES = new Set(["new", "contacted", "qualified", "viewing", "offer", "won", "lost"]);
const QUALIFICATION_STATUSES = new Set([
  "agent_ready",
  "needs_confirmation",
  "needs_finance_nurture",
  "nurture_for_better_fit",
  "not_ready",
]);
const NURTURE_STATUSES = new Set(["pending", "nurturing", "paused", "completed", "handover_ready"]);

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const id = body?.id;
    const action = typeof body?.action === "string" ? body.action : "";

    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    if (action === "send_followup_now") {
      return sendFollowupNow(req, id);
    }

    const update: Record<string, unknown> = {};
    const internalNote =
      typeof body.internal_note === "string" ? body.internal_note.trim().slice(0, 2000) : "";

    if (body.status !== undefined) {
      if (!LEAD_STATUSES.has(String(body.status))) {
        return NextResponse.json({ ok: false, error: "Invalid lead status" }, { status: 400 });
      }
      update.status = String(body.status);
      if (body.status === "won" || body.status === "lost") {
        update.nurture_status = "completed";
        update.next_nurture_at = null;
      }
    }

    if (body.qualification_status !== undefined) {
      if (!QUALIFICATION_STATUSES.has(String(body.qualification_status))) {
        return NextResponse.json({ ok: false, error: "Invalid qualification status" }, { status: 400 });
      }
      update.qualification_status = String(body.qualification_status);
      if (body.qualification_status === "agent_ready") {
        update.agent_ready_at = new Date().toISOString();
        update.nurture_status = body.nurture_status ? String(body.nurture_status) : "handover_ready";
        update.next_nurture_at = null;
        if (body.status === undefined) update.status = "qualified";
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
      if (
        body.nurture_status === "paused" ||
        body.nurture_status === "completed" ||
        body.nurture_status === "handover_ready"
      ) {
        update.next_nurture_at = null;
      }
    }

    if (Object.keys(update).length === 0 && !internalNote) {
      return NextResponse.json({ ok: false, error: "No supported fields supplied" }, { status: 400 });
    }

    const sb = supabaseAdmin();
    if (Object.keys(update).length > 0) {
      const { error } = await sb.from("enquiries").update(update).eq("id", id);

      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const events = [];
    if (Object.keys(update).length > 0) {
      events.push({
        enquiry_id: id,
        event_type: "admin_updated",
        message: "Admin updated lead state.",
        metadata: update,
      });
    }
    if (internalNote) {
      events.push({
        enquiry_id: id,
        event_type: "admin_note",
        message: internalNote,
        metadata: {},
      });
    }

    if (events.length > 0) {
      await sb.from("enquiry_events").insert(events);
    }

    await logAdminActivity({
      req,
      action: internalNote ? "lead_note" : "lead_update",
      entityType: "enquiry",
      entityId: String(id),
      summary: internalNote ? "Admin added an internal note." : "Admin updated lead state.",
      metadata: { update, has_internal_note: Boolean(internalNote) },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}

async function sendFollowupNow(req: Request, id: string) {
  const secret = process.env.NURTURE_JOB_SECRET || process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "NURTURE_JOB_SECRET or CRON_SECRET is not configured." },
      { status: 500 }
    );
  }

  const sb = supabaseAdmin();
  const now = new Date().toISOString();
  const { error: updateError } = await sb
    .from("enquiries")
    .update({
      nurture_status: "nurturing",
      next_nurture_at: now,
      updated_at: now,
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 });
  }

  const origin = requestOrigin(req);
  const res = await fetch(`${origin}/api/nurture/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({ enquiryId: id, force: true, limit: 1 }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.ok) {
    return NextResponse.json(
      { ok: false, error: data?.error ?? "Mia follow-up failed.", details: data },
      { status: res.status || 500 }
    );
  }

  await sb.from("enquiry_events").insert({
    enquiry_id: id,
    event_type: "admin_triggered_nurture",
    message: "Admin sent a Mia follow-up immediately.",
    metadata: data,
  });

  await logAdminActivity({
    req,
    action: "send_mia_now",
    entityType: "enquiry",
    entityId: String(id),
    summary: "Admin sent a Mia follow-up immediately.",
    metadata: data,
  });

  return NextResponse.json({ ok: true, nurture: data });
}

function requestOrigin(req: Request) {
  const url = new URL(req.url);
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");

  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  return url.origin;
}
