export const dynamic = "force-dynamic";

import Link from "next/link";
import CarouselSlidePreview from "@/components/marketing/ad-previews/CarouselSlidePreview";
import SquareAdPreview from "@/components/marketing/ad-previews/SquareAdPreview";
import StoryAdPreview from "@/components/marketing/ad-previews/StoryAdPreview";
import type { AdPreviewVariant } from "@/components/marketing/ad-previews/types";

type PreviewExample = {
  title: string;
  headline: string;
  subheadline: string;
  cta: string;
  badge: string;
  variant: AdPreviewVariant;
};

const examples: PreviewExample[] = [
  {
    title: "Stop wasting time on junk leads",
    headline: "Stop wasting time on junk leads.",
    subheadline: "HeyMies scores, tracks and nurtures buyers so agents can focus on serious clients.",
    cta: "Book a Demo",
    badge: "Lead scoring",
    variant: "dark",
  },
  {
    title: "AI scored this buyer 92/100",
    headline: "AI scored this buyer 92/100.",
    subheadline: "Spot high-intent activity like repeat views, saved properties and bond-help requests.",
    cta: "See the Score",
    badge: "High intent",
    variant: "signal",
  },
  {
    title: "Focus on serious buyers",
    headline: "Focus on serious buyers.",
    subheadline: "Give your agents cleaner context before the first call and fewer dead-end conversations.",
    cta: "Improve Lead Quality",
    badge: "Agent workflow",
    variant: "light",
  },
  {
    title: "Follow up smarter, not harder",
    headline: "Follow up smarter, not harder.",
    subheadline: "Mia keeps uncertain buyers warm and alerts agents when buyer intent becomes clear.",
    cta: "Follow Up Smarter",
    badge: "Mia nurture",
    variant: "focus",
  },
];

export default function AdminMarketingPreviewsPage() {
  return (
    <main className="tech-page text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link href="/admin/marketing" className="text-sm font-semibold text-emerald-700">
              Back to marketing assets
            </Link>
            <p className="tech-kicker mt-6">Ad previews</p>
            <h1 className="mt-2 text-3xl font-semibold">HeyMies Social Ad Preview Kit</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Export-friendly visual mockups for feed squares, story placements, and
              carousel slides. These are reusable React components, ready for campaign
              copy testing and future export tooling.
            </p>
          </div>
          <Link
            href="/agents-ai-leads"
            className="tech-button-primary w-fit rounded-xl px-4 py-2 text-sm font-semibold"
          >
            View landing page
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {examples.map((example) => (
            <a
              key={example.title}
              href={`#${slugify(example.title)}`}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 shadow-sm hover:border-emerald-200 hover:bg-emerald-50/40"
            >
              {example.title}
            </a>
          ))}
        </div>

        <div className="mt-10 space-y-12">
          {examples.map((example) => (
            <section
              key={example.title}
              id={slugify(example.title)}
              className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">{example.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Variant: {example.variant}. Same copy rendered across core paid-social formats.
                  </p>
                </div>
                <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                  Export-friendly preview
                </span>
              </div>

              <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_0.9fr_0.85fr]">
                <PreviewFrame label="Square feed">
                  <SquareAdPreview {...example} />
                </PreviewFrame>
                <PreviewFrame label="Story/Reel">
                  <StoryAdPreview {...example} />
                </PreviewFrame>
                <PreviewFrame label="Carousel slide">
                  <CarouselSlidePreview {...example} />
                </PreviewFrame>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

function PreviewFrame({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
          visual only
        </span>
      </div>
      <div className="flex justify-center rounded-3xl border border-slate-200 bg-slate-50 p-5">
        {children}
      </div>
    </div>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replaceAll(" ", "-").replaceAll("/", "-");
}
