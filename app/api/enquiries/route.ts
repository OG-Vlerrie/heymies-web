import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resend } from "@/lib/resend";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { financeReadinessScore, hasFinanceGap } from "@/lib/buyer-finance";
import { scoreListingForBuyer, type BuyerMatchProfile, type MatchListing } from "@/lib/matching";
import { ensureEmailPreference } from "@/lib/email-preferences";

const DEFAULT_MESSAGE =
  "Hi, I'm interested in this property and would like more information.";

type QualificationStatus =
  | "agent_ready"
  | "needs_finance_nurture"
  | "needs_confirmation"
  | "nurture_for_better_fit"
  | "not_ready";

type BuyerProfile = BuyerMatchProfile & {
  full_name: string | null;
  phone: string | null;
  lead_score: number | null;
  preapproved: string | null;
  timeline: string | null;
  selling_property: string | null;
};

const BUYER_RESPONSE_ACTIONS = {
  finance_ready: "I'm pre-approved, deposit-ready, or paying cash",
  needs_preapproval: "I'd like help with pre-approval",
  wants_viewing: "I'd like to arrange a viewing",
  still_comparing: "I'm still comparing options",
  better_matches: "Please send me better matches",
} as const;

type BuyerResponseAction = keyof typeof BUYER_RESPONSE_ACTIONS;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authClient = createClient(
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
    } = await authClient.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = supabaseAdmin();

    const body = await req.json();
    const listingId = String(body.listingId || "").trim();
    const message = String(body.message || "").trim();
    const requestViewing = Boolean(body.request_viewing);
    const finalMessage = message || DEFAULT_MESSAGE;

    if (!listingId) {
      return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, phone, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Failed to load enquiry user profile:", profileError);
      return NextResponse.json(
        { error: `Could not load user profile: ${profileError.message}` },
        { status: 500 }
      );
    }

    let profile = profileData;
    if (!profile) {
      const { data: repairedProfile, error: repairError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            role: "buyer",
            full_name: user.user_metadata?.full_name ?? null,
            phone: user.user_metadata?.phone ?? null,
          },
          { onConflict: "id" }
        )
        .select("full_name, phone, role")
        .single();

      if (repairError) {
        console.error("Failed to repair missing enquiry user profile:", repairError);
        return NextResponse.json(
          { error: `Could not create user profile: ${repairError.message}` },
          { status: 500 }
        );
      }

      profile = repairedProfile;
    }

    if (profile.role !== "buyer") {
      return NextResponse.json(
        { error: "Only buyer accounts can enquire on listings." },
        { status: 403 }
      );
    }

    let fullName = profile?.full_name || user.user_metadata?.full_name || "";
    let phone = profile?.phone || "";
    const email = user.email || "";

    const { data: listingData, error: listingError } = await supabase
      .from("listings")
      .select("id, agent_id, title, price, price_per_month, sale_type, listing_type, suburb, city, bedrooms, bathrooms, contact_email")
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
      price: number | null;
      price_per_month: number | null;
      sale_type: string | null;
      listing_type: string | null;
      suburb: string | null;
      city: string | null;
      bedrooms: number | null;
      bathrooms: number | null;
      contact_email: string | null;
    };

    const { data: buyerData } = await supabase
      .from("buyers")
      .select(
        "full_name,phone,lead_score,preapproved,timeline,selling_property,budget_min,budget_max,property_types,areas,areas_multi,bedrooms_min,bathrooms_min"
      )
      .eq("user_id", user.id)
      .maybeSingle();

    const buyer = buyerData as BuyerProfile | null;
    fullName = fullName || buyer?.full_name || "";
    phone = phone || buyer?.phone || "";

    const qualification = qualifyEnquiry({
      listing,
      buyer,
      requestViewing,
    });

    const now = new Date().toISOString();
    const responseToken = createResponseToken();

    const { data: existing, error: existingError } = await supabase
      .from("enquiries")
      .select("id, enquiry_count, request_viewing, buyer_response_token")
      .eq("user_id", user.id)
      .eq("listing_id", listingId)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { error: "Could not check existing enquiry" },
        { status: 500 }
      );
    }

    async function getAgentRecipients() {
      const recipients = new Set<string>();

      if (listing.contact_email) {
        recipients.add(listing.contact_email);
      }

      if (!listing.agent_id) {
        return { emails: Array.from(recipients) };
      }

      const { data: agentProfile, error: agentProfileError } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", listing.agent_id)
        .maybeSingle();

      if (agentProfileError) {
        console.error("Failed to load agent profile:", agentProfileError);
      }

      const { data: agentUser, error: agentUserError } =
        await supabase.auth.admin.getUserById(listing.agent_id);

      if (agentUserError) {
        console.error("Failed to load agent auth user:", agentUserError);
      }

      if (agentUser.user?.email) {
        recipients.add(agentUser.user.email);
      }

      return {
        full_name: agentProfile?.full_name ?? null,
        emails: Array.from(recipients),
      };
    }

    async function sendAgentEmail(params: {
      subject: string;
      heading: string;
      intro: string;
      enquiryCountText?: string;
      viewingRequested: boolean;
      messageText: string;
      qualificationSummary: string;
      nextAction: string;
      readinessScore: number;
      propertyFitScore: number | null;
    }) {
      try {
        const agentProfile = await getAgentRecipients();

        if (!agentProfile?.emails.length) return;

        const safeListingTitle = escapeHtml(listing.title);
        const safeFullName = escapeHtml(fullName || "-");
        const safeEmail = escapeHtml(email || "-");
        const safePhone = escapeHtml(phone || "-");
        const safeMessage = escapeHtml(params.messageText).replaceAll("\n", "<br />");

        await resend.emails.send({
          from: process.env.EMAIL_FROM?.trim() || "HeyMies <no-reply@heymies.co.za>",
          to: agentProfile.emails,
          subject: params.subject,
          html: `
            <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
              <h2 style="margin-bottom: 8px;">${escapeHtml(params.heading)}</h2>
              <p style="margin-top: 0;">${escapeHtml(params.intro)}</p>

              <div style="margin: 20px 0; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <p><strong>Listing:</strong> ${safeListingTitle}</p>
                <p><strong>Name:</strong> ${safeFullName}</p>
                <p><strong>Email:</strong> ${safeEmail}</p>
                <p><strong>Phone:</strong> ${safePhone}</p>
                ${
                  params.enquiryCountText
                    ? `<p><strong>Enquiry count:</strong> ${escapeHtml(params.enquiryCountText)}</p>`
                    : ""
                }
                <p><strong>Viewing requested:</strong> ${
                  params.viewingRequested ? "Yes" : "No"
                }</p>
                <p><strong>Readiness:</strong> ${params.readinessScore}/100</p>
                <p><strong>Property fit:</strong> ${
                  params.propertyFitScore === null ? "Pending" : `${params.propertyFitScore}%`
                }</p>
                <p><strong>Mia's read:</strong> ${escapeHtml(params.qualificationSummary)}</p>
                <p><strong>Suggested next step:</strong> ${escapeHtml(params.nextAction)}</p>
                <p><strong>Buyer's message:</strong></p>
                <p>${safeMessage}</p>
              </div>

              <p>This one looks worth your attention. You can also review it in your HeyMies dashboard.</p>
              <p>Warmly,<br />Mia from HeyMies</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send enquiry email:", emailError);
      }
    }

    async function sendBuyerNurtureEmail(params: {
      subject: string;
      heading: string;
      body: string;
      nextAction: string;
      responseToken: string;
      responseActions: BuyerResponseAction[];
    }) {
      if (!email) return;

      try {
        const preferences = await ensureEmailPreference({
          userId: user?.id,
          email,
          topic: "nurture",
          origin: requestOrigin(req),
        });

        if (!preferences.allowed) return;

        const firstName = fullName.trim().split(" ")[0] || "there";
        const safeBody = escapeHtml(params.body).replaceAll("\n", "<br />");
        const actionLinks = params.responseActions
          .map((action) => {
            const href = `${requestOrigin(req)}/api/enquiries?token=${encodeURIComponent(
              params.responseToken
            )}&action=${encodeURIComponent(action)}`;
            return `<p style="margin: 10px 0;"><a href="${escapeHtml(
              href
            )}" style="color:#047857;font-weight:700;">${escapeHtml(
              BUYER_RESPONSE_ACTIONS[action]
            )}</a></p>`;
          })
          .join("");

        await resend.emails.send({
          from: process.env.EMAIL_FROM?.trim() || "HeyMies <no-reply@heymies.co.za>",
          to: email,
          subject: params.subject,
          html: `
            <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
              <h2 style="margin-bottom: 8px;">${escapeHtml(params.heading)}</h2>
              <p>Hi ${escapeHtml(firstName)},</p>
              <p>${safeBody}</p>
              <p>${escapeHtml(params.nextAction)}</p>
              <div style="margin: 18px 0; padding: 14px; border: 1px solid #d1fae5; border-radius: 12px; background: #ecfdf5;">
                <p style="margin-top: 0;"><strong>You can reply with one click:</strong></p>
                ${actionLinks}
              </div>
              <p style="margin-top: 24px; font-size: 12px; color: #64748b;">
                <a href="${escapeHtml(preferences.manageUrl)}" style="color:#64748b;">Manage email preferences</a>
                &nbsp;|&nbsp;
                <a href="${escapeHtml(preferences.unsubscribeUrl)}" style="color:#64748b;">Unsubscribe from Mia follow-ups</a>
              </p>
              <p>Warmly,<br />Mia from HeyMies</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send buyer nurture email:", emailError);
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
          property_fit_score: qualification.propertyFitScore,
          readiness_score: qualification.readinessScore,
          qualification_status: qualification.status,
          qualification_summary: qualification.summary,
          next_action: qualification.nextAction,
          nurture_status: qualification.nurtureStatus,
          agent_ready_at: qualification.status === "agent_ready" ? now : null,
          next_nurture_at: qualification.nextNurtureAt,
          buyer_response_token: responseToken,
          buyer_response_token_created_at: now,
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
        metadata: qualification.eventMetadata,
      });

      if (qualification.status === "agent_ready") {
        await sendAgentEmail({
          subject: `Mia found a ready buyer for ${listing.title}`,
          heading: "A ready buyer is waiting",
          intro: "Mia from HeyMies has checked this enquiry against the buyer's profile and it looks ready for your attention.",
          viewingRequested: requestViewing,
          messageText: finalMessage,
          qualificationSummary: qualification.summary,
          nextAction: qualification.nextAction,
          readinessScore: qualification.readinessScore,
          propertyFitScore: qualification.propertyFitScore,
        });
      } else {
        await sendBuyerNurtureEmail({
          subject: `Quick check on ${listing.title}`,
          heading: qualification.buyerEmailHeading,
          body: qualification.buyerEmailBody,
          nextAction: qualification.nextAction,
          responseToken,
          responseActions: responseActionsForStatus(qualification.status),
        });
      }

      return NextResponse.json({
        ok: true,
        mode: "created",
        qualification_status: qualification.status,
        readiness_score: qualification.readinessScore,
        property_fit_score: qualification.propertyFitScore,
      });
    }

    const nextCount = (existing.enquiry_count || 1) + 1;
    const updatedViewingRequest = existing.request_viewing || requestViewing;
    const existingResponseToken = existing.buyer_response_token || responseToken;
    const updatedQualification = qualifyEnquiry({
      listing,
      buyer,
      requestViewing: updatedViewingRequest,
      enquiryCount: nextCount,
    });

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
        property_fit_score: updatedQualification.propertyFitScore,
        readiness_score: updatedQualification.readinessScore,
        qualification_status: updatedQualification.status,
        qualification_summary: updatedQualification.summary,
        next_action: updatedQualification.nextAction,
        nurture_status: updatedQualification.nurtureStatus,
        agent_ready_at: updatedQualification.status === "agent_ready" ? now : null,
        next_nurture_at: updatedQualification.nextNurtureAt,
        buyer_response_token: existingResponseToken,
        buyer_response_token_created_at: existing.buyer_response_token ? undefined : now,
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
      metadata: updatedQualification.eventMetadata,
    });

    if (updatedQualification.status === "agent_ready") {
      await sendAgentEmail({
        subject: `Mia found a ready buyer for ${listing.title}`,
        heading: "A ready buyer has re-engaged",
        intro: "Mia from HeyMies has checked this updated enquiry and it looks ready for your attention.",
        enquiryCountText: String(nextCount),
        viewingRequested: updatedViewingRequest,
        messageText: finalMessage,
        qualificationSummary: updatedQualification.summary,
        nextAction: updatedQualification.nextAction,
        readinessScore: updatedQualification.readinessScore,
        propertyFitScore: updatedQualification.propertyFitScore,
      });
    } else {
      await sendBuyerNurtureEmail({
        subject: `Quick check on ${listing.title}`,
        heading: updatedQualification.buyerEmailHeading,
        body: updatedQualification.buyerEmailBody,
        nextAction: updatedQualification.nextAction,
        responseToken: existingResponseToken,
        responseActions: responseActionsForStatus(updatedQualification.status),
      });
    }

    return NextResponse.json({
      ok: true,
      mode: "updated",
      enquiry_count: nextCount,
      qualification_status: updatedQualification.status,
      readiness_score: updatedQualification.readinessScore,
      property_fit_score: updatedQualification.propertyFitScore,
    });
  } catch (error) {
    console.error("Enquiry route error:", error);

    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim() || "";
  const action = req.nextUrl.searchParams.get("action")?.trim() || "";
  const origin = requestOrigin(req);

  if (!token || !isBuyerResponseAction(action)) {
    return NextResponse.redirect(`${origin}/enquiry-response?result=invalid`);
  }

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("enquiries")
    .select(
      "id,user_id,listing_id,agent_id,full_name,email,phone,latest_message,request_viewing,readiness_score,property_fit_score,qualification_summary,next_action,buyer_response_token,listing:listings(id,title,contact_email)"
    )
    .eq("buyer_response_token", token)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.redirect(`${origin}/enquiry-response?result=invalid`);
  }

  const enquiry = {
    ...data,
    listing: Array.isArray(data.listing) ? data.listing[0] : data.listing,
  } as {
    id: string;
    user_id: string | null;
    listing_id: string;
    agent_id: string | null;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    latest_message: string | null;
    request_viewing: boolean;
    readiness_score: number | null;
    property_fit_score: number | null;
    qualification_summary: string | null;
    next_action: string | null;
    listing?: {
      id: string;
      title: string;
      contact_email: string | null;
    };
  };

  const response = responseUpdateForAction(action, enquiry);
  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("enquiries")
    .update({
      request_viewing: response.requestViewing,
      readiness_score: response.readinessScore,
      qualification_status: response.qualificationStatus,
      qualification_summary: response.qualificationSummary,
      next_action: response.nextAction,
      nurture_status: response.nurtureStatus,
      agent_ready_at: response.qualificationStatus === "agent_ready" ? now : null,
      next_nurture_at:
        response.qualificationStatus === "agent_ready"
          ? null
          : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      last_buyer_response: action,
      last_buyer_responded_at: now,
      updated_at: now,
      status: response.qualificationStatus === "agent_ready" ? "qualified" : "active",
    })
    .eq("id", enquiry.id);

  if (updateError) {
    console.error("Failed to record buyer response:", updateError);
    return NextResponse.redirect(`${origin}/enquiry-response?result=error`);
  }

  await supabase.from("enquiry_events").insert({
    enquiry_id: enquiry.id,
    user_id: enquiry.user_id,
    listing_id: enquiry.listing_id,
    event_type: "buyer_response",
    message: BUYER_RESPONSE_ACTIONS[action],
    metadata: {
      buyer_response: action,
      qualification_status: response.qualificationStatus,
      readiness_score: response.readinessScore,
      next_action: response.nextAction,
    },
  });

  if (response.qualificationStatus === "agent_ready") {
    await sendAgentReadyResponseEmail({
      enquiry,
      action,
      readinessScore: response.readinessScore,
      propertyFitScore: enquiry.property_fit_score,
      qualificationSummary: response.qualificationSummary,
      nextAction: response.nextAction,
    });
  }

  return NextResponse.redirect(
    `${origin}/enquiry-response?result=recorded&action=${encodeURIComponent(
      action
    )}&status=${encodeURIComponent(response.qualificationStatus)}`
  );
}

function qualifyEnquiry({
  listing,
  buyer,
  requestViewing,
  enquiryCount = 1,
}: {
  listing: MatchListing;
  buyer: BuyerProfile | null;
  requestViewing: boolean;
  enquiryCount?: number;
}) {
  const match = buyer ? scoreListingForBuyer(listing, buyer) : null;
  const propertyFitScore = match?.score ?? null;
  const preapproved = (buyer?.preapproved ?? "").trim().toLowerCase();
  const timeline = (buyer?.timeline ?? "").trim().toLowerCase();
  const sellingProperty = (buyer?.selling_property ?? "").trim().toLowerCase();

  let readinessScore = buyer?.lead_score ? Math.round(buyer.lead_score * 0.1) : 0;

  if (propertyFitScore !== null) {
    readinessScore += Math.round(propertyFitScore * 0.35);
  }

  readinessScore += Math.round(financeReadinessScore(preapproved) * 0.85);
  if (hasFinanceGap(preapproved)) readinessScore -= 5;

  if (timeline.includes("0-3") || timeline.includes("asap")) readinessScore += 20;
  else if (timeline.includes("3-6")) readinessScore += 12;
  else if (timeline.includes("6-12")) readinessScore += 6;
  else if (timeline.includes("browsing")) readinessScore -= 5;

  if (requestViewing) readinessScore += 15;
  if (enquiryCount > 1) readinessScore += 8;
  if (sellingProperty === "yes") readinessScore -= 10;

  readinessScore = Math.max(0, Math.min(100, readinessScore));

  const needsFinanceFollowup = hasFinanceGap(preapproved);
  const isSlowTimeline = timeline.includes("browsing") || timeline.includes("6-12");

  let status: QualificationStatus = "needs_confirmation";

  if (propertyFitScore !== null && propertyFitScore < 35) {
    status = "nurture_for_better_fit";
  } else if (readinessScore >= 70 && (propertyFitScore ?? 0) >= 70) {
    status = "agent_ready";
  } else if (needsFinanceFollowup && (propertyFitScore ?? 0) >= 50) {
    status = "needs_finance_nurture";
  } else if (isSlowTimeline && readinessScore < 55) {
    status = "not_ready";
  }

  const nextNurtureAt =
    status === "agent_ready"
      ? null
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const statusCopy = qualificationCopy(status, listing.title);
  const summaryParts = [
    propertyFitScore === null
      ? "No buyer profile was found for automated matching."
      : `Property fit ${propertyFitScore}% (${match?.reasons.join(", ") || "review manually"}).`,
    `Readiness ${readinessScore}/100.`,
    buyer?.preapproved ? `Finance: ${buyer.preapproved}.` : "Finance status not confirmed.",
    buyer?.timeline ? `Timeline: ${buyer.timeline}.` : "Timeline not confirmed.",
    requestViewing ? "Buyer requested viewing." : "Buyer requested more information.",
  ];

  if (buyer?.selling_property) {
    summaryParts.push(`Needs to sell first: ${buyer.selling_property}.`);
  }

  return {
    propertyFitScore,
    readinessScore,
    status,
    summary: summaryParts.join(" "),
    nextAction: statusCopy.nextAction,
    nurtureStatus: status === "agent_ready" ? "handover_ready" : "nurturing",
    nextNurtureAt,
    buyerEmailHeading: statusCopy.buyerHeading,
    buyerEmailBody: statusCopy.buyerBody,
    eventMetadata: {
      property_fit_score: propertyFitScore,
      readiness_score: readinessScore,
      qualification_status: status,
      match_reasons: match?.reasons ?? [],
      next_action: statusCopy.nextAction,
    },
  };
}

function qualificationCopy(status: QualificationStatus, listingTitle: string) {
  switch (status) {
    case "agent_ready":
      return {
        nextAction: "Please call them today while the interest is fresh.",
        buyerHeading: "This looks like a strong match",
        buyerBody: `Thanks for your interest in ${listingTitle}. It lines up well with your buyer profile, so I have sent your details to the agent and asked them to contact you.\n\nIf you already have a preferred viewing time, just reply with it and I will keep that with your enquiry.`,
      };
    case "needs_finance_nurture":
      return {
        nextAction: "Are you already pre-approved, deposit-ready, paying cash, or would you like help getting pre-approved?",
        buyerHeading: "This could be a good fit, but let's check finance first",
        buyerBody: `Thanks for your interest in ${listingTitle}. It looks like it could fit your search, but before I send it through as a serious lead, I want to check your finance position.\n\nAgents usually move faster when they know a buyer is pre-approved or has a clear finance plan.`,
      };
    case "nurture_for_better_fit":
      return {
        nextAction: "Would you like to stay with this property, or should I watch for homes closer to your budget and area preferences?",
        buyerHeading: "Let's make sure this is the right home to chase",
        buyerBody: `Thanks for enquiring about ${listingTitle}. I checked it against your buyer profile and it may be outside parts of what you told us you are looking for.\n\nThat does not mean it is wrong for you, but I do not want to waste your time or send you to an agent for a property that is not a real fit.`,
      };
    case "not_ready":
      return {
        nextAction: "Are you just keeping an eye on the market, or would you like to start getting ready to buy?",
        buyerHeading: "No rush, let's keep this useful",
        buyerBody: `Thanks for enquiring about ${listingTitle}. Based on your profile, it looks like you may still be early in the buying journey.\n\nI can still help you keep track of good matches without pushing you into an agent conversation too soon.`,
      };
    case "needs_confirmation":
    default:
      return {
        nextAction: "Would you like the agent to contact you now, or are you still comparing options?",
        buyerHeading: "Quick check before I connect you",
        buyerBody: `Thanks for your interest in ${listingTitle}. It may be a fit, but I want to check your intent before I send it through to the agent.\n\nThat way, agents only contact you when you actually want the conversation.`,
      };
  }
}

function responseActionsForStatus(status: QualificationStatus): BuyerResponseAction[] {
  switch (status) {
    case "needs_finance_nurture":
      return ["finance_ready", "needs_preapproval", "still_comparing"];
    case "nurture_for_better_fit":
      return ["better_matches", "still_comparing", "wants_viewing"];
    case "not_ready":
      return ["still_comparing", "needs_preapproval", "better_matches"];
    case "needs_confirmation":
    default:
      return ["wants_viewing", "still_comparing", "better_matches"];
  }
}

function isBuyerResponseAction(action: string): action is BuyerResponseAction {
  return action in BUYER_RESPONSE_ACTIONS;
}

function createResponseToken() {
  return `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll("-", "");
}

function requestOrigin(req: NextRequest) {
  const url = new URL(req.url);
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return url.origin;
}

function responseUpdateForAction(
  action: BuyerResponseAction,
  enquiry: {
    latest_message: string | null;
    request_viewing: boolean;
    readiness_score: number | null;
    property_fit_score: number | null;
    qualification_summary: string | null;
    listing?: { title: string };
  }
) {
  const baseReadiness = enquiry.readiness_score ?? 0;
  const propertyFitScore = enquiry.property_fit_score ?? 0;
  const listingTitle = enquiry.listing?.title ?? "this property";
  const responseText = BUYER_RESPONSE_ACTIONS[action];

  let readinessScore = baseReadiness;
  let qualificationStatus: QualificationStatus = "needs_confirmation";
  let requestViewing = enquiry.request_viewing;
  let nextAction = "Mia should keep this buyer warm and check in again.";

  if (action === "finance_ready") {
    readinessScore += 25;
    qualificationStatus = propertyFitScore >= 45 ? "agent_ready" : "needs_confirmation";
    nextAction = "Call the buyer today and confirm finance details before arranging the next step.";
  }

  if (action === "wants_viewing") {
    readinessScore += 25;
    requestViewing = true;
    qualificationStatus = "agent_ready";
    nextAction = "Call the buyer today to arrange a viewing.";
  }

  if (action === "needs_preapproval") {
    readinessScore += 5;
    qualificationStatus = "needs_finance_nurture";
    nextAction = "Help the buyer with pre-approval before handing them to an agent.";
  }

  if (action === "still_comparing") {
    readinessScore += 3;
    qualificationStatus = "needs_confirmation";
    nextAction = "Keep the buyer warm and ask what would make this property a yes.";
  }

  if (action === "better_matches") {
    readinessScore += 2;
    qualificationStatus = "nurture_for_better_fit";
    nextAction = "Recommend better-fit listings before agent handover.";
  }

  readinessScore = Math.max(0, Math.min(100, readinessScore));

  const qualificationSummary = [
    enquiry.qualification_summary,
    `Buyer clicked: ${responseText}.`,
    `Mia response context: ${listingTitle}.`,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    requestViewing,
    readinessScore,
    qualificationStatus,
    qualificationSummary,
    nextAction,
    nurtureStatus: qualificationStatus === "agent_ready" ? "handover_ready" : "nurturing",
  };
}

async function sendAgentReadyResponseEmail({
  enquiry,
  action,
  readinessScore,
  propertyFitScore,
  qualificationSummary,
  nextAction,
}: {
  enquiry: {
    agent_id: string | null;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    latest_message: string | null;
    listing?: {
      title: string;
      contact_email: string | null;
    };
  };
  action: BuyerResponseAction;
  readinessScore: number;
  propertyFitScore: number | null;
  qualificationSummary: string;
  nextAction: string;
}) {
  const recipients = new Set<string>();
  if (enquiry.listing?.contact_email) recipients.add(enquiry.listing.contact_email);

  const supabase = supabaseAdmin();
  if (enquiry.agent_id) {
    const { data: agentUser, error: agentUserError } =
      await supabase.auth.admin.getUserById(enquiry.agent_id);

    if (agentUserError) {
      console.error("Failed to load agent auth user for buyer response:", agentUserError);
    }

    if (agentUser.user?.email) recipients.add(agentUser.user.email);
  }

  if (recipients.size === 0) return;

  const listingTitle = enquiry.listing?.title ?? "a listing";

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM?.trim() || "HeyMies <no-reply@heymies.co.za>",
      to: Array.from(recipients),
      subject: `Mia has a ready buyer for ${listingTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
          <h2 style="margin-bottom: 8px;">Buyer response received</h2>
          <p>Mia from HeyMies asked one follow-up question and the buyer clicked: <strong>${escapeHtml(
            BUYER_RESPONSE_ACTIONS[action]
          )}</strong>.</p>
          <div style="margin: 20px 0; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <p><strong>Listing:</strong> ${escapeHtml(listingTitle)}</p>
            <p><strong>Name:</strong> ${escapeHtml(enquiry.full_name || "-")}</p>
            <p><strong>Email:</strong> ${escapeHtml(enquiry.email || "-")}</p>
            <p><strong>Phone:</strong> ${escapeHtml(enquiry.phone || "-")}</p>
            <p><strong>Readiness:</strong> ${readinessScore}/100</p>
            <p><strong>Property fit:</strong> ${
              propertyFitScore === null ? "Pending" : `${propertyFitScore}%`
            }</p>
            <p><strong>Mia's read:</strong> ${escapeHtml(qualificationSummary)}</p>
            <p><strong>Suggested next step:</strong> ${escapeHtml(nextAction)}</p>
          </div>
          <p>Warmly,<br />Mia from HeyMies</p>
        </div>
      `,
    });
  } catch (emailError) {
    console.error("Failed to send agent-ready response email:", emailError);
  }
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
