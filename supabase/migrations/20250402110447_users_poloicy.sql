alter table "public"."users" enable row level security;

create policy "Public users are visible to everyone."
on "public"."users"
as permissive
for select
to anon
using (true);



