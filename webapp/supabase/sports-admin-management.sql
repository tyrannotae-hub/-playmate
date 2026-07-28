-- 종목(sports) 추가/수정/삭제를 관리자 대시보드에서 할 수 있게 RLS 추가.
-- 기존엔 select 정책만 있어서(schema.sql) 새 종목을 추가하려면 매번 SQL을
-- 직접 실행해야 했음 — is_admin()은 club-signup-approval.sql에서 이미 정의됨.

create policy "admin manages sports" on sports
  for insert with check (is_admin());

create policy "admin updates sports" on sports
  for update using (is_admin());

create policy "admin deletes sports" on sports
  for delete using (is_admin());
