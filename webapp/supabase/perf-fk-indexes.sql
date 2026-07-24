-- 효율화 작업 3단계(쿼리 성능 점검): public 스키마의 거의 모든 FK 컬럼에
-- 인덱스가 없는 것을 확인함(Postgres는 PK와 달리 FK 컬럼을 자동으로
-- 인덱싱하지 않음). 지금은 테이블마다 row가 몇 개뿐이라 체감 차이는 없지만,
-- 앱의 핵심 조회 패턴이 전부 이 컬럼들을 필터로 쓰기 때문에(예: 클래스
-- 상세에서 facility_id로 클래스 목록, 예약 목록에서 parent_id/team_class_id로
-- 필터, 예약 확정 시 class_schedule_id로 슬롯 갱신 등) 데이터가 늘어나면
-- 그대로 성능 문제가 된다. 지금 미리 인덱스를 걸어두는 게 안전하고 비용도
-- 거의 없음(CREATE INDEX CONCURRENTLY 없이도 순간적으로 끝남).
--
-- auth.*, storage.* 스키마의 FK는 Supabase가 직접 관리하는 내부 테이블이라
-- 건드리지 않음.
--
-- Supabase 대시보드 → SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.

create index if not exists children_parent_id_idx on children (parent_id);

create index if not exists instructors_facility_id_idx on instructors (facility_id);

create index if not exists teams_classes_facility_id_idx on teams_classes (facility_id);
create index if not exists teams_classes_sport_id_idx on teams_classes (sport_id);
create index if not exists teams_classes_instructor_id_idx on teams_classes (instructor_id);

create index if not exists class_schedules_team_class_id_idx on class_schedules (team_class_id);

create index if not exists class_images_team_class_id_idx on class_images (team_class_id);

create index if not exists class_instructors_instructor_id_idx on class_instructors (instructor_id);

create index if not exists bookings_parent_id_idx on bookings (parent_id);
create index if not exists bookings_child_id_idx on bookings (child_id);
create index if not exists bookings_team_class_id_idx on bookings (team_class_id);
create index if not exists bookings_class_schedule_id_idx on bookings (class_schedule_id);
create index if not exists bookings_requested_schedule_id_idx on bookings (requested_schedule_id);

create index if not exists reviews_parent_id_idx on reviews (parent_id);

create index if not exists club_owners_facility_id_idx on club_owners (facility_id);
create index if not exists club_signup_requests_auth_user_id_idx on club_signup_requests (auth_user_id);
create index if not exists club_signup_requests_sport_id_idx on club_signup_requests (sport_id);

create index if not exists facility_notices_facility_id_idx on facility_notices (facility_id);
create index if not exists facility_promo_images_facility_id_idx on facility_promo_images (facility_id);
create index if not exists facility_home_categories_facility_id_idx on facility_home_categories (facility_id);
create index if not exists facility_home_category_classes_team_class_id_idx on facility_home_category_classes (team_class_id);

create index if not exists wishlists_team_class_id_idx on wishlists (team_class_id);
create index if not exists facility_wishlists_facility_id_idx on facility_wishlists (facility_id);
create index if not exists instructor_wishlists_instructor_id_idx on instructor_wishlists (instructor_id);

create index if not exists notifications_booking_id_idx on notifications (booking_id);
