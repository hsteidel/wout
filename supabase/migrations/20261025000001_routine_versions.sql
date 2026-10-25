-- Emails allowed to save new versions. Anyone can view the routine without signing in.
-- Rows are added by hand (SQL editor / dashboard); the page cannot change this list.
create table public.members (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

create or replace function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.members where email = lower(auth.jwt() ->> 'email'));
$$;

-- Append-only history: every save is a new full copy of the week. All versions stay readable;
-- the page opens on the latest. Going back means saving an old version again as a new one.
create table public.routine_versions (
  id bigint generated always as identity primary key,
  routine text not null default 'hermann',
  data jsonb not null,
  note text check (char_length(note) <= 500),
  author_id uuid default auth.uid() references auth.users (id) on delete set null,
  author_email text default lower(auth.jwt() ->> 'email'),
  created_at timestamptz not null default now()
);

create index routine_versions_latest_idx on public.routine_versions (routine, id desc);

alter table public.members enable row level security;
alter table public.routine_versions enable row level security;

-- members: you can see your own row, which is how the page knows you may save.
create policy "members read own row" on public.members
  for select to authenticated
  using (email = lower(auth.jwt() ->> 'email'));

create policy "versions readable by anyone" on public.routine_versions
  for select to anon, authenticated
  using (true);

create policy "versions added by members as themselves" on public.routine_versions
  for insert to authenticated
  with check (
    (select public.is_member())
    and author_id = (select auth.uid())
    and author_email = lower(auth.jwt() ->> 'email')
  );

-- No update or delete policies: versions can't be edited or removed from the page.

revoke all on function public.is_member() from public, anon;
grant execute on function public.is_member() to authenticated;

grant select on public.routine_versions to anon, authenticated;
grant insert (routine, data, note) on public.routine_versions to authenticated;
grant select on public.members to authenticated;
