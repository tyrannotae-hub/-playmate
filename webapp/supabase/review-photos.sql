-- 리뷰 첨부 사진. 클라이언트에서 정사각형(800x800)으로 리사이즈해 업로드하는 방식은
-- profile-photos.sql의 avatars 버킷 패턴(AvatarUpload.tsx)을 그대로 따름.
-- reviews.photo_urls text[]는 schema.sql에 이미 존재하므로 여기서는 스토리지 버킷/정책만 추가.

-- ============ Storage: 리뷰 사진 버킷 (공개 읽기, 작성 본인만 쓰기) ============
-- 경로 규칙: 항상 작성자(학부모)의 auth.uid()를 최상위 폴더로 사용.
--   review-photos/{parent_id}/{booking_id}-{n}.jpg  (n: 0부터 시작하는 사진 순번)
-- 리뷰는 반드시 본인 예약(booking)에 대해서만 작성 가능하므로,
-- (storage.foldername(name))[1] = auth.uid()::text 하나로 본인 사진 쓰기 권한을 커버할 수 있음.
insert into storage.buckets (id, name, public)
values ('review-photos', 'review-photos', true)
on conflict (id) do nothing;

-- 재실행해도 안전하도록 기존 정책이 있으면 먼저 지우고 다시 생성
drop policy if exists "review photos readable by all" on storage.objects;
drop policy if exists "parent uploads own review photo" on storage.objects;
drop policy if exists "parent updates own review photo" on storage.objects;
drop policy if exists "parent deletes own review photo" on storage.objects;

create policy "review photos readable by all" on storage.objects
  for select using (bucket_id = 'review-photos');

create policy "parent uploads own review photo" on storage.objects
  for insert with check (
    bucket_id = 'review-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "parent updates own review photo" on storage.objects
  for update using (
    bucket_id = 'review-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "parent deletes own review photo" on storage.objects
  for delete using (
    bucket_id = 'review-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
