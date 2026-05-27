# HeyMies Web

HeyMies is a Next.js real estate lead-intelligence app. Mia qualifies buyer enquiries, nurtures buyers when more context is needed, matches buyers to listings, and helps agents or private sellers receive cleaner handovers.

## Stack

- Next.js 14
- React 18
- TypeScript
- Supabase
- Resend
- OpenAI

## Local Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in Supabase, Resend, OpenAI, admin, and job secrets.
3. Install dependencies with `npm install`.
4. Run the app with `npm run dev`.
5. Open `http://localhost:3000`.

## Useful Commands

```bash
npm run dev
npm run build
```

On Windows PowerShell, if `npm run build` is blocked by script execution policy, use:

```bash
npm.cmd run build
```

## Core Flows

- Public listing search and listing detail pages.
- Buyer, private seller, and agent signup.
- Buyer dashboard with saved listings, comparison, alerts, and profile management.
- Agent/seller dashboard with listing and lead workflows.
- Mia enquiry qualification and nurture emails.
- Buyer matching and match alert emails.
- Admin control room for users, listings, enquiries, Mia, reports, QA, and health checks.
- Launch readiness dashboard at `/admin/launch`.

## Admin Security

Admin routes accept a signed admin session cookie for users whose `profiles.role` is `admin`.
During alpha, Basic Auth can remain as a fallback. Before public beta:

1. Create or update your admin user's `public.profiles.role` to `admin`.
2. Set `ADMIN_SESSION_SECRET` to a long random value.
3. Set `ADMIN_REQUIRE_ROLE=true`.
4. Keep `ADMIN_USER` and `ADMIN_PASS` strong until the Basic Auth fallback is removed.

## Alpha Readiness

Use `ALPHA_TEST_PLAN.md` before inviting friendly testers.

Before public testing, rotate any secrets that have been shared outside the deployment environment and confirm production Supabase migrations, email sending, and cron secrets are configured.

Use `/admin/launch` as the live-user go/no-go screen before expanding beyond friendly alpha users.
