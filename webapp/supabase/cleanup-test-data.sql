-- 테스트 계정/데이터 정리 (일회성 스크립트, 2026-07-23).
-- 되돌릴 수 없으니 실행 전 대상이 맞는지 한번 더 확인하세요.
--
-- 삭제 대상:
--   1) testclub123, testcoach456 로그인 계정
--   2) 아이스웍스 역삼점 시설 + 거기 딸린 클래스/스케줄/예약/리뷰 전부
--   3) testcoach456(개인 코치 셀프 온보딩) 본인 명의 시설 + 거기 딸린
--      클래스/스케줄/예약/리뷰 전부

do $$
declare
  v_iceworks_id uuid;
  v_solo_coach_facility_id uuid;
begin
  select id into v_iceworks_id from facilities where name = '아이스웍스 역삼점';
  select facility_id into v_solo_coach_facility_id from club_owners where username = 'testcoach456';

  -- 로그인 계정 먼저 삭제 (club_owners는 auth.users에 on delete cascade라 같이 지워짐 —
  -- 이래야 club_owners.facility_id가 시설을 참조하고 있어서 생기는 FK 에러를 피할 수 있음)
  delete from auth.users where id in (
    select id from club_owners where username in ('testclub123', 'testcoach456')
  );

  -- 시설 2곳(아이스웍스 역삼점 + testcoach456 개인 시설)에 딸린 데이터 전부 삭제
  if v_iceworks_id is not null then
    delete from reviews where booking_id in (
      select b.id from bookings b
      join teams_classes tc on tc.id = b.team_class_id
      where tc.facility_id = v_iceworks_id
    );
    delete from bookings where team_class_id in (
      select id from teams_classes where facility_id = v_iceworks_id
    );
    delete from teams_classes where facility_id = v_iceworks_id;
    delete from instructors where facility_id = v_iceworks_id;
    delete from facilities where id = v_iceworks_id;
  end if;

  if v_solo_coach_facility_id is not null then
    delete from reviews where booking_id in (
      select b.id from bookings b
      join teams_classes tc on tc.id = b.team_class_id
      where tc.facility_id = v_solo_coach_facility_id
    );
    delete from bookings where team_class_id in (
      select id from teams_classes where facility_id = v_solo_coach_facility_id
    );
    delete from teams_classes where facility_id = v_solo_coach_facility_id;
    delete from instructors where facility_id = v_solo_coach_facility_id;
    delete from facilities where id = v_solo_coach_facility_id;
  end if;
end $$;
