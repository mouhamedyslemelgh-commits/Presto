-- PRESTO: applicants who have not yet registered as drivers.
create table if not exists public.presto_candidates (
 id bigint generated always as identity primary key,
 name text not null check (char_length(name) between 1 and 120),
 phone text not null check (char_length(phone) between 7 and 30),
 whatsapp text not null default '',
 city text not null default '',
 address text not null default '',
 age integer check (age between 16 and 100),
 vehicle_type text not null default '',
 vehicle_model text not null default '',
 license_plate text not null default '',
 status text not null default 'not_contacted' check (status in ('not_contacted','contacted','interested','awaiting_registration','registered','not_interested')),
 notes text not null default '',
 last_contact date,
 next_contact date,
 assigned_to text not null default '',
 person_photo_path text not null default '',
 vehicle_photo_path text not null default '',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 created_by uuid not null default auth.uid()
);
create index if not exists presto_candidates_status_idx on public.presto_candidates(status,next_contact);
alter table public.presto_candidates enable row level security;
-- Restrict access to authenticated PRESTO staff; tighten to existing admin roles if applicable.
create policy "candidate_staff_select" on public.presto_candidates for select to authenticated using (true);
create policy "candidate_staff_insert" on public.presto_candidates for insert to authenticated with check (created_by=auth.uid());
create policy "candidate_staff_update" on public.presto_candidates for update to authenticated using (true) with check (true);
create policy "candidate_staff_delete" on public.presto_candidates for delete to authenticated using (true);
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('presto-candidate-photos','presto-candidate-photos',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy "candidate_photo_read" on storage.objects for select to authenticated using (bucket_id='presto-candidate-photos');
create policy "candidate_photo_upload" on storage.objects for insert to authenticated with check (bucket_id='presto-candidate-photos');
create policy "candidate_photo_update" on storage.objects for update to authenticated using (bucket_id='presto-candidate-photos') with check (bucket_id='presto-candidate-photos');
