-- 학부모가 클래스를 찜(위시리스트)해두는 기능

create table wishlists (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references parents(id) on delete cascade,
  team_class_id uuid not null references teams_classes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (parent_id, team_class_id)
);

alter table wishlists enable row level security;

create policy "wishlists scoped to parent" on wishlists
  for all using (auth.uid() = parent_id) with check (auth.uid() = parent_id);
