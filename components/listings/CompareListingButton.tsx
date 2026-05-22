"use client";

import { useEffect, useState } from "react";

export type CompareListingSnapshot = {
  id: string;
  title: string;
  price: number | null;
  price_per_month?: number | null;
  sale_type?: string | null;
  listing_type?: string | null;
  suburb: string | null;
  city: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking?: number | null;
  cover_image?: string | null;
};

const STORAGE_KEY = "heymies.compare.listings";
const CHANGE_EVENT = "heymies:compare-changed";

function readCompareList(): CompareListingSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CompareListingSnapshot[]) : [];
  } catch {
    return [];
  }
}

function writeCompareList(items: CompareListingSnapshot[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 4)));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getCompareStorageKey() {
  return STORAGE_KEY;
}

export function getCompareChangeEvent() {
  return CHANGE_EVENT;
}

export default function CompareListingButton({
  listing,
  className,
}: {
  listing: CompareListingSnapshot;
  className?: string;
}) {
  const [selected, setSelected] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    function sync() {
      const items = readCompareList();
      setSelected(items.some((item) => item.id === listing.id));
      setCount(items.length);
    }

    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [listing.id]);

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    const items = readCompareList();
    if (items.some((item) => item.id === listing.id)) {
      writeCompareList(items.filter((item) => item.id !== listing.id));
      return;
    }

    writeCompareList([listing, ...items].slice(0, 4));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={
        className ??
        [
          "inline-flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-semibold transition",
          selected
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        ].join(" ")
      }
      title={selected ? "Remove from comparison" : "Add to comparison"}
    >
      {selected ? "Comparing" : count >= 4 ? "Replace compare" : "Compare"}
    </button>
  );
}
