-- Apply only on the dedicated PRESTO Supabase database.
-- People who have not attended formation have no training date yet.
begin;
alter table public.presto_training_records drop constraint if exists presto_training_records_training_status_check;
alter table public.presto_training_records add constraint presto_training_records_training_status_check check (training_status in ('completed','in_progress','needs_review','not_trained'));
alter table public.presto_training_records alter column training_date drop not null;
alter table public.presto_training_records add constraint presto_training_records_date_required_check check (training_status = 'not_trained' or training_date is not null);
create index if not exists presto_training_records_status_idx on public.presto_training_records (training_status, id desc);
commit;
