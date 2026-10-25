-- Members can rename a version (its note) from the page. The column grant limits updates
-- to the note; the week data, author and date stay as saved.
create policy "version names changed by members" on public.routine_versions
  for update to authenticated
  using ((select private.is_member()))
  with check ((select private.is_member()));

grant update (note) on public.routine_versions to authenticated;
