-- 클럽 홍보 배너(facility_promo_images, 슬라이드별)와 클래스 배너(teams_classes,
-- 클래스 상세 대표사진 위에 얹는 문구)에 운영자가 직접 제목/소제목을 넣을 수
-- 있게 함. 제목보다 소제목이 작게 표시되고, 배너 안에 들어가는 문구라 길이
-- 제한을 둠(DB 체크 제약 + 프론트 maxLength 이중 방어).
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.
-- (facility-promo-images.sql, schema.sql이 먼저 적용되어 있어야 합니다)

alter table facility_promo_images add column if not exists title text;
alter table facility_promo_images add column if not exists subtitle text;
alter table facility_promo_images
  add constraint facility_promo_images_title_len check (char_length(title) <= 20);
alter table facility_promo_images
  add constraint facility_promo_images_subtitle_len check (char_length(subtitle) <= 40);

alter table teams_classes add column if not exists banner_title text;
alter table teams_classes add column if not exists banner_subtitle text;
alter table teams_classes
  add constraint teams_classes_banner_title_len check (char_length(banner_title) <= 20);
alter table teams_classes
  add constraint teams_classes_banner_subtitle_len check (char_length(banner_subtitle) <= 40);
