# Personal OS

Next.js 15 rebuild of the LifeOS dashboard, following the "Personal OS Build Cheat Sheet" blueprint.
Standalone project — lives in its own folder, deploys as its own Vercel project. Does not touch or
replace `../LifeOS/`, which keeps running exactly as it always has.

## Status

Done: project scaffold, oklch design tokens carried over from LifeOS's "Vitality" palette, login page +
password-gated auth (checked server-side per route via `next/headers` cookies — no Edge middleware,
so no Edge Runtime bundling issues), Supabase client helpers, core DB migration, dashboard shell with
a full recreation of the real "Miles OS V3.1" mockup screenshot as a reference panel, `/api/health`
smoke route.

Not yet built: Telegram capture pipeline, the seven real (data-connected) dashboard cards, Health/
Goals/Brain tabs, cron.

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` — can reuse the same Supabase project LifeOS already uses (Project Settings → API), or a new one — your call.
   - `AUTH_SECRET` — any random 32+ byte hex string (e.g. `openssl rand -hex 32`).
   - `DASHBOARD_PASSWORD` — the password you'll type to unlock the dashboard.
   - `API_SECRET` — random hex, for programmatic/API access without the cookie.
3. Run `db/migrations/0001_personal_os_core.sql` in the Supabase SQL Editor for whichever project you pick.
4. `npm run dev`, visit `http://localhost:3000` — should redirect to `/login`.
5. Visit `/api/health` (after logging in, or with header `x-api-secret: <API_SECRET>`) to confirm env vars and DB connectivity.

## Deploying

Create a **new, separate** Vercel project pointed at this repo, with **Root Directory = `PersonalOS/`**.
Add the env vars above to that project. This is independent of whatever Vercel project deploys
`LifeOS/` — different project, different domain, no shared config to fight over.
