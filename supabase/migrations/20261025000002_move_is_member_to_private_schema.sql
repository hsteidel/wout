-- Keep the helper out of the exposed API schema so it isn't callable as /rest/v1/rpc/is_member.
-- Policies reference the function itself, so they keep working after the move.
create schema if not exists private;
grant usage on schema private to authenticated;
alter function public.is_member() set schema private;
