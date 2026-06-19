<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

InstantAuthority.ai — a Next.js 16 (App Router, Turbopack, React 19) SaaS. Stack: Prisma (PostgreSQL), Clerk auth, Anthropic SDK. Single app, port 3000. Standard commands live in `package.json` (`dev`, `build`, `start`, `lint`) and `README.md`.

- **Runs without secrets.** Clerk and the DB degrade gracefully when keys/`DATABASE_URL` are absent (see `proxy.ts`, `app/layout.tsx`, `lib/auth-user.ts`). `npm run dev` serves the public landing page `/`, which is a fully interactive client-side demo (Authority Engine, Website Analyzer, GEO Optimizer, etc.) — no backend needed to exercise it.
- **What needs secrets:** the `/dashboard/*` pages and `/api/*` routes (DB-backed + AI). They require valid `CLERK_SECRET_KEY` + `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (`pk_*`/`sk_*` format) and `ANTHROPIC_API_KEY`. Without valid Clerk keys, `DashboardShell`'s `<UserButton>` throws on the client (ClerkProvider is not mounted), so the dashboard is not interactively usable, and `npm run build` fails while prerendering `/dashboard/*`. `next dev` itself still starts fine.
- **Postgres (optional, for DB features):** binaries are installed but the service is not auto-started. Start it with `sudo pg_ctlcluster 16 main start`. A local DB `instantauthority` with role `postgres`/`postgres` is used. `DATABASE_URL` is read from a gitignored `.env` (`postgresql://postgres:postgres@localhost:5432/instantauthority`); recreate it if missing. Sync schema with `npx prisma db push`. Prisma's schema reads `env("DATABASE_URL")`, so `prisma db push` needs that env var set (via `.env`).
- **Prisma client** is generated automatically by `npm install` (postinstall) and again by `npm run build`. Run `npx prisma generate` manually if you edit `prisma/schema.prisma`.
- **Lint** (`npm run lint`) currently reports pre-existing errors in `app/page.tsx` (set-state-in-effect, `<a>`-for-internal-nav). These exist in committed code, not from environment setup.
