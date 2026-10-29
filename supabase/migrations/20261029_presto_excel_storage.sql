-- PRESTO automatic Excel mirror, to be applied ONLY to a dedicated PRESTO project.
-- The online database is authoritative; the .xlsx is a private, automatically refreshed snapshot.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('presto-excel','presto-excel',false,10485760,array['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
on conflict (id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy "PRESTO admins may read private Excel"
on storage.objects for select to authenticated
using (bucket_id='presto-excel' and name='LIVREUR_Presto_v2.xlsx' and exists
 (select 1 from public.presto_admins p where p.user_id=(select auth.uid())));
create policy "PRESTO admins may create Excel snapshots"
on storage.objects for insert to authenticated
with check (bucket_id='presto-excel' and name='LIVREUR_Presto_v2.xlsx' and exists
 (select 1 from public.presto_admins p where p.user_id=(select auth.uid())));
create policy "PRESTO admins may overwrite Excel snapshots"
on storage.objects for update to authenticated
using (bucket_id='presto-excel' and name='LIVREUR_Presto_v2.xlsx' and exists
 (select 1 from public.presto_admins p where p.user_id=(select auth.uid())))
with check (bucket_id='presto-excel' and name='LIVREUR_Presto_v2.xlsx' and exists
 (select 1 from public.presto_admins p where p.user_id=(select auth.uid())));
