<<<<<<< HEAD
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Role = "agent" | "buyer" | "seller";

export default function SignupPage() {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [role, setRole] = useState<Role>("agent");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSignup() {
    setError(null);

    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setLoading(true);

    const { error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: fullName || null,
          phone: phone || null,
        },
      },
    });

    if (authErr) {
      setLoading(false);
      return setError(authErr.message);
    }

    setLoading(false);

    // With email confirmation ON, user may need to confirm before they can log in.
    router.push(`/login?role=${role}`);
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Create account</h1>

      <div className="mt-6 space-y-3">
        <label className="block text-sm font-medium">Role</label>

        <select
          className="w-full rounded-xl border p-3"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          <option value="agent">Agent</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Private Seller</option>
        </select>

        <input
          className="w-full rounded-xl border p-3"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          className="w-full rounded-xl border p-3"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          className="w-full rounded-xl border p-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full rounded-xl border p-3"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          className="w-full rounded-xl border p-3"
          placeholder="Confirm password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          className="w-full rounded-xl bg-black p-3 text-white disabled:opacity-60"
          onClick={onSignup}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create account"}
        </button>

        <p className="text-sm">
          Already have an account?{" "}
          <a className="underline" href="/login">
            Log in
          </a>
        </p>
      </div>
    </main>
  );
}
=======
import Link from "next/link";

export default function SignupChooseRolePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="relative w-full overflow-hidden">
        <div aria-hidden className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at top, rgba(16,185,129,0.25) 0%, rgba(16,185,129,0.12) 40%, transparent 75%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <h1 className="text-4xl font-semibold md:text-5xl">Join HeyMies</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-700">
            Choose how you want to use HeyMies.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <ChoiceCard
              title="Agent"
              desc="Get qualified buyers only. Less admin, more closing."
              href="/onboarding/agent"
              cta="Apply as agent"
            />
            <ChoiceCard
              title="Private Seller"
              desc="List your property and attract serious buyers, not noise."
              href="/onboarding/seller"
              cta="Continue as seller"
            />
            <ChoiceCard
              title="Buyer"
              desc="Get matched and guided until you’re ready to view and buy."
              href="/onboarding/buyer"
              cta="Continue as buyer"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function ChoiceCard({
  title,
  desc,
  href,
  cta,
}: {
  title: string;
  desc: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-slate-700">{desc}</p>
      <Link
        href={href}
        className="mt-6 inline-block rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
      >
        {cta}
      </Link>
    </div>
  );
}
>>>>>>> de317c9451e18b44415fb345ed03f23a18805a36
