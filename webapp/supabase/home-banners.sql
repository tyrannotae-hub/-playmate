-- 홈 화면 최상단 배너(PromoBanner)가 지금까지 컴포넌트 파일에 하드코딩돼
-- 있어서 문구/사진을 바꾸려면 매번 코드 배포가 필요했음. 관리자가
-- /admin/banners에서 직접 관리할 수 있도록 테이블로 분리.

create table home_banners (
  id uuid primary key default gen_random_uuid(),
  href text not null,
  background_image_url text,
  layout text not null check (layout in ('logo', 'text')),
  caption text,   -- layout='logo'일 때 로고 아래 문구
  title text,     -- layout='text'일 때 제목
  subtitle text,  -- layout='text'일 때 부제
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table home_banners enable row level security;

create policy "home banners readable by all" on home_banners
  for select using (true);

create policy "admin manages home banners" on home_banners
  for insert with check (is_admin());

create policy "admin updates home banners" on home_banners
  for update using (is_admin());

create policy "admin deletes home banners" on home_banners
  for delete using (is_admin());

-- ============ Storage: site-assets 버킷 (공개 읽기, 관리자만 쓰기) ============
-- 이 버킷 자체는 이전에 스크립트로 먼저 만들어졌던 것이라(홈 배너 사진 올릴 때),
-- 여기서 정식으로 마이그레이션에 등록하고 storage RLS를 붙인다.
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

create policy "site assets readable by all" on storage.objects
  for select using (bucket_id = 'site-assets');

create policy "admin uploads site assets" on storage.objects
  for insert with check (bucket_id = 'site-assets' and is_admin());

create policy "admin updates site assets" on storage.objects
  for update using (bucket_id = 'site-assets' and is_admin());

create policy "admin deletes site assets" on storage.objects
  for delete using (bucket_id = 'site-assets' and is_admin());

-- 기존에 컴포넌트에 하드코딩돼 있던 배너 3개를 그대로 이관 (화면 변화 없게)
insert into home_banners (href, background_image_url, layout, caption, title, subtitle, sort_order) values
(
  '/',
  'https://unazmttaqqukrlupmnhr.supabase.co/storage/v1/object/public/site-assets/banners/home-hero-ice-rink.jpg',
  'logo',
  '우리 아이 첫 운동, 플레이메이트와 함께 시작해요',
  null,
  null,
  0
),
(
  '/facilities/b59ee112-2b7d-4155-98ad-c30b4b828875',
  'https://unazmttaqqukrlupmnhr.supabase.co/storage/v1/object/public/facility-covers/b59ee112-2b7d-4155-98ad-c30b4b828875/promo/626c4b06-9b06-4638-9f79-25d8275e64e5.jpg',
  'text',
  null,
  '퍼핀스 아카데미',
  '역삼・목동・신사・동탄 4개 지점, 아이스하키 아카데미',
  1
),
(
  '/recommend',
  'https://unazmttaqqukrlupmnhr.supabase.co/storage/v1/object/public/site-assets/banners/home-five-sports-kids.png',
  'text',
  null,
  '플레이메이트가 찾아드려요',
  '우리 아이에게 맞는 운동 찾기',
  2
);
