-- 클래스:코치 다대다 관계
-- 클래스 하나에 코치가 여러 명 배정될 수 있도록 조인 테이블을 추가한다.
-- teams_classes.instructor_id 컬럼은 하위 호환을 위해 그대로 남겨두되(삭제하지 않음),
-- 이후 애플리케이션 코드에서는 class_instructors만 사용한다.
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하거나,
-- `npm run db:migrate -- supabase/class-instructors.sql` 로 적용하세요.
-- (schema.sql, club-owners.sql 이 이미 적용되어 있어야 합니다 — my_facility_id() 함수 사용)

create table class_instructors (
  team_class_id uuid not null references teams_classes(id) on delete cascade,
  instructor_id uuid not null references instructors(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (team_class_id, instructor_id)
);

alter table class_instructors enable row level security;

-- 공개 데이터: 누구나 읽기 가능 (클래스 상세/시설 홈 화면용)
create policy "class instructors readable by all" on class_instructors
  for select using (true);

-- 클럽 계정: 자기 시설 소속 클래스에 한해 코치 배정 관리 가능
create policy "club owner manages own class instructors" on class_instructors
  for all using (
    exists (select 1 from teams_classes tc where tc.id = team_class_id and tc.facility_id = my_facility_id())
  ) with check (
    exists (select 1 from teams_classes tc where tc.id = team_class_id and tc.facility_id = my_facility_id())
  );

-- ============ 기존 단일 강사 데이터 이관 ============
-- teams_classes.instructor_id 에 값이 있던 행들을 class_instructors 로 옮겨준다.
insert into class_instructors (team_class_id, instructor_id)
select id, instructor_id from teams_classes
where instructor_id is not null
on conflict do nothing;

-- teams_classes.instructor_id 컬럼은 하위 호환을 위해 남겨두지만(삭제 안 함), 더 이상
-- 애플리케이션에서 쓰지 않으므로 이 컬럼이 코치 삭제를 막지 않도록 on delete 동작을 set null로 변경.
alter table teams_classes drop constraint if exists teams_classes_instructor_id_fkey;
alter table teams_classes
  add constraint teams_classes_instructor_id_fkey
  foreign key (instructor_id) references instructors(id) on delete set null;

-- ============ Storage: 코치 프로필 사진 버킷 (공개 읽기, 클럽 계정만 자기 시설 폴더에 쓰기) ============
insert into storage.buckets (id, name, public)
values ('instructor-profiles', 'instructor-profiles', true)
on conflict (id) do nothing;

create policy "instructor profiles readable by all" on storage.objects
  for select using (bucket_id = 'instructor-profiles');

create policy "club owner uploads own instructor profiles" on storage.objects
  for insert with check (
    bucket_id = 'instructor-profiles'
    and (storage.foldername(name))[1] = my_facility_id()::text
  );

create policy "club owner updates own instructor profiles" on storage.objects
  for update using (
    bucket_id = 'instructor-profiles'
    and (storage.foldername(name))[1] = my_facility_id()::text
  );

create policy "club owner deletes own instructor profiles" on storage.objects
  for delete using (
    bucket_id = 'instructor-profiles'
    and (storage.foldername(name))[1] = my_facility_id()::text
  );
