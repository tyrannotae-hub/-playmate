-- 클럽/코치 가입 신청 시 주력 종목도 함께 받아서, 관리자가 승인 화면에서
-- 어떤 종목인지 바로 볼 수 있게 함.
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.
-- (club-signup-approval.sql이 먼저 적용되어 있어야 합니다)

alter table club_signup_requests add column if not exists sport_id text references sports(id);
