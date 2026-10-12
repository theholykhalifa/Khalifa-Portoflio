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

## 8. Self-service scores — RETIRED

Score editing and deleting were removed from the site: posted scores are
final for everyone, including the owner. (Management happens in Table
Editor or the admin panel.) If you ran the delete/update policies, you
may drop them:

```sql
drop policy if exists "users delete own scores" on scores;
drop policy if exists "users update own scores" on scores;
```

## 9. Visits counter (one tiny table)

```sql
create table visits (
  id bigint generated always as identity primary key,
  path text default '',
  created_at timestamptz default now()
);
alter table visits enable row level security;
create policy "visits insertable by all"
  on visits for insert to anon, authenticated with check (true);
create policy "visits readable by all"
  on visits for select to anon, authenticated using (true);
```

One row per page load. Powers the little ◉ VISITS pill.

## 10. Convergence pass (run this whole block once)

If you ever saw "already exists" errors, run this: every statement is
guarded, so re-running is always safe and finishes anything skipped.

```sql
-- visits table + policies
create table if not exists visits (
  id bigint generated always as identity primary key,
  path text default '',
  created_at timestamptz default now()
);
alter table visits enable row level security;
drop policy if exists "visits insertable by all" on visits;
create policy "visits insertable by all"
  on visits for insert to anon, authenticated with check (true);
drop policy if exists "visits readable by all" on visits;
create policy "visits readable by all"
  on visits for select to anon, authenticated using (true);

-- achievements table + policies
create table if not exists achievements (
  user_id uuid references auth.users(id) on delete cascade,
  badge text not null,
  earned_at timestamptz default now(),
  primary key (user_id, badge)
);
alter table achievements enable row level security;
drop policy if exists "achievements readable by all" on achievements;
create policy "achievements readable by all"
  on achievements for select to anon, authenticated using (true);
drop policy if exists "users insert own achievements" on achievements;
create policy "users insert own achievements"
  on achievements for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "users update own achievements" on achievements;
create policy "users update own achievements"
  on achievements for update to authenticated using (auth.uid() = user_id);

-- avatar column for leaderboard faces
alter table profiles add column if not exists avatar int default 0;
```

Expect green Success with no errors this time — then every cloud
feature (visits pill, badge sync, hero faces) lights up together.

## 11. Simulation exams (timed runs + crown)

```sql
create table if not exists exam_runs (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  callsign text not null,
  scenario text not null check (scenario in ('s1','s2','s3')),
  score int not null,
  total int not null,
  duration_s int default 0,
  hints int default 0,
  attempts int default 0,
  created_at timestamptz default now()
);
alter table exam_runs enable row level security;
drop policy if exists "exam runs readable by all" on exam_runs;
create policy "exam runs readable by all"
  on exam_runs for select to anon, authenticated using (true);
drop policy if exists "users insert own exam runs" on exam_runs;
create policy "users insert own exam runs"
  on exam_runs for insert to authenticated with check (auth.uid() = user_id);
```

## Notes

- RLS means: anyone can READ the board; only logged-in users can write
  their OWN rows. The anon key is public by design.
- Abuse controls (rate limits, captcha, email confirm) live in
  Supabase dashboard → Authentication → settings. Enable them if the
  board gets rowdy.
