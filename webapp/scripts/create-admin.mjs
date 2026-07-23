// 관리자(운영자) 계정 부트스트랩 스크립트.
// 클럽/코치는 이제 /club/signup에서 셀프 신청하고 관리자가 /admin에서 승인/거절하지만,
// 관리자 계정 자체는 셀프 가입이 없다 — create-club-owner.mjs와 같은 컨벤션으로
// 서비스 롤 키를 가진 운영자가 로컬에서 이 스크립트를 실행해 만든다.
// 자세한 설계 근거는 supabase/club-signup-approval.sql 상단 주석 참고.

import { createClient } from "@supabase/supabase-js";

const [, , username, password, name] = process.argv;

if (!username || !password || !name) {
  console.error("사용법: npm run admin:create -- <아이디> <비밀번호> <이름>");
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

// 학부모(@playmate.local)/클럽(@club.playmate.local)과 구분되는 내부 이메일 패턴.
const email = `${username}@admin.playmate.local`;

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
  .from("admins")
  .insert({ id: userData.user.id, username, name });

if (rowError) {
  console.error("admins 등록 실패:", rowError.message);
  console.error(
    `Auth 계정은 이미 생성됐어요 (id: ${userData.user.id}). Supabase 대시보드 Authentication > Users에서 정리하거나 admins에 수동으로 이 id를 등록해주세요.`
  );
  process.exit(1);
}

console.log(`완료: "${name}" 관리자 계정 생성됨 (아이디: ${username})`);
console.log("로그인: https://playmate-theta.vercel.app/admin/login");
