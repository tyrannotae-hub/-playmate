-- 클래스관리센터 확장: 원데이 가격 공개/비공개, 클래스 할인(기간 지정),
-- 원데이 체험의 매주 요일 반복, 휴일(운영 제외일) 설정.
--
-- teams_classes에 5개 컬럼 추가:
--   show_trial_price     : 체험 가격을 학부모 화면에 노출할지 여부 (기본 true).
--                          기존 show_price는 "정가" 노출 여부라 체험가와 독립적으로
--                          켜고 끌 수 있어야 해서 별도 컬럼으로 분리함.
--   discount_price        : 할인 적용 가격(선택). null이면 할인 없음.
--   discount_start_date   : 할인 시작일(포함)
--   discount_end_date     : 할인 종료일(포함) — 오늘 날짜가 [시작,종료] 구간에 있을 때만
--                          discount_price를 정가 대신 보여줌.
--   trial_day_label       : 원데이 체험도 매주 특정 요일에 반복해서 열 수 있게 하는
--                          요일 패턴(day_label과 동일한 "월,수,금" 콤마 축약 포맷).
--                          null/빈 문자열이면 반복 없음(기존처럼 class_trial_dates에
--                          운영자가 등록한 개별 날짜만 사용).
--
-- 새 테이블 class_holidays: 클래스별로 특정 날짜를 "휴무"로 지정해서, 위
-- trial_day_label로 자동 계산되는 반복 날짜 목록에서 해당 날짜를 제외하기 위함
-- (예: 매주 토요일 반복이지만 공휴일 한 주는 쉬는 경우).
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.

alter table teams_classes add column if not exists show_trial_price boolean not null default true;
alter table teams_classes add column if not exists discount_price integer;
alter table teams_classes add column if not exists discount_start_date date;
alter table teams_classes add column if not exists discount_end_date date;
alter table teams_classes add column if not exists trial_day_label text;

create table if not exists class_holidays (
  id uuid primary key default gen_random_uuid(),
  team_class_id uuid not null references teams_classes(id) on delete cascade,
  holiday_date date not null,
  unique (team_class_id, holiday_date)
);

alter table class_holidays enable row level security;

-- 학부모가 예약 폼에서 체험 가능 날짜를 계산할 때 휴일을 제외해야 하므로 공개 조회.
drop policy if exists "class holidays readable by all" on class_holidays;
create policy "class holidays readable by all" on class_holidays
  for select using (true);

-- 클럽 운영자는 자기 시설 클래스의 휴일만 추가/삭제 가능.
drop policy if exists "club owner manages own class holidays" on class_holidays;
create policy "club owner manages own class holidays" on class_holidays
  for all using (
    exists (select 1 from teams_classes tc where tc.id = team_class_id and tc.facility_id = my_facility_id())
  ) with check (
    exists (select 1 from teams_classes tc where tc.id = team_class_id and tc.facility_id = my_facility_id())
  );
