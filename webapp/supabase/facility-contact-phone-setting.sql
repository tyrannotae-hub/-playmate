-- 클럽/코치가 클래스관리센터에서 "예약 시 학부모 연락처 받기"를 켜고 끌 수 있게 함.
-- 기본값 true(기존 동작 유지) — 끄면 학부모 예약 폼에 연락처 입력란 자체가 안 보임.
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.

alter table facilities add column if not exists collect_contact_phone boolean not null default true;
