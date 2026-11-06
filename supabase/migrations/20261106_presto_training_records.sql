-- PRESTO: a separate roster for people who attended app-use training.
-- Apply only to the dedicated PRESTO Supabase database (not another project).
-- Photos are stored privately in presto-driver-photos/training/ and served using signed URLs.
begin;
create table if not exists public.presto_training_records (
 id bigint generated always as identity primary key,
 name text not null check (char_length(btrim(name)) between 1 and 100),
 phone text not null check (char_length(btrim(phone)) between 1 and 30),
 city text not null default '' check (char_length(city)<=100),
 photo_path text not null default '' check (char_length(photo_path)<=500),
 training_date date not null default current_date,
 trainer text not null default '' check (char_length(trainer)<=100),
 training_location text not null default '' check (char_length(training_location)<=120),
 training_status text not null default 'completed'
  check (training_status in ('completed','in_progress','needs_review')),
 app_type text not null default 'driver'
  check (app_type in ('driver','customer','both')),
 notes text not null default '' check (char_length(notes)<=1200),
 created_at timestamptz not null default now()
);
create index if not exists presto_training_records_date_idx
 on public.presto_training_records(training_date desc,id desc);
alter table public.presto_training_records enable row level security;
revoke all on public.presto_training_records from public, anon, authenticated;
grant select, insert, update, delete on public.presto_training_records to authenticated;
grant usage, select on sequence public.presto_training_records_id_seq to authenticated;

-- Names, telephone numbers and photos are personal data.
-- Restrict the list to signed-in PRESTO users, not anonymous site visitors.
drop policy if exists "presto_training_member_read" on public.presto_training_records;
create policy "presto_training_member_read" on public.presto_training_records
 for select to authenticated using (
  (select auth.uid()) is not null and (auth.jwt()->>'is_anonymous') is distinct from 'true'
 );
drop policy if exists "presto_training_member_insert" on public.presto_training_records;
create policy "presto_training_member_insert" on public.presto_training_records
 for insert to authenticated with check (
  (select auth.uid()) is not null and (auth.jwt()->>'is_anonymous') is distinct from 'true'
 );
drop policy if exists "presto_training_member_update" on public.presto_training_records;
create policy "presto_training_member_update" on public.presto_training_records
 for update to authenticated
 using ((select auth.uid()) is not null and (auth.jwt()->>'is_anonymous') is distinct from 'true')
 with check ((select auth.uid()) is not null and (auth.jwt()->>'is_anonymous') is distinct from 'true');
drop policy if exists "presto_training_member_delete" on public.presto_training_records;
create policy "presto_training_member_delete" on public.presto_training_records
 for delete to authenticated
 using ((select auth.uid()) is not null and (auth.jwt()->>'is_anonymous') is distinct from 'true');

-- Existing private bucket is reused. Only the training/ folder is covered here.
drop policy if exists "presto_training_photo_read" on storage.objects;
create policy "presto_training_photo_read" on storage.objects for select to authenticated
 using (bucket_id='presto-driver-photos' and name like 'training/%'
 and (select auth.uid()) is not null and (auth.jwt()->>'is_anonymous') is distinct from 'true');
drop policy if exists "presto_training_photo_upload" on storage.objects;
create policy "presto_training_photo_upload" on storage.objects for insert to authenticated
 with check (bucket_id='presto-driver-photos' and name like 'training/%'
 and (select auth.uid()) is not null and (auth.jwt()->>'is_anonymous') is distinct from 'true');
commit;
