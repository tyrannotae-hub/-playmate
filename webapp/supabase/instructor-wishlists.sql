-- 학부모가 코치(강사)를 찜(위시리스트)해두는 기능.
-- wishlists.sql(클래스 찜)과 완전히 별개의 테이블/RPC이며, 클래스 찜 기능에는 영향 없음.
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.

create table instructor_wishlists (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references parents(id) on delete cascade,
  instructor_id uuid not null references instructors(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (parent_id, instructor_id)
);

alter table instructor_wishlists enable row level security;

create policy "instructor wishlists scoped to parent" on instructor_wishlists
  for all using (auth.uid() = parent_id) with check (auth.uid() = parent_id);

-- 코치별 찜(하트) 개수를 누구나 볼 수 있게 하는 RPC.
-- instructor_wishlists 테이블 자체는 "본인 것만 select"로 막혀있어서,
-- 다른 사람이 몇 명 찜했는지 집계만 노출하고 누가 찜했는지는 노출하지 않도록
-- security definer RPC로 카운트만 반환함. (wishlist-counts.sql과 동일한 패턴)
create or replace function get_instructor_wishlist_counts()
returns table(instructor_id uuid, count bigint)
language sql
security definer
stable
as $$
  select instructor_id, count(*) from instructor_wishlists group by instructor_id;
$$;

grant execute on function get_instructor_wishlist_counts() to anon, authenticated;
