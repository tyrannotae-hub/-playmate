-- 원데이(체험) 할인 기간을 정가 할인 기간과 독립적으로 지정할 수 있도록 컬럼 추가.
-- 기존엔 discount_start_date/discount_end_date를 정가 할인과 공유했는데, 운영 중
-- "정가는 할인 안 하고 체험만 할인 기간을 다르게 걸고 싶다"는 요구가 있어 분리한다.

alter table teams_classes add column if not exists trial_discount_start_date date;
alter table teams_classes add column if not exists trial_discount_end_date date;
