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

## Notes

- RLS means: anyone can READ the board; only logged-in users can write
  their OWN rows. The anon key is public by design.
- Abuse controls (rate limits, captcha, email confirm) live in
  Supabase dashboard → Authentication → settings. Enable them if the
  board gets rowdy.
