-- 아이디+비밀번호 로그인 지원
-- Supabase Auth는 내부적으로 이메일 기반이라, 아이디를 가짜 이메일(아이디@playmate.local)로 매핑해서 사용합니다.

alter table parents add column username text unique;

-- 아이디로 로그인할 때 내부 이메일을 찾기 위한 함수 (로그인 전이라 RLS를 우회해야 함)
create or replace function get_login_email(p_username text)
returns text
language sql
security definer
stable
as $$
  select email from parents where username = p_username;
$$;

grant execute on function get_login_email(text) to anon, authenticated;

-- 회원가입 시 parents 행에 username도 같이 저장하도록 트리거 갱신
create or replace function handle_new_parent()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.parents (id, email, username)
  values (new.id, new.email, new.raw_user_meta_data->>'username');
  return new;
end;
$$;
