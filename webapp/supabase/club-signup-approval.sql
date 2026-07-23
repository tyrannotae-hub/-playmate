-- 클럽/개인 코치 셀프 회원가입 신청 + 관리자 승인 시스템.
-- 지금까지는 club-owners.sql 주석대로 운영자가 scripts/create-club-owner.mjs,
-- scripts/create-solo-coach.mjs를 로컬에서 서비스 롤 키로 직접 실행해 계정을
-- 만들어줬는데, 이 파일은 그걸 "자기 신청 + 관리자 승인" 방식으로 대체한다.
--
-- 설계 핵심: 비밀번호를 평문으로 어떤 테이블에도 저장하지 않는다. 회원가입 신청
-- 시점에 실제 Supabase Auth 계정을 바로 만들고(비밀번호는 Supabase가 해시 저장),
-- club_signup_requests에는 그 auth 계정의 id만 참조로 남긴다. 관리자 승인 시점에는
-- 이미 만들어진 auth 계정에 facility/club_owners(+instructors) 행만 새로 연결한다.
-- 이러면 서비스 롤 키 없이 일반 클라이언트 + RLS + security definer RPC만으로
-- 전부 구현 가능하다 (이 프로젝트가 지금까지 써온 패턴과 동일).
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.
-- (schema.sql, club-owners.sql, solo-coach.sql 이 이미 적용되어 있어야 합니다)

-- ============================================================
-- 관리자 계정: 학부모(parents)/클럽(club_owners)과 완전히 독립된 인증.
-- 셀프 가입 없음 — scripts/create-admin.mjs로만 생성 (서비스 롤 키 필요).
-- ============================================================
create table admins (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  name text not null,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;

create policy "admin reads own row" on admins
  for select using (auth.uid() = id);

-- 현재 로그인한 계정이 관리자인지 (아래 정책들에서 재사용, security definer로 RLS 재귀 방지)
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists(select 1 from admins where id = auth.uid());
$$;

grant execute on function is_admin() to authenticated;

-- 관리자 아이디 로그인용 내부 이메일 조회 (get_club_login_email과 동일 패턴, 로그인 전이라 RLS 우회 필요)
create or replace function get_admin_login_email(p_username text)
returns text
language sql
security definer
stable
as $$
  select u.email from auth.users u
  join admins a on a.id = u.id
  where a.username = p_username;
$$;

grant execute on function get_admin_login_email(text) to anon, authenticated;

-- ============================================================
-- 클럽/개인 코치 회원가입 신청.
-- ============================================================
create table club_signup_requests (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  name text not null,
  owner_type text not null check (owner_type in ('club', 'solo_coach')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table club_signup_requests enable row level security;

-- 가입 신청 폼에서 signUp 직후 자기 auth_user_id로 신청 행을 넣는 것만 허용.
create policy "user inserts own signup request" on club_signup_requests
  for insert with check (auth.uid() = auth_user_id);

-- 관리자만 전체 신청 목록 조회 가능.
create policy "admin reads all signup requests" on club_signup_requests
  for select using (is_admin());

-- ============================================================
-- 승인/거절 RPC. 둘 다 is_admin() 체크를 함수 내부에서 하므로 RLS insert 정책이
-- 따로 없어도(=club_owners/instructors/facilities에 club_owner insert 정책이 없어도)
-- security definer로 안전하게 동작한다.
-- ============================================================
create or replace function approve_club_signup(p_request_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_req club_signup_requests%rowtype;
  v_facility_id uuid;
  v_facility_name text;
begin
  if not is_admin() then
    raise exception 'NOT_ALLOWED';
  end if;

  select * into v_req from club_signup_requests where id = p_request_id and status = 'pending';
  if v_req.id is null then
    raise exception 'REQUEST_NOT_FOUND';
  end if;

  v_facility_name := case when v_req.owner_type = 'solo_coach' then v_req.name || ' 코치' else v_req.name end;

  insert into facilities (name, address, owner_type)
    values (v_facility_name, '', v_req.owner_type)
    returning id into v_facility_id;

  insert into club_owners (id, facility_id, username, name)
    values (v_req.auth_user_id, v_facility_id, v_req.username, v_req.name);

  if v_req.owner_type = 'solo_coach' then
    insert into instructors (facility_id, name) values (v_facility_id, v_req.name);
  end if;

  update club_signup_requests set status = 'approved', reviewed_at = now() where id = p_request_id;
end;
$$;

grant execute on function approve_club_signup(uuid) to authenticated;

create or replace function reject_club_signup(p_request_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  if not is_admin() then
    raise exception 'NOT_ALLOWED';
  end if;
  update club_signup_requests set status = 'rejected', reviewed_at = now()
    where id = p_request_id and status = 'pending';
end;
$$;

grant execute on function reject_club_signup(uuid) to authenticated;
