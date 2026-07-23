-- 클래스 삭제 버그 수정: teams_classes를 직접 delete()하면 bookings.team_class_id
-- FK(cascade 없음)에 걸려서, 완료/취소된 예약만 있어도 삭제가 막혔음.
-- "신청/확정" 상태의 활성 예약이 있을 때만 막고, 완료/취소된 예약은 클래스와 함께
-- 정리하도록 security definer RPC로 변경.
--
-- club_owners.sql의 RLS를 보면 클럽 운영자는 bookings/reviews에 대한 delete 권한이
-- 원래 없음(select/update만 있음) — 그래서 이 함수는 security definer로 만들고,
-- 호출자가 실제로 이 클래스가 속한 시설의 운영자인지 my_facility_id()로 직접 검증함.
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.
-- (schema.sql, club-owners.sql이 이미 적용되어 있어야 합니다 — my_facility_id() 재사용)

create or replace function delete_class(p_class_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_facility_id uuid;
  v_active_count int;
begin
  select facility_id into v_facility_id from teams_classes where id = p_class_id;
  if v_facility_id is null then
    raise exception 'CLASS_NOT_FOUND';
  end if;

  if v_facility_id <> my_facility_id() then
    raise exception 'NOT_ALLOWED';
  end if;

  select count(*) into v_active_count
    from bookings
    where team_class_id = p_class_id and status in ('requested', 'confirmed');

  if v_active_count > 0 then
    raise exception 'ACTIVE_BOOKINGS_EXIST';
  end if;

  -- 완료/취소된 예약과 거기 달린 리뷰는 클래스 삭제와 함께 정리
  delete from reviews where booking_id in (
    select id from bookings where team_class_id = p_class_id
  );
  delete from bookings where team_class_id = p_class_id;
  delete from teams_classes where id = p_class_id;
end;
$$;

grant execute on function delete_class(uuid) to authenticated;
