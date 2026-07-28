-- 클럽 계정 탈퇴: 인스타그램으로 직접 영업해 온 파트너 클럽들의 오프보딩 플로우.
-- club-signup-approval.sql과 동일한 "본인 신청 → 관리자 검토 → 승인/거절" 패턴을 그대로 재사용한다.
--
-- 설계 핵심: 예약/리뷰 이력이 있는 시설을 하드 삭제하면 안 된다.
--   - teams_classes.facility_id references facilities(id) 에 on delete cascade가 없어서
--     (schema.sql) 클래스가 하나라도 있으면 raw DELETE는 FK 위반으로 실패한다.
--   - 설사 강제로 지운다 해도 예약 이력/리뷰가 통째로 사라지는 건 원치 않는 결과다.
--   따라서 facilities는 절대 지우지 않고 status만 'withdrawn'으로 바꾼다("소프트 비활성화").
--   parent(학부모)에게 노출되는 조회(webapp/src/lib/data.ts)만 status='withdrawn'인
--   시설/클래스를 걸러내고, 클럽 본인 대시보드・관리자 화면은 그대로 다 보인다
--   (RLS가 이미 owner를 자기 facility로 한정해두고, 관리자는 이력 관리를 위해 봐야 하므로).
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.
-- (schema.sql, club-owners.sql, club-signup-approval.sql이 이미 적용되어 있어야 합니다
--  — my_facility_id(), is_admin()을 그대로 재사용하고 여기서 다시 정의하지 않음)

alter table facilities add column if not exists status text not null default 'active'
  check (status in ('active', 'withdrawn'));

-- ============================================================
-- 탈퇴 신청.
-- ============================================================
create table club_withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references facilities(id),
  requested_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz
);

alter table club_withdrawal_requests enable row level security;

-- 클럽 운영자: 자기 시설 이름으로 탈퇴 신청 등록/조회 (신청 가능 여부 확인용으로도 필요).
create policy "club owner inserts own withdrawal request" on club_withdrawal_requests
  for insert with check (facility_id = my_facility_id());

create policy "club owner reads own withdrawal requests" on club_withdrawal_requests
  for select using (facility_id = my_facility_id());

-- 관리자: 전체 신청 조회/처리.
create policy "admin reads all withdrawal requests" on club_withdrawal_requests
  for select using (is_admin());

create policy "admin updates all withdrawal requests" on club_withdrawal_requests
  for update using (is_admin());

-- ============================================================
-- 클럽 운영자: 탈퇴 신청. 진행 중(requested/confirmed) 예약이 하나라도 있으면 막는다
-- (완료/취소된 예약은 이력이라 상관없음).
-- ============================================================
create or replace function request_club_withdrawal()
returns void
language plpgsql
security definer
as $$
declare
  v_facility_id uuid;
begin
  v_facility_id := my_facility_id();
  if v_facility_id is null then
    raise exception 'NOT_ALLOWED';
  end if;

  if exists (
    select 1
    from bookings b
    join teams_classes tc on tc.id = b.team_class_id
    where tc.facility_id = v_facility_id
      and b.status in ('requested', 'confirmed')
  ) then
    raise exception 'ACTIVE_BOOKINGS_EXIST';
  end if;

  if exists (
    select 1 from club_withdrawal_requests
    where facility_id = v_facility_id and status = 'pending'
  ) then
    raise exception 'ALREADY_REQUESTED';
  end if;

  insert into club_withdrawal_requests (facility_id) values (v_facility_id);
end;
$$;

grant execute on function request_club_withdrawal() to authenticated;

-- ============================================================
-- 관리자: 승인/거절. approve는 시설 status를 withdrawn으로 바꾸는 것 외에는
-- 아무것도 지우지 않는다(클래스/예약/리뷰 이력 전부 그대로 보존).
-- ============================================================
create or replace function approve_club_withdrawal(p_request_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_req club_withdrawal_requests%rowtype;
begin
  if not is_admin() then
    raise exception 'NOT_ALLOWED';
  end if;

  select * into v_req from club_withdrawal_requests where id = p_request_id and status = 'pending';
  if v_req.id is null then
    raise exception 'REQUEST_NOT_FOUND';
  end if;

  update facilities set status = 'withdrawn' where id = v_req.facility_id;
  update club_withdrawal_requests set status = 'approved', reviewed_at = now() where id = p_request_id;
end;
$$;

grant execute on function approve_club_withdrawal(uuid) to authenticated;

create or replace function reject_club_withdrawal(p_request_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  if not is_admin() then
    raise exception 'NOT_ALLOWED';
  end if;
  update club_withdrawal_requests set status = 'rejected', reviewed_at = now()
    where id = p_request_id and status = 'pending';
end;
$$;

grant execute on function reject_club_withdrawal(uuid) to authenticated;
