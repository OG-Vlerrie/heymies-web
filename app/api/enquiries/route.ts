import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resend } from "@/lib/resend";

const DEFAULT_MESSAGE =
  "Hi, I’m interested in this property and would like more information.";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const listingId = String(body.listingId || "").trim();
    const message = String(body.message || "").trim();
    const requestViewing = Boolean(body.request_viewing);
    const finalMessage = message || DEFAULT_MESSAGE;

    if (!listingId) {
      return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { error: "Could not load user profile" },
        { status: 500 }
      );
    }

    const fullName = profile?.full_name || user.user_metadata?.full_name || "";
    const phone = profile?.phone || "";
    const email = user.email || "";

    const { data: listingData, error: listingError } = await supabase
      .from("listings")
      .select("id, agent_id, title")
      .eq("id", listingId)
      .eq("status", "active")
      .maybeSingle();

    if (listingError || !listingData) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const listing = listingData as {
      id: string;
      agent_id: string | null;
      title: string;
    };

    const now = new Date().toISOString();

    const { data: existing, error: existingError } = await supabase
      .from("enquiries")
      .select("id, enquiry_count, request_viewing")
      .eq("user_id", user.id)
      .eq("listing_id", listingId)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { error: "Could not check existing enquiry" },
        { status: 500 }
      );
    }

    async function getAgentProfile() {
      if (!listing.agent_id) return null;

      const { data: agentProfile, error: agentProfileError } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", listing.agent_id)
        .maybeSingle();

      if (agentProfileError) {
        console.error("Failed to load agent profile:", agentProfileError);
        return null;
      }

      return agentProfile;
    }

    async function sendAgentEmail(params: {
      subject: string;
      heading: string;
      intro: string;
      enquiryCountText?: string;
      viewingRequested: boolean;
      messageText: string;
    }) {
      try {
        const agentProfile = await getAgentProfile();

        if (!agentProfile?.email) return;

        await resend.emails.send({
          from: "HeyMies <no-reply@heymies.co.za>",
          to: agentProfile.email,
          subject: params.subject,
          html: `
            <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
              <h2 style="margin-bottom: 8px;">${params.heading}</h2>
              <p style="margin-top: 0;">${params.intro}</p>

              <div style="margin: 20px 0; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <p><strong>Listing:</strong> ${listing.title}</p>
                <p><strong>Name:</strong> ${fullName || "—"}</p>
                <p><strong>Email:</strong> ${email || "—"}</p>
                <p><strong>Phone:</strong> ${phone || "—"}</p>
                ${
                  params.enquiryCountText
                    ? `<p><strong>Enquiry count:</strong> ${params.enquiryCountText}</p>`
                    : ""
                }
                <p><strong>Viewing requested:</strong> ${
                  params.viewingRequested ? "Yes" : "No"
                }</p>
                <p><strong>Message:</strong></p>
                <p>${params.messageText}</p>
              </div>

              <p>Log in to HeyMies to view and manage this enquiry.</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send enquiry email:", emailError);
      }
    }

    if (!existing) {
      const { data: inserted, error: insertError } = await supabase
        .from("enquiries")
        .insert({
          user_id: user.id,
          listing_id: listingId,
          agent_id: listing.agent_id,
          full_name: fullName,
          email,
          phone,
          latest_message: finalMessage,
          request_viewing: requestViewing,
          enquiry_count: 1,
          first_enquired_at: now,
          last_enquired_at: now,
          status: "new",
        })
        .select("id")
        .single();

      if (insertError || !inserted) {
        return NextResponse.json(
          { error: "Could not create enquiry" },
          { status: 500 }
        );
      }

      await supabase.from("enquiry_events").insert({
        enquiry_id: inserted.id,
        user_id: user.id,
        listing_id: listingId,
        event_type: "created",
        message: message || null,
      });

      await sendAgentEmail({
        subject: `New enquiry for ${listing.title}`,
        heading: "New property enquiry",
        intro: "A buyer has submitted a new enquiry on one of your listings.",
        viewingRequested: requestViewing,
        messageText: finalMessage,
      });

      return NextResponse.json({
        ok: true,
        mode: "created",
      });
    }

    const nextCount = (existing.enquiry_count || 1) + 1;
    const updatedViewingRequest = existing.request_viewing || requestViewing;

    const { error: updateError } = await supabase
      .from("enquiries")
      .update({
        full_name: fullName,
        email,
        phone,
        latest_message: finalMessage,
        request_viewing: updatedViewingRequest,
        enquiry_count: nextCount,
        last_enquired_at: now,
        updated_at: now,
        status: "active",
      })
      .eq("id", existing.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Could not update enquiry" },
        { status: 500 }
      );
    }

    await supabase.from("enquiry_events").insert({
      enquiry_id: existing.id,
      user_id: user.id,
      listing_id: listingId,
      event_type: "updated",
      message: message || null,
    });

    await sendAgentEmail({
      subject: `Buyer re-engaged on ${listing.title}`,
      heading: "Buyer re-engaged",
      intro: "A buyer has submitted another enquiry on this listing.",
      enquiryCountText: String(nextCount),
      viewingRequested: updatedViewingRequest,
      messageText: finalMessage,
    });

    return NextResponse.json({
      ok: true,
      mode: "updated",
      enquiry_count: nextCount,
    });
  } catch (error) {
    console.error("Enquiry route error:", error);

    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
