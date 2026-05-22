"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

type SaveListingButtonProps = {
  listingId: string;
  className?: string;
  compact?: boolean;
  checkOnMount?: boolean;
  onChange?: () => void;
};

export default function SaveListingButton({
  listingId,
  className,
  compact = false,
  checkOnMount = true,
  onChange,
}: SaveListingButtonProps) {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSavedState() {
      if (!checkOnMount) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) {
        if (!cancelled) {
          setSavedId(null);
          setLoading(false);
        }
        return;
      }

      const { data: buyer } = await supabase
        .from("buyers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!buyer?.id) {
        if (!cancelled) {
          setSavedId(null);
          setLoading(false);
        }
        return;
      }

      const { data: saved } = await supabase
        .from("buyer_saved")
        .select("id")
        .eq("buyer_id", buyer.id)
        .eq("listing_id", listingId)
        .maybeSingle();

      if (!cancelled) {
        setSavedId(saved?.id ?? null);
        setLoading(false);
      }
    }

    loadSavedState();

    return () => {
      cancelled = true;
    };
  }, [checkOnMount, listingId, supabase]);

  async function toggleSaved(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (busy) return;
    setBusy(true);

    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;

      if (!user) {
        router.push(`/login?next=${encodeURIComponent(`/listings/${listingId}`)}`);
        return;
      }

      const { data: buyer, error: buyerErr } = await supabase
        .from("buyers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (buyerErr) throw new Error(buyerErr.message);

      if (!buyer?.id) {
        router.push(`/signup/buyer?next=${encodeURIComponent(`/listings/${listingId}`)}`);
        return;
      }

      if (savedId) {
        const { error } = await supabase.from("buyer_saved").delete().eq("id", savedId);
        if (error) throw new Error(error.message);
        setSavedId(null);
      } else {
        const { data, error } = await supabase
          .from("buyer_saved")
          .insert({ buyer_id: buyer.id, listing_id: listingId })
          .select("id")
          .single();

        if (error) throw new Error(error.message);
        setSavedId(data.id);
      }

      onChange?.();
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }

  const label = savedId
    ? "Saved"
    : !checkOnMount && compact
    ? "Login to save"
    : compact
    ? "Save"
    : "Save listing";

  return (
    <button
      type="button"
      onClick={toggleSaved}
      disabled={busy}
      aria-pressed={Boolean(savedId)}
      className={
        className ??
        [
          "inline-flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:opacity-60",
          savedId
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        ].join(" ")
      }
    >
      {!savedId && (
        <span aria-hidden className="mr-1">
          +
        </span>
      )}
      {loading ? "Checking" : label}
    </button>
  );
}
