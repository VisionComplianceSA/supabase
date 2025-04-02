create table "users" (
  "id" integer not null,
  "name" text
);

alter table users enable row level security;

create policy "Public users are visible to everyone."
on users for select
to anon
using ( true );