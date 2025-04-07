insert into storage.buckets
  (id, name)
values
  ('testid', 'test');

create policy "Public read Access to test"
  on storage.objects
  for select
  using ( bucket_id = 'testid' );

create policy "Public write Access to test"
  on storage.objects
  for insert
  with check ( bucket_id = 'testid' );