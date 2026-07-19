-- logic-gym Step 2: profiles, attempts, tighter puzzle RLS (ASCII only)

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null check (char_length(nickname) between 2 and 20),
  plan text not null default 'free' check (plan in ('free', 'paid')),
  created_at timestamptz not null default now()
);

create table if not exists public.puzzle_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  puzzle_id uuid not null references public.puzzles (id) on delete cascade,
  is_correct boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists puzzle_attempts_user_created_idx
  on public.puzzle_attempts (user_id, created_at desc);

create index if not exists puzzle_attempts_user_puzzle_idx
  on public.puzzle_attempts (user_id, puzzle_id);

alter table public.profiles enable row level security;
alter table public.puzzle_attempts enable row level security;

drop policy if exists "Allow public read puzzles" on public.puzzles;

create policy "Authenticated read verified puzzles"
  on public.puzzles for select
  to authenticated
  using (status = 'verified');

create policy "Users read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users read own attempts"
  on public.puzzle_attempts for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own attempts"
  on public.puzzle_attempts for insert
  to authenticated
  with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'nickname'), ''), '學員')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
