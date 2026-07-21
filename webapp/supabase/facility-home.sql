-- 클럽 홈 꾸미기: 커버 이미지 1장(클라이언트에서 고정 크기로 리사이즈해 업로드,
-- 모든 클럽이 동일한 비율/크기를 쓰도록 강제) + 공지사항 목록.

alter table facilities add column cover_image_url text;

create table facility_notices (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references facilities(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table facility_notices enable row level security;

create policy "notices readable by all" on facility_notices
  for select using (true);

create policy "club owner manages own notices" on facility_notices
  for all using (facility_id = my_facility_id()) with check (facility_id = my_facility_id());

-- ============ Storage: 시설 커버 이미지 버킷 (공개 읽기, 클럽 계정만 자기 시설 폴더에 쓰기) ============
insert into storage.buckets (id, name, public)
values ('facility-covers', 'facility-covers', true)
on conflict (id) do nothing;

create policy "facility covers readable by all" on storage.objects
  for select using (bucket_id = 'facility-covers');

create policy "club owner uploads own facility cover" on storage.objects
  for insert with check (
    bucket_id = 'facility-covers'
    and (storage.foldername(name))[1] = my_facility_id()::text
  );

create policy "club owner updates own facility cover" on storage.objects
  for update using (
    bucket_id = 'facility-covers'
    and (storage.foldername(name))[1] = my_facility_id()::text
  );

create policy "club owner deletes own facility cover" on storage.objects
  for delete using (
    bucket_id = 'facility-covers'
    and (storage.foldername(name))[1] = my_facility_id()::text
  );
