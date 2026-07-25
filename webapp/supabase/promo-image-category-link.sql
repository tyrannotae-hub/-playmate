-- 클럽 홈 홍보 배너 사진마다 홈 진열장 카테고리를 연결할 수 있게 함 —
-- 연결해두면 학부모가 그 배너를 눌렀을 때 해당 카테고리(연결되는 클래스 그룹)로
-- 스크롤 이동한다. 연결 안 하면(null) 지금처럼 그냥 사진만 보여줌(클릭 무반응).
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.
-- (facility-home-categories.sql이 먼저 적용되어 있어야 합니다)

alter table facility_promo_images
  add column if not exists category_id uuid references facility_home_categories(id) on delete set null;
