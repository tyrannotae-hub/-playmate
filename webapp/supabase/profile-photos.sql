-- 학부모 계정 프로필 사진 + 자녀 프로필 사진.
-- 클라이언트에서 정사각형(400x400)으로 리사이즈해 업로드하는 방식은
-- facility-home.sql의 커버 이미지 패턴(CoverImageUpload.tsx)을 그대로 따름.

alter table parents add column avatar_url text;
alter table children add column photo_url text;

-- ============ Storage: 프로필 사진 버킷 (공개 읽기, 본인/자녀 사진만 쓰기) ============
-- 경로 규칙: 항상 부모의 auth.uid()를 최상위 폴더로 사용.
--   본인 사진: avatars/{parent_id}/self.jpg
--   자녀 사진: avatars/{parent_id}/child-{child_id}.jpg
-- 자녀는 항상 부모 소유이므로, (storage.foldername(name))[1] = auth.uid()::text
-- 하나의 정책으로 본인/자녀 사진 쓰기 권한을 모두 커버할 수 있음.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars readable by all" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "parent uploads own avatar" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "parent updates own avatar" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "parent deletes own avatar" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
