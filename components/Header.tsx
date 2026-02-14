"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type LoginRole = "agent" | "seller" | "buyer";

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

  const linkClass = (href: string) =>
    `text-sm transition ${
      pathname === href
        ? "font-semibold text-slate-900"
        : "text-slate-600 hover:text-slate-900"
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

      if (menuRef.current && !menuRef.current.contains(t)) setOpen(false);
      if (joinMenuRef.current && !joinMenuRef.current.contains(t))
        setJoinOpen(false);
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  function loginHref(role: LoginRole) {
    return `/login?role=${role}`;
  }

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
            For Agents
          </Link>
          <Link
            href="/for-private-sellers"
            className={linkClass("/for-private-sellers")}
          >
            For Private Sellers
          </Link>
          <Link href="/for-buyers" className={linkClass("/for-buyers")}>
            For Buyers
          </Link>
          <Link href="/listings" className={linkClass("/listings")}>
            Listings
          </Link>
          <Link href="/pricing" className={linkClass("/pricing")}>
            Pricing
          </Link>
          <Link href="/contact" className={linkClass("/contact")}>
            Contact
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Login dropdown (only when NOT logged in) */}
          {!loading && !loggedIn && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className="rounded-xl px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                onClick={() => {
                  setJoinOpen(false);
                  setOpen((v) => !v);
                }}
              >
                Login
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-emerald-200 bg-white text-slate-900 shadow-lg">
                  <Link
                    href={loginHref("agent")}
                    className="block px-4 py-3 text-sm hover:bg-emerald-50"
                    onClick={() => setOpen(false)}
                  >
                    Agent
                  </Link>
                  <Link
                    href={loginHref("seller")}
                    className="block px-4 py-3 text-sm hover:bg-emerald-50"
                    onClick={() => setOpen(false)}
                  >
                    Private Seller
                  </Link>
                  <Link
                    href={loginHref("buyer")}
                    className="block px-4 py-3 text-sm hover:bg-emerald-50"
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
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </>
          ) : (
            !loading && (
              <div className="relative" ref={joinMenuRef}>
                <button
                  type="button"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  onClick={() => {
                    setOpen(false);
                    setJoinOpen((v) => !v);
                  }}
                >
                  Join HeyMies
                </button>

                {joinOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-lg">
                    <Link
                      href="/signup/agent"
                      className="block px-4 py-3 text-sm hover:bg-slate-50"
                      onClick={() => setJoinOpen(false)}
                    >
                      Agent
                    </Link>
                    <Link
                      href="/signup/private-seller"
                      className="block px-4 py-3 text-sm hover:bg-slate-50"
                      onClick={() => setJoinOpen(false)}
                    >
                      Private Seller
                    </Link>
                    <Link
                      href="/signup/buyer"
                      className="block px-4 py-3 text-sm hover:bg-slate-50"
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
    </header>
  );
}
