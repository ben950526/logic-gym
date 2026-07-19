-- logic-gym Step 1: puzzles table (ASCII only, safe to paste in SQL Editor)

create extension if not exists "pgcrypto";

do $$ begin
  create type puzzle_type as enum ('multiple_choice', 'numeric_fill', 'ordering');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type puzzle_category as enum ('detective', 'math', 'pattern', 'symbol');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type puzzle_difficulty as enum ('easy', 'medium', 'hard');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type puzzle_status as enum ('pending', 'verified', 'rejected');
exception when duplicate_object then null;
end $$;

create table if not exists public.puzzles (
  id uuid primary key default gen_random_uuid(),
  type puzzle_type not null,
  category puzzle_category not null,
  difficulty puzzle_difficulty not null,
  title text not null,
  content_json jsonb not null,
  answer_json jsonb not null,
  explanation text not null,
  status puzzle_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists puzzles_status_idx on public.puzzles (status);
create index if not exists puzzles_category_difficulty_idx
  on public.puzzles (category, difficulty, status);

alter table public.puzzles enable row level security;

drop policy if exists "Allow public read puzzles" on public.puzzles;
drop policy if exists "Service role full access" on public.puzzles;

create policy "Allow public read puzzles"
  on public.puzzles for select
  using (true);

create policy "Service role full access"
  on public.puzzles
  for all
  to service_role
  using (true)
  with check (true);
