"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type LoginRole = "agent" | "seller" | "buyer";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/for-agents", label: "Agents" },
  { href: "/for-private-sellers", label: "Sellers" },
  { href: "/for-buyers", label: "Buyers" },
  { href: "/listings", label: "Listings" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  // Login dropdown
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Join dropdown
  const [joinOpen, setJoinOpen] = useState(false);
  const joinMenuRef = useRef<HTMLDivElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = (href: string) =>
    `rounded-full px-3 py-2 text-sm font-medium ${
      pathname === href
        ? "bg-white/12 text-white ring-1 ring-white/15"
        : "text-slate-300 hover:bg-white/8 hover:text-white"
    }`;

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setLoggedIn(!!data.user);
      setLoading(false);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setLoggedIn(!!session?.user);
        setLoading(false);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  // Close dropdowns on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const t = e.target as Node;

      if (menuRef.current && !menuRef.current.contains(t)) {
        setOpen(false);
      }
      if (joinMenuRef.current && !joinMenuRef.current.contains(t)) {
        setJoinOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function logout() {
    await fetch("/api/auth/admin-session", { method: "DELETE" }).catch(() => null);
    await supabase.auth.signOut();
    router.push("/");
  }

  function loginHref(role: LoginRole) {
    return `/login?role=${role}`;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#06111f]/94 text-white shadow-[0_16px_45px_rgba(2,6,23,0.22)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-start gap-4 px-4 py-3 lg:justify-between">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <img
            src="/logo.svg"
            alt="HeyMies"
            width={52}
            height={52}
            style={{ display: "block" }}
            className="rounded-xl bg-white/95 p-1 shadow-sm"
          />
          <span className="text-lg font-bold text-white">HeyMies</span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/6 p-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 lg:ml-0">
          <button
            type="button"
            className="rounded-xl border border-white/12 bg-white/8 px-3 py-2 text-sm font-semibold text-white hover:bg-white/14 lg:hidden"
            onClick={() => setMobileOpen((value) => !value)}
          >
            Menu
          </button>

          {!loading && !loggedIn && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-white/8 sm:block"
                onClick={() => {
                  setJoinOpen(false);
                  setOpen((v) => !v);
                }}
              >
                Login
              </button>

              {open && (
                <div className="absolute right-0 mt-3 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
                  <Link
                    href={loginHref("agent")}
                    className="block px-4 py-3 text-sm font-medium hover:bg-emerald-50"
                    onClick={() => setOpen(false)}
                  >
                    Agent
                  </Link>
                  <Link
                    href={loginHref("seller")}
                    className="block px-4 py-3 text-sm font-medium hover:bg-emerald-50"
                    onClick={() => setOpen(false)}
                  >
                    Private Seller
                  </Link>
                  <Link
                    href={loginHref("buyer")}
                    className="block px-4 py-3 text-sm font-medium hover:bg-emerald-50"
                    onClick={() => setOpen(false)}
                  >
                    Buyer
                  </Link>
                </div>
              )}
            </div>
          )}

          {!loading && loggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-xl border border-white/12 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/16"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/12"
              >
                Logout
              </button>
            </>
          ) : (
            !loading && (
              <div className="relative hidden sm:block" ref={joinMenuRef}>
                <button
                  type="button"
                  className="tech-button-primary rounded-xl px-4 py-2 text-sm font-semibold"
                  onClick={() => {
                    setOpen(false);
                    setJoinOpen((v) => !v);
                  }}
                >
                  Join HeyMies
                </button>

                {joinOpen && (
                  <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
                    <Link
                      href="/signup/agent"
                      className="block px-4 py-3 text-sm font-medium hover:bg-slate-50"
                      onClick={() => setJoinOpen(false)}
                    >
                      Agent
                    </Link>
                    <Link
                      href="/signup/private-seller"
                      className="block px-4 py-3 text-sm font-medium hover:bg-slate-50"
                      onClick={() => setJoinOpen(false)}
                    >
                      Private Seller
                    </Link>
                    <Link
                      href="/signup/buyer"
                      className="block px-4 py-3 text-sm font-medium hover:bg-slate-50"
                      onClick={() => setJoinOpen(false)}
                    >
                      Buyer
                    </Link>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-white/10 bg-[#06111f] px-4 py-3 lg:hidden">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 sm:grid-cols-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkClass(link.href)}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!loading && !loggedIn ? (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-3 py-2 text-sm font-medium text-emerald-200 hover:bg-white/8"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full px-3 py-2 text-sm font-medium text-emerald-200 hover:bg-white/8"
                  onClick={() => setMobileOpen(false)}
                >
                  Join
                </Link>
              </>
            ) : null}
          </div>
        </nav>
      )}
    </header>
  );
}
