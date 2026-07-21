-- 클럽(시설) 자체 관리 사이트 (에이블리 "내마켓" 같은 공급자용 셀프서비스 대시보드)
-- 기술아키텍처.md 12.3절 "공급자 셀프 온보딩 전환"을 앞당겨 구현.
-- 클럽 계정은 셀프 회원가입이 아니라 운영자(founder)가 Supabase 대시보드에서 직접 만들어줌
-- (요구사항정의서의 Founder-led Sales 온보딩 방식과 동일 — 계정만 수동, 이후 운영은 셀프).
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.
-- (schema.sql, auth-username.sql 이 이미 적용되어 있어야 합니다)

create table club_owners (
  id uuid primary key references auth.users(id) on delete cascade,
  facility_id uuid not null references facilities(id),
  username text unique not null,
  name text not null default '클럽 관리자',
  created_at timestamptz not null default now()
);

alter table club_owners enable row level security;

create policy "club owner reads own row" on club_owners
  for select using (auth.uid() = id);

-- 아이디 로그인용 내부 이메일 조회 (로그인 전이라 RLS 우회 필요)
create or replace function get_club_login_email(p_username text)
returns text
language sql
security definer
stable
as $$
  select u.email from auth.users u
  join club_owners co on co.id = u.id
  where co.username = p_username;
$$;

grant execute on function get_club_login_email(text) to anon, authenticated;

-- 현재 로그인한 클럽 계정의 facility_id (아래 정책들에서 재사용, security definer로 RLS 재귀 방지)
create or replace function my_facility_id()
returns uuid
language sql
security definer
stable
as $$
  select facility_id from club_owners where id = auth.uid();
$$;

grant execute on function my_facility_id() to authenticated;

-- ============ 시설: 자기 시설 정보 수정 ============
create policy "club owner updates own facility" on facilities
  for update using (id = my_facility_id()) with check (id = my_facility_id());

-- ============ 강사: 자기 시설 소속 강사 CRUD ============
create policy "club owner manages own instructors" on instructors
  for all using (facility_id = my_facility_id()) with check (facility_id = my_facility_id());

-- ============ 클래스: 자기 시설 클래스 CRUD ============
create policy "club owner manages own classes" on teams_classes
  for all using (facility_id = my_facility_id()) with check (facility_id = my_facility_id());

-- ============ 스케줄: 자기 시설 클래스의 스케줄 CRUD ============
create policy "club owner manages own schedules" on class_schedules
  for all using (
    exists (select 1 from teams_classes tc where tc.id = team_class_id and tc.facility_id = my_facility_id())
  ) with check (
    exists (select 1 from teams_classes tc where tc.id = team_class_id and tc.facility_id = my_facility_id())
  );

-- ============ 예약: 자기 시설 예약 조회/상태 변경(승인·거절·완료 처리) ============
create policy "club owner reads own bookings" on bookings
  for select using (
    exists (select 1 from teams_classes tc where tc.id = team_class_id and tc.facility_id = my_facility_id())
  );

create policy "club owner updates own bookings" on bookings
  for update using (
    exists (select 1 from teams_classes tc where tc.id = team_class_id and tc.facility_id = my_facility_id())
  ) with check (
    exists (select 1 from teams_classes tc where tc.id = team_class_id and tc.facility_id = my_facility_id())
  );

-- ============ 예약 처리에 필요한 최소 정보: 자기 시설 예약에 걸린 자녀 이름/생년월일 조회 ============
-- (13장 아동 개인정보보호 원칙 — 부모 신원은 노출하지 않고 자녀 이름/나이만)
create policy "club owner reads children on own bookings" on children
  for select using (
    exists (
      select 1 from bookings b
      join teams_classes tc on tc.id = b.team_class_id
      where b.child_id = children.id and tc.facility_id = my_facility_id()
    )
  );
