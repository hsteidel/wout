-- Members can delete versions from the page. The last remaining version of a routine
-- can't be deleted, so the page always has a week to show. Deletes are permanent.
create policy "versions deleted by members" on public.routine_versions
  for delete to authenticated
  using (
    (select private.is_member())
    and exists (
      select 1 from public.routine_versions other
      where other.routine = routine_versions.routine and other.id <> routine_versions.id
    )
  );

grant delete on public.routine_versions to authenticated;
