# Personal OS (new dashboard, merged into LifeOS)

Next.js 15 rebuild of the LifeOS dashboard, following the "Personal OS Build Cheat Sheet" blueprint. This now lives directly inside `LifeOS/` — same Vercel project, same domain, no second deploy to set up.

## Layout after the merge

- `app/`, `components/`, `lib/`, `db/`, `middleware.ts`, and the Next.js config files are the **new** dashboard. `/` and `/login` are served by this.
- `public/` holds every **old** static page (`gym.html`, `finance.html`, `health.html`, `caffeine.html`, `po-water.html`, `kanban.html`, `pomodoro.html`, `mental.html`, `body.html`, `hustle.html`, `ideas.html`, `logboek.html`, `main.html`, `review.html`, `nova-lite.html`, `avatar-lab.html`, `template.html`, plus `theme.css`, `topbar.js`, `sync.js`, `nova-avatar.js`) — still reachable at the exact same URLs (e.g. `/gym.html`), and now sit behind the same password gate as the new dashboard.
- `api/` (top-level, outside `app/`) still holds the old Vercel Functions: `config.js`, `nova.js`, `nova-proxy.js`, `receipt.js`, `whoop-callback.js`, `whoop-data.js`, `whoop-refresh.js`. **Not yet verified working after this merge** — see the flag below.

## Phase 0 status

Done: project scaffold, oklch design tokens carried over from LifeOS's "Vitality" palette, password-gated auth (HMAC-signed cookie) covering both the new dashboard and every old page under `public/`, Supabase client helpers, core DB migration (new tables only, doesn't touch `app_state`), empty dashboard shell, `/api/health` smoke route.

Not yet built: Telegram capture pipeline, the seven dashboard cards, Health/Goals/Brain tabs, cron, and porting the old `api/*.js` functions (Nova, WHOOP, receipts) into the Next.js app.

## ⚠ Needs a live-deploy check: old `api/*.js` functions

Locally (`next dev`), the old top-level `api/config.js`, `api/nova.js`, etc. return 404 — `next dev` only serves routes under `app/api/`, it doesn't know about a plain `/api` folder. On real Vercel this *may* still work (Vercel can deploy a top-level `/api` folder as Serverless Functions alongside a Next.js app — a supported hybrid pattern), but this hasn't been confirmed against your actual Vercel project yet, and there's a second open question: those functions run outside Next.js's own routing, so they may bypass the new password gate entirely (unauthenticated) rather than 404.

**After your first deploy, test:** open `/gym.html`, check whether the WHOOP connect button and Nova finance chat still work. If they don't (or if they're reachable without logging in first), the fix is to port `config.js`/`nova.js`/`nova-proxy.js`/`receipt.js`/`whoop-*.js` into `app/api/*/route.ts` — this was already planned as Phase 8, just bumped earlier if needed.

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` — same Supabase project LifeOS already uses (Project Settings → API). The URL/anon key are the same ones already hardcoded in `public/sync.js`.
   - `AUTH_SECRET` — any random 32+ byte hex string (e.g. `openssl rand -hex 32`).
   - `DASHBOARD_PASSWORD` — the password you'll type to unlock the dashboard.
   - `API_SECRET` — random hex, for programmatic/API access without the cookie.
3. Run `db/migrations/0001_personal_os_core.sql` in the Supabase SQL Editor for that same project. It only adds new tables — it doesn't touch the existing `app_state` table your old pages use.
4. `npm run dev`, visit `http://localhost:3000` — should redirect to `/login`.
5. Visit `/api/health` (after logging in, or with header `x-api-secret: <API_SECRET>`) to confirm env vars and DB connectivity.

## Deploying

No new Vercel project needed — this is the same project that already deploys `LifeOS/`. Just add the env vars above to that existing project's settings and push. Vercel should auto-detect the framework switched from static to Next.js on the next build.
