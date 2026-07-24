import { redirect } from "next/navigation";
import ClubNav from "@/components/ClubNav";
import { getCurrentClubOwner, getMyFacility } from "@/lib/club-data";

// 한때 학부모 페이지처럼 edge로 전환했었으나(왕복 지연 개선 목적), 클럽 관리센터
// 라우트들이 공통으로 지는 기본 번들 무게(Supabase 클라이언트 등)만으로도 Vercel의
// edge 함수 1MB 한도에 육박해서 페이지마다 순서대로 "1MB 초과" 배포 실패가 반복됐음
// (club/classes 1.21MB, club/bookings 1.2MB 순으로 발생, page 단위로 nodejs를
// 되돌려도 다음 라우트가 계속 넘침). 개별 페이지를 땜질하는 대신 nodejs로 전부 되돌림 —
// 다음에 이 레이아웃을 다시 edge로 시도한다면, 라우트별 번들 크기를 먼저 측정하고
// 접근할 것.
export const runtime = "nodejs";

export default async function ClubProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const owner = await getCurrentClubOwner();
  if (!owner) redirect("/club/login");

  const facility = await getMyFacility(owner.facilityId);

  return (
    <>
      <ClubNav
        facilityName={facility?.name ?? "내 클럽"}
        ownerType={facility?.ownerType ?? "club"}
      />
      <main className="mx-auto max-w-3xl px-4 pb-10 pt-5">{children}</main>
    </>
  );
}
