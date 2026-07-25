-- banner-captions.sql에서 추가했던 facility_promo_images.subtitle을 다시 뺌 —
-- 클럽 홈 배너는 제목만 쓰기로 정리(소제목 기능 삭제). 아직 아무 사진에도
-- subtitle이 입력된 적 없어서(전부 null) 안전하게 드롭 가능.
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.

alter table facility_promo_images drop constraint if exists facility_promo_images_subtitle_len;
alter table facility_promo_images drop column if exists subtitle;
