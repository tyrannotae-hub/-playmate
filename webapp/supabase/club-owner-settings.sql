-- 클럽/개인 코치 계정이 "계정 설정"에서 본인 이름을 바꿀 수 있게 함.
-- club_owners에는 지금 select 정책만 있고 update 정책이 없음(club-owners.sql).
-- 단순히 "for update using (auth.uid()=id)"를 열면 클라이언트가 name 외에
-- facility_id/username까지 마음대로 바꿔버릴 위험이 있어서(시설 탈취/아이디 중복),
-- name 컬럼만 딱 바꾸는 security definer RPC로 좁혀서 구현.
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.

create or replace function update_my_club_owner_name(p_name text)
returns void
language plpgsql
security definer
as $$
begin
  if trim(p_name) = '' then
    raise exception 'INVALID_NAME';
  end if;

  update club_owners set name = trim(p_name) where id = auth.uid();
end;
$$;

grant execute on function update_my_club_owner_name(text) to authenticated;
