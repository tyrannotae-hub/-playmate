-- 예약 취소를 예약 변경과 동일한 규칙으로 통일:
--   - 아직 클럽이 승인 전인 예약(requested)은 학부모가 클럽 승인 없이 바로 취소/변경
--     가능 — 이 경우 취소는 이력을 남길 필요가 없어 예약 자체를 삭제한다.
--   - 클럽이 이미 승인한 예약(confirmed)은 취소/변경 둘 다 클럽이 승인해야 최종
--     반영되는 요청 방식으로 전환.
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.
-- (schema.sql, club-owners.sql, booking-changes.sql이 먼저 적용되어 있어야 합니다)

alter table bookings add column if not exists cancel_requested_at timestamptz;
-- 대시보드 "변경완료" 집계용 — 변경 요청이 승인되어 실제 반영된 시각(요청/응답 필드는
-- 처리 후 비워지므로, 이력을 남기려면 별도 컬럼이 필요함).
alter table bookings add column if not exists last_change_applied_at timestamptz;

-- 클럽 운영자가 완료/취소된 예약을 정리할 수 있도록 DELETE 권한 추가
-- (이미 SELECT/UPDATE는 자기 시설 예약에 한해 전권을 갖고 있음).
drop policy if exists "club owner deletes own bookings" on bookings;
create policy "club owner deletes own bookings" on bookings
  for delete using (
    exists (select 1 from teams_classes tc where tc.id = team_class_id and tc.facility_id = my_facility_id())
  );

-- cancel_booking(): 반환 타입을 void→text로 바꿔서(어떤 처리를 했는지 클라이언트에 알려줌)
-- 파라미터는 그대로지만 반환 타입 변경은 drop 후 재생성해야 함.
drop function if exists cancel_booking(uuid, text);

create or replace function cancel_booking(p_booking_id uuid, p_reason text default null)
returns text
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

  if v_status = 'requested' then
    -- 클럽이 아직 확인 전인 예약이라 승인 절차 없이 바로 취소하고, 이력 없이 삭제한다.
    update class_schedules
      set slot_booked_count = greatest(0, slot_booked_count - 1)
      where id = v_schedule_id;
    delete from bookings where id = p_booking_id;
    return 'deleted';
  elsif v_status = 'confirmed' then
    update bookings
      set cancel_requested_at = now(),
          cancel_reason = coalesce(nullif(trim(p_reason), ''), cancel_reason)
      where id = p_booking_id;
    return 'requested';
  else
    raise exception 'CANNOT_CANCEL';
  end if;
end;
$$;

grant execute on function cancel_booking(uuid, text) to authenticated;

-- 학부모: 본인이 넣은 취소 요청을 다시 취소(마음이 바뀐 경우) — cancel_booking_change와 동일 패턴.
create or replace function cancel_cancel_request(p_booking_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update bookings set
    cancel_requested_at = null
  where id = p_booking_id and parent_id = auth.uid();
end;
$$;

grant execute on function cancel_cancel_request(uuid) to authenticated;

-- 클럽 운영자: 취소 요청 승인/거절
create or replace function respond_booking_cancel(p_booking_id uuid, p_approve boolean)
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

  if v_booking.cancel_requested_at is null then
    raise exception 'NO_PENDING_CANCEL';
  end if;

  if p_approve then
    update bookings set
      status = 'cancelled',
      cancelled_at = now(),
      cancel_requested_at = null
    where id = p_booking_id;

    update class_schedules
      set slot_booked_count = greatest(0, slot_booked_count - 1)
      where id = v_booking.class_schedule_id;
  else
    update bookings set
      cancel_requested_at = null
    where id = p_booking_id;
  end if;
end;
$$;

grant execute on function respond_booking_cancel(uuid, boolean) to authenticated;

-- request_booking_change(): requested 상태 예약은 클럽 승인 없이 바로 반영, confirmed만
-- 승인 대기로 전환. 반환 타입도 void→text로 바꿔서(바로 반영 vs 승인 대기) 클라이언트에
-- 알려주므로 drop 후 재생성.
drop function if exists request_booking_change(uuid, uuid, date, text);

create or replace function request_booking_change(
  p_booking_id uuid,
  p_schedule_id uuid default null,
  p_trial_date date default null,
  p_note text default null
)
returns text
language plpgsql
security definer
as $$
declare
  v_booking bookings%rowtype;
  v_schedule_team_class_id uuid;
  v_schedule_allow_trial boolean;
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

  if p_schedule_id is not null then
    select team_class_id, allow_trial into v_schedule_team_class_id, v_schedule_allow_trial
      from class_schedules where id = p_schedule_id;
    if v_schedule_team_class_id is distinct from v_booking.team_class_id then
      raise exception 'INVALID_SCHEDULE';
    end if;
    if v_booking.booking_type = 'trial' and not v_schedule_allow_trial then
      raise exception 'SCHEDULE_NOT_TRIAL';
    end if;
  end if;

  if p_trial_date is not null and exists (
    select 1 from class_holidays
    where team_class_id = v_booking.team_class_id and holiday_date = p_trial_date
  ) then
    raise exception 'HOLIDAY_DATE';
  end if;

  if v_booking.status = 'requested' then
    -- 클럽이 아직 확인 전이라 승인 없이 바로 반영. 시간대를 바꾸면 정원도 즉시 이동.
    if p_schedule_id is not null and p_schedule_id <> v_booking.class_schedule_id then
      update class_schedules
        set slot_booked_count = slot_booked_count + 1
        where id = p_schedule_id and slot_booked_count < slot_capacity;
      if not found then
        raise exception 'FULL';
      end if;
      update class_schedules
        set slot_booked_count = greatest(0, slot_booked_count - 1)
        where id = v_booking.class_schedule_id;
    end if;

    update bookings set
      class_schedule_id = coalesce(p_schedule_id, class_schedule_id),
      trial_date = coalesce(p_trial_date, trial_date)
    where id = p_booking_id;

    return 'applied';
  end if;

  update bookings set
    requested_schedule_id = p_schedule_id,
    requested_trial_date = p_trial_date,
    change_requested_at = now(),
    change_note = nullif(trim(coalesce(p_note, '')), '')
  where id = p_booking_id;

  return 'requested';
end;
$$;

grant execute on function request_booking_change(uuid, uuid, date, text) to authenticated;

-- respond_booking_change(): 변경 승인 시 last_change_applied_at을 남겨서 대시보드
-- "변경완료" 집계가 가능하게 함(요청/응답 필드는 처리 후 비워지므로 별도 이력 필요).
-- 파라미터/반환 타입 모두 그대로라 drop 불필요.
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
      change_note = null,
      last_change_applied_at = now()
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
