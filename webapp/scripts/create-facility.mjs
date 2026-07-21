import { createClient } from "@supabase/supabase-js";

const [, , name, address, phone, regionCode] = process.argv;

if (!name || !address) {
  console.error(
    "사용법: npm run facility:create -- <시설명> <주소> [연락처] [region_code]\n" +
      "region_code 예: seoul-gangnam, seoul-guro, seoul-mokdong (검색 지역 필터에 쓰임, webapp/src/lib/region-meta.ts 참고)"
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

const { data, error } = await admin
  .from("facilities")
  .insert({ name, address, phone: phone ?? null, region_code: regionCode ?? null })
  .select("id, name")
  .single();

if (error || !data) {
  console.error("시설 등록 실패:", error?.message);
  process.exit(1);
}

console.log(`완료: "${data.name}" 생성됨 (facility_id: ${data.id})`);
