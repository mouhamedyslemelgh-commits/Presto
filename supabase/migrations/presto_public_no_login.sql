-- PRESTO public collaboration with no account (explicit owner request).
-- WARNING: anyone with the website URL can add, change and delete PRESTO records.
-- Public READ was already enabled. This applies only to presto_* tables.
-- The owner's Google Sheet remains private; site writes are recorded for recovery.
create table if not exists presto_private.edit_history(
 id bigint generated always as identity primary key,
 changed_at timestamptz not null default now(),
 action text not null,
 old_record jsonb,
 new_record jsonb
);
alter table presto_private.edit_history enable row level security;
revoke all on presto_private.edit_history from PUBLIC, anon, authenticated;

create or replace function presto_private.log_driver_change()
returns trigger
language plpgsql security definer
set search_path=''
as $$
begin
 insert into presto_private.edit_history(action,old_record,new_record)
 values (TG_OP,case when TG_OP='INSERT' then null else to_jsonb(OLD) end,
  case when TG_OP='DELETE' then null else to_jsonb(NEW) end);
 return null;
end;
$$;
revoke all on function presto_private.log_driver_change() from PUBLIC, anon, authenticated;
drop trigger if exists presto_driver_change_audit on public.presto_drivers;
create trigger presto_driver_change_audit
after insert or update or delete on public.presto_drivers
for each row execute function presto_private.log_driver_change();

-- Remove login-only policies that would conflict with public collaboration.
drop policy if exists "Only PRESTO admins may add drivers" on public.presto_drivers;
drop policy if exists "Only PRESTO admins may change drivers" on public.presto_drivers;
drop policy if exists "Only PRESTO admins may remove drivers" on public.presto_drivers;
drop policy if exists "Only PRESTO admins can update company profile" on public.presto_profile;

grant select,insert,update,delete on public.presto_drivers to anon,authenticated;
grant usage,select on sequence public.presto_drivers_id_seq to anon,authenticated;
grant select,update on public.presto_profile to anon,authenticated;

create policy "Public visitors may add PRESTO drivers" on public.presto_drivers
 for insert to anon,authenticated
 with check(char_length(btrim(name))>0 and char_length(name)<=100);
create policy "Public visitors may update PRESTO drivers" on public.presto_drivers
 for update to anon,authenticated
 using(true) with check(char_length(btrim(name))>0 and char_length(name)<=100);
create policy "Public visitors may delete PRESTO drivers" on public.presto_drivers
 for delete to anon,authenticated using(true);
create policy "Public visitors may change PRESTO company settings" on public.presto_profile
 for update to anon,authenticated using(id=1) with check(id=1);

-- Remove obsolete one-time owner-claim endpoint. No account is needed for PRESTO.
drop function if exists public.presto_claim_owner(text);
drop table if exists presto_private.setup_token;
