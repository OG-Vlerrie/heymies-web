# HeyMies Alpha Test Plan

## Goal

Validate that 3-5 friendly users can complete the core HeyMies journey without manual database fixes.

## Before Inviting Testers

- Rotate any secrets that have been shared outside the deployment environment.
- Confirm all Supabase migrations have been applied to the production project.
- Confirm the Resend sending domain is verified and mail lands in inboxes.
- Set `CRON_SECRET`, `NURTURE_JOB_SECRET`, and `MATCHING_JOB_SECRET` in production.
- Confirm admin credentials are strong and stored only in production environment variables.
- Create at least 3 active listings with realistic photos and complete data.
- Create one internal buyer, seller, and agent account for smoke testing.
- Send the first tester invite from `FIRST_TESTER_INVITE.md`.
- Open `/admin/launch` and clear any blocked readiness items.

## Smoke Test

1. Buyer signs up and confirms email.
2. Buyer completes search profile.
3. Buyer browses listings and saves at least one listing.
4. Buyer creates or edits a match alert.
5. Buyer enquires on a listing.
6. Mia records property fit, readiness, qualification status, and next action.
7. If not agent-ready, buyer receives a nurture email with working one-click links.
8. Buyer clicks a response link and lands on the response confirmation page.
9. Admin sees the updated enquiry, event history, and Mia status.
10. If agent-ready, agent/seller receives a useful handover email.
11. Email preferences page loads and updates preferences correctly.
12. Unsubscribe link changes the relevant preference and future sends respect it.
13. Contact page submission creates a lead and sends the admin notification email.

## Tester Script

Ask testers to complete one role-specific journey:

- Buyer: create a profile, browse listings, save one, compare two, enquire on one.
- Private seller: sign up, review auto-created draft listing, complete listing details.
- Agent: sign up, review dashboard, inspect a lead or listing workflow.

## What To Capture

- Where testers hesitate.
- Any email that does not arrive within 5 minutes.
- Any page that shows an error or empty state with no next action.
- Whether Mia's follow-up feels helpful or intrusive.
- Whether agent handover context is clear enough to act on.

## Alpha Exit Criteria

- No critical signup, login, listing, enquiry, or email preference failures.
- At least one buyer-to-Mia-to-agent handover succeeds end to end.
- Admin can identify and manage every test enquiry.
- Testers understand what HeyMies does without a live walkthrough.
