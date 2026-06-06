# Supabase Auth setup — Global Score Agent

## 1. Enable providers (Supabase Dashboard)

1. Open **Authentication → Providers**.
2. Enable **Email** (password sign-up / sign-in).
3. Enable **Google** and **GitHub**; configure OAuth client IDs/secrets from each provider console.

## 2. Redirect URLs

Under **Authentication → URL Configuration**, add:

| Environment | Site URL | Redirect URLs |
|-------------|----------|---------------|
| Local | `http://localhost:3000` | `http://localhost:3000/auth/callback` |
| Production | `https://your-domain.com` | `https://your-domain.com/auth/callback` |

Set `NEXT_PUBLIC_SITE_URL` in `.env.local` to match (no trailing slash).

## 3. Environment variables

Copy [`.env.example`](../.env.example) to `.env.local` and fill:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server APIs only; never expose to the client)
- `NEXT_PUBLIC_SITE_URL`

## 4. GSA login: `gsa.user_login_process`

After a valid Auth session, the app calls the Postgres RPC **`gsa.user_login_process(p_user_id, p_display_name, p_avatar_url)`** to create or load the GSA profile and check subscription status.

### Supabase configuration

1. **Project Settings → API → Exposed schemas** — add **`gsa`** (in addition to `public` / `web_dashboard` as needed).
2. Run [`docs/supabase-gsa-schema-access.sql`](supabase-gsa-schema-access.sql) in the SQL Editor. Without **`GRANT USAGE ON SCHEMA gsa TO authenticated`**, login-process fails with `permission denied for schema gsa` even if the function grants exist.
3. Ensure `GRANT EXECUTE ON FUNCTION gsa.user_login_process TO authenticated` is applied (included in the script above).
4. **Security recommendation:** at the start of the function, reject calls where `p_user_id IS DISTINCT FROM auth.uid()` so users cannot run the RPC for another UUID.

### RPC response (JSON)

| Field | Type | Meaning |
|-------|------|---------|
| `profile_id` | number | GSA profile primary key |
| `subscription` | `"Active"` \| `"Disable"` | Whether the user may use dashboard data |
| `new_user` | boolean | Profile + Free subscription were just created |
| `message_es` / `message_en` | string | Localized message when `subscription` is `Disable` |

### When the app calls login-process

| Moment | `p_display_name` / `p_avatar_url` |
|--------|-----------------------------------|
| Email/password **register** (immediate session) | Name from form; avatar `NULL` |
| Email confirmation / OAuth **`/auth/callback`** | From `user_metadata` (registration) |
| Email/password **login** (existing user) | Both `NULL` |
| Every dashboard visit (safety net) | `POST /api/auth/login-process` if `sessionStorage` has no `gsa:loginProcess` |

Client state is stored in **`sessionStorage`** key `gsa:loginProcess` (fast paint on refresh) and revalidated on each dashboard load via `POST /api/auth/login-process` in [`DashboardLoginContext`](../app/(dashboard)/dashboard/components/DashboardLoginContext.tsx).

- **`Active`:** dashboard home loads `/api/dashboard/overview` as usual.
- **`Disable`:** sidebar navigation is disabled; home shows `message_es` / `message_en` (no overview fetch). Logout remains available.

### App endpoints

| Route | Purpose |
|-------|---------|
| `POST /api/auth/login-process` | Session user → RPC → JSON (see [`lib/gsa/login-process.ts`](../lib/gsa/login-process.ts)) |

Promotional codes are **not** part of this flow in v1; registration collects **name** only (`display_name` / `full_name` in Auth metadata).

## 5. App routes

| Route | Purpose |
|-------|---------|
| `/auth/login` | Login / register (email + OAuth buttons) |
| `/auth/callback` | OAuth and email confirmation callback |
| `/dashboard/*` | Protected by `middleware.ts` (redirects to login if no session) |
| `/api/dashboard/*` | Protected by `middleware.ts` (401 JSON) and [`requireDashboardUser()`](../lib/auth/require-dashboard-user.ts) in each route handler |

New dashboard API routes must call `requireDashboardUser()` at the start of the handler (before any `service_role` or DB access). Middleware blocks unauthenticated requests even if a handler omits the helper.

## 6. Dashboard data (`web_dashboard` schema)

The overview page loads data via **`GET /api/dashboard/overview`** (server-side), not from the browser Supabase client.

The overview API uses **only** the authenticated user's Supabase session (JWT). It does **not** use `SUPABASE_SERVICE_ROLE_KEY` or retry with elevated privileges. If the query fails or `main_stadistics` has no row, the API returns an error and the dashboard home shows a localized message (ES/EN) instead of placeholder numbers.

**Important:** Users listed under **Authentication → Users** only means login works. Table access is configured separately under **Database** (schema `web_dashboard`), not under **Authentication → Policies** in the sidebar.

### Step A — Expose the schema (often the cause of HTTP 500)

1. Supabase Dashboard → **Project Settings** → **API**
2. **Exposed schemas** → add `web_dashboard` (keep `public` as needed)
3. Save

Without this step, PostgREST returns errors like schema not allowed / PGRST106 and `/api/dashboard/overview` returns 500.

### Step B — SQL grants + RLS

Run the script [`docs/supabase-dashboard-access.sql`](supabase-dashboard-access.sql) in the SQL Editor.

This avoids RLS issues when `authenticated` has no `SELECT` on `web_dashboard` tables.

**Option A — recommended for production:** Add RLS policies so logged-in users can read dashboard tables:

```sql
-- Overview (/dashboard home)
create policy "authenticated read main_stadistics"
  on web_dashboard.main_stadistics for select
  to authenticated
  using (true);

create policy "authenticated read chains"
  on web_dashboard.chains for select
  to authenticated
  using (true);

-- Agents directory (/dashboard/agents) and filters
create policy "authenticated read agents"
  on web_dashboard.agents for select
  to authenticated
  using (true);

create policy "authenticated read agent_advanced_filters"
  on web_dashboard.agent_advanced_filters for select
  to authenticated
  using (true);
```

Enable RLS on each table before creating policies. Adjust `using (...)` if you need row-level restrictions later.

**Option B — already supported in code:** Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. The overview API verifies the user session, then reads with the service role if the session client is denied.

Also ensure in Supabase **Project Settings → API → Exposed schemas**, `web_dashboard` is listed.

## 7. Marketing CTAs

All “Acceder al Dashboard” / “Abrir dashboard” buttons link to `/auth/login?redirect=/dashboard`.
