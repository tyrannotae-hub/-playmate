-- 클럽 홈 배너 제목을 Enter로 줄바꿈해서 2줄까지 쓸 수 있게 함(구조는 그대로
-- 한 줄 text 컬럼, 프론트에서 \n을 허용하고 white-space: pre-line으로 표시).
-- 줄바꿈 문자까지 포함해 여유있게 20자 → 40자로 상향.
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.
-- (banner-captions.sql이 먼저 적용되어 있어야 합니다)

alter table facility_promo_images drop constraint if exists facility_promo_images_title_len;
alter table facility_promo_images
  add constraint facility_promo_images_title_len check (char_length(title) <= 40);
