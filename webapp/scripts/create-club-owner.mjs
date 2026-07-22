// 클럽(다수 강사가 소속된 시설) 계정 온보딩 스크립트.
// 클럽 소속 없이 혼자 수업을 운영하는 "개인 코치"는 이 스크립트가 아니라
// create-solo-coach.mjs (npm run coach:create)로 온보딩한다 — 코치 본인 명의의
// 1인 시설을 자동 생성해주는 별도 스크립트다. 자세한 설계 근거는 supabase/solo-coach.sql 참고.

import { createClient } from "@supabase/supabase-js";

const [, , username, password, name, facilityId] = process.argv;

if (!username || !password || !name || !facilityId) {
  console.error(
    "사용법: npm run club:create -- <아이디> <비밀번호> <클럽이름> <facility_id>"
  );
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    ".env.admin.local 에 NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY가 필요해요."
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email = `${username}@club.playmate.local`;

const { data: userData, error: userError } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (userError || !userData.user) {
  console.error("계정 생성 실패:", userError?.message);
  process.exit(1);
}

const { error: rowError } = await admin
  .from("club_owners")
  .insert({ id: userData.user.id, facility_id: facilityId, username, name });

if (rowError) {
  console.error("club_owners 등록 실패:", rowError.message);
  console.error(
    `Auth 계정은 이미 생성됐어요 (id: ${userData.user.id}). Supabase 대시보드 Authentication > Users에서 정리하거나 club_owners에 수동으로 이 id를 등록해주세요.`
  );
  process.exit(1);
}

console.log(`완료: "${name}" 클럽 계정 생성됨 (아이디: ${username})`);
console.log("로그인: https://playmate-theta.vercel.app/club/login");
