-- 웹 푸시 구독 정보 저장. 예약 상태 변경(확정/취소/완료) 시
-- api/bookings/[id]/status 라우트에서 이 테이블을 조회해 web-push로 발송함.
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.
-- (schema.sql이 이미 적용되어 있어야 합니다)

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references parents(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

-- 구독 등록/해제는 본인(학부모) 세션에서 직접 수행하므로 일반 RLS로 충분
drop policy if exists "push subscriptions scoped to parent" on push_subscriptions;
create policy "push subscriptions scoped to parent" on push_subscriptions
  for all using (auth.uid() = parent_id) with check (auth.uid() = parent_id);

create index if not exists push_subscriptions_parent_idx on push_subscriptions (parent_id);

-- 예약 상태 변경(api/bookings/[id]/status)은 클럽 운영자 세션에서 호출되는데,
-- 그 시점에 "예약한 학부모"의 구독 정보를 읽어야 발송이 가능함.
-- 위 RLS는 본인(auth.uid() = parent_id)만 읽을 수 있게 막아두므로, 클럽 운영자
-- 세션에서는 그대로 조회가 안 됨 → cancel_booking()과 동일하게 security definer
-- RPC로 우회. 호출자 신원 검증은 하지 않는 대신, endpoint/키만 반환하고
-- 학부모 개인정보(이름 등)는 노출하지 않음.
create or replace function get_parent_push_subscriptions(p_parent_id uuid)
returns table (id uuid, endpoint text, p256dh text, auth_key text)
language sql
security definer
as $$
  select id, endpoint, p256dh, auth_key
  from push_subscriptions
  where parent_id = p_parent_id;
$$;

grant execute on function get_parent_push_subscriptions(uuid) to authenticated;

-- 만료된 구독을 실제 발송 시도 후 정리할 때도 같은 이유로 정의자 권한이 필요
create or replace function delete_push_subscription(p_id uuid)
returns void
language sql
security definer
as $$
  delete from push_subscriptions where id = p_id;
$$;

grant execute on function delete_push_subscription(uuid) to authenticated;
