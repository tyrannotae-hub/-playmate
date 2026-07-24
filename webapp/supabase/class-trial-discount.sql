-- 원데이(체험) 가격에도 할인가를 걸 수 있도록 컬럼 추가.
--
--   trial_discount_price : 원데이 체험의 할인 적용 가격(선택). null이면 체험가 할인 없음.
--                          할인 기간은 정가 할인과 동일하게 discount_start_date/
--                          discount_end_date를 공유한다(하나의 프로모션 기간에 정가·
--                          체험가를 함께 할인하는 것이 자연스러운 사용 흐름이라 판단해
--                          별도 기간 컬럼을 추가하지 않았다).
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.

alter table teams_classes add column if not exists trial_discount_price integer;
