import { supabaseAdmin } from "@/lib/supabase/admin";

type AdminActivityInput = {
  req?: Request;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary?: string | null;
  metadata?: Record<string, unknown>;
};

export function adminActorFromRequest(req?: Request) {
  const auth = req?.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) return "admin";

  try {
    const decoded =
      typeof atob === "function"
        ? atob(auth.slice("Basic ".length))
        : Buffer.from(auth.slice("Basic ".length), "base64").toString("utf8");
    return decoded.split(":")[0] || "admin";
  } catch {
    return "admin";
  }
}

export async function logAdminActivity({
  req,
  action,
  entityType,
  entityId,
  summary,
  metadata = {},
}: AdminActivityInput) {
  try {
    const { error } = await supabaseAdmin().from("admin_activity").insert({
      actor: adminActorFromRequest(req),
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      summary: summary ?? null,
      metadata,
    });

    if (error) {
      console.error("Failed to record admin activity:", error.message);
    }
  } catch (error) {
    console.error("Failed to record admin activity:", error);
  }
}
