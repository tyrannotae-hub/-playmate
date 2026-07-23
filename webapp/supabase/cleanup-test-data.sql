-- 테스트 계정/데이터 정리 (일회성 스크립트, 2026-07-23).
-- 되돌릴 수 없으니 실행 전 대상이 맞는지 한번 더 확인하세요.
--
-- 삭제 대상:
--   1) 아이스웍스 역삼점 시설 + 거기 딸린 클래스/스케줄/예약/리뷰 전부
--   2) testclub123, testcoach456 로그인 계정 (club_owners는 auth.users에
--      on delete cascade 걸려있어서 auth.users만 지우면 같이 지워짐)
--
-- 주의: testcoach456(개인 코치 셀프 온보딩 계정)에 연결된 "본인 명의 시설"과
-- 거기 등록된 테스트 클래스는 이 스크립트가 지우지 않습니다 — 로그인 계정만
-- 지워지고 시설/클래스 데이터는 주인 없는 상태로 검색에 남을 수 있어요.
-- 그것까지 지우고 싶으면 별도로 알려주세요.

do $$
declare
  v_facility_id uuid;
begin
  select id into v_facility_id from facilities where name = '아이스웍스 역삼점';

  if v_facility_id is not null then
    -- 리뷰 (해당 시설 클래스에 달린 예약의 리뷰)
    delete from reviews where booking_id in (
      select b.id from bookings b
      join teams_classes tc on tc.id = b.team_class_id
      where tc.facility_id = v_facility_id
    );

    -- 예약 (class_schedules/teams_classes를 지우기 전에 먼저 지워야 FK 에러 안 남)
    delete from bookings where team_class_id in (
      select id from teams_classes where facility_id = v_facility_id
    );

    -- 클래스 (schedules/class_instructors/class_images/wishlists는 on delete cascade로 자동 삭제)
    delete from teams_classes where facility_id = v_facility_id;

    -- 강사
    delete from instructors where facility_id = v_facility_id;

    -- 시설 (facility_notices는 on delete cascade로 자동 삭제)
    delete from facilities where id = v_facility_id;
  end if;
end $$;

-- 테스트 로그인 계정 (club_owners는 auth.users 삭제 시 cascade로 같이 삭제됨)
delete from auth.users where id in (
  select id from club_owners where username in ('testclub123', 'testcoach456')
);
