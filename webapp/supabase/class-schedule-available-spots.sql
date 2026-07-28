-- 정원(slot_capacity) + 예약수(slot_booked_count) 두 컬럼으로 "잔여 = 정원-예약수"를
-- 자동 계산하던 방식을, 운영자가 "지금 남은 자리 수"를 직접 입력하는 방식으로 바꾼다.
--
-- 배경: 클럽이 플레이메이트 말고 다른 경로(전화, 현장 접수 등)로도 예약을 받기 때문에,
-- 플레이메이트 예약 건수만으로 자동 계산한 잔여석이 실제와 다를 수 있음. 운영자가
-- 직접 "남은 자리 몇 개"를 관리할 수 있어야 하고, 아예 정원 관리를 안 할 수도 있어야 함
-- (그 시간대는 항상 "예약 가능"으로 노출).
--
-- slot_capacity 컬럼을 그대로 재사용해서 "정원"이 아니라 "지금 남은 자리 수"라는
-- 의미로 바꾸고(nullable=정원 관리 안 함), slot_booked_count는 더 이상 필요 없어 제거.
-- 예약이 들어오면 -1, 취소/거절되면 +1로 직접 증감한다.
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.

alter table class_schedules alter column slot_capacity drop not null;
alter table class_schedules drop column if exists slot_booked_count;

-- ============ request_booking(): 예약 시 -1 (정원 미설정이면 그대로 통과) ============
create or replace function request_booking(
  p_child_id uuid,
  p_schedule_id uuid,
  p_contact_phone text default null,
  p_gender text default null,
  p_height_cm smallint default null,
  p_shoe_size_mm smallint default null,
  p_residence text default null,
  p_consent boolean default false,
  p_booking_type text default 'enrollment',
  p_trial_date date default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_team_class_id uuid;
  v_allow_trial boolean;
  v_booking_id uuid;
begin
  if not p_consent then
    raise exception 'CONSENT_REQUIRED';
  end if;

  if p_booking_type not in ('trial', 'enrollment') then
    raise exception 'INVALID_BOOKING_TYPE';
  end if;

  select team_class_id, allow_trial into v_team_class_id, v_allow_trial
    from class_schedules where id = p_schedule_id;
  if v_team_class_id is null then
    raise exception 'SCHEDULE_NOT_FOUND';
  end if;

  if p_booking_type = 'trial' then
    if p_trial_date is null then
      raise exception 'TRIAL_DATE_REQUIRED';
    end if;
    if not v_allow_trial then
      raise exception 'SCHEDULE_NOT_TRIAL';
    end if;
    if exists (
      select 1 from class_holidays
      where team_class_id = v_team_class_id and holiday_date = p_trial_date
    ) then
      raise exception 'HOLIDAY_DATE';
    end if;
  end if;

  update class_schedules
    set slot_capacity = slot_capacity - 1
    where id = p_schedule_id and (slot_capacity is null or slot_capacity > 0);

  if not found then
    raise exception 'FULL';
  end if;

  insert into bookings (
    parent_id, child_id, team_class_id, class_schedule_id, status,
    contact_phone, gender, height_cm, shoe_size_mm, residence, consent_agreed_at,
    booking_type, trial_date
  )
    values (
      auth.uid(), p_child_id, v_team_class_id, p_schedule_id, 'requested',
      nullif(trim(p_contact_phone), ''), p_gender, p_height_cm, p_shoe_size_mm,
      nullif(trim(p_residence), ''), now(), p_booking_type, p_trial_date
    )
    returning id into v_booking_id;

  return v_booking_id;
end;
$$;

-- ============ cancel_booking(): requested 취소 시 +1 ============
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
    update class_schedules
      set slot_capacity = slot_capacity + 1
      where id = v_schedule_id and slot_capacity is not null;
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

-- ============ respond_booking_cancel(): 승인 시 +1 ============
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
      set slot_capacity = slot_capacity + 1
      where id = v_booking.class_schedule_id and slot_capacity is not null;
  else
    update bookings set
      cancel_requested_at = null
    where id = p_booking_id;
  end if;
end;
$$;

-- ============ request_booking_change(): requested 상태는 즉시 반영, 시간대 이동 시 -1/+1 ============
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
    if p_schedule_id is not null and p_schedule_id <> v_booking.class_schedule_id then
      update class_schedules
        set slot_capacity = slot_capacity - 1
        where id = p_schedule_id and (slot_capacity is null or slot_capacity > 0);
      if not found then
        raise exception 'FULL';
      end if;
      update class_schedules
        set slot_capacity = slot_capacity + 1
        where id = v_booking.class_schedule_id and slot_capacity is not null;
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

-- ============ respond_booking_change(): 승인 시 시간대 이동에 맞춰 -1/+1 ============
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
        set slot_capacity = slot_capacity - 1
        where id = v_booking.requested_schedule_id and (slot_capacity is null or slot_capacity > 0);

      if not found then
        raise exception 'FULL';
      end if;

      update class_schedules
        set slot_capacity = slot_capacity + 1
        where id = v_booking.class_schedule_id and slot_capacity is not null;
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
