-- ⚠️ 부분 대체됨(supabase/README.md 참고): cancel_booking() 최신 버전은
-- booking-cancel-request.sql에 있음(확인중/승인됨 상태에 따라 즉시취소 vs
-- 클럽승인필요 분기 추가됨).
--
-- 학부모 예약 취소 RPC (schema.sql의 request_booking()과 대칭)
--
-- bookings 테이블에는 학부모용 UPDATE RLS 정책이 없다 (schema.sql의
-- "bookings scoped to parent"는 SELECT만 허용하고, UPDATE는 club-owners.sql의
-- club owner 전용 정책만 존재). 즉 학부모는 bookings를 직접 update() 할 수 없으므로
-- 취소는 반드시 이 security definer RPC를 통해서만 처리한다.
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.
-- (schema.sql이 이미 적용되어 있어야 합니다)

create or replace function cancel_booking(p_booking_id uuid, p_reason text default null)
returns void
language plpgsql
security definer
as $$
declare
  v_parent_id uuid;
  v_status text;
  v_schedule_id uuid;
begin
  select parent_id, status, class_schedule_id
    into v_parent_id, v_status, v_schedule_id
    from bookings
    where id = p_booking_id;

  if v_parent_id is null then
    raise exception 'BOOKING_NOT_FOUND';
  end if;

  if v_parent_id <> auth.uid() then
    raise exception 'NOT_ALLOWED';
  end if;

  if v_status not in ('requested', 'confirmed') then
    raise exception 'CANNOT_CANCEL';
  end if;

  update bookings
    set status = 'cancelled',
        cancelled_at = now(),
        cancel_reason = coalesce(p_reason, cancel_reason)
    where id = p_booking_id;

  -- 슬롯을 다시 열어줘야 다른 학부모가 예약 가능
  update class_schedules
    set slot_booked_count = greatest(0, slot_booked_count - 1)
    where id = v_schedule_id;
end;
$$;

grant execute on function cancel_booking(uuid, text) to authenticated;
