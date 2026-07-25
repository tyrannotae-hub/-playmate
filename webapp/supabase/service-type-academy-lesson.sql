-- 학부모 앱을 "아카데미"/"레슨" 두 갈래로 분리하는 작업의 데이터 기반.
-- classType(individual/group/team)은 인원 형태일 뿐 이 구분과 무관함(레슨도
-- 그룹으로 진행될 수 있음) — 그래서 별도 필드로 관리한다.
--
-- - facilities.offers_academy/offers_lesson: 이 시설(클럽/코치)이 아카데미・레슨 중
--   무엇을 운영할 자격이 있는지(가입 시 신청 → 관리자 승인). 나중에 수익화 시
--   유형별로 다른 정산/증빙 기준을 적용할 수 있도록 미리 분리해둠. 한 시설이 둘 다
--   가능(예: 팀 클럽 운영자가 개인 레슨도 여는 경우).
-- - teams_classes.service_type: 클래스 하나하나가 실제로 아카데미인지 레슨인지는
--   운영자가 클래스 등록/수정 시 직접 고른다(자동 판별 아님). 시설이 하나만
--   가능하면 자동으로 그 값으로 고정.
-- - club_signup_requests.wants_academy/wants_lesson/business_reg_number: 가입 신청
--   시점에 어떤 자격을 신청하는지 + (선택) 사업자등록번호. 관리자가 승인하면
--   신청한 자격 그대로 facilities.offers_*에 반영됨.
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.
-- (schema.sql, club-signup-approval.sql이 먼저 적용되어 있어야 합니다)

alter table facilities add column if not exists offers_academy boolean not null default true;
alter table facilities add column if not exists offers_lesson boolean not null default false;

alter table teams_classes add column if not exists service_type text not null default 'academy'
  check (service_type in ('academy', 'lesson'));
create index if not exists teams_classes_service_type_idx on teams_classes (service_type);

alter table club_signup_requests add column if not exists wants_academy boolean not null default true;
alter table club_signup_requests add column if not exists wants_lesson boolean not null default false;
alter table club_signup_requests add column if not exists business_reg_number text;

-- approve_club_signup()은 파라미터가 그대로라 create or replace만으로 충분(드랍 불필요).
-- 신청한 자격(wants_academy/wants_lesson)을 그대로 facilities.offers_*에 반영하도록 갱신.
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

  insert into facilities (name, address, owner_type, offers_academy, offers_lesson)
    values (v_facility_name, '', v_req.owner_type, v_req.wants_academy, v_req.wants_lesson)
    returning id into v_facility_id;

  insert into club_owners (id, facility_id, username, name)
    values (v_req.auth_user_id, v_facility_id, v_req.username, v_req.name);

  if v_req.owner_type = 'solo_coach' then
    insert into instructors (facility_id, name) values (v_facility_id, v_req.name);
  end if;

  update club_signup_requests set status = 'approved', reviewed_at = now() where id = p_request_id;
end;
$$;
