-- 랜딩페이지 사전등록/입점문의 저장용 테이블
create table leads (
  id uuid primary key default gen_random_uuid(),
  audience text not null check (audience in ('parent','partner')),
  name text,
  phone text,
  child_age text,
  interest_sport text,
  facility_name text,
  contact_name text,
  region text,
  message text,
  created_at timestamptz not null default now()
);

alter table leads enable row level security;

-- 누구나 제출(insert)은 가능하지만, 읽기/수정/삭제는 불가 (운영자는 Supabase 대시보드에서 직접 확인)
create policy "anyone can submit a lead" on leads
  for insert
  to anon
  with check (true);
