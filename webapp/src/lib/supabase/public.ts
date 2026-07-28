import { createClient } from "@supabase/supabase-js";

// 쿠키(next/headers)에 의존하지 않는 익명 클라이언트.
// unstable_cache로 감싼 함수 안에서는 cookies()/headers() 접근이 금지되는데,
// 클래스·시설·종목·리뷰·찜 개수 같은 공개 조회는 전부 RLS가
// "select using (true)"로 열려 있어 굳이 사용자 세션이 필요 없다.
// 이 클라이언트로 공개 데이터를 캐싱해서, 파트너(클럽)가 늘어나도 홈/검색
// 페이지가 매 요청마다 DB를 다시 훑지 않게 한다.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
