"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { scoreListingForBuyer, type BuyerMatchProfile, type MatchListing } from "@/lib/matching";
import { buyerMatchLabel } from "@/lib/match-labels";

type ListingMatchBadgeProps = {
  listing: MatchListing;
  compact?: boolean;
};

export default function ListingMatchBadge({ listing, compact = false }: ListingMatchBadgeProps) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [buyer, setBuyer] = useState<BuyerMatchProfile | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadBuyer() {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) {
        if (!cancelled) setChecked(true);
        return;
      }

      const { data } = await supabase
        .from("buyers")
        .select(
          "budget_min,budget_max,property_types,areas,areas_multi,bedrooms_min,bathrooms_min"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (!cancelled) {
        setBuyer((data as BuyerMatchProfile | null) ?? null);
        setChecked(true);
      }
    }

    loadBuyer();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  if (!checked) {
    return (
      <span className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-500">
        Matching...
      </span>
    );
  }

  if (!buyer) {
    return (
      <span className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-600">
        Complete profile for match
      </span>
    );
  }

  const match = scoreListingForBuyer(listing, buyer);

  return (
    <div className={compact ? "flex flex-wrap gap-2" : "space-y-2"}>
      <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
        {buyerMatchLabel(match.score)}
      </span>
      {!compact && (
        <div className="flex flex-wrap gap-2">
          {match.reasons.map((reason) => (
            <span
              key={reason}
              className="rounded-full border border-slate-200 bg-white/90 px-2 py-1 text-xs text-slate-600"
            >
              {reason}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
