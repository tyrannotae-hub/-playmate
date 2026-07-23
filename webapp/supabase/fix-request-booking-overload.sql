-- 예약 신청 실패 버그 수정: request_booking() 함수가 인자 2개짜리(schema.sql, 구버전)와
-- 인자 3개짜리(booking-notify-email.sql, p_notify_email 추가된 버전) 두 개가 동시에
-- 남아있어서, 클라이언트가 인자 2개로 호출할 때 PostgREST가 어느 함수인지 못 정하고
-- "Could not choose the best candidate function" 에러로 매번 실패하던 것을 해결.
-- 인자 3개짜리(p_notify_email은 기본값 null이라 2개만 넘겨도 정상 동작)만 남기고
-- 구버전(인자 2개)은 삭제.
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.

drop function if exists request_booking(uuid, uuid);
