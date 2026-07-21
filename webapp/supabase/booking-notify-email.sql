-- 예약 신청 시 "알림받을 이메일"을 선택 입력받아 저장.
-- 클럽이 예약 상태를 승인/거절/완료 처리하면 이 이메일로 알림 발송 (API 라우트에서 처리).

alter table bookings add column notify_email text;

create or replace function request_booking(
  p_child_id uuid,
  p_schedule_id uuid,
  p_notify_email text default null
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

  insert into bookings (parent_id, child_id, team_class_id, class_schedule_id, status, notify_email)
    values (auth.uid(), p_child_id, v_team_class_id, p_schedule_id, 'requested', nullif(trim(p_notify_email), ''))
    returning id into v_booking_id;

  return v_booking_id;
end;
$$;
