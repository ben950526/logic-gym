-- Remove symbol / ordering puzzles (v1 drops symbol category)
delete from puzzle_attempts
where puzzle_id in (
  select id from puzzles where category = 'symbol' or type = 'ordering'
);

delete from competition_attempts
where puzzle_id in (
  select id from puzzles where category = 'symbol' or type = 'ordering'
);

delete from puzzles where category = 'symbol' or type = 'ordering';

update profiles
set active_title_category = null
where active_title_category = 'symbol';

update profiles
set unlocked_title_categories = array(
  select unnest(unlocked_title_categories)
  except select 'symbol'
)
where 'symbol' = any(unlocked_title_categories);
