-- PRESTO email-account access to the EXISTING shared driver registry.
-- Apply only to the dedicated PRESTO database after backing up existing data.
-- All verified email accounts share one registry; anonymous visitors do not have database access.
-- Do not apply this migration to Rihlat al-Ilm or M-yslem-AI.
begin;
alter table public.presto_drivers enable row level security;
alter table public.presto_profile enable row level security;

drop policy if exists "Public visitors may add PRESTO drivers" on public.presto_drivers;
drop policy if exists "Public visitors may update PRESTO drivers" on public.presto_drivers;
drop policy if exists "Public visitors may delete PRESTO drivers" on public.presto_drivers;
drop policy if exists "Public visitors may change PRESTO company settings" on public.presto_profile;
drop policy if exists "Anyone with the URL can read drivers" on public.presto_drivers;
drop policy if exists "Anyone can see PRESTO company profile" on public.presto_profile;
drop policy if exists "PRESTO members may read drivers" on public.presto_drivers;
drop policy if exists "PRESTO members may add drivers" on public.presto_drivers;
drop policy if exists "PRESTO members may edit drivers" on public.presto_drivers;
drop policy if exists "PRESTO members may delete drivers" on public.presto_drivers;
drop policy if exists "PRESTO members may view profile" on public.presto_profile;
drop policy if exists "PRESTO members may update profile" on public.presto_profile;

revoke all on public.presto_drivers from anon;
revoke all on public.presto_profile from anon;
grant select,insert,update,delete on public.presto_drivers to authenticated;
grant select,update on public.presto_profile to authenticated;
grant usage,select on sequence public.presto_drivers_id_seq to authenticated;

create policy "PRESTO members may read drivers" on public.presto_drivers
 for select to authenticated using ((select auth.uid()) is not null and (auth.jwt()->>'is_anonymous') is distinct from 'true');
create policy "PRESTO members may add drivers" on public.presto_drivers
 for insert to authenticated with check ((select auth.uid()) is not null and (auth.jwt()->>'is_anonymous') is distinct from 'true');
create policy "PRESTO members may edit drivers" on public.presto_drivers
 for update to authenticated
 using ((select auth.uid()) is not null and (auth.jwt()->>'is_anonymous') is distinct from 'true')
 with check ((select auth.uid()) is not null and (auth.jwt()->>'is_anonymous') is distinct from 'true');
create policy "PRESTO members may delete drivers" on public.presto_drivers
 for delete to authenticated using ((select auth.uid()) is not null and (auth.jwt()->>'is_anonymous') is distinct from 'true');
create policy "PRESTO members may view profile" on public.presto_profile
 for select to authenticated using ((select auth.uid()) is not null and (auth.jwt()->>'is_anonymous') is distinct from 'true');
create policy "PRESTO members may update profile" on public.presto_profile
 for update to authenticated
 using ((select auth.uid()) is not null and (auth.jwt()->>'is_anonymous') is distinct from 'true')
 with check ((select auth.uid()) is not null and (auth.jwt()->>'is_anonymous') is distinct from 'true');
commit;
