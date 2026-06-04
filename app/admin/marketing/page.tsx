export const dynamic = "force-dynamic";

import Link from "next/link";

type AssetItem = {
  title: string;
  hook: string;
  body: string;
  cta: string;
};

type AssetSection = {
  title: string;
  description: string;
  items: AssetItem[];
};

const sections: AssetSection[] = [
  {
    title: "Reel Scripts",
    description: "Short video prompts for Meta, Instagram, TikTok, and LinkedIn-style posts.",
    items: [
      {
        title: "Stop wasting time on junk leads",
        hook: "POV: Your phone is full of property enquiries, but none of them are ready.",
        body: "Show an agent opening message after message, then cut to HeyMies scoring buyers by intent, activity, and fit. The agent only follows up with the strongest buyers first.",
        cta: "Book a HeyMies demo.",
      },
      {
        title: "AI scored this buyer 92/100",
        hook: "This buyer did not just enquire. They showed intent.",
        body: "Show Thabo M. viewing a listing five times, saving three homes, and requesting bond help. HeyMies turns those signals into a 92/100 high-intent buyer alert.",
        cta: "See what your lead quality could look like.",
      },
      {
        title: "Agents do not need more leads, they need better leads",
        hook: "More leads can mean more admin, more chasing, and more dead ends.",
        body: "Compare a messy inbox with a clean HeyMies dashboard. The message: your team should focus on buyers who are engaged, qualified, and worth calling now.",
        cta: "Prioritise better buyers.",
      },
      {
        title: "Property leads are broken",
        hook: "Most property leads give agents too little context too late.",
        body: "Show the old way: name, phone number, and a cold call. Then show the HeyMies way: buyer score, activity history, finance signal, and recommended next action.",
        cta: "Fix your lead handover.",
      },
      {
        title: "Follow up smarter, not harder",
        hook: "The best follow-up is not more chasing. It is better timing.",
        body: "Show Mia nurturing uncertain buyers automatically, while agents get alerted when buyer behaviour turns serious.",
        cta: "Let AI warm up your buyers.",
      },
    ],
  },
  {
    title: "Carousel Post Ideas",
    description: "Swipeable post concepts with a clear first-slide hook and simple story arc.",
    items: [
      {
        title: "Stop wasting time on junk leads",
        hook: "Slide 1: Still calling every property enquiry like it is hot?",
        body: "Slides 2-4: cold enquiries, ghosting, and poor-fit buyers drain agent time. Slide 5: HeyMies scores and nurtures buyers before your team prioritises follow-up.",
        cta: "Swipe less. Sell smarter. Book a demo.",
      },
      {
        title: "AI scored this buyer 92/100",
        hook: "Slide 1: What makes a buyer high intent?",
        body: "Slides 2-4: repeat listing views, saved properties, and bond assistance requests. Slide 5: HeyMies turns activity into a clear buyer score.",
        cta: "Find your 92/100 buyers.",
      },
      {
        title: "Agents do not need more leads, they need better leads",
        hook: "Slide 1: Lead volume is not the win. Lead quality is.",
        body: "Slides 2-4: more leads can create more noise, slower follow-up, and lower morale. Slide 5: HeyMies helps agents focus on serious buyers first.",
        cta: "Upgrade your lead quality.",
      },
      {
        title: "Property leads are broken",
        hook: "Slide 1: A name and phone number is not a qualified lead.",
        body: "Slides 2-4: missing finance context, missing activity, missing timing. Slide 5: HeyMies gives agents buyer context before the call.",
        cta: "Turn enquiries into context.",
      },
      {
        title: "Follow up smarter, not harder",
        hook: "Slide 1: Follow-up fails when every buyer gets treated the same.",
        body: "Slides 2-4: nurture cold buyers, watch buyer activity, and alert agents when intent rises. Slide 5: HeyMies keeps follow-up moving.",
        cta: "Automate the warm-up.",
      },
    ],
  },
  {
    title: "Ad Headlines",
    description: "Short headline options for Meta ad creative and landing-page tests.",
    items: [
      {
        title: "Stop wasting time on junk leads",
        hook: "Stop chasing junk property leads.",
        body: "HeyMies scores and nurtures buyers so agents can focus on the clients most likely to move.",
        cta: "Book a Demo",
      },
      {
        title: "AI scored this buyer 92/100",
        hook: "AI found your high-intent buyer.",
        body: "Spot serious buyer behaviour before your agents spend another hour guessing who to call first.",
        cta: "See How It Works",
      },
      {
        title: "Agents do not need more leads, they need better leads",
        hook: "Better leads beat more leads.",
        body: "HeyMies helps estate agents prioritise buyer quality, not just enquiry volume.",
        cta: "Improve Lead Quality",
      },
      {
        title: "Property leads are broken",
        hook: "Property leads need context.",
        body: "Give agents buyer score, activity, and next-step signals before they pick up the phone.",
        cta: "Fix Lead Follow-Up",
      },
      {
        title: "Follow up smarter, not harder",
        hook: "Follow up when intent is real.",
        body: "Mia nurtures uncertain buyers and alerts agents when buyer activity becomes meaningful.",
        cta: "Start Smarter Follow-Up",
      },
    ],
  },
  {
    title: "Primary Text",
    description: "Longer ad body copy for Meta primary text fields and LinkedIn post captions.",
    items: [
      {
        title: "Stop wasting time on junk leads",
        hook: "Not every property enquiry deserves the same amount of agent time.",
        body: "HeyMies uses AI to score, track, and nurture buyers so your team can stop treating every cold enquiry like a hot lead. Prioritise the serious clients and let Mia keep the maybes warm.",
        cta: "Book a demo with HeyMies.",
      },
      {
        title: "AI scored this buyer 92/100",
        hook: "A buyer who views the same listing five times is telling you something.",
        body: "HeyMies turns buyer activity into useful lead intelligence. See saved properties, repeat views, bond-help requests, and high-intent alerts before your agents decide who to call.",
        cta: "See how HeyMies scores buyers.",
      },
      {
        title: "Agents do not need more leads, they need better leads",
        hook: "More leads are not helpful if your team has to chase all of them manually.",
        body: "HeyMies helps South African estate agents cut through noisy enquiries with AI buyer scoring, automated nurturing, activity tracking, and qualified buyer alerts.",
        cta: "Prioritise better leads.",
      },
      {
        title: "Property leads are broken",
        hook: "Most property leads arrive with too little context.",
        body: "A name, number, and listing enquiry do not tell your agents who is serious. HeyMies adds buyer score, behaviour, finance signals, and follow-up context before handover.",
        cta: "Fix the lead handover.",
      },
      {
        title: "Follow up smarter, not harder",
        hook: "Your agents should not have to manually warm up every uncertain buyer.",
        body: "Mia follows up, watches buyer activity, and helps surface the clients who are moving from browsing to serious intent. Your team gets better timing and cleaner context.",
        cta: "Book a HeyMies demo.",
      },
    ],
  },
  {
    title: "CTA Examples",
    description: "CTA-ready ad cards with copy that can be reused in buttons, captions, and end frames.",
    items: [
      {
        title: "Stop wasting time on junk leads",
        hook: "Ready to spend less time chasing cold enquiries?",
        body: "Use HeyMies to score buyer intent, nurture the maybes, and focus your team on serious clients.",
        cta: "Book a Demo",
      },
      {
        title: "AI scored this buyer 92/100",
        hook: "Want to know which buyers are worth calling first?",
        body: "HeyMies highlights high-intent buyer behaviour before the agent follow-up starts.",
        cta: "See a Buyer Score",
      },
      {
        title: "Agents do not need more leads, they need better leads",
        hook: "Improve the quality of your next buyer conversation.",
        body: "Give your agents clearer buyer context and fewer dead-end calls.",
        cta: "Improve Lead Quality",
      },
      {
        title: "Property leads are broken",
        hook: "Fix the gap between enquiry and qualified buyer.",
        body: "HeyMies adds scoring, nurturing, and activity tracking to the property lead journey.",
        cta: "Fix Your Lead Flow",
      },
      {
        title: "Follow up smarter, not harder",
        hook: "Let AI handle the warm-up before your agents step in.",
        body: "Mia keeps buyers engaged and alerts your team when intent becomes clear.",
        cta: "Follow Up Smarter",
      },
    ],
  },
];

export default function AdminMarketingPage() {
  return (
    <main className="tech-page text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link href="/admin" className="text-sm font-semibold text-emerald-700">
              Back to admin
            </Link>
            <p className="tech-kicker mt-6">Marketing assets</p>
            <h1 className="mt-2 text-3xl font-semibold">Ready-to-Copy Ad Ideas</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Internal campaign copy for HeyMies agent acquisition. Use these as quick
              drafts for Meta ads, reels, carousel posts, landing-page tests, and sales
              follow-up snippets.
            </p>
          </div>
          <Link
            href="/agents-ai-leads"
            className="tech-button-primary w-fit rounded-xl px-4 py-2 text-sm font-semibold"
          >
            View landing page
          </Link>
          <Link
            href="/admin/marketing/previews"
            className="tech-button-secondary w-fit rounded-xl px-4 py-2 text-sm font-semibold"
          >
            View ad previews
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {sections.map((section) => (
            <a
              key={section.title}
              href={`#${slugify(section.title)}`}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 shadow-sm hover:border-emerald-200 hover:bg-emerald-50/40"
            >
              {section.title}
            </a>
          ))}
        </div>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.title} id={slugify(section.title)} className="scroll-mt-24">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">{section.title}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                      {section.description}
                    </p>
                  </div>
                  <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                    {section.items.length} ideas
                  </span>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {section.items.map((item) => (
                    <AssetCard key={`${section.title}-${item.title}`} item={item} />
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

function AssetCard({ item }: { item: AssetItem }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
      <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
      <CopyBlock label="Hook" value={item.hook} />
      <CopyBlock label="Body copy" value={item.body} />
      <CopyBlock label="CTA" value={item.cta} strong />
    </article>
  );
}

function CopyBlock({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 text-sm leading-6 ${
          strong ? "font-semibold text-emerald-800" : "text-slate-700"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replaceAll(" ", "-");
}
