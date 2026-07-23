-- "체험(원데이) 신청" 예약 타입 추가.
--
-- 배경: 아이스하키 등 일부 종목은 정식 등록(매주 반복 참여, 월 결제) 전에
-- 원데이 체험 1회권으로 먼저 참여해보고 등록 여부를 결정하는 경우가 많음.
-- 기존 request_booking()은 "월 정기 등록" 개념 하나만 다뤄서 체험 신청 시
-- 정확히 어느 날짜에 참여하는지 남길 방법이 없었음. booking_type과
-- trial_date를 추가해 체험/정기 등록을 구분하고, 체험이면 실제 참여 날짜를
-- 저장한다. 체험도 정기 등록과 동일하게 slot_booked_count 정원을 공유해서
-- 소비한다(체험 전용 별도 정원 관리는 이번 스코프 아님).
--
-- request_booking()은 오늘(2026-07-23) 하루에만 시그니처가 세 번 바뀌었음:
--   1) booking-contact-phone.sql: (uuid, uuid, text) [p_contact_phone]
--   2) booking-registration-details.sql: (uuid, uuid, text, text, smallint, smallint, text, boolean)
--      [+ p_gender, p_height_cm, p_shoe_size_mm, p_residence, p_consent]
--   3) 이 파일: 위 8개 파라미터 시그니처에 p_booking_type, p_trial_date 추가
-- PostgREST는 파라미터 개수/이름이 다르면 별개 오버로드로 인식해 함수를 못 정하고
-- "Could not choose the best candidate function" 에러를 내므로(오늘 이미 한 번
-- 겪은 장애, fix-request-booking-overload.sql 참고), create or replace 전에
-- 반드시 실제 DB에 남아있는 최신 시그니처(8개 파라미터 버전)를 명시적으로
-- drop function if exists로 지정해서 지운다.
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.

alter table bookings add column if not exists booking_type text not null default 'enrollment' check (booking_type in ('trial', 'enrollment'));
alter table bookings add column if not exists trial_date date;

drop function if exists request_booking(uuid, uuid, text, text, smallint, smallint, text, boolean);

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
  v_booking_id uuid;
begin
  if not p_consent then
    raise exception 'CONSENT_REQUIRED';
  end if;

  if p_booking_type not in ('trial', 'enrollment') then
    raise exception 'INVALID_BOOKING_TYPE';
  end if;

  if p_booking_type = 'trial' and p_trial_date is null then
    raise exception 'TRIAL_DATE_REQUIRED';
  end if;

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
