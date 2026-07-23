-- 예약 신청 시 수집하는 정보 확장: 성별, 키, 발사이즈, 거주지(선택), 개인정보 동의.
-- (기존에는 연락처만 선택으로 받았음)
--
-- request_booking()은 booking-contact-phone.sql이 만든
-- request_booking(uuid, uuid, text) [p_contact_phone] 시그니처를 대체함.
-- 파라미터 개수가 바뀔 때마다 이전 시그니처를 명시적으로 drop해야
-- PostgREST가 오버로드를 헷갈려하지 않음(2026-07-23 예약 실패 장애 원인 참고).
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.

alter table bookings add column if not exists gender text check (gender in ('male', 'female'));
alter table bookings add column if not exists height_cm smallint;
alter table bookings add column if not exists shoe_size_mm smallint;
alter table bookings add column if not exists residence text;
alter table bookings add column if not exists consent_agreed_at timestamptz;

drop function if exists request_booking(uuid, uuid, text);

create or replace function request_booking(
  p_child_id uuid,
  p_schedule_id uuid,
  p_contact_phone text default null,
  p_gender text default null,
  p_height_cm smallint default null,
  p_shoe_size_mm smallint default null,
  p_residence text default null,
  p_consent boolean default false
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
    contact_phone, gender, height_cm, shoe_size_mm, residence, consent_agreed_at
  )
    values (
      auth.uid(), p_child_id, v_team_class_id, p_schedule_id, 'requested',
      nullif(trim(p_contact_phone), ''), p_gender, p_height_cm, p_shoe_size_mm,
      nullif(trim(p_residence), ''), now()
    )
    returning id into v_booking_id;

  return v_booking_id;
end;
$$;

grant execute on function request_booking(uuid, uuid, text, text, smallint, smallint, text, boolean) to authenticated;
