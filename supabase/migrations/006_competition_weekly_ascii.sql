-- logic-gym: weekly competition (ASCII only)

alter table public.puzzles
  add column if not exists in_competition_pool boolean not null default false;

create table if not exists public.competition_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  puzzle_id uuid not null references public.puzzles (id) on delete cascade,
  week_key text not null,
  is_correct boolean not null,
  points_earned integer not null default 0 check (points_earned >= 0),
  created_at timestamptz not null default now()
);

create index if not exists competition_attempts_user_week_idx
  on public.competition_attempts (user_id, week_key, created_at desc);

create index if not exists competition_attempts_week_user_idx
  on public.competition_attempts (week_key, user_id);

create index if not exists puzzles_competition_pool_idx
  on public.puzzles (in_competition_pool, status)
  where in_competition_pool = true;

alter table public.competition_attempts enable row level security;

create policy "Users read own competition attempts"
  on public.competition_attempts for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own competition attempts"
  on public.competition_attempts for insert
  to authenticated
  with check (auth.uid() = user_id);

-- mark existing verified puzzles for competition pool (up to 6)
update public.puzzles
set in_competition_pool = true
where id in (
  select id from public.puzzles
  where status = 'verified'
  order by created_at
  limit 6
);
