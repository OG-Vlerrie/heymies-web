"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `text-sm transition ${
      pathname === href
        ? "font-semibold text-slate-900"
        : "text-slate-600 hover:text-slate-900"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="HeyMies"
            width={70}
            height={70}
            style={{ display: "block" }}
          />
          <span className="text-xl font-bold tracking-tight text-emerald-700">
  HeyMies
</span>

        </Link>

       {/* Nav */}
<nav className="hidden items-center gap-6 md:flex">
  <Link href="/about" className={linkClass("/about")}>
    About
  </Link>

  <Link href="/how-it-works" className={linkClass("/how-it-works")}>
    How it works
  </Link>

  <Link href="/for-agents" className={linkClass("/for-agents")}>
    For agents
  </Link>

  <Link href="/listings" className={linkClass("/listings")}>
    Listings
  </Link>

  <Link href="/contact" className={linkClass("/contact")}>
    Contact
  </Link>
</nav>




        {/* CTA */}
        <Link
  href="/signup"
  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
>
  Join HeyMies
</Link>


      </div>
    </header>
  );
}
