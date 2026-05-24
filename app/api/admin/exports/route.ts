import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const EXPORTS = new Set(["leads", "pipeline", "buyers", "listings", "agent-ready", "activity"]);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "";

  if (!EXPORTS.has(type)) {
    return NextResponse.json({ ok: false, error: "Invalid export type" }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const result = await loadRows(type, supabase);

  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  const csv = toCsv(result.rows);
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="heymies-${type}-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}

async function loadRows(type: string, supabase: ReturnType<typeof supabaseAdmin>) {
  if (type === "leads") {
    const { data, error } = await supabase
      .from("leads")
      .select("id,email,source,tag,created_at")
      .order("created_at", { ascending: false })
      .limit(5000);
    return { rows: data ?? [], error: error?.message ?? null };
  }

  if (type === "pipeline" || type === "agent-ready") {
    let query = supabase
      .from("enquiries")
      .select(
        "id,full_name,email,phone,status,qualification_status,nurture_status,readiness_score,property_fit_score,enquiry_count,request_viewing,next_action,last_enquired_at,agent_ready_at,listing:listings(title,suburb,city,price,price_per_month,sale_type)"
      )
      .order("last_enquired_at", { ascending: false })
      .limit(5000);

    if (type === "agent-ready") query = query.eq("qualification_status", "agent_ready");

    const { data, error } = await query;
    return {
      rows: normalizeRows(data ?? [], "listing").map((row: any) => ({
        ...row,
        listing_title: row.listing?.title ?? "",
        listing_area: [row.listing?.suburb, row.listing?.city].filter(Boolean).join(", "),
        listing_price:
          row.listing?.sale_type === "rent" ? row.listing?.price_per_month : row.listing?.price,
        listing_sale_type: row.listing?.sale_type ?? "",
        listing: undefined,
      })),
      error: error?.message ?? null,
    };
  }

  if (type === "buyers") {
    const { data, error } = await supabase
      .from("buyers")
      .select(
        "id,user_id,full_name,phone,budget_min,budget_max,property_types,areas,areas_multi,bedrooms_min,bathrooms_min,preapproved,timeline,selling_property,lead_score,created_at"
      )
      .order("created_at", { ascending: false })
      .limit(5000);
    return { rows: data ?? [], error: error?.message ?? null };
  }

  if (type === "listings") {
    const { data, error } = await supabase
      .from("listings")
      .select(
        "id,title,status,sale_type,listing_type,price,price_per_month,suburb,city,province,bedrooms,bathrooms,contact_name,contact_email,contact_phone,created_at"
      )
      .order("created_at", { ascending: false })
      .limit(5000);
    return { rows: data ?? [], error: error?.message ?? null };
  }

  const { data, error } = await supabase
    .from("admin_activity")
    .select("id,actor,action,entity_type,entity_id,summary,metadata,created_at")
    .order("created_at", { ascending: false })
    .limit(5000);
  return { rows: data ?? [], error: error?.message ?? null };
}

function normalizeRows(rows: unknown[], key: string) {
  return rows.map((row) => {
    const record = row as Record<string, any>;
    return {
      ...record,
      [key]: Array.isArray(record[key]) ? record[key][0] : record[key],
    };
  });
}

function toCsv(rows: any[]) {
  if (rows.length === 0) return "";
  const normalized = rows.map(flatten);
  const headers = Array.from(new Set(normalized.flatMap((row) => Object.keys(row)))).filter(
    (header) => normalized.some((row) => row[header] !== undefined)
  );
  return [
    headers.join(","),
    ...normalized.map((row) => headers.map((header) => csvCell(row[header])).join(",")),
  ].join("\n");
}

function flatten(row: Record<string, any>) {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (value === undefined) continue;
    out[key] = Array.isArray(value) ? value.join(" | ") : typeof value === "object" && value !== null ? JSON.stringify(value) : value;
  }
  return out;
}

function csvCell(value: unknown) {
  if (value === null || value === undefined) return "";
  const text = String(value).replaceAll('"', '""');
  return /[",\n\r]/.test(text) ? `"${text}"` : text;
}
