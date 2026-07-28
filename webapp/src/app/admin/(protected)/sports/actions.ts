"use server";

import { updateTag } from "next/cache";

// SportsManager는 브라우저에서 Supabase 클라이언트로 직접 sports 테이블을
// 고치는데, getSports()는 unstable_cache(tags: ["sports"])로 캐싱돼 있어서
// 이 태그를 무효화해줘야 학부모 화면에 바로 반영된다. Server Action 안에서는
// read-your-own-writes를 보장하는 updateTag가 권장됨(revalidateTag는 이제
// profile 인자가 필요하고 즉시 반영을 보장하지 않음).
export async function revalidateSports() {
  updateTag("sports");
}
