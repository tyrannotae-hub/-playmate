-- 원데이 휴무를 클래스 단위가 아니라 시간대(class_schedules) 단위로도 지정할 수 있게
-- class_holidays에 nullable class_schedule_id를 추가한다.
--
-- 배경: 한 클래스에 원데이 가능한 시간대가 2개 이상(예: 토요일 10시, 토요일 14시)일 때,
-- 관리센터의 "원데이 클래스 관리" 달력에서 한 시간대만 휴무로 켜도 class_holidays가
-- team_class_id+날짜로만 저장돼 있어서 같은 클래스의 다른 시간대까지 같이 휴무 처리되던
-- 문제가 있었음.
--
-- class_schedule_id가 null이면 기존처럼 "그 날은 클래스 전체 휴무"(예: 공휴일)를 뜻하고,
-- 값이 있으면 "그 시간대만 그 날 원데이 휴무"를 뜻한다. 기존 unique(team_class_id,
-- holiday_date) 제약은 시간대별로 여러 행이 같은 날짜를 가질 수 있어야 하므로 제거하고,
-- "전체휴무" 행과 "시간대별휴무" 행 각각에 맞는 부분 유니크 인덱스로 대체한다.
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.

alter table class_holidays add column if not exists class_schedule_id uuid references class_schedules(id) on delete cascade;

alter table class_holidays drop constraint if exists class_holidays_team_class_id_holiday_date_key;

create unique index if not exists class_holidays_whole_class_unique
  on class_holidays (team_class_id, holiday_date)
  where class_schedule_id is null;

create unique index if not exists class_holidays_per_schedule_unique
  on class_holidays (class_schedule_id, holiday_date)
  where class_schedule_id is not null;
