-- 제니스 스포츠클럽 아이스링크 시설 삭제 (일회성 스크립트, 2026-07-23).
-- 되돌릴 수 없으니 실행 전 대상이 맞는지 한번 더 확인하세요.

do $$
declare
  v_facility_id uuid;
begin
  select id into v_facility_id from facilities where name = '제니스 스포츠클럽 아이스링크';

  if v_facility_id is not null then
    -- 혹시 이 시설에 연결된 클럽 로그인 계정이 있으면(현재는 없는 것으로 알고 있지만
    -- 안전하게) facilities를 지우기 전에 먼저 지워야 FK 에러가 안 남
    delete from club_owners where facility_id = v_facility_id;

    delete from reviews where booking_id in (
      select b.id from bookings b
      join teams_classes tc on tc.id = b.team_class_id
      where tc.facility_id = v_facility_id
    );
    delete from bookings where team_class_id in (
      select id from teams_classes where facility_id = v_facility_id
    );
    delete from teams_classes where facility_id = v_facility_id;
    delete from instructors where facility_id = v_facility_id;
    delete from facilities where id = v_facility_id;
  end if;
end $$;
