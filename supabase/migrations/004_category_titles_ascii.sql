-- logic-gym: category titles (ASCII only)

alter table public.profiles
  add column if not exists unlocked_title_categories text[] not null default '{}',
  add column if not exists active_title_category text check (
    active_title_category is null
    or active_title_category in ('detective', 'math', 'pattern', 'symbol')
  );
