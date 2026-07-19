-- Run this ONLY if the full script failed at the Chinese comment (table already exists).

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
