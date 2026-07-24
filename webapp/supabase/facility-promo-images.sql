-- 클럽 홈 최상단 자동 슬라이드 홍보물(광고/이벤트 이미지, 여러 장, 정방형).
-- 기존 cover_image_url(커버 이미지 1장) 자리를 대체하는 홍보 캐러셀 테이블.
-- 업로드는 기존 facility-covers 버킷을 재사용(경로: {facilityId}/promo/{uuid}.jpg) —
-- 버킷 정책이 첫 폴더 세그먼트만 facility_id로 검사하므로 새 버킷이 필요 없다.

create table facility_promo_images (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references facilities(id) on delete cascade,
  url text not null,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

alter table facility_promo_images enable row level security;

create policy "facility promo images readable by all" on facility_promo_images
  for select using (true);

create policy "club owner manages own facility promo images" on facility_promo_images
  for all using (facility_id = my_facility_id()) with check (facility_id = my_facility_id());
