-- ⚠️ 부분 대체됨(supabase/README.md 참고): class_trial_dates 테이블과
-- teams_classes.allow_trial은 class-schedule-trial-toggle.sql에서 삭제됨.
-- trial_price/show_price 컬럼은 계속 유효.
--
-- 클래스 개설 시 "원데이 체험" 옵션 지원.
--
-- teams_classes에 3개 컬럼 추가:
--   allow_trial   : 이 클래스가 원데이 체험을 받는지 여부 (기본 false)
--   trial_price   : 체험 전용 가격(선택, 정가와 다르게 설정 가능)
--   show_price    : 정가를 학부모 화면에 그대로 공개할지 여부 (기본 true,
--                   false면 프론트에서 "가격 문의"로 대체 표시)
--
-- 체험 가능 날짜는 클래스마다 운영자가 직접 지정(요일 패턴에서 자동 계산하지
-- 않음 — 특정 날짜만 체험을 열어두고 싶을 수 있어서)하는 새 테이블
-- class_trial_dates로 관리. 운영자가 나중에 언제든 추가/삭제(수정) 가능.
--
-- request_booking()은 파라미터 목록(개수/이름/타입)이 그대로라 create or
-- replace만으로 충분함 — drop 불필요(오늘 여러 번 있었던 오버로드 충돌은
-- 파라미터 목록 자체가 바뀔 때만 해당).
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.
-- (booking-trial.sql이 먼저 적용되어 있어야 합니다)

alter table teams_classes add column if not exists allow_trial boolean not null default false;
alter table teams_classes add column if not exists trial_price integer;
alter table teams_classes add column if not exists show_price boolean not null default true;

create table if not exists class_trial_dates (
  id uuid primary key default gen_random_uuid(),
  team_class_id uuid not null references teams_classes(id) on delete cascade,
  trial_date date not null,
  unique (team_class_id, trial_date)
);

alter table class_trial_dates enable row level security;

-- 학부모가 예약 폼에서 골라야 하므로 공개 조회
drop policy if exists "class trial dates readable by all" on class_trial_dates;
create policy "class trial dates readable by all" on class_trial_dates
  for select using (true);

-- 클럽 운영자는 자기 시설 클래스의 체험 날짜만 추가/삭제 가능
drop policy if exists "club owner manages own class trial dates" on class_trial_dates;
create policy "club owner manages own class trial dates" on class_trial_dates
  for all using (
    exists (select 1 from teams_classes tc where tc.id = team_class_id and tc.facility_id = my_facility_id())
  ) with check (
    exists (select 1 from teams_classes tc where tc.id = team_class_id and tc.facility_id = my_facility_id())
  );

-- request_booking(): 체험 신청이면 trial_date가 운영자가 실제로 열어둔
-- class_trial_dates에 속하는 날짜인지 서버에서도 한 번 더 검증(아무 날짜나
-- 클라이언트에서 조작해서 보내는 것 방지).
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

  select team_class_id into v_team_class_id from class_schedules where id = p_schedule_id;
  if v_team_class_id is null then
    raise exception 'SCHEDULE_NOT_FOUND';
  end if;

  if p_booking_type = 'trial' then
    if p_trial_date is null then
      raise exception 'TRIAL_DATE_REQUIRED';
    end if;
    if not exists (
      select 1 from class_trial_dates
      where team_class_id = v_team_class_id and trial_date = p_trial_date
    ) then
      raise exception 'INVALID_TRIAL_DATE';
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
