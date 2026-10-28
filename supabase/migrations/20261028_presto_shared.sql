-- PRESTO shared database: public viewing, private editing.
-- Do NOT apply to an unrelated Supabase project.
create table if not exists public.presto_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);
alter table public.presto_admins enable row level security;
revoke all on public.presto_admins from anon, authenticated;
grant select on public.presto_admins to authenticated;
create policy "Admins can verify their own membership"
on public.presto_admins for select to authenticated
using (user_id = (select auth.uid()));

create table if not exists public.presto_drivers (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 100),
  phone text not null default '' check (char_length(phone) <= 30),
  bag boolean not null default false,
  shirt boolean not null default false,
  verified boolean not null default false,
  bankily boolean not null default false,
  masrvi boolean not null default false,
  sedad boolean not null default false,
  click boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists presto_drivers_created_idx on public.presto_drivers(created_at desc);
alter table public.presto_drivers enable row level security;
revoke all on public.presto_drivers from anon, authenticated;
grant select on public.presto_drivers to anon, authenticated;
grant insert, update, delete on public.presto_drivers to authenticated;
grant usage, select on sequence public.presto_drivers_id_seq to authenticated;
create policy "Anyone with the URL can read drivers"
on public.presto_drivers for select to anon, authenticated using (true);
create policy "Only PRESTO admins may add drivers"
on public.presto_drivers for insert to authenticated
with check (exists(select 1 from public.presto_admins p where p.user_id=(select auth.uid())));
create policy "Only PRESTO admins may change drivers"
on public.presto_drivers for update to authenticated
using (exists(select 1 from public.presto_admins p where p.user_id=(select auth.uid())))
with check (exists(select 1 from public.presto_admins p where p.user_id=(select auth.uid())));
create policy "Only PRESTO admins may remove drivers"
on public.presto_drivers for delete to authenticated
using (exists(select 1 from public.presto_admins p where p.user_id=(select auth.uid())));

-- Company identity displayed to all visitors.
create table if not exists public.presto_profile (
  id smallint primary key default 1 check (id=1),
  company text not null default 'PRESTO' check (char_length(company) between 1 and 70),
  city text not null default 'Nouakchott · MR' check (char_length(city) between 1 and 90),
  updated_at timestamptz not null default now()
);
insert into public.presto_profile(id,company,city) values(1,'PRESTO','Nouakchott · MR')
on conflict (id) do nothing;
alter table public.presto_profile enable row level security;
revoke all on public.presto_profile from anon, authenticated;
grant select on public.presto_profile to anon, authenticated;
grant update on public.presto_profile to authenticated;
create policy "Anyone can see PRESTO company profile"
on public.presto_profile for select to anon,authenticated using(true);
create policy "Only PRESTO admins can update company profile"
on public.presto_profile for update to authenticated
using (exists(select 1 from public.presto_admins p where p.user_id=(select auth.uid())))
with check (exists(select 1 from public.presto_admins p where p.user_id=(select auth.uid())));

-- For live updates, polling is also implemented as fallback in the client.
alter publication supabase_realtime add table public.presto_drivers, public.presto_profile;
