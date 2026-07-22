-- 클럽 공개 홈페이지 정보량 강화 1탄: 인스타그램 바로가기 링크
-- facilities에 인스타그램 프로필 URL 컬럼 추가.

alter table facilities add column instagram_url text;

-- ============ 시연/검증용 샘플 데이터 ============
-- 아이스웍스 역삼점(11111111-...)에 인스타그램 링크 + 강사 소개(bio)·프로필 사진 채우기.
-- 실제 운영 데이터는 클럽/Admin이 Supabase 대시보드(Table Editor)에서 직접 입력하는 컨벤션이며,
-- 아래는 /facilities/11111111-1111-1111-1111-111111111111 페이지의 새 섹션 구조를 눈으로 확인하기 위한 샘플임.

update facilities
  set instagram_url = 'https://www.instagram.com/iceworks_yeoksam'
  where id = '11111111-1111-1111-1111-111111111111';

update instructors
  set bio = '아이스하키 국가대표 출신으로, 8년간 유소년 선수들을 지도해왔습니다. 기초 체력부터 팀워크까지 단계별로 꼼꼼하게 가르칩니다.',
      profile_image_url = 'https://i.pravatar.cc/300?img=12'
  where id = '33333333-3333-3333-3333-333333333333';

-- 프로필 사진이 없는 강사 케이스(이니셜/이모지 플레이스홀더 확인용)로 bio만 채움.
update instructors
  set bio = '피겨스케이팅 전문 지도자로 개인별 맞춤 커리큘럼을 제공합니다. 아이들이 즐겁게 스케이팅과 친해질 수 있도록 돕습니다.'
  where id = '55555555-5555-5555-5555-555555555555';
