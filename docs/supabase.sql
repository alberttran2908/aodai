-- Tiệm May Áo Dài · online boards on Supabase (free tier is plenty).
-- 1. Create a project at supabase.com. In Authentication › Sign In / Providers, turn ON "Allow anonymous sign-ins".
-- 2. Open SQL Editor, paste this whole file, Run.
-- 3. Project Settings › API: copy the Project URL and the "anon public" key into js/config.js (G.CFG.supabase).
--    The anon key is meant to be public; everything below is protected by row-level security.

-- players: one row per anonymous browser, holding the shop name shown on boards
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  shop_name text not null check (char_length(shop_name) between 1 and 24),
  banned boolean not null default false,
  created_at timestamptz not null default now()
);

-- the daily order: the first try of a Vietnam calendar day is the official score
create table if not exists public.daily_scores (
  date date not null,
  owner uuid not null references public.profiles(id) on delete cascade,
  score int not null check (score between 0 and 100),
  payload text check (char_length(payload) <= 2000),
  created_at timestamptz not null default now(),
  primary key (date, owner)
);

-- the weekly business challenge: best net worth per player per week
create table if not exists public.challenge_scores (
  week text not null check (char_length(week) <= 16),
  owner uuid not null references public.profiles(id) on delete cascade,
  worth int not null check (worth between -1000000 and 1000000),
  days int not null default 0 check (days between 0 and 60),
  bankrupt boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (week, owner)
);

alter table public.profiles enable row level security;
alter table public.daily_scores enable row level security;
alter table public.challenge_scores enable row level security;

-- anyone may read (boards are public); nobody writes directly — only through the functions below
drop policy if exists "read profiles" on public.profiles;
create policy "read profiles" on public.profiles for select using (not banned);
drop policy if exists "read daily" on public.daily_scores;
create policy "read daily" on public.daily_scores for select using (true);
drop policy if exists "read challenge" on public.challenge_scores;
create policy "read challenge" on public.challenge_scores for select using (true);
revoke insert, update, delete on public.profiles, public.daily_scores, public.challenge_scores from anon, authenticated;

-- set / rename your shop (letters, digits, spaces and a little punctuation, 1–24 characters)
create or replace function public.set_profile(p_name text) returns void
language plpgsql security definer set search_path = public as $$
declare n text := left(trim(regexp_replace(coalesce(p_name, ''), '[^[:alnum:][:space:]''&.-]', '', 'g')), 24);
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if n = '' then n := 'Một tiệm may'; end if;
  insert into profiles (id, shop_name) values (auth.uid(), n)
  on conflict (id) do update set shop_name = excluded.shop_name;
end $$;

-- the daily score: only for today or yesterday (Vietnam time), first submission wins; returns your rank
create or replace function public.submit_daily(p_date date, p_score int, p_payload text) returns json
language plpgsql security definer set search_path = public as $$
declare today date := (now() at time zone 'Asia/Ho_Chi_Minh')::date; r int;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_date not between today - 1 and today then raise exception 'wrong day'; end if;
  if p_score not between 0 and 100 then raise exception 'bad score'; end if;
  insert into daily_scores (date, owner, score, payload) values (p_date, auth.uid(), p_score, left(p_payload, 2000))
  on conflict (date, owner) do nothing;
  select count(*) + 1 into r from daily_scores d
    where d.date = p_date and d.score > (select score from daily_scores where date = p_date and owner = auth.uid());
  return json_build_object('accepted', true, 'rank', r);
end $$;

-- the weekly challenge: keeps your best worth for the week; at most one submission a minute
create or replace function public.submit_challenge(p_week text, p_worth int, p_days int, p_bankrupt boolean) returns json
language plpgsql security definer set search_path = public as $$
declare last timestamptz; r int;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select created_at into last from challenge_scores where week = p_week and owner = auth.uid();
  if last is not null and last > now() - interval '1 minute' then raise exception 'too fast'; end if;
  insert into challenge_scores (week, owner, worth, days, bankrupt) values (p_week, auth.uid(), p_worth, p_days, p_bankrupt)
  on conflict (week, owner) do update set worth = greatest(challenge_scores.worth, excluded.worth),
    days = excluded.days, bankrupt = excluded.bankrupt, created_at = now();
  select count(*) + 1 into r from challenge_scores c
    where c.week = p_week and c.worth > (select worth from challenge_scores where week = p_week and owner = auth.uid());
  return json_build_object('accepted', true, 'rank', r);
end $$;

revoke all on function public.set_profile(text), public.submit_daily(date, int, text), public.submit_challenge(text, int, int, boolean) from public, anon;
grant execute on function public.set_profile(text), public.submit_daily(date, int, text), public.submit_challenge(text, int, int, boolean) to authenticated;

-- the boards, with shop names (banned players hidden)
create or replace view public.daily_board with (security_invoker = on) as
  select d.date, d.score, d.created_at, d.owner, p.shop_name as name
  from daily_scores d join profiles p on p.id = d.owner where not p.banned;
create or replace view public.challenge_board with (security_invoker = on) as
  select c.week, c.worth, c.days, c.bankrupt, c.owner, p.shop_name as name
  from challenge_scores c join profiles p on p.id = c.owner where not p.banned;
grant select on public.daily_board, public.challenge_board to anon, authenticated;
