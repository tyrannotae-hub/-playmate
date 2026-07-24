-- 클럽 홈 진열장: 클럽오너가 이름을 직접 정하고, 자기 클래스 중 원하는 것만 골라 담는
-- 가로 스크롤 카테고리(정확히 2개로 UI에서 제한). 자동 분류가 아니라 오너가 수동 큐레이션.

create table facility_home_categories (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references facilities(id) on delete cascade,
  name text not null,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create table facility_home_category_classes (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references facility_home_categories(id) on delete cascade,
  team_class_id uuid not null references teams_classes(id) on delete cascade,
  sort_order smallint not null default 0,
  unique (category_id, team_class_id)
);

alter table facility_home_categories enable row level security;
alter table facility_home_category_classes enable row level security;

create policy "facility home categories readable by all" on facility_home_categories
  for select using (true);

create policy "club owner manages own facility home categories" on facility_home_categories
  for all using (facility_id = my_facility_id()) with check (facility_id = my_facility_id());

create policy "facility home category classes readable by all" on facility_home_category_classes
  for select using (true);

create policy "club owner manages own facility home category classes" on facility_home_category_classes
  for all using (
    exists (
      select 1 from facility_home_categories c
      where c.id = category_id and c.facility_id = my_facility_id()
    )
  ) with check (
    exists (
      select 1 from facility_home_categories c
      where c.id = category_id and c.facility_id = my_facility_id()
    )
  );
