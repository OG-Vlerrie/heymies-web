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
