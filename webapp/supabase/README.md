# Supabase 마이그레이션 안내

이 폴더의 `.sql` 파일은 전부 Supabase 대시보드 SQL Editor에서 순서대로 실행되어
**이미 라이브 DB에 반영된** 마이그레이션 기록입니다. 별도 마이그레이션 툴 없이
기능을 추가할 때마다 파일을 하나씩 만들어 쌓아온 방식이라 파일 수(40개+)가
많아 보이지만, 실제 스키마는 아래처럼 기능별로 묶어서 보면 훨씬 단순합니다.

**새로 이 프로젝트의 스키마를 이해하려면 개별 파일을 순서대로 읽지 말고 이
README부터 읽으세요.**

⚠️ 표시가 있는 파일은 이후 파일에서 일부 컬럼/테이블이 삭제되거나 로직이
대체됐습니다. 다시 실행할 필요 없고(대부분 재실행해도 데이터가 깨지진 않지만,
이미 없는 컬럼을 다루는 부분에서 에러가 날 수 있음), 현재 스키마를 파악할 때는
같이 적어둔 "최신 버전" 파일을 기준으로 보면 됩니다.

## 기본 스키마
- `schema.sql` — parents/children/sports/facilities/instructors/teams_classes/
  class_schedules/bookings/reviews 기본 테이블 + `request_booking()` RPC 최초 버전
  (이후 여러 파일에서 계속 확장됨, 최신 시그니처는 아래 "예약" 항목 참고)
- `seed.sql`, `sports-additional.sql` — 시드 데이터

## 클럽(시설) 계정 · 온보딩
- `club-owners.sql` — 클럽 자체 관리 대시보드용 RLS 기반(`my_facility_id()` 등
  다른 여러 파일이 이 함수에 의존)
- `club-owner-settings.sql` — 계정 설정에서 이름 변경
- `club-signup-approval.sql`, `club-signup-sport.sql` — 셀프 가입 신청 + 관리자 승인
- `solo-coach.sql` — 개인 코치(클럽 소속 없이 혼자 운영) 지원
- `auth-username.sql` — 아이디+비밀번호 로그인

## 클래스(수업) 관리
- `class-instructors.sql` — 클래스:코치 다대다
- `class-optional-fields.sql` — 예약 시 키/발사이즈/거주지 수집 여부
- `class-media.sql` — 클래스 사진+소개글 (`class_images` 테이블. 파일 자체엔 "6장/4:3"
  이라고 적혀있지만 이후 프론트 코드에서 8장/정방형으로 확장됨 — DB 제약은 없음)
- `class-delete-fix.sql` — 클래스 삭제 버그 수정
- `class-discount-trial-recurring.sql` — ⚠️ `trial_day_label` 컬럼은
  `class-schedule-trial-toggle.sql`에서 삭제됨. `discount_price`/`discount_start_date`/
  `discount_end_date`/`show_trial_price`/`class_holidays` 테이블은 계속 유효.
- `class-trial-discount.sql`, `class-trial-discount-dates.sql` — 원데이 전용 할인가+기간
- `class-trial-options.sql` — ⚠️ `class_trial_dates` 테이블과
  `teams_classes.allow_trial`은 `class-schedule-trial-toggle.sql`에서 삭제됨.
  `trial_price`/`show_price`는 계속 유효.
- `class-schedule-trial-toggle.sql` — ✅ 최신. 원데이 가능 여부는 클래스 단위가
  아니라 `class_schedules.allow_trial`(시간대 단위)로 관리. `request_booking()`/
  `request_booking_change()` 최신 버전도 여기 있음(이후 `booking-cancel-request.sql`이
  `request_booking_change()`를 한 번 더 갱신).
- `class-holiday-per-schedule.sql` — ✅ 최신. 원데이 휴무도 `class_holidays.
  class_schedule_id`로 시간대 단위 지정 가능(null이면 클래스 전체 휴무).

## 예약
- `booking-contact-phone.sql`, `booking-registration-details.sql` — 연락처/성별/키/
  발사이즈/거주지/개인정보 동의 수집
- `booking-notify-email.sql` — ⚠️ 완전 대체됨. 이메일 알림 자체가 실사용 불가로
  판명되어 웹 푸시로 전환됨(`push-subscriptions.sql`). `notify_email` 컬럼은 죽은
  컬럼(참조 코드 없음, 삭제해도 무방).
- `booking-trial.sql` — 체험(원데이) 예약 타입 최초 도입
- `fix-request-booking-overload.sql` — 일회성 버그 수정(PostgREST 함수 오버로드 충돌)
- `booking-cancel.sql` — ⚠️ `cancel_booking()` 최신 버전은 `booking-cancel-request.sql`.
- `booking-changes.sql` — ⚠️ `request_booking_change()`/`respond_booking_change()`
  최신 버전은 `class-schedule-trial-toggle.sql`(request 쪽)과
  `booking-cancel-request.sql`(respond 쪽, `last_change_applied_at` 추가).
- `booking-cancel-request.sql` — ✅ 최신. 확인중(club 미승인) 예약은 즉시 취소/변경,
  승인된 예약은 취소도 변경요청과 동일하게 클럽 승인 필요.

## 클럽 홈(공개 페이지)
- `facility-home.sql` — 커버 이미지(현재는 홍보 캐러셀 fallback 용도로만 남음) +
  공지사항
- `facility-instagram.sql` — 인스타그램 링크
- `facility-profile-photo.sql`, `facility-promo-images.sql` — 프로필 사진(정방형) +
  홍보 캐러셀(여러 장)
- `facility-home-categories.sql` — 홈 진열장(카테고리 2개, 클럽오너가 직접 큐레이션)
- `facility-regions.sql` — 시설이 여러 지역에 노출될 수 있도록 다중 지역 지원
  (`facility_regions` 테이블, `facilities.region_code`는 대표 지역으로 남음)

## 찜(위시리스트) · 알림 · 기타
- `wishlists.sql`, `wishlist-counts.sql`, `instructor-wishlists.sql`,
  `facility-wishlists.sql` — 클래스/코치/시설 찜하기
- `notifications.sql`, `push-subscriptions.sql` — 인앱 알림 + 웹 푸시
- `profile-photos.sql`, `review-photos.sql` — 프로필/리뷰 사진
- `leads.sql` — 랜딩페이지 사전등록/입점문의(웹앱과 별개, GitHub Pages 랜딩용)

## 성능
- `perf-fk-indexes.sql` — public 스키마 FK 컬럼 대부분에 인덱스가 없던 것을
  일괄 추가(Postgres는 PK와 달리 FK를 자동 인덱싱하지 않음). 지금은 테이블당
  row가 몇 개뿐이라 체감은 없지만 데이터가 늘어나기 전에 미리 정리.

## 일회성 정리 스크립트 (이미 실행 완료, 재실행 불필요)
- `cleanup-test-data.sql` — 테스트 계정/데이터 삭제
- `cleanup-zenith.sql` — 제니스 스포츠클럽 시설 삭제

---

**새 마이그레이션을 추가할 때**: 파일명은 `영역-내용.sql` 형식으로, 파일 맨 위
주석에 배경/이유를 간단히 남기고, 이 README의 해당 섹션에도 한 줄 추가해주세요.
기존 컬럼/테이블을 삭제하거나 함수 시그니처(파라미터 개수·타입)를 바꾸는 경우,
대체되는 이전 파일에 위와 같이 ⚠️ 표시를 추가해서 최신 상태를 계속 추적 가능하게
유지해주세요.
