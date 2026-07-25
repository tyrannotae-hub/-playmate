-- 한 시설이 여러 지역에 지점을 둘 수 있음(예: 퍼핀스 아이스하키 클럽의
-- 역삼/목동/신사/동탄 각각이 서로 다른 클래스로 등록돼 있음)에도, 지금까지는
-- 지역이 시설(facility_regions) 단위로만 있어서 검색에서 지역 필터를 걸어도
-- 그 지역에 없는 클래스까지 다 노출되는 문제가 있었음. 클래스마다 실제 운영
-- 지역을 따로 지정할 수 있게 teams_classes에 컬럼 추가(선택 입력 — 비워두면
-- 기존처럼 시설 단위 지역으로 검색에 노출됨).
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.

alter table teams_classes add column if not exists region_code text;
create index if not exists teams_classes_region_code_idx on teams_classes (region_code);
