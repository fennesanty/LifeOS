# Personal OS

Next.js 15 rebuild of the LifeOS dashboard, following the "Personal OS Build Cheat Sheet" blueprint. Lives alongside `../LifeOS/`, which keeps running unchanged until this replaces it.

## Phase 0 status (this build)

Done: project scaffold, oklch design tokens carried over from LifeOS's "Vitality" palette, password-gated auth (HMAC-signed cookie), Supabase client helpers, core DB migration, empty dashboard shell, `/api/health` smoke route.

Not yet built: Telegram capture pipeline, the seven dashboard cards, Health/Goals/Brain tabs, cron, LifeOS feature ports (WHOOP, Nova, receipts, gym/water/caffeine/etc). See the phase plan for the full sequence.

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` — same Supabase project LifeOS already uses (Project Settings → API).
   - `AUTH_SECRET` — any random 32+ byte hex string (e.g. `openssl rand -hex 32`).
   - `DASHBOARD_PASSWORD` — the password you'll type to unlock the dashboard.
   - `API_SECRET` — random hex, for programmatic/API access without the cookie.
3. Run `db/migrations/0001_personal_os_core.sql` in the Supabase SQL Editor for that same project. It only adds new tables — it doesn't touch LifeOS's existing `app_state` table.
4. `npm run dev`, visit `http://localhost:3000` — should redirect to `/login`.
5. Visit `/api/health` (after logging in, or with header `x-api-secret: <API_SECRET>`) to confirm env vars and DB connectivity.

## Deploying

Create a **second** Vercel project pointed at this same GitHub repo, with **Root Directory = `PersonalOS/`**. Add the same env vars there. This is separate from the existing LifeOS Vercel project — one `git push` triggers both, each only rebuilds if its own root directory changed.
