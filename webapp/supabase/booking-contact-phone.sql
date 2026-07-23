-- 예약 신청 시 학부모 연락처(전화번호)를 선택 입력받아 저장.
-- 클럽/코치가 관리자 센터에서 예약을 확인할 때 이 번호로 학부모에게 직접 연락할 수 있도록 함.
--
-- 기존 request_booking(uuid, uuid, text) [p_notify_email 버전, booking-notify-email.sql]은
-- 이미 실사용 안 되는 죽은 코드(이메일 알림 기능 자체가 삭제됨)이므로 파라미터를 완전히 대체한다.
-- 파라미터 이름만 바뀌어도 create or replace로는 "cannot change name of input parameter" 에러가
-- 나므로, 기존 시그니처를 명시적으로 drop한 뒤 새로 만든다.
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.

alter table bookings add column contact_phone text;

drop function if exists request_booking(uuid, uuid, text);

create or replace function request_booking(
  p_child_id uuid,
  p_schedule_id uuid,
  p_contact_phone text default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_team_class_id uuid;
  v_booking_id uuid;
begin
  select team_class_id into v_team_class_id from class_schedules where id = p_schedule_id;
  if v_team_class_id is null then
    raise exception 'SCHEDULE_NOT_FOUND';
  end if;

  update class_schedules
    set slot_booked_count = slot_booked_count + 1
    where id = p_schedule_id and slot_booked_count < slot_capacity;

  if not found then
    raise exception 'FULL';
  end if;

  insert into bookings (parent_id, child_id, team_class_id, class_schedule_id, status, contact_phone)
    values (auth.uid(), p_child_id, v_team_class_id, p_schedule_id, 'requested', nullif(trim(p_contact_phone), ''))
    returning id into v_booking_id;

  return v_booking_id;
end;
$$;
