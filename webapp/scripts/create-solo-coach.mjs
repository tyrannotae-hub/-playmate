// 클럽 소속 없이 혼자 자기 수업을 운영하는 "개인 코치" 계정을 만드는 온보딩 스크립트.
// create-club-owner.mjs와 같은 Founder-led 수동 생성 컨벤션을 따르되, 클럽 대신
// 코치 본인 명의의 1인 시설(facility)을 자동으로 함께 만들어준다 (설계 근거는
// supabase/solo-coach.sql 상단 주석 참고). 이후 로그인/대시보드는 기존 /club/login,
// /club/(protected)/* 를 클럽 계정과 동일하게 그대로 사용한다.

import { createClient } from "@supabase/supabase-js";

const [, , username, password, name] = process.argv;

if (!username || !password || !name) {
  console.error(
    "사용법: npm run coach:create -- <아이디> <비밀번호> <코치이름>\n" +
      "클럽 소속 없이 혼자 수업을 운영하는 개인 코치 계정을 만들어요.\n" +
      "(코치 본인 명의의 1인 시설을 자동 생성하고, 그 시설의 클럽 계정으로 등록합니다)"
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

// 클럽 계정(@club.playmate.local)과 구분되는 내부 이메일 패턴.
const email = `${username}@coach.playmate.local`;

const { data: userData, error: userError } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (userError || !userData.user) {
  console.error("계정 생성 실패:", userError?.message);
  process.exit(1);
}

// 1) 코치 본인 명의의 1인 시설 생성. 주소/연락처 등은 나중에 본인이 대시보드(클럽 홈 꾸미기)에서
//    채우도록 비워둔다 (facilities.address는 not null이라 빈 문자열로 둔다).
const { data: facilityData, error: facilityError } = await admin
  .from("facilities")
  .insert({ name: `${name} 코치`, address: "", owner_type: "solo_coach" })
  .select("id, name")
  .single();

if (facilityError || !facilityData) {
  console.error("1인 시설 생성 실패:", facilityError?.message);
  console.error(
    `Auth 계정은 이미 생성됐어요 (id: ${userData.user.id}). Supabase 대시보드 Authentication > Users에서 정리해주세요.`
  );
  process.exit(1);
}

// 2) 그 시설 소속으로 코치 본인 프로필(강사) 행 생성. 경력/자격증/소개글/사진은
//    /club/instructors 화면이 있다면 거기서, 없다면 클래스 등록 화면에서 자기 이름을 선택하면
//    이 강사 행이 그대로 재사용된다 (webapp/src/app/club/(protected)/classes/ClassesClient.tsx 참고).
const { error: instructorError } = await admin
  .from("instructors")
  .insert({ facility_id: facilityData.id, name });

if (instructorError) {
  console.error("코치 프로필 생성 실패:", instructorError.message);
  console.error(
    `Auth 계정(id: ${userData.user.id})과 시설(id: ${facilityData.id})은 이미 생성됐어요. ` +
      "instructors 테이블에 이 코치를 직접 추가하거나 수동으로 정리해주세요."
  );
  process.exit(1);
}

// 3) 위 시설을 가리키는 club_owners 행 생성 (로그인 계정 — /club/login 에서 이 username으로 로그인).
const { error: ownerError } = await admin
  .from("club_owners")
  .insert({ id: userData.user.id, facility_id: facilityData.id, username, name });

if (ownerError) {
  console.error("club_owners 등록 실패:", ownerError.message);
  console.error(
    `Auth 계정(id: ${userData.user.id})과 시설(id: ${facilityData.id})은 이미 생성됐어요. ` +
      "club_owners에 수동으로 등록하거나 정리해주세요."
  );
  process.exit(1);
}

console.log(
  `완료: "${name}" 코치 계정 생성됨 (아이디: ${username}, facility_id: ${facilityData.id})`
);
console.log("로그인: https://playmate-theta.vercel.app/club/login");
