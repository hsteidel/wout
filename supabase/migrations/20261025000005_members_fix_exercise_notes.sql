-- Members can fix exercise notes on a saved version without creating a new one.
-- Everything else in the saved week stays locked: a trigger compares the week with all
-- notes stripped and refuses the update if anything else changed. Direct SQL fixes
-- (run as postgres, not from the page) are not affected.

-- The week with every exercise's note removed, for comparing.
create function private.strip_exercise_notes(d jsonb) returns jsonb
language sql immutable set search_path = '' as $$
  select jsonb_set(d, '{days}', coalesce((
    select jsonb_agg(jsonb_set(day, '{exercises}', coalesce((
      select jsonb_agg(ex - 'note' order by i)
      from jsonb_array_elements(day -> 'exercises') with ordinality e(ex, i)), '[]'::jsonb)) order by j)
    from jsonb_array_elements(d -> 'days') with ordinality x(day, j)), '[]'::jsonb))
$$;

-- From the page, a saved week can only change its exercise notes.
create function private.only_notes_changed() returns trigger
language plpgsql set search_path = '' as $$
begin
  if current_user = 'authenticated'
     and private.strip_exercise_notes(new.data) is distinct from private.strip_exercise_notes(old.data) then
    raise exception 'Only exercise notes can change in place; save a new version instead.'
      using errcode = '42501';
  end if;
  return new;
end $$;

create trigger routine_versions_only_notes
  before update on public.routine_versions
  for each row execute function private.only_notes_changed();

grant update (data) on public.routine_versions to authenticated;
