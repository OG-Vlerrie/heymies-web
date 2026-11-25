"use client";

import { useEffect, useState } from "react";

type ListingPhotoGalleryProps = {
  title: string;
  coverImage: string | null;
  images: string[] | null;
};

export default function ListingPhotoGallery({
  title,
  coverImage,
  images,
}: ListingPhotoGalleryProps) {
  const photos = Array.from(
    new Set([coverImage, ...(images ?? [])].filter((photo): photo is string => Boolean(photo)))
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isOpen = activeIndex !== null;

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) =>
          current === null ? null : (current - 1 + photos.length) % photos.length
        );
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((current) =>
          current === null ? null : (current + 1) % photos.length
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, photos.length]);

  if (photos.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center bg-slate-50 text-sm text-slate-500 sm:h-[440px]">
        No image available
      </div>
    );
  }

  const selectedPhoto = activeIndex === null ? null : photos[activeIndex];

  function showPrevious() {
    setActiveIndex((current) =>
      current === null ? null : (current - 1 + photos.length) % photos.length
    );
  }

  function showNext() {
    setActiveIndex((current) =>
      current === null ? null : (current + 1) % photos.length
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setActiveIndex(0)}
        className="group relative block h-[320px] w-full cursor-zoom-in overflow-hidden bg-slate-100 text-left sm:h-[440px]"
        aria-label={`Open all ${photos.length} photos for ${title}`}
      >
        <img
          src={photos[0]}
          alt={title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
        <span className="absolute bottom-4 right-4 rounded-full bg-slate-950/80 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm">
          View {photos.length === 1 ? "photo" : `all ${photos.length} photos`}
        </span>
      </button>

      {photos.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 border-t border-slate-200 bg-white p-3 sm:gap-3 sm:p-4">
          {photos.slice(1, 5).map((src, index) => {
            const photoIndex = index + 1;
            const remaining = photos.length - 5;
            const isLastPreview = index === 3 && remaining > 0;

            return (
              <button
                key={src}
                type="button"
                onClick={() => setActiveIndex(photoIndex)}
                className="group relative h-20 cursor-zoom-in overflow-hidden rounded-xl bg-slate-100 sm:h-28"
                aria-label={`Open photo ${photoIndex + 1} of ${photos.length}`}
              >
                <img
                  src={src}
                  alt={`${title}, photo ${photoIndex + 1}`}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
                {isLastPreview ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-slate-950/60 text-sm font-semibold text-white sm:text-base">
                    +{remaining} more
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {selectedPhoto ? (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photo gallery`}
          onClick={() => setActiveIndex(null)}
        >
          <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6">
            <p className="text-sm font-medium">
              {(activeIndex ?? 0) + 1} / {photos.length}
            </p>
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-white/10"
              aria-label="Close photo gallery"
            >
              Close ✕
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-14 pb-3 sm:px-20">
            <img
              src={selectedPhoto}
              alt={`${title}, photo ${(activeIndex ?? 0) + 1}`}
              className="max-h-full max-w-full object-contain"
              onClick={(event) => event.stopPropagation()}
            />
            {photos.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    showPrevious();
                  }}
                  className="absolute left-2 rounded-full bg-white/10 px-4 py-3 text-2xl text-white hover:bg-white/20 sm:left-6"
                  aria-label="Previous photo"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    showNext();
                  }}
                  className="absolute right-2 rounded-full bg-white/10 px-4 py-3 text-2xl text-white hover:bg-white/20 sm:right-6"
                  aria-label="Next photo"
                >
                  ›
                </button>
              </>
            ) : null}
          </div>

          {photos.length > 1 ? (
            <div
              className="flex gap-2 overflow-x-auto px-4 py-3 sm:px-6"
              onClick={(event) => event.stopPropagation()}
            >
              {photos.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${
                    index === activeIndex ? "border-white" : "border-transparent opacity-60"
                  }`}
                  aria-label={`View photo ${index + 1}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
