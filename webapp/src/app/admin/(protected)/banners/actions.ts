"use server";

import { updateTag } from "next/cache";

// getHomeBanners()는 unstable_cache(tags: ["home-banners"])로 캐싱돼 있어서,
// 관리자가 배너를 고친 직후에도 홈 화면에 바로 반영되도록 무효화해준다.
export async function revalidateHomeBanners() {
  updateTag("home-banners");
}
