-- logic-gym: user level and exp (ASCII only)

alter table public.profiles
  add column if not exists level integer not null default 1 check (level >= 1),
  add column if not exists exp integer not null default 0 check (exp >= 0);

-- level/exp only updated by server (service role); users cannot self-edit progress
drop policy if exists "Users update own profile" on public.profiles;
