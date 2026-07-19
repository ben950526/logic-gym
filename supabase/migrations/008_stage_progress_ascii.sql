-- logic-gym v2: stage progress for planet map (ASCII only)

create table if not exists public.stage_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  stage_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, stage_id)
);

create index if not exists stage_progress_user_idx
  on public.stage_progress (user_id);

alter table public.stage_progress enable row level security;

create policy "Users read own stage progress"
  on public.stage_progress for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own stage progress"
  on public.stage_progress for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users update own stage progress"
  on public.stage_progress for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
