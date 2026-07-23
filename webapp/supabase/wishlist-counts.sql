-- 클래스별 찜(하트) 개수를 누구나 볼 수 있게 하는 RPC.
-- wishlists 테이블 자체는 "본인 것만 select"로 막혀있어서(wishlists.sql),
-- 다른 사람이 몇 명 찜했는지 집계만 노출하고 누가 찜했는지는 노출하지 않도록
-- security definer RPC로 카운트만 반환함.
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.

create or replace function get_wishlist_counts()
returns table(team_class_id uuid, count bigint)
language sql
security definer
stable
as $$
  select team_class_id, count(*) from wishlists group by team_class_id;
$$;

grant execute on function get_wishlist_counts() to anon, authenticated;
