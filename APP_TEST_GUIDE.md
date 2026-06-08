# HeyMies Production Alpha Test Guide

This guide is written for a non-technical tester. The goal is to use HeyMies like a real buyer, private seller, agent, and admin, then write down anything that is confusing, broken, slow, or surprising.

## 1. What You Are Testing

HeyMies helps:

- Buyers find, save, compare, and enquire about properties.
- Mia qualify buyer enquiries before sending them to agents or sellers.
- Private sellers create listings and receive cleaner buyer enquiries.
- Agents manage listings and view buyer handover details.
- Admins monitor signups, listings, enquiries, Mia, matching, system health, and launch readiness.

Use this guide on the production alpha website, not local development.

## 2. Before You Start

Ask for these from the app owner:

- Production alpha URL: `https://...`
- Test email inbox access for each test account.
- Password to use for all test accounts, if one has been chosen.
- Admin login details.
- At least 3 published active listings in production alpha.
- At least 1 listing owned by the test agent.
- At least 1 listing owned by the test private seller, if possible.

Recommended browser setup:

- Use Chrome or Edge.
- Keep one normal browser window for the current test account.
- Use an incognito/private window when switching accounts quickly.
- Take screenshots when something looks wrong.
- Record the page URL when reporting an issue.

## 3. Test Accounts To Create

Create these accounts in production alpha. Use real-looking names and phone numbers, but keep them clearly marked as test users.

| Account | Purpose | Suggested Email | Profile Setup |
| --- | --- | --- | --- |
| Ready buyer | Tests the smooth buyer-to-agent handover | `buyer.ready+alpha@...` | Finance ready, 0-3 months, no need to sell first |
| Nurture buyer | Tests Mia follow-up for a buyer who is not ready yet | `buyer.nurture+alpha@...` | No pre-approval, browsing, needs to sell first |
| Mismatch buyer | Tests weak property fit and recommendations | `buyer.mismatch+alpha@...` | Different area/type/budget from test listings |
| Private seller | Tests seller signup and listing creation | `seller.alpha@...` | Private seller role |
| Agent | Tests agent signup, listing, and lead views | `agent.alpha@...` | Agent role with a valid-looking FFC number |
| Admin | Tests protected admin area | `admin.alpha@...` | Admin role must be set by the app owner |

Suggested shared test password:

`AlphaTest2026!`

Do not use this password for real users.

## 4. How To Report Issues

For every issue, capture:

- What account you were using.
- What page you were on.
- What you clicked or typed.
- What you expected.
- What actually happened.
- Screenshot, if possible.
- Whether it happened once or every time.

Use this format:

```text
Issue title:
Role:
Account:
Page URL:
Steps:
Expected:
Actual:
Screenshot:
Severity: Critical / High / Medium / Low
Notes:
```

Severity guide:

- Critical: Cannot sign up, log in, create listings, enquire, or access core dashboards.
- High: Important flow works only partly, sends wrong data, or shows scary errors.
- Medium: Confusing, missing confirmation, broken link, bad empty state, or awkward wording.
- Low: Visual polish, typo, spacing, or small improvement.

## 5. Public Visitor Tests

Use a logged-out browser or incognito window.

### Public Navigation

1. Open the production alpha URL.
2. Visit the main pages from the header:
   - Home
   - Agents
   - Sellers
   - Buyers
   - Pricing
   - About
   - How it works
   - Contact
   - Listings
3. Check that each page loads without an error.
4. Check that the page explains what HeyMies does clearly enough without someone talking you through it.
5. Click the main call-to-action buttons on each page.

Expected result:

- All pages load.
- Buttons go to the correct signup, login, contact, or listing page.
- Text is understandable to a normal buyer, seller, or agent.
- Nothing looks broken on mobile width or desktop width.

### Public Listings

1. Go to `/listings`.
2. Search by suburb or city.
3. Change max price.
4. Change bedroom filter.
5. Open a listing.
6. Try clicking Save or Compare while logged out.
7. Scroll to the enquiry section.

Expected result:

- Listings load.
- Filters narrow the list.
- Listing cards show photo, title, area, price, beds, baths, and parking.
- Logged-out Save/Compare/Enquire should ask you to log in or create a buyer account.

### Contact Form

1. Go to `/contact`.
2. Submit a realistic enquiry.
3. Try submitting with missing required information.

Expected result:

- Valid submission shows a clear success message.
- Invalid submission gives a helpful message.
- App owner/admin should receive or see the lead.

## 6. Buyer Scenario A: Ready Buyer

Use `buyer.ready+alpha@...`.

This buyer should look like someone agents want to speak to soon.

Suggested profile:

- Full name: `Ready Buyer Alpha`
- Phone: a valid test phone number
- Budget min: `1500000`
- Budget max: `3500000`
- Property types: House and Townhouse
- Areas: choose areas matching active listings
- Bedrooms: `3+`
- Bathrooms: `2+`
- Finance/deposit: choose a strong option such as pre-approved or cash buyer
- Timeline: `0-3 months`
- Need to sell first: `No`
- POPIA consent: checked

### Buyer Signup

1. Go to `/signup/buyer`.
2. Complete all steps.
3. Submit the account.
4. Open the confirmation email.
5. Confirm the email.
6. Log in.

Expected result:

- Signup validates missing fields clearly.
- Confirmation email arrives within 5 minutes.
- Confirmation link opens the app.
- Login works.
- Buyer lands on the buyer dashboard or the intended next page.

### Buyer Dashboard

1. Go to `/dashboard/buyer`.
2. Check the profile summary.
3. Check saved homes, enquiries, viewing schedule, progress, and recommended listings.
4. Click `Edit preferences`.
5. Change one preference and save.

Expected result:

- Dashboard shows the buyer's name, budget, finance status, timeline, areas, and profile status.
- Recommended listings appear if there are matching active listings.
- Editing preferences saves and returns to the buyer dashboard.

### Save, Compare, And Enquire

1. Go to `/listings`.
2. Save at least 2 listings.
3. Add at least 2 listings to Compare.
4. Open `/dashboard/buyer/saved`.
5. Confirm saved listings appear.
6. Open `/dashboard/buyer/compare`.
7. Confirm listings appear side by side.
8. Copy/share the comparison link if available.
9. Open one listing and send an enquiry.
10. Tick the viewing request checkbox.

Suggested enquiry message:

```text
Hi, I am interested in this property and would like to arrange a viewing this week. My finance is ready and I am looking to buy soon.
```

Expected result:

- Saved listings persist after page refresh.
- Compare shows up to 4 listings.
- Enquiry sends successfully.
- Confirmation says the enquiry was sent or updated.
- If the buyer is agent-ready, the message should say the enquiry was qualified and sent to the agent.

### Viewing Schedule

1. Go to `/dashboard/buyer`.
2. Find the enquiry.
3. Use the date/time field to schedule a viewing.
4. Confirm it appears in the viewing schedule.

Expected result:

- Viewing appears on the dashboard with the correct listing and date/time.

### Buyer Alerts

1. Go to `/dashboard/buyer/alerts`.
2. Create an alert using the buyer's target areas and max price.
3. Pause the alert.
4. Activate it again.
5. Delete it.

Expected result:

- Alert can be created.
- Alert shows Active or Paused correctly.
- Delete removes it.
- If the page says alerts are stored in the browser, screenshot it and report as a note.

## 7. Buyer Scenario B: Nurture Buyer

Use `buyer.nurture+alpha@...`.

This buyer should look interested but not ready for an agent handover yet.

Suggested profile:

- Full name: `Nurture Buyer Alpha`
- Budget min: `1000000`
- Budget max: `2500000`
- Property types: Apartment
- Areas: choose one active listing area
- Finance/deposit: not pre-approved or needs pre-approval
- Timeline: `Browsing`
- Need to sell first: `Yes`
- POPIA consent: checked

### Nurture Enquiry

1. Sign up and confirm email.
2. Log in.
3. Go to `/listings`.
4. Open a relevant listing.
5. Send an enquiry.

Suggested message:

```text
I am interested but still figuring out finance and may need to sell my current place first. Please send more details.
```

Expected result:

- Enquiry sends.
- Confirmation should not overpromise an immediate agent handover if the buyer is not ready.
- Admin should later see the enquiry as needing nurture, confirmation, finance help, or not ready.
- If a Mia nurture email is sent, the email should have working links.

### Mia Email Response

When a Mia email arrives:

1. Open the email.
2. Click each response link that makes sense.
3. Confirm the app opens an enquiry response page.
4. Read the message on the page.

Expected result:

- Links work without needing technical steps.
- The response page confirms that the buyer response was recorded.
- Admin can see the updated response/status.

## 8. Buyer Scenario C: Mismatch Buyer

Use `buyer.mismatch+alpha@...`.

This buyer is used to test weak matches.

Suggested profile:

- Choose an area that does not match the test listings.
- Choose a property type that does not match the test listings.
- Set a lower budget than the active listings.
- Keep finance reasonably ready so the difference is mostly property fit.

Tests:

1. Open buyer dashboard.
2. Check Recommended listings.
3. Browse listings.
4. Save a listing that is a poor match.
5. Open saved listings and compare.
6. Enquire anyway.

Expected result:

- Match guidance should not pretend the listing is perfect.
- Reasons should make sense.
- Enquiry should still send, but Mia/admin should have context that the property fit is weaker.

## 9. Private Seller Scenario

Use `seller.alpha@...`.

### Seller Signup

1. Go to `/signup/private-seller`.
2. Complete account, contact, and consent steps.
3. Confirm email.
4. Log in.

Expected result:

- Seller account is created.
- Seller lands on `/dashboard/listings/new` or can navigate there from the dashboard.

### Create A Seller Listing

1. Go to `/dashboard/listings/new`.
2. Choose sale or rent.
3. Add title, price, bedrooms, bathrooms, parking, location, and contact details.
4. Add at least 1 clear photo.
5. Try `Generate template`.
6. Try `Generate with AI`.
7. Create listing.

Expected result:

- Missing required fields show helpful messages.
- At least one photo is required.
- Template description works.
- If AI is unavailable, the app should fall back to a template and show a helpful message.
- Listing is created as a draft.
- Seller can view/edit the listing from the dashboard.

### Listing Quality And Publishing

1. Open seller listings.
2. Open the new listing for editing.
3. Check that the listing details are saved correctly.
4. Ask the app owner/admin to publish the listing if publishing is admin-controlled.
5. Confirm the listing appears publicly on `/listings` after publishing.

Expected result:

- Drafts are not public until active/published.
- Active listings appear publicly.
- Public listing hides anything that should not be public.

### Seller Receives Buyer Enquiry

1. Use a buyer account to enquire on the seller listing.
2. Log back in as the seller.
3. Go to `/dashboard/leads`.
4. Open the lead/enquiry.

Expected result:

- Seller sees the enquiry assigned to them.
- Seller can see buyer name, email, phone, message, readiness/fit details, and listing context where available.

## 10. Agent Scenario

Use `agent.alpha@...`.

### Agent Signup

1. Go to `/signup/agent`.
2. Complete all steps.
3. Use a valid-looking FFC number, for example `FFC123456`.
4. Fill agency details, service areas, CRM tool, and consent.
5. Confirm email.
6. Log in.

Expected result:

- Required fields validate clearly.
- Invalid commission values over 15% should be blocked.
- FFC field should accept letters, numbers, spaces, hyphens, or slashes.
- Agent dashboard loads.

### Agent Dashboard And Listings

1. Go to `/dashboard`.
2. Check role says Agent.
3. Click `Add listing`.
4. Create a listing using the same listing creation checks as the seller.
5. Open `/dashboard/listings`.
6. Open and edit the listing.

Expected result:

- Agent can create and edit their own listings.
- Buyer accounts should not be able to access listing creation.
- Agent should not be able to edit listings owned by another seller/agent.

### Agent Lead Handover

1. Use the ready buyer account to enquire on the agent's listing.
2. Log in as the agent.
3. Go to `/dashboard/leads`.
4. Search for the buyer or listing.
5. Open the enquiry detail.

Expected result:

- Agent sees the enquiry.
- Agent can identify:
  - Buyer name
  - Contact details
  - Listing
  - Message
  - Viewing request
  - Readiness score
  - Property fit
  - Finance status
  - Timeline
  - Mia qualification summary or next action

Ask yourself:

- Would an agent know what to do next?
- Is there enough context to call the buyer confidently?
- Does anything feel too vague or too robotic?

## 11. Admin Scenario

Use admin credentials provided by the app owner.

### Admin Login And Protection

1. Log out of all accounts.
2. Try opening `/admin`.
3. Confirm protection appears.
4. Log in as admin.
5. Open `/admin`.

Expected result:

- Non-admin users cannot access admin pages.
- Admin can access the control room.

### Admin Control Room

Open `/admin` and check:

- Buyers count
- Private sellers count
- Active listings count
- Draft listings count
- Total enquiries
- Agent-ready count
- Due nurture count
- API errors in the last 24 hours

Expected result:

- Page loads without server errors.
- Counts look believable after the tests.
- Recent API errors section is empty or understandable.

### Launch Readiness

1. Open `/admin/launch`.
2. Review each readiness item.
3. Note anything blocked.

Expected result:

- The page clearly says whether alpha is ready or blocked.
- Blocked items explain what needs to be fixed.

### QA Checklist

1. Open `/admin/qa`.
2. Review the checklist.
3. Mark what was tested manually, if the page allows it.

Expected result:

- QA page loads.
- Checklist items are understandable.

### Users And Roles

1. Open `/admin/users`.
2. Find each test account.
3. Confirm each role is correct:
   - buyer
   - seller
   - agent
   - admin
4. Check for unconfirmed or missing-profile accounts.

Expected result:

- Test accounts appear.
- Roles are correct.
- Admin can spot broken signup/profile rows.

### Listings Admin

1. Open `/admin/listings`.
2. Find new seller and agent listings.
3. Open listing detail/admin editor.
4. Check photos, title, description, price, status, owner, and quality warnings.
5. Change status if appropriate.

Expected result:

- Admin can review draft and active listings.
- Listing quality warnings are understandable.
- Status changes are recorded and visible.

### Enquiries, Pipeline, And Mia

1. Open `/admin/pipeline`.
2. Find enquiries from each buyer account.
3. Open enquiry detail pages.
4. Check qualification status and Mia summary.
5. Open `/admin/mia`.
6. Review due nurture, paused nurture, and agent-ready leads.
7. If safe, run manual nurture from the admin controls.

Expected result:

- Ready buyer should look agent-ready or close to agent-ready.
- Nurture buyer should not be forced to agent handover too early.
- Mismatch buyer should show weaker property fit.
- Mia next action should make sense.
- Manual nurture should not send duplicate or confusing emails.

### Reports And Exports

1. Open `/admin/reports`.
2. Try available CSV exports, such as buyers, listings, pipeline, leads, or activity.
3. Open one downloaded CSV.

Expected result:

- Export downloads.
- File opens.
- Columns and rows make sense.
- No private secrets are exposed.

### System Health

1. Open `/admin/health`.
2. Check email config, Supabase access, cron readiness, nurture backlog, matching activity, and API errors.

Expected result:

- Health page clearly shows what is OK or blocked.
- Anything red/blocked should be reported.

## 12. Email Tests

Check emails for:

- Buyer signup confirmation.
- Seller signup confirmation.
- Agent signup confirmation.
- Contact form notification, if available.
- Buyer enquiry confirmation or follow-up.
- Mia nurture email.
- Agent/seller handover email.
- Buyer match alert email, if matching jobs are enabled.
- Email preferences or unsubscribe link.

Expected result:

- Emails arrive within 5 minutes unless the app owner says a job runs later.
- Sender name looks trustworthy.
- Subject line is clear.
- Links work.
- Email does not expose internal scores in a scary way.
- Unsubscribe or preferences links work.

## 13. Email Preferences And Unsubscribe

1. Log in as a buyer.
2. Open `/email-preferences`.
3. Change at least one preference.
4. Save.
5. Use an unsubscribe link from an email if available.

Expected result:

- Preferences page loads.
- Saving works.
- Unsubscribe changes the correct preference.
- Future sends should respect the changed preference.

## 14. Mobile Checks

Run these on a phone or narrow browser window:

- Home page
- Listings page
- Listing detail
- Buyer signup
- Buyer dashboard
- Saved listings
- Compare listings
- Seller listing creation
- Agent dashboard
- Admin control room

Expected result:

- Text does not overlap.
- Buttons are clickable.
- Forms are usable.
- Listing cards are readable.
- Tables or compare views scroll horizontally if needed.

## 15. Negative Tests

Try these intentionally:

- Wrong password on login.
- Invalid email during signup.
- Passwords that do not match.
- Buyer budget min higher than budget max.
- Buyer signup without POPIA consent.
- Agent signup without FFC number.
- Agent commission above 15%.
- Seller listing without photo.
- Seller listing without price.
- Enquiry while logged out.
- Buyer trying to access agent/seller listing creation.
- Non-admin trying to open `/admin`.

Expected result:

- App blocks the action.
- Error message explains what to fix.
- No blank white screen.
- No scary technical error shown to the user.

## 16. Known High-Risk Areas To Watch

Pay extra attention to these:

- Email confirmation links.
- Role redirects after login.
- Buyer dashboard links.
- Buyer enquiry status after Mia qualification.
- Whether the correct agent/seller receives the enquiry.
- Listing owner permissions.
- Draft listings appearing publicly by mistake.
- Admin pages showing missing profile or role mismatch.
- Mia emails being too frequent or unclear.
- Any route that opens a 404 page.

Important current check:

- The buyer dashboard has a `View all` link for enquiries. If clicking it opens a 404 or missing page, report it as a High issue.

## 17. End-To-End Master Test

Run this once after all accounts exist.

1. Admin confirms there is at least one active listing owned by the test agent.
2. Ready buyer logs in.
3. Ready buyer browses listings.
4. Ready buyer saves the agent listing.
5. Ready buyer adds it to compare.
6. Ready buyer sends an enquiry and requests a viewing.
7. Admin opens `/admin/pipeline`.
8. Admin finds the enquiry.
9. Admin confirms Mia qualification, property fit, readiness, and next action.
10. Agent logs in.
11. Agent opens `/dashboard/leads`.
12. Agent opens the enquiry.
13. Agent confirms the handover is useful.
14. Buyer checks dashboard for enquiry and viewing schedule.
15. If a handover email was sent, confirm the agent/seller received it.

Pass criteria:

- Buyer can complete the journey without help.
- Admin can trace the enquiry.
- Agent can understand and act on the lead.
- No database/manual fix is needed.

## 18. Alpha Pass Criteria

The app is ready for broader alpha testing when:

- Buyer, seller, agent, and admin login work.
- Buyer signup and profile creation work.
- Seller/agent listing creation works.
- Public listings load and filters work.
- Buyers can save, compare, enquire, and request viewings.
- Mia classifies at least one ready buyer and one nurture buyer correctly.
- Agent/seller sees the correct enquiry.
- Admin can manage users, listings, enquiries, Mia, and health checks.
- Email confirmation and important email links work.
- No critical or high-severity issues remain unresolved.

## 19. Final Notes For The Tester

Please do not worry about breaking anything. These are test accounts in alpha. The most useful feedback is often:

- "I did not know what to do next."
- "This wording made me unsure."
- "I expected this button to do something else."
- "I would not trust this email."
- "This page feels empty or unfinished."

That kind of feedback is just as important as finding technical bugs.
