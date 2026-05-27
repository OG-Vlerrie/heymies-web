# HeyMies Partner Manual

This manual is written for a real estate partner who needs to understand HeyMies deeply enough to test it, explain it, and judge whether it works in a real property environment.

HeyMies is not only a listings website. It is a lead-intelligence layer for property enquiries. The goal is to help buyers move at the right pace, help sellers create better listings, and help agents receive cleaner leads with more context.

Mia is the assistant inside HeyMies. Mia checks buyer fit, buyer readiness, finance context, timing, enquiry intent, and follow-up needs before an enquiry is treated as ready for agent handover.

## 1. The Big Idea

Traditional property enquiries are often thin:

- A buyer clicks "I am interested."
- The agent receives a name, email, phone number, and maybe a short message.
- The agent still has to work out whether the buyer is serious, financed, a good fit, ready to view, or just browsing.

HeyMies adds structure before and after the enquiry.

The product asks buyers for useful context up front, checks how well listings fit their preferences, captures enquiry behaviour, and lets Mia follow up when the buyer is not yet ready for a handover.

The desired result is simple:

- Buyers feel guided instead of pressured.
- Sellers get cleaner buyer interest.
- Agents waste less time on low-context leads.
- Admin can see what happened and why.

## 2. Core Roles

### Buyer

A buyer uses HeyMies to:

- Create a search profile.
- Set budget, preferred areas, property types, bedrooms, bathrooms, finance status, buying timeline, and whether they need to sell first.
- Browse listings.
- See match guidance.
- Save listings.
- Compare listings.
- Create match alerts.
- Enquire on a property.
- Receive Mia follow-up emails if more context is needed.

The buyer profile is important because HeyMies cannot qualify an enquiry properly without knowing what the buyer is looking for.

### Private Seller

A private seller uses HeyMies to:

- Sign up with contact and property details.
- Give HeyMies enough information to create a draft listing.
- Review and complete the listing before publishing.
- Receive better-qualified buyer interest instead of raw enquiries.

The private seller flow is designed to reduce blank-page listing creation. The seller gives structured information once, and HeyMies turns it into something useful.

### Agent

An agent uses HeyMies to:

- Sign up and create an agent profile.
- Add listings.
- Review leads.
- See buyer readiness, property fit, finance context, and Mia's recommended next action.
- Act on leads that are agent-ready.

For agents, the value is not just more leads. The value is better context before calling the buyer.

### Admin

Admin users use HeyMies to:

- Monitor signups.
- Check users and roles.
- Review listings.
- Inspect enquiries.
- Track Mia activity.
- Run or pause nurture.
- View launch readiness and health checks.
- Test the product before inviting real users.

Admin is the control room during alpha.

### Mia

Mia is the qualification and nurture assistant.

Mia:

- Scores property fit.
- Scores buyer readiness.
- Decides whether the enquiry is agent-ready.
- Sends immediate follow-up when more information is needed.
- Sends scheduled nurture follow-ups when the buyer has not responded.
- Records buyer one-click responses.
- Updates the enquiry status and next action.
- Prepares context for agent or admin review.

Mia does not replace an agent. Mia prepares the lead so the agent has a clearer next conversation.

## 3. Public Website Pages

### Home Page

The home page explains HeyMies at a high level.

Use it to show:

- The problem: property enquiries lack context.
- The solution: Mia qualifies, nurtures, matches, and hands over cleaner leads.
- The three journeys: buyers, sellers, and agents.

When demoing, start here if your partner has not seen the product before.

### For Buyers

This page explains the buyer benefit.

It introduces:

- Better-matched homes.
- Saved listings.
- Listing comparison.
- Guided enquiries.
- Mia follow-up before agent pressure.

Use this page to explain why a buyer would give HeyMies profile information before enquiring.

### For Private Sellers

This page explains the seller benefit.

It introduces:

- Guided seller signup.
- Draft listing creation.
- Cleaner enquiries.
- Mia protecting the seller from low-intent or poorly matched buyers.

Use this page when explaining why private sellers may prefer structured buyer interest over open-ended enquiries.

### For Agents

This page explains the agent benefit.

It introduces:

- Property fit.
- Buyer readiness.
- Finance context.
- Viewing intent.
- Mia nurture.
- Handover context.

For a real estate professional, this is one of the most important pages. It should make clear that HeyMies is not trying to replace the agent. It is trying to improve the lead before the agent spends time on it.

### How It Works

This page explains the operating flow:

1. A user creates a profile or listing.
2. HeyMies captures structured context.
3. Mia checks fit and readiness.
4. Ready buyers can be handed over.
5. Not-ready buyers can be nurtured.

Use this page after the home page if your partner asks, "What actually happens behind the scenes?"

## 4. Buyer Journey

### Step 1: Buyer Signup

Path: `/signup/buyer`

The buyer signup has three main steps.

#### Step 1A: Details

The buyer enters:

- Full name.
- Phone number.
- Email address.
- Password.
- Password confirmation.

Why this matters:

- The name, phone, and email are used for the buyer profile and eventual enquiry handover.
- The account allows the buyer to save, compare, enquire, and return later.

What to test:

1. Enter a realistic buyer name.
2. Enter a South African phone number.
3. Enter an email address you can access.
4. Enter a password.
5. Confirm that validation catches invalid emails, short passwords, and mismatched passwords.

#### Step 1B: Property Preferences

The buyer enters:

- Budget minimum.
- Budget maximum.
- Property type.
- Preferred areas.
- Minimum bedrooms.
- Minimum bathrooms.

Why this matters:

- Budget is used for property fit.
- Areas are used for area matching.
- Property type helps avoid matching a buyer to the wrong kind of stock.
- Bedrooms and bathrooms help Mia understand practical fit.

What to test:

1. Try a normal budget range, for example R1.5m to R2.5m.
2. Select at least one property type.
3. Add one or more areas.
4. Set bedrooms and bathrooms.
5. Try setting budget minimum higher than budget maximum and confirm the form blocks it.

#### Step 1C: Qualification

The buyer enters:

- Finance / deposit status.
- Buying timeline.
- Whether they need to sell a property first.
- POPIA consent.

Finance options include:

- Pre-approved.
- Cash buyer.
- Deposit ready.
- Pre-approval in progress.
- Not pre-approved yet.

Why this matters:

- Finance readiness strongly affects whether an agent should call immediately.
- A cash buyer or pre-approved buyer is generally stronger than a buyer who has not started finance.
- A deposit-ready buyer is meaningful, but may still need bond context.
- Timeline tells Mia whether the buyer is urgent or still browsing.
- Selling first can reduce readiness because another transaction may need to happen before purchase.

What to test:

1. Select each finance option and check that it feels understandable.
2. Check that "Need pre-approval?" appears when the buyer is not clearly finance-ready.
3. Test each timeline option.
4. Confirm the buyer cannot complete signup without POPIA consent.

### Step 2: Email Confirmation

After signup, the buyer is sent to the check-email page.

Why this matters:

- Confirmed email is needed for a reliable buyer account.
- Nurture emails and match alerts depend on email delivery.

What to test:

1. Complete signup.
2. Check inbox and spam.
3. Click the confirmation email.
4. Log in after confirmation.

If the email does not arrive:

- Check Supabase email settings.
- Check spam.
- Check whether the sending domain and authentication are configured.

### Step 3: Buyer Dashboard

Path: `/dashboard/buyer`

The buyer dashboard shows:

- Buyer profile summary.
- Budget.
- Finance status.
- Timeline.
- Property type and area preferences.
- Saved homes.
- Active enquiries.
- Viewings.
- Profile status.
- Recommended listings.
- Progress checklist.

Why this matters:

The dashboard gives the buyer one place to continue their search. It also shows whether the profile has enough information for Mia to match and qualify properly.

What to test:

1. Log in as a buyer.
2. Check that profile details from signup appear.
3. Click "Edit preferences."
4. Browse listings.
5. Save a listing.
6. Return to the dashboard and confirm the saved listing appears.
7. Check recommendations.

### Step 4: Edit Buyer Preferences

Path: `/dashboard/buyer/profile`

The buyer can update:

- Name.
- Phone.
- Budget.
- Property types.
- Areas.
- Bedrooms.
- Bathrooms.
- Finance / deposit status.
- Buying timeline.
- Need to sell first.
- POPIA consent.

Why this matters:

Buyers change their minds. HeyMies should let them update their search profile without creating a new account.

What to test:

1. Change finance status to Cash buyer.
2. Save.
3. Return to the dashboard.
4. Confirm the updated finance status is displayed.
5. Change finance status to Deposit ready.
6. Confirm the profile still saves.

### Step 5: Browse Listings

Path: `/listings`

The listings page shows active properties.

Buyers can:

- Browse active listings.
- Open a listing detail page.
- Save listings.
- Compare listings.
- Enquire.

Why this matters:

This is where buyer behaviour starts to become useful. Saving, comparing, and enquiring all help show intent.

What to test:

1. Open the listings page.
2. Confirm active listings display.
3. Open a listing.
4. Save it.
5. Compare it with another listing.
6. Enquire on it.

### Step 6: Listing Detail And Enquiry

Path: `/listings/[id]`

A listing detail page includes:

- Property photos.
- Price.
- Area.
- Property details.
- Description.
- Match guidance if a buyer profile exists.
- Save button.
- Compare button.
- Enquiry form.

When the buyer submits an enquiry, HeyMies sends it to the enquiry API. Mia then qualifies it.

What to test:

1. Open a listing while logged in as a buyer.
2. Confirm the match badge appears if profile data exists.
3. Submit an enquiry.
4. Try both a generic enquiry and a viewing request.
5. Check whether the buyer receives a confirmation or nurture email.
6. Check admin to confirm the enquiry was created.

### Step 7: Saved Listings

Path: `/dashboard/buyer/saved`

Saved listings let buyers create a shortlist.

Why this matters:

Saved homes are a signal of interest. They also give the buyer a clean place to return.

What to test:

1. Save a listing.
2. Open saved listings.
3. Confirm match guidance appears.
4. Remove a saved listing.
5. Confirm the dashboard updates.

### Step 8: Compare Listings

Path: `/dashboard/buyer/compare`

The compare page lets buyers compare selected homes.

Why this matters:

Comparison is a natural buyer behaviour. It is also useful context: a buyer comparing two homes is often more serious than a casual browser.

What to test:

1. Add two listings to compare.
2. Open the compare page.
3. Check that price, location, specs, and match labels are clear.
4. Remove a listing from comparison.

### Step 9: Match Alerts

Path: `/dashboard/buyer/alerts`

Buyer alerts let a buyer save search criteria such as:

- Areas.
- Max price.
- Bedrooms.

Why this matters:

Alerts create an ongoing search relationship. When matching jobs run, HeyMies can identify new listings that fit buyer alerts and send emails if preferences allow it.

What to test:

1. Create an alert from the buyer dashboard.
2. Add one or more areas.
3. Add max price and bedrooms.
4. Toggle the alert off and on.
5. Delete the alert.

Note: if the database alert table is not available, the app may store alerts locally in the browser as a fallback. In production, alerts should be stored in Supabase.

## 5. Private Seller Journey

### Step 1: Private Seller Signup

Path: `/signup/private-seller`

The seller provides:

- Contact details.
- Selling intent.
- Property details.
- Location.
- Bedrooms, bathrooms, parking, and size information.
- Asking price.
- Bond and cost information.
- Viewing access.
- Occupancy.
- Special features.
- Notes.
- POPIA consent.

Why this matters:

Private sellers often do not know how to structure a listing. HeyMies collects the important fields in a guided way.

What to test:

1. Create a seller account.
2. Enter realistic property details.
3. Complete signup.
4. Confirm the email flow works.
5. Check whether a draft listing is created or whether seller data appears in admin.

### Step 2: Seller Draft Listing

The intended seller outcome is a draft listing that can be reviewed, completed, and eventually published.

Why this matters:

The seller should not have to rewrite everything. Information given during signup should become useful listing data.

What to test:

1. Sign up as a private seller.
2. Log in.
3. Check the dashboard or listing area.
4. Confirm the seller can continue from the submitted details.
5. Review whether the generated draft feels commercially usable.

## 6. Agent Journey

### Step 1: Agent Signup

Path: `/signup/agent`

The agent provides:

- Contact details.
- Agency name.
- Position title.
- FFC number.
- Years of experience.
- Office city and suburb.
- Service areas.
- Specialties.
- Average deals per month.
- Commission band.
- Current lead sources.
- CRM tool.
- Team size.
- Onboarding goal.
- POPIA consent.

Why this matters:

Agent profile data helps understand who is receiving leads, where they operate, and what kind of handover is useful.

What to test:

1. Create an agent account.
2. Confirm email.
3. Log in.
4. Check dashboard access.
5. Confirm the agent appears in admin users.

### Step 2: Agent Dashboard

The agent dashboard is where an agent can:

- Review listings.
- Review leads.
- Open lead detail.
- See buyer readiness and property fit.
- Mark lead statuses.

Why this matters:

The agent needs a fast way to decide which lead is worth calling now.

What to test:

1. Log in as an agent.
2. Open dashboard.
3. Open leads.
4. Check whether lead cards include buyer context.
5. Open a lead detail page.
6. Review Mia's summary and recommended next action.

## 7. Listing Management

### Create Listing

Path: `/dashboard/listings/new`

A listing includes:

- Sale type: sale or rent.
- Listing type: house, apartment, townhouse, duplex, cluster, land, or commercial.
- Title.
- Description.
- Price or rent.
- Deposit for rentals.
- Available date for rentals.
- Levy.
- Rates and taxes.
- Bedrooms.
- Bathrooms.
- Garages.
- Parking.
- Floor size.
- Erf size.
- Pets allowed.
- Furnished.
- Street address.
- Suburb.
- City.
- Province.
- Postal code.
- Optional latitude and longitude.
- Features.
- Contact name, phone, and email.
- Photos.

Why this matters:

Listing quality affects matching and buyer confidence. Mia cannot do useful lead intelligence if the listing is thin or missing key data.

The listing quality check expects important details such as:

- Title.
- Description.
- Price.
- Area.
- Specs.
- Contact details.
- Photos.

What to test:

1. Create a sale listing.
2. Create a rental listing.
3. Add at least one photo.
4. Try submitting without photos and confirm the listing is blocked.
5. Try submitting without price or location and confirm validation catches it.
6. Use "Generate description" and check whether the generated copy is usable.
7. If AI generation is enabled, test AI listing description generation.

### Matching Trigger After Listing Publish

When a listing is created, HeyMies attempts to run buyer matching for that listing.

Why this matters:

If a new active listing fits existing buyer alerts, match events can be created and emails can be sent.

What to test:

1. Create a buyer with a clear alert.
2. Create a listing that matches that buyer.
3. Confirm match events appear in admin or matching health screens.
4. Confirm match alert email behaviour if email sending is configured.

## 8. Matching Logic

HeyMies uses buyer profile data to score how well a listing fits.

The main matching inputs are:

- Budget minimum and maximum.
- Property area.
- Property type.
- Bedrooms.
- Bathrooms.
- Sale or rental context.

The match score is shown as labels, for example:

- Strong match.
- Good match.
- Possible match.
- Low match.

Why this matters:

The match score is not a valuation. It is a fit indicator. It helps buyers and agents understand whether the listing lines up with what the buyer said they wanted.

How to judge matching during testing:

1. Create a buyer looking in Sandton with R2m budget.
2. View a Sandton listing near that price.
3. Check whether the match is strong or good.
4. View a listing in a different city or well outside budget.
5. Check whether the match is lower.

If matching feels wrong, capture:

- Buyer budget.
- Buyer areas.
- Buyer property type.
- Listing price.
- Listing area.
- Listing type.
- Match label shown.

## 9. Enquiry Qualification

When a buyer enquires, Mia calculates two main ideas:

- Property fit.
- Buyer readiness.

### Property Fit

Property fit measures how closely the listing matches the buyer profile.

It considers:

- Budget.
- Area.
- Property type.
- Bedrooms.
- Bathrooms.

### Buyer Readiness

Buyer readiness measures whether the buyer looks ready for an agent or seller conversation.

It considers:

- Buyer profile strength.
- Property fit.
- Finance / deposit status.
- Buying timeline.
- Viewing request.
- Repeat enquiries.
- Whether the buyer needs to sell first.

Strong readiness signals include:

- Pre-approved.
- Cash buyer.
- Good property fit.
- Urgent timeline.
- Viewing requested.
- Repeat enquiry.

Weakening signals include:

- Not pre-approved.
- Just browsing.
- Poor property fit.
- Needs to sell first.

### Qualification Statuses

Mia can assign these statuses:

#### Agent-ready

The buyer looks ready enough for an agent or seller handover.

Typical signs:

- Good property fit.
- Strong readiness score.
- Finance looks sorted or intent is clear.

Outcome:

- Agent or seller can be notified.
- Admin sees the lead as ready.
- Nurture is not needed unless manually resumed.

#### Needs finance nurture

The property may fit, but finance is unclear.

Typical signs:

- Buyer likes the listing.
- Fit is acceptable.
- Finance is missing or not ready.

Outcome:

- Mia asks whether the buyer is pre-approved, deposit-ready, paying cash, or needs help with pre-approval.

#### Needs confirmation

The lead might be useful, but Mia needs more intent.

Typical signs:

- Reasonable fit, but not enough certainty.
- Buyer did not request a viewing.
- Readiness is not high enough for handover.

Outcome:

- Mia asks whether the buyer wants agent contact now or is still comparing.

#### Better-fit nurture

The property may not fit the buyer profile well.

Typical signs:

- Listing is outside budget, area, type, or practical needs.

Outcome:

- Mia asks whether the buyer wants to continue with this property or receive better matches.

#### Not ready

The buyer appears early in the journey.

Typical signs:

- Long timeline.
- Just browsing.
- Low readiness.

Outcome:

- Mia keeps the buyer warm without pushing them to an agent too soon.

## 10. Mia Nurture

Mia nurtures when a lead is not ready for handover.

There are two types of nurture:

1. Immediate nurture after an enquiry.
2. Scheduled nurture after time passes.

### Immediate Nurture

When a buyer submits an enquiry and Mia decides the lead is not agent-ready, Mia can send a follow-up email immediately.

The email depends on the qualification status.

For finance nurture, Mia asks whether finance is sorted, whether the buyer is deposit-ready or cash-ready, or whether pre-approval would help.

For better-fit nurture, Mia asks whether the buyer wants better matches.

For not-ready nurture, Mia keeps the search warm without pressure.

For needs-confirmation, Mia asks whether the buyer wants to be connected now.

### One-Click Buyer Responses

Mia emails include one-click response links.

Possible responses include:

- "I'm pre-approved, deposit-ready, or paying cash."
- "I'd like help with pre-approval."
- "I'd like to arrange a viewing."
- "I'm still comparing options."
- "Please send me better matches."

When the buyer clicks a response:

1. HeyMies records the response.
2. The enquiry is updated.
3. Readiness may increase.
4. Qualification status may change.
5. Admin sees the buyer response in the activity timeline.
6. If the response makes the buyer agent-ready, an agent-ready notification can be sent.

### Scheduled Nurture

Scheduled nurture is handled by the nurture job.

The job checks enquiries that:

- Are in a nurture-eligible qualification status.
- Have nurture status of pending or nurturing.
- Have a next nurture date that is due.

Eligible qualification statuses are:

- Needs finance nurture.
- Needs confirmation.
- Better-fit nurture.
- Not ready.

The job skips buyers when:

- The buyer has no email.
- The buyer's email is unconfirmed.
- Email preferences block nurture.
- Mia has followed up recently.
- The maximum follow-up count has been reached.

Mia avoids sending follow-ups too close together. If a lead was nurtured recently, the job skips it.

Scheduled timing:

- First scheduled follow-up: about 2 days later.
- Second scheduled follow-up: about 4 days later.
- Later follow-ups: about 7 days later.
- Maximum scheduled follow-ups: 4.

After the maximum follow-ups, Mia pauses the enquiry so the buyer is not over-contacted.

### Manual Mia Actions

Admin can manually:

- Send Mia now.
- Pause Mia.
- Resume Mia.
- Mark a lead agent-ready.
- Mark won.
- Mark lost.
- Add internal notes.

Why this matters:

Automation should support judgement, not remove it. Admin can step in when the context is obvious.

## 11. Enquiry Response Page

Path: `/enquiry-response`

When a buyer clicks a one-click Mia response, they land on a confirmation page.

It tells them their response was recorded.

If the response makes the lead agent-ready, it explains that the agent can now follow up.

What to test:

1. Create an enquiry that triggers nurture.
2. Open the nurture email.
3. Click a response link.
4. Confirm the response page loads.
5. Check admin to confirm the enquiry updated.

## 12. Agent And Seller Lead Review

Path: `/dashboard/leads`

The lead list shows enquiries assigned to the logged-in agent or seller.

It includes:

- Buyer name.
- Email and phone.
- Listing.
- Latest message.
- Enquiry count.
- Viewing requested.
- Qualification status.
- Readiness score.
- Property fit score.
- Finance status.
- Timeline.

Why this matters:

An agent should be able to scan leads quickly and decide which ones deserve immediate action.

What to test:

1. Log in as an agent.
2. Open leads.
3. Confirm a buyer enquiry appears.
4. Check that finance status is visible.
5. Check property fit and readiness.
6. Open the lead detail page.

### Lead Detail

Path: `/dashboard/leads/[id]`

The lead detail page shows:

- Listing context.
- Buyer message.
- Buyer readiness.
- Property fit.
- Finance status.
- Timeline.
- Whether the buyer needs to sell first.
- Mia qualification summary.
- Suggested next action.
- Contact details.
- Manual status buttons.

What to test:

1. Open a lead.
2. Read Mia's summary.
3. Ask whether the next action makes real-world sense.
4. Mark the lead contacted, qualified, viewing, offer, won, or lost.

## 13. Admin Control Room

Path: `/admin`

Admin is the operating view for alpha testing.

It includes access to:

- Launch readiness.
- System health.
- QA checklist.
- Lead pipeline.
- Mia dashboard.
- Users.
- Listings.
- Reports.

Use admin when testing with your partner. It is the place to verify that what happened on the public side was recorded correctly.

### Admin Users

Path: `/admin/users`

Use this page to check:

- Signup confirmation.
- User roles.
- Buyer, agent, seller, or admin role.
- Missing profile rows.
- Unconfirmed users.
- Links to buyer memory.

What to test:

1. Create a buyer.
2. Open admin users.
3. Confirm the user appears.
4. Confirm the role is buyer.
5. Confirm email confirmation status.
6. If needed, correct a role.

### Admin Buyer Memory

Path: `/admin/buyers/[user_id]`

Buyer memory shows everything HeyMies knows about a buyer.

It includes:

- Contact details.
- Budget.
- Areas.
- Property types.
- Bedrooms and bathrooms.
- Finance status.
- Timeline.
- Need to sell first.
- Email preferences.
- Enquiries.
- Mia activity.
- Match events.
- Alerts.
- Saved homes.
- Viewings.

Why this matters:

Buyer memory is a single source of truth. It helps admin understand the buyer's full journey rather than one isolated enquiry.

What to test:

1. Create a buyer.
2. Save a listing.
3. Enquire.
4. Create an alert.
5. Open buyer memory.
6. Confirm each activity is visible.

### Admin Pipeline

Path: `/admin/pipeline`

The pipeline board groups enquiries into operational stages:

- New.
- Needs confirmation.
- Finance nurture.
- Better-fit nurture.
- Agent-ready.
- Paused.
- Won.
- Lost.

Each lead card shows:

- Buyer.
- Listing.
- Readiness.
- Property fit.
- Qualification status.
- Nurture status.
- Event count.
- Next action.

Quick actions include:

- Mark agent-ready.
- Pause Mia.
- Resume Mia.
- Send Mia now.
- Mark won.
- Mark lost.
- Add internal note.

What to test:

1. Create several enquiries with different buyer profiles.
2. Open the pipeline.
3. Confirm leads appear in sensible stages.
4. Click "Send Mia now" on a nurture lead.
5. Pause and resume a lead.
6. Mark a lead agent-ready.
7. Add an internal note.

### Admin Enquiry Detail

Path: `/admin/enquiries/[id]`

This page shows the full lead detail for admin.

It includes:

- Listing information.
- Buyer message.
- Mia qualification.
- Nurture state.
- Last buyer response.
- Handover pack.
- Activity history.
- Buyer profile.
- Owner or agent profile.
- Email preferences.

Why this matters:

This page is where you inspect whether Mia's decision was reasonable.

What to test:

1. Open an enquiry from the pipeline.
2. Read Mia's summary.
3. Read the handover pack.
4. Check if the agent could act from this information alone.
5. Review the event timeline.

### Admin Mia Dashboard

Path: `/admin/mia`

The Mia dashboard focuses on nurture and agent-ready activity.

Use it to see:

- Recent Mia activity.
- Buyer responses.
- Agent-ready leads.
- Nurture status.
- Follow-up timing.

What to test:

1. Create a nurture lead.
2. Trigger or wait for Mia follow-up.
3. Click a buyer response link.
4. Confirm Mia activity updates.

### Admin Listings

Path: `/admin/listings`

Use this page to inspect listings from an admin perspective.

Check:

- Active listings.
- Draft listings.
- Listing completeness.
- Contact details.
- Price and area.
- Photos.

What to test:

1. Create a listing.
2. Open admin listings.
3. Confirm it appears.
4. Check that missing fields are obvious.

### Admin Reports

Path: `/admin/reports`

Reports summarize product activity.

Use reports to understand:

- New buyers.
- Buyer responses.
- Enquiries.
- Recent activity.

What to test:

1. Run several test journeys.
2. Open reports.
3. Confirm counts move in the expected direction.

### Admin QA Checklist

Path: `/admin/qa`

The QA checklist is a practical test list for alpha.

Use it before inviting testers.

It covers:

- Buyer signup.
- Buyer email confirmation.
- Buyer enquiry.
- Mia nurture.
- Seller signup.
- Agent signup.
- Preferences.
- Matching.

What to test:

1. Work through the checklist one item at a time.
2. Record anything that fails.
3. Re-test after fixes.

### Launch Readiness

Path: `/admin/launch`

Launch readiness checks whether the platform is ready for friendly users.

It checks:

- Supabase configuration.
- Email configuration.
- OpenAI configuration.
- Admin credentials.
- Job secrets.
- Buyer profiles.
- Agent profiles.
- Seller profiles.
- Email preferences.
- Buyer alerts.
- Match events.
- Active listings.
- Listing completeness.
- Enquiry pipeline.
- Mia nurture backlog.

Use this page before showing the platform to anyone new.

### System Health

Path: `/admin/health`

System health checks operational concerns such as:

- Configuration.
- Due nurture backlog.
- Stale nurture.
- Matching backlog.
- Recent Mia activity.
- Recent matching activity.

Use it when something feels stuck.

## 14. Email Preferences And Unsubscribe

Path: `/email-preferences`

Users can manage:

- Marketing emails.
- Mia nurture emails.
- Match alert emails.

Emails include preference or unsubscribe links.

Why this matters:

HeyMies must respect consent and avoid over-contacting users.

What to test:

1. Open email preferences.
2. Turn off Mia nurture.
3. Create or update a nurture lead.
4. Confirm Mia does not send nurture email when preferences block it.
5. Test unsubscribe links from email.

## 15. Contact Form

Path: `/contact`

The contact page is for general enquiries about HeyMies.

It can capture:

- People interested in pilot access.
- Questions about matching.
- Questions about agents, sellers, or Mia.

What to test:

1. Submit the contact form.
2. Confirm the lead is stored.
3. Confirm the admin notification email sends if configured.

## 16. Partner Demo Script

Use this script when showing the product.

### Part 1: Explain the Concept

Say:

"HeyMies is a real estate lead-intelligence platform. The point is not just to list properties. The point is to understand buyer intent before an agent spends time on the lead."

Then show:

1. Home page.
2. For Agents page.
3. How It Works page.

### Part 2: Create A Buyer

Show:

1. Buyer signup.
2. Buyer profile details.
3. Finance / deposit status.
4. Buying timeline.
5. POPIA consent.

Explain:

"This profile gives Mia context. Without it, every enquiry is just a name and number."

### Part 3: Browse And Enquire

Show:

1. Listings page.
2. Listing detail.
3. Save listing.
4. Compare listing.
5. Submit enquiry.

Explain:

"The enquiry is where Mia starts deciding whether this should go to an agent immediately or be nurtured first."

### Part 4: Show Admin

Show:

1. Admin users.
2. Buyer memory.
3. Admin pipeline.
4. Admin enquiry detail.

Explain:

"This is where we can see exactly what happened, what Mia decided, and what the next action should be."

### Part 5: Show Mia Nurture

Create a buyer who is not pre-approved or is just browsing.

Submit an enquiry on a reasonable listing.

Then show:

1. Mia qualification status.
2. Nurture email.
3. One-click response.
4. Enquiry response confirmation page.
5. Updated admin activity.

Explain:

"Mia is not chasing buyers blindly. She is asking the missing question that determines whether the lead is ready."

### Part 6: Show Agent Value

Open a lead as an agent.

Show:

- Buyer readiness.
- Property fit.
- Finance status.
- Timeline.
- Viewing intent.
- Mia summary.
- Next action.

Ask your partner:

"If you received this as an agent, would you know what to do next?"

That question is the core test.

## 17. Testing Scenarios For A Real Estate Partner

### Scenario A: Strong Buyer

Create a buyer with:

- Pre-approved or cash buyer.
- 0-3 month timeline.
- Clear budget.
- Clear area.
- Clear property type.

Then enquire on a matching listing.

Expected result:

- Strong property fit.
- High readiness.
- Likely agent-ready or close to agent-ready.
- Clear handover context.

### Scenario B: Finance Gap

Create a buyer with:

- Not pre-approved yet.
- Good area and budget match.
- Reasonable timeline.

Then enquire on a good listing.

Expected result:

- Good property fit.
- Needs finance nurture.
- Mia asks about pre-approval, deposit, or cash.

### Scenario C: Poor Fit

Create a buyer looking in one area and budget band.

Then enquire on a listing outside that area or budget.

Expected result:

- Lower property fit.
- Better-fit nurture.
- Mia asks whether to keep chasing this one or send better matches.

### Scenario D: Early Browser

Create a buyer with:

- Browsing timeline.
- No strong finance status.
- Minimal urgency.

Then enquire.

Expected result:

- Not ready or needs confirmation.
- Mia keeps the buyer warm without agent pressure.

### Scenario E: Viewing Intent

Create a buyer and request a viewing.

Expected result:

- Readiness increases.
- Lead may move closer to agent-ready.
- Agent/admin should see viewing requested.

### Scenario F: Repeat Enquiry

Submit more than one enquiry on the same listing.

Expected result:

- Enquiry count increases.
- Readiness may increase.
- Admin sees repeat intent.

## 18. What Your Partner Should Judge

Ask your partner to judge HeyMies through a real estate lens.

Key questions:

- Does the buyer profile ask the right questions?
- Are any important buyer qualification questions missing?
- Does finance / deposit status reflect how agents think?
- Does Mia ask useful follow-up questions?
- Does Mia follow up too soon, too late, or just right?
- Would an agent trust the readiness and fit labels?
- Does the handover pack contain enough context to call the buyer?
- Would a private seller understand the listing flow?
- Are any admin labels confusing?
- Where would a real agent want more control?

## 19. Known Alpha Considerations

HeyMies is still in alpha.

During testing, pay attention to:

- Email deliverability.
- Supabase confirmation emails.
- Missing profile rows.
- Listing image upload.
- Match alert persistence.
- Nurture timing.
- Admin role access.
- Whether copied text feels natural.
- Whether Mia feels helpful rather than pushy.

Use admin launch readiness and health pages before expanding the tester group.

## 20. Simple End-To-End Test Checklist

Run this checklist with your partner.

1. Open home page.
2. Explain the concept.
3. Create a buyer account.
4. Confirm email.
5. Complete buyer profile.
6. Browse listings.
7. Save one listing.
8. Compare two listings.
9. Create one alert.
10. Enquire on one listing.
11. Check Mia's result.
12. Open admin users.
13. Open buyer memory.
14. Open pipeline.
15. Open enquiry detail.
16. Trigger or inspect Mia nurture.
17. Click a one-click buyer response.
18. Confirm admin activity updates.
19. Create or inspect an agent account.
20. Open agent leads.
21. Review whether the lead is actionable.
22. Create or inspect a private seller account.
23. Review listing creation.
24. Open launch readiness.
25. Record issues and product questions.

## 21. The Main Product Promise

HeyMies should make this sentence true:

"By the time an agent or seller receives the lead, they should understand who the buyer is, what they want, how well the property fits, whether finance and timing look ready, and what the next action should be."

If the product does that, HeyMies is moving in the right direction.

