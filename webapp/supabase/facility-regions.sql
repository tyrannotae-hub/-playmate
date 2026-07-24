-- 시설이 여러 지역(인접 자치구 등)에 걸쳐 검색/필터에 노출될 수 있도록 다대다로 분리.
-- 학부모 쪽 지역 설정(mypage/settings, REGION_OPTIONS 25개 자치구)과 동일한 목록을
-- 클럽 쪽에서도 그대로 쓴다. 기존 facilities.region_code(단일값)는 대표 지역으로
-- 그대로 남겨두고(레거시 표시용), 실제 지역 검색/필터 매칭은 이 테이블 기준으로 한다.

create table facility_regions (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references facilities(id) on delete cascade,
  region_code text not null,
  unique (facility_id, region_code)
);

alter table facility_regions enable row level security;

create policy "facility regions readable by all" on facility_regions
  for select using (true);

create policy "club owner manages own facility regions" on facility_regions
  for all using (facility_id = my_facility_id()) with check (facility_id = my_facility_id());

-- 기존에 이미 region_code가 설정돼 있던 시설은 그 값을 대표 지역 1개로 백필
insert into facility_regions (facility_id, region_code)
select id, region_code from facilities where region_code is not null
on conflict (facility_id, region_code) do nothing;
