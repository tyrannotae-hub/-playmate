-- 홈 진열장(facility_home_categories) 개편:
-- 1) 기존엔 "정확히 2개"로 프론트에서만 제한했음 — 이제 개수 제한 없이 자유롭게
--    추가/삭제 가능하게 함(DB 제약은 원래도 없었음, 프론트만 바뀜).
-- 2) 카테고리별로 공개 페이지에서 1줄(가로 스크롤)/2줄(2행 가로 스크롤) 중 선택 가능.
--    기본값 1줄, 언제든 다시 1줄로 되돌릴 수 있음(옵션이라 "안 만들고 싶으면" 그냥
--    1줄로 두면 됨).
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.
-- (facility-home-categories.sql이 먼저 적용되어 있어야 합니다)

alter table facility_home_categories add column if not exists display_rows smallint not null default 1;
alter table facility_home_categories
  add constraint facility_home_categories_display_rows_check check (display_rows in (1, 2));
