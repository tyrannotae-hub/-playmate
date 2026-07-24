-- 원데이(체험) 가능 여부를 클래스 단위(teams_classes.allow_trial/trial_day_label)에서
-- 시간대 단위(class_schedules)로 옮긴다.
--
-- 배경: 한 클래스 안에 정규 시간대와 원데이 시간대가 함께 있는 경우가 많음(예: 월요일
-- 4시는 정규만, 수요일 6시는 원데이 체험도 가능). class_schedules는 이미 day_label을
-- 갖고 있으므로, "원데이 반복 요일"은 그 schedule 자신의 day_label을 그대로 쓰면 되고
-- 별도 trial_day_label이 필요 없어진다. 개별 날짜 등록(class_trial_dates)도 요일 반복
-- 계산만으로 충분해서 함께 제거한다 — 애초에 이 테이블 때문에 "trial_day_label만 설정하고
-- class_trial_dates를 안 채우면 예약 변경 시 가능한 날짜가 없다고 나오는" 버그가 있었음
-- (request_booking()/request_booking_change()가 trial_day_label 도입 이후에도 계속
-- class_trial_dates 존재 여부만 검증하고 있었음).
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.

alter table class_schedules add column if not exists allow_trial boolean not null default false;

-- 기존에 클래스 단위로 allow_trial=true였던 클래스는 보수적으로 그 클래스의 모든
-- 시간대를 원데이 가능으로 백필한다(운영자가 새 관리 화면에서 필요시 시간대별로 끔).
update class_schedules cs
set allow_trial = true
from teams_classes tc
where cs.team_class_id = tc.id and tc.allow_trial = true;

drop table if exists class_trial_dates;

alter table teams_classes drop column if exists trial_day_label;
alter table teams_classes drop column if exists allow_trial;

-- request_booking(): class_trial_dates 검증을 제거하고, 해당 시간대(class_schedules)가
-- 원데이 가능(allow_trial)한지 + 그 날짜가 휴일(class_holidays)이 아닌지로 대체.
-- 파라미터 목록은 그대로라 drop 없이 create or replace만으로 충분.
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
    set slot_booked_count = slot_booked_count + 1
    where id = p_schedule_id and slot_booked_count < slot_capacity;

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

grant execute on function request_booking(uuid, uuid, text, text, smallint, smallint, text, boolean, text, date) to authenticated;

-- request_booking_change(): 마찬가지로 class_trial_dates 대신 대상 시간대의 allow_trial +
-- class_holidays로 검증.
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

  update bookings set
    requested_schedule_id = p_schedule_id,
    requested_trial_date = p_trial_date,
    change_requested_at = now(),
    change_note = nullif(trim(coalesce(p_note, '')), '')
  where id = p_booking_id;
end;
$$;

grant execute on function request_booking_change(uuid, uuid, date, text) to authenticated;
