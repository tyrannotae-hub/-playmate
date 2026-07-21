-- 클래스 상세페이지를 상품 상세처럼 꾸밀 수 있도록: 소개글 + 사진 갤러리(최대 6장)
-- 사진은 클라이언트에서 4:3 고정 비율/크기로 리사이즈해 업로드 (모든 클럽이 동일 규격)

alter table teams_classes add column description text;

create table class_images (
  id uuid primary key default gen_random_uuid(),
  team_class_id uuid not null references teams_classes(id) on delete cascade,
  url text not null,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

alter table class_images enable row level security;

create policy "class images readable by all" on class_images
  for select using (true);

create policy "club owner manages own class images" on class_images
  for all using (
    exists (select 1 from teams_classes tc where tc.id = team_class_id and tc.facility_id = my_facility_id())
  ) with check (
    exists (select 1 from teams_classes tc where tc.id = team_class_id and tc.facility_id = my_facility_id())
  );

-- ============ Storage: 클래스 사진 버킷 (공개 읽기, 클럽 계정만 자기 시설 소속 클래스 폴더에 쓰기) ============
insert into storage.buckets (id, name, public)
values ('class-images', 'class-images', true)
on conflict (id) do nothing;

create policy "class images bucket readable by all" on storage.objects
  for select using (bucket_id = 'class-images');

create policy "club owner uploads own class images" on storage.objects
  for insert with check (
    bucket_id = 'class-images'
    and (storage.foldername(name))[1] = my_facility_id()::text
  );

create policy "club owner deletes own class images" on storage.objects
  for delete using (
    bucket_id = 'class-images'
    and (storage.foldername(name))[1] = my_facility_id()::text
  );
