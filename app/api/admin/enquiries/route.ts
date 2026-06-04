import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/admin-activity";
import { apiErrorResponse, logApiError } from "@/lib/api-error-logging";

const LEAD_STATUSES = new Set(["new", "contacted", "qualified", "viewing", "offer", "won", "lost"]);
const QUALIFICATION_STATUSES = new Set([
  "agent_ready",
  "needs_confirmation",
  "needs_finance_nurture",
  "nurture_for_better_fit",
  "not_ready",
]);
const NURTURE_STATUSES = new Set(["pending", "nurturing", "paused", "completed", "handover_ready"]);
const PIPELINE_ENQUIRY_SELECT =
  "id,user_id,listing_id,full_name,email,phone,status,enquiry_count,latest_message,request_viewing,readiness_score,property_fit_score,qualification_status,qualification_summary,next_action,nurture_status,next_nurture_at,last_nurtured_at,last_buyer_response,last_buyer_responded_at,agent_ready_at,first_enquired_at,last_enquired_at,listing:listings(id,title,suburb,city,price,price_per_month,sale_type,cover_image,status)";

export async function PATCH(req: Request) {
  let body: Record<string, any>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const id = typeof body?.id === "string" ? body.id.trim() : "";
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
    let updatedEnquiry: Record<string, any> | null = null;
    if (Object.keys(update).length > 0) {
      const { data, error } = await sb
        .from("enquiries")
        .update({ ...update, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select(PIPELINE_ENQUIRY_SELECT)
        .maybeSingle();

      if (error) {
        return apiErrorResponse({
          req,
          route: "/api/admin/enquiries",
          status: 500,
          error,
          publicMessage: "Could not update lead.",
          metadata: { id, update },
        });
      }

      if (!data) {
        return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
      }

      updatedEnquiry = normalizeRelation(data, "listing");
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
      const { error: eventError } = await sb.from("enquiry_events").insert(events);
      if (eventError) {
        return apiErrorResponse({
          req,
          route: "/api/admin/enquiries",
          status: 500,
          error: eventError,
          publicMessage: "Lead updated, but the activity event could not be saved.",
          metadata: { id, eventCount: events.length },
        });
      }
    }

    await logAdminActivity({
      req,
      action: internalNote ? "lead_note" : "lead_update",
      entityType: "enquiry",
      entityId: String(id),
      summary: internalNote ? "Admin added an internal note." : "Admin updated lead state.",
      metadata: { update, has_internal_note: Boolean(internalNote) },
    });

    revalidateLeadPaths(id);

    return NextResponse.json({ ok: true, enquiry: updatedEnquiry });
  } catch (error) {
    return apiErrorResponse({
      req,
      route: "/api/admin/enquiries",
      status: 500,
      error,
      publicMessage: "Could not update lead.",
    });
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
    return apiErrorResponse({
      req,
      route: "/api/admin/enquiries",
      status: 500,
      error: updateError,
      publicMessage: "Could not queue Mia follow-up.",
      metadata: { id, action: "send_followup_now" },
    });
  }

  const origin = requestOrigin(req);
  let res: Response;
  try {
    res = await fetch(`${origin}/api/nurture/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ enquiryId: id, force: true, limit: 1 }),
      cache: "no-store",
    });
  } catch (error) {
    return apiErrorResponse({
      req,
      route: "/api/admin/enquiries",
      status: 502,
      error,
      publicMessage: "Could not reach Mia nurture job.",
      metadata: { id, action: "send_followup_now", origin },
    });
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.ok) {
    await logApiError({
      req,
      route: "/api/admin/enquiries",
      status: res.status || 500,
      error: data?.error ?? "Mia follow-up failed.",
      metadata: { id, action: "send_followup_now", details: data },
    });

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

  const { data: enquiry } = await sb
    .from("enquiries")
    .select(PIPELINE_ENQUIRY_SELECT)
    .eq("id", id)
    .maybeSingle();

  revalidateLeadPaths(id);

  return NextResponse.json({ ok: true, nurture: data, enquiry: normalizeRelation(enquiry, "listing") });
}

function requestOrigin(req: Request) {
  const url = new URL(req.url);
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");

  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  return url.origin;
}

function normalizeRelation<T extends Record<string, any> | null>(row: T, key: string) {
  if (!row) return null;
  return {
    ...row,
    [key]: Array.isArray(row[key]) ? row[key][0] : row[key],
  };
}

function revalidateLeadPaths(id: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/mia");
  revalidatePath("/admin/pipeline");
  revalidatePath(`/admin/enquiries/${id}`);
  revalidatePath("/dashboard/leads");
}
