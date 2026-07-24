-- 클럽 프로필 사진(정방형) — 클럽 홈 상단 홍보 캐러셀 아래, 클럽 이름 옆에 노출.
-- 기존 cover_image_url은 아래 facility-promo-images.sql에서 홍보 캐러셀로 용도가
-- 바뀌므로, "이 클럽이 누구인지" 보여주는 대표 사진은 이 필드로 분리한다.
-- 업로드 시 기존 facility-covers 버킷을 재사용(경로: {facilityId}/profile.jpg).

alter table facilities add column if not exists profile_image_url text;
