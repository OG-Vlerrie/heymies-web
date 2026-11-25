import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const metadata = body?.data;

    if (!email.includes("@") || password.length < 6 || !metadata || metadata.role !== "agent") {
      return NextResponse.json({ error: "Invalid agent signup details." }, { status: 400 });
    }

    const redirect = new URL(String(body?.emailRedirectTo ?? ""));
    if (redirect.origin !== req.nextUrl.origin || redirect.pathname !== "/login") {
      return NextResponse.json({ error: "Invalid confirmation redirect." }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      return NextResponse.json({ error: "Signup is temporarily unavailable." }, { status: 503 });
    }

    // Use the public key so Supabase's normal signup and email-confirmation rules apply.
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirect.toString(), data: metadata },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Supabase returns no identities for an existing account in its obfuscated
    // signup response. Only notify for a newly created account.
    if (data.user?.identities?.length) {
      const to = process.env.AGENT_SIGNUP_NOTIFY_TO?.trim();
      const from = process.env.EMAIL_FROM?.trim();
      const key = process.env.RESEND_API_KEY?.trim();
      if (to && from && key) {
        try {
          const result = await new Resend(key).emails.send({
            from,
            to: [to],
            subject: "New HeyMies agent signup",
            text: [
              `Name: ${String(metadata.full_name ?? "").slice(0, 200)}`,
              `Agency: ${String(metadata.agency_name ?? "").slice(0, 200)}`,
              `Email: ${email}`,
              "The agent may still need to confirm their email address.",
            ].join("\n"),
          });
          if (result.error) console.error("Agent signup notification failed:", result.error);
        } catch (sendError) {
          // A notification problem must not undo a successful account creation.
          console.error("Agent signup notification failed:", sendError);
        }
      } else {
        console.warn("Agent signup notification is not configured.");
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Agent signup route failed:", error);
    return NextResponse.json({ error: "Could not create account. Please try again." }, { status: 400 });
  }
}
