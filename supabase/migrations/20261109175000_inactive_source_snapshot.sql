alter table public.presto_inactive_drivers add column if not exists source_snapshot jsonb;
