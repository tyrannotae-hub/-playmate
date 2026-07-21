-- PlayMate MVP 스키마
-- 기술아키텍처.md 3장 데이터 모델을 Supabase(Postgres)로 구현
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.

create extension if not exists pgcrypto;

-- ============ 학부모 / 자녀 ============
-- parents.id 는 Supabase Auth(auth.users)의 id를 그대로 사용 (이메일 로그인 1:1 매핑)
create table parents (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text not null default '학부모',
  address text,
  region_code text,
  created_at timestamptz not null default now()
);

create table children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references parents(id) on delete cascade,
  name text not null,
  birth_date date not null,
  gender text,
  temperament_tags text[] not null default '{}',
  interest_tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ============ 종목 / 공급자 (Admin이 Supabase Studio에서 직접 입력) ============
create table sports (
  id text primary key,
  name text not null,
  emoji text,
  category text,
  traits text[] not null default '{}'
);

create table facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  region_code text,
  lat numeric,
  lng numeric,
  phone text,
  description text,
  subscription_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table instructors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  facility_id uuid references facilities(id),
  bio text,
  career_years smallint,
  certification_verified boolean not null default false,
  certified_by text,
  profile_image_url text,
  subscription_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table teams_classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sport_id text not null references sports(id),
  facility_id uuid not null references facilities(id),
  instructor_id uuid references instructors(id),
  age_min smallint,
  age_max smallint,
  class_type text not null check (class_type in ('individual','group','team')),
  price integer not null,
  price_unit text not null default '월',
  created_at timestamptz not null default now()
);

create table class_schedules (
  id uuid primary key default gen_random_uuid(),
  team_class_id uuid not null references teams_classes(id) on delete cascade,
  day_label text not null,
  time_label text not null,
  slot_capacity smallint not null,
  slot_booked_count smallint not null default 0
);

-- ============ 예약 / 리뷰 ============
create table bookings (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references parents(id),
  child_id uuid not null references children(id),
  team_class_id uuid not null references teams_classes(id),
  class_schedule_id uuid not null references class_schedules(id),
  status text not null default 'requested' check (status in ('requested','confirmed','completed','cancelled')),
  requested_at timestamptz not null default now(),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text,
  matching_fee_applied boolean not null default false
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references bookings(id),
  parent_id uuid not null references parents(id),
  target_type text not null check (target_type in ('facility','instructor','team_class')),
  target_id uuid not null,
  rating smallint not null check (rating between 1 and 5),
  content text,
  photo_urls text[] not null default '{}',
  -- 작성자 실명 대신 공개 닉네임만 저장 (13장 아동 개인정보보호 원칙 — parents 테이블은 본인만 조회 가능하므로 조인 없이 노출)
  author_label text not null default '학부모',
  created_at timestamptz not null default now()
);

-- ============ 예약 신청 RPC (슬롯 동시성 처리, 기술아키텍처.md 3장 참고) ============
create or replace function request_booking(p_child_id uuid, p_schedule_id uuid)
returns uuid
language plpgsql
security definer
as $$
declare
  v_team_class_id uuid;
  v_booking_id uuid;
begin
  select team_class_id into v_team_class_id from class_schedules where id = p_schedule_id;
  if v_team_class_id is null then
    raise exception 'SCHEDULE_NOT_FOUND';
  end if;

  update class_schedules
    set slot_booked_count = slot_booked_count + 1
    where id = p_schedule_id and slot_booked_count < slot_capacity;

  if not found then
    raise exception 'FULL';
  end if;

  insert into bookings (parent_id, child_id, team_class_id, class_schedule_id, status)
    values (auth.uid(), p_child_id, v_team_class_id, p_schedule_id, 'requested')
    returning id into v_booking_id;

  return v_booking_id;
end;
$$;

-- ============ Row Level Security ============
alter table parents enable row level security;
alter table children enable row level security;
alter table sports enable row level security;
alter table facilities enable row level security;
alter table instructors enable row level security;
alter table teams_classes enable row level security;
alter table class_schedules enable row level security;
alter table bookings enable row level security;
alter table reviews enable row level security;

-- 공개 데이터: 누구나 읽기 가능 (검색/상세 화면용)
create policy "sports readable by all" on sports for select using (true);
create policy "facilities readable by all" on facilities for select using (true);
create policy "instructors readable by all" on instructors for select using (true);
create policy "classes readable by all" on teams_classes for select using (true);
create policy "schedules readable by all" on class_schedules for select using (true);
create policy "reviews readable by all" on reviews for select using (true);

-- 학부모 본인 데이터만 접근 (13장 아동 개인정보보호 요건)
create policy "parents manage own row" on parents
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "children scoped to parent" on children
  for all using (auth.uid() = parent_id) with check (auth.uid() = parent_id);

create policy "bookings scoped to parent" on bookings
  for select using (auth.uid() = parent_id);

-- 예약 생성은 반드시 request_booking() RPC를 통해서만 (직접 insert 금지 → 슬롯 카운트 우회 방지)

-- 리뷰는 실제로 완료된 자기 예약에 한해서만 작성 가능 (4.2절 어뷰징 방지)
create policy "reviews insertable by owner of completed booking" on reviews
  for insert with check (
    auth.uid() = parent_id
    and exists (
      select 1 from bookings b
      where b.id = booking_id
        and b.parent_id = auth.uid()
        and b.status = 'completed'
    )
  );

-- 신규 가입 시 parents 행 자동 생성
create or replace function handle_new_parent()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.parents (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_parent();
