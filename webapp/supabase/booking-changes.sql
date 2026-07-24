-- ⚠️ 부분 대체됨(supabase/README.md 참고): request_booking_change()는
-- class-schedule-trial-toggle.sql에서 시그니처 자체가 바뀜(trial_date 파라미터
-- 제거, class_trial_dates 대신 class_schedules.allow_trial 검증). respond_booking_change()는
-- booking-cancel-request.sql에서 last_change_applied_at 컬럼 갱신이 추가됨.
-- cancel_booking_change()는 그대로 유효.
--
-- 예약 변경(일정/체험 날짜 변경) 요청 기능.
-- 학부모가 기존 예약의 시간대(또는 체험 날짜)를 바꿔달라고 요청하면, 클럽 운영자가
-- 승인/거절하는 흐름. cancel_booking()과 마찬가지로 bookings에는 학부모용 UPDATE RLS가
-- 없어서(club-owners.sql 참고) 요청/취소 둘 다 security definer RPC로만 처리한다.
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.
-- (schema.sql, club-owners.sql, booking-trial.sql, class-trial-options.sql이 먼저 적용되어 있어야 합니다)

alter table bookings add column if not exists requested_schedule_id uuid references class_schedules(id);
alter table bookings add column if not exists requested_trial_date date;
alter table bookings add column if not exists change_requested_at timestamptz;
alter table bookings add column if not exists change_note text;

-- 학부모: 변경 요청
create or replace function request_booking_change(
  p_booking_id uuid,
  p_schedule_id uuid default null,
  p_trial_date date default null,
  p_note text default null
)
returns void
language plpgsql
security definer
as $$
declare
  v_booking bookings%rowtype;
begin
  select * into v_booking from bookings where id = p_booking_id and parent_id = auth.uid();
  if not found then
    raise exception 'BOOKING_NOT_FOUND';
  end if;

  if v_booking.status not in ('requested', 'confirmed') then
    raise exception 'BOOKING_NOT_ACTIVE';
  end if;

  if p_schedule_id is null and p_trial_date is null then
    raise exception 'NOTHING_TO_CHANGE';
  end if;

  if p_schedule_id is not null and not exists (
    select 1 from class_schedules where id = p_schedule_id and team_class_id = v_booking.team_class_id
  ) then
    raise exception 'INVALID_SCHEDULE';
  end if;

  if p_trial_date is not null and not exists (
    select 1 from class_trial_dates
    where team_class_id = v_booking.team_class_id and trial_date = p_trial_date
  ) then
    raise exception 'INVALID_TRIAL_DATE';
  end if;

  update bookings set
    requested_schedule_id = p_schedule_id,
    requested_trial_date = p_trial_date,
    change_requested_at = now(),
    change_note = nullif(trim(coalesce(p_note, '')), '')
  where id = p_booking_id;
end;
$$;

grant execute on function request_booking_change(uuid, uuid, date, text) to authenticated;

-- 학부모: 본인이 넣은 변경 요청 취소 (승인/거절 전에 마음이 바뀐 경우)
create or replace function cancel_booking_change(p_booking_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update bookings set
    requested_schedule_id = null,
    requested_trial_date = null,
    change_requested_at = null,
    change_note = null
  where id = p_booking_id and parent_id = auth.uid();
end;
$$;

grant execute on function cancel_booking_change(uuid) to authenticated;

-- 클럽 운영자: 변경 요청 승인/거절
create or replace function respond_booking_change(p_booking_id uuid, p_approve boolean)
returns void
language plpgsql
security definer
as $$
declare
  v_booking bookings%rowtype;
begin
  select b.* into v_booking
  from bookings b
  join teams_classes tc on tc.id = b.team_class_id
  where b.id = p_booking_id and tc.facility_id = my_facility_id();

  if not found then
    raise exception 'BOOKING_NOT_FOUND';
  end if;

  if v_booking.change_requested_at is null then
    raise exception 'NO_PENDING_CHANGE';
  end if;

  if p_approve then
    if v_booking.requested_schedule_id is not null
       and v_booking.requested_schedule_id <> v_booking.class_schedule_id then
      update class_schedules
        set slot_booked_count = slot_booked_count + 1
        where id = v_booking.requested_schedule_id and slot_booked_count < slot_capacity;

      if not found then
        raise exception 'FULL';
      end if;

      update class_schedules
        set slot_booked_count = greatest(0, slot_booked_count - 1)
        where id = v_booking.class_schedule_id;
    end if;

    update bookings set
      class_schedule_id = coalesce(v_booking.requested_schedule_id, class_schedule_id),
      trial_date = coalesce(v_booking.requested_trial_date, trial_date),
      requested_schedule_id = null,
      requested_trial_date = null,
      change_requested_at = null,
      change_note = null
    where id = p_booking_id;
  else
    update bookings set
      requested_schedule_id = null,
      requested_trial_date = null,
      change_requested_at = null,
      change_note = null
    where id = p_booking_id;
  end if;
end;
$$;

grant execute on function respond_booking_change(uuid, boolean) to authenticated;
