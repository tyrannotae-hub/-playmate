-- 클래스별로 예약 신청 시 추가 수집할 정보(키/발사이즈/거주지)를 코치가
-- 클래스관리센터에서 선택할 수 있게 함. 성별·나이·연락처는 모든 클래스에서
-- 항상 수집(기본)하므로 별도 토글 없음.
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.

alter table teams_classes add column if not exists collect_height boolean not null default false;
alter table teams_classes add column if not exists collect_shoe_size boolean not null default false;
alter table teams_classes add column if not exists collect_residence boolean not null default false;
