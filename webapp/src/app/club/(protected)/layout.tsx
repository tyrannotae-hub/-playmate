import { redirect } from "next/navigation";
import ClubNav from "@/components/ClubNav";
import { getCurrentClubOwner, getMyFacility } from "@/lib/club-data";

// Vercel Hobby 서버리스 함수가 iad1(미국)에 고정 실행되는 반면 Supabase는 서울이라
// 왕복 지연이 컸던 문제(학부모 페이지는 이미 edge로 전환됨)를 클럽 관리센터에도 동일 적용.
// 이 레이아웃에 지정하면 하위 페이지 전체(bookings/classes/dashboard/home/instructors/
// settings)에 상속된다. web-push를 쓰는 예약 상태변경 API 라우트는 별도 파일이라 영향 없음.
export const runtime = "edge";

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
