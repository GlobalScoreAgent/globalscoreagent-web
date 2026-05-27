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

## 4. Optional: `user_profiles` + promo code

Promotional codes are stored in `auth.users.raw_user_meta_data.promo_code` on email sign-up. To mirror into a public table for future validation:

```sql
create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  promo_code text,
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy "Users can read own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id, promo_code)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data->>'promo_code'), '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

Validation against a `promotional_codes` table can be added later via API before or after sign-up.

## 5. App routes

| Route | Purpose |
|-------|---------|
| `/auth/login` | Login / register (email + OAuth buttons) |
| `/auth/callback` | OAuth and email confirmation callback |
| `/dashboard/*` | Protected by `middleware.ts` (redirects to login if no session) |

## 6. Dashboard data (`web_dashboard` schema)

The overview page loads data via **`GET /api/dashboard/overview`** (server-side), not from the browser Supabase client.

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
