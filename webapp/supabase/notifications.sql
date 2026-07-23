-- 인앱 알림 (예약 확정/취소/완료 등) — 요구사항정의서.md 6장/8장
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.
-- (schema.sql, club-owners.sql 이 이미 적용되어 있어야 합니다 — my_facility_id() 함수를 재사용)

create table notifications (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references parents(id) on delete cascade,
  booking_id uuid references bookings(id) on delete cascade,
  type text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table notifications enable row level security;

-- 학부모 본인 알림만 조회 가능
create policy "notifications scoped to parent" on notifications
  for select using (auth.uid() = parent_id);

-- 학부모 본인 알림만 읽음 처리(read_at) 가능
create policy "notifications updatable by parent" on notifications
  for update using (auth.uid() = parent_id) with check (auth.uid() = parent_id);

-- insert는 예약 상태 변경 API(api/bookings/[id]/status)에서 club 운영자 세션으로 수행됨.
-- club 운영자가 "자기 시설"의 예약에 한해서만, 그리고 그 예약의 실제 parent_id로만
-- 알림을 만들 수 있도록 booking_id 기준으로 검증 (parent_id 스푸핑 방지).
create policy "club owner inserts notifications for own bookings" on notifications
  for insert with check (
    exists (
      select 1 from bookings b
      join teams_classes tc on tc.id = b.team_class_id
      where b.id = notifications.booking_id
        and b.parent_id = notifications.parent_id
        and tc.facility_id = my_facility_id()
    )
  );

create index notifications_parent_created_idx on notifications (parent_id, created_at desc);
