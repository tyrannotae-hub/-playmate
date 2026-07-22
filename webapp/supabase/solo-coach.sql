-- 개인 코치(클럽 소속 없이 혼자 자기 수업을 운영하는 코치) 지원.
--
-- 별도의 인증/대시보드 시스템을 새로 만들지 않고, "개인 코치 = 본인 명의의 1인 시설(facility)의
-- club_owner"로 모델링한다. club-owners.sql의 기존 인프라(RLS 정책, my_facility_id(),
-- 클래스/강사/예약 CRUD, 클럽 로그인)를 100% 그대로 재사용하기 위함 — 기술아키텍처.md의
-- Founder-led 온보딩 컨벤션과 동일하게, 계정 생성은 운영자가 스크립트로 수동 처리.
--
-- 온보딩: webapp/scripts/create-solo-coach.mjs (npm run coach:create -- <아이디> <비밀번호> <코치이름>)
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.
-- (schema.sql, club-owners.sql 이 이미 적용되어 있어야 합니다)

alter table facilities
  add column owner_type text not null default 'club' check (owner_type in ('club', 'solo_coach'));

comment on column facilities.owner_type is
  'club = 운영자가 만들어준 클럽(다수 강사) 계정, solo_coach = 혼자 수업을 운영하는 개인 코치의 1인 시설';
