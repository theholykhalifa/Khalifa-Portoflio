# HOLY — Supabase setup (free tier): cloud accounts + leaderboard

Follow once. ~5 minutes. No credit card.

## 1. Create the project

1. Go to **supabase.com** → sign in (GitHub works) → **New project**
2. Name: `holy` · set a database password (save it somewhere) · pick the closest region
3. Wait ~2 minutes for provisioning

## 2. Create the tables (SQL Editor)

Project dashboard → **SQL Editor** → **New query** → paste everything below → **Run**:

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  callsign text unique not null,
  created_at timestamptz default now()
);

create table scores (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  callsign text not null,
  game text not null check (game in ('sec','vuln')),
  score int not null,
  total int not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table scores enable row level security;

create policy "profiles readable by all"
  on profiles for select to anon, authenticated using (true);
create policy "users insert own profile"
  on profiles for insert to authenticated with check (auth.uid() = id);
create policy "users update own profile"
  on profiles for update to authenticated using (auth.uid() = id);

create policy "scores readable by all"
  on scores for select to anon, authenticated using (true);
create policy "users insert own scores"
  on scores for insert to authenticated with check (auth.uid() = user_id);
```

## 3. Easier logins (optional, recommended for a demo)

**Authentication → Sign In / Up** → turn OFF **Confirm email**.
Otherwise every new account must click an inbox link before first login.
(For a serious production site, leave it ON.)

## 4. Connect the site

**Project Settings → API** → copy:
- **Project URL** (`https://xyzcompany.supabase.co`)
- **anon public key** (the long `eyJ…` string — this one is SAFE to publish)

Paste both into `config.js`:

```js
const HOLY_SUPABASE = { url: "https://xyzcompany.supabase.co", key: "eyJ…" };
```

Then the usual: `git add .` / `git commit -m "connect cloud"` / `git push`.

## 5. Verify

- Open `playground.html` → create an account → finish a quiz → score posts
- Supabase dashboard → **Table Editor → scores** → your rows appear
- Leaderboard card lights up with real entries

## 6. Banning (optional, real enforcement)

Bans must run server-side — browsers can't be trusted with the secret key.

**Step 1 — ban table + enforcement.** SQL Editor → New query → Run:

```sql
create table bans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  reason text default '',
  until timestamptz,
  created_at timestamptz default now()
);
alter table bans enable row level security;
-- No insert/update policies: only the secret key (server) can write.
create policy "bans readable by all"
  on bans for select to anon, authenticated using (true);

-- Block banned users from posting scores:
drop policy if exists "users insert own scores" on scores;
create policy "users insert own scores, unbanned only"
  on scores for insert to authenticated
  with check (
    auth.uid() = user_id
    and not exists (
      select 1 from bans
      where bans.user_id = auth.uid()
        and (bans.until is null or bans.until > now())
    )
  );
```

**Step 2 — deploy the function** (needs Supabase CLI + the secret key —
run on your PC, never commit secrets):

```powershell
npm i -g supabase
supabase login
supabase link --project-ref xyzcompany   # your ref
supabase secrets set ADMIN_SECRET="pick-a-long-random-string" --project-ref xyzcompany
supabase functions deploy ban-user --project-ref xyzcompany
```

Function URL: `https://xyzcompany.supabase.co/functions/v1/ban-user`

**Step 3 — use it.** Admin page → BAN HAMMER card → paste the function
URL + the ADMIN_SECRET you set → user UUID → hours (0 = permanent) →
BAN. UNBAN reverses it. The secret is typed per session, never stored.

**Immediate alternative (no deploy):** Supabase dashboard → Table Editor
→ `bans` → Insert row manually (user_id from auth.users, until or NULL).
The RLS policy above enforces it instantly.

## 7. Achievements sync (one more table)

SQL Editor → New query → Run:

```sql
create table achievements (
  user_id uuid references auth.users(id) on delete cascade,
  badge text not null,
  earned_at timestamptz default now(),
  primary key (user_id, badge)
);
alter table achievements enable row level security;
create policy "achievements readable by all"
  on achievements for select to anon, authenticated using (true);
create policy "users insert own achievements"
  on achievements for insert to authenticated with check (auth.uid() = user_id);
create policy "users update own achievements"
  on achievements for update to authenticated using (auth.uid() = user_id);
```

Badges earned while logged in now sync to the account automatically.

## 8. Let users delete their OWN scores

Users can only ever touch their own rows — safe to allow. SQL Editor → Run:

```sql
create policy "users delete own scores"
  on scores for delete to authenticated using (auth.uid() = user_id);
```

Then the ✕ button in MY SCORES works (delete own rows only). (Value editing is intentionally not offered — replay to improve. Deleting *others'* scores stays server-side: edge function or Table Editor.)

## Notes

- RLS means: anyone can READ the board; only logged-in users can write
  their OWN rows. The anon key is public by design.
- Abuse controls (rate limits, captcha, email confirm) live in
  Supabase dashboard → Authentication → settings. Enable them if the
  board gets rowdy.
