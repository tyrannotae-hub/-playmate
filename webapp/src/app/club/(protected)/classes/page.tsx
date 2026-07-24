import { getCurrentClubOwner, getMyClasses, getMyInstructors } from "@/lib/club-data";
import { getSports } from "@/lib/data";
import ClassesClient from "./ClassesClient";

// 이 라우트는 클래스 폼(할인/이미지업로드/일정/휴일 등)이 번들에서 가장 무거워서,
// 상위 레이아웃의 edge 상속을 여기서만 nodejs로 되돌린다 — edge 함수 1MB 크기 제한을
// 초과해 Vercel 배포가 실패했음(club/(protected)/layout.tsx 참고).
export const runtime = "nodejs";

export default async function ClubClassesPage() {
  const owner = await getCurrentClubOwner();
  if (!owner) return null;

  const [classes, sports, instructors] = await Promise.all([
    getMyClasses(owner.facilityId),
    getSports(),
    getMyInstructors(owner.facilityId),
  ]);

  return (
    <ClassesClient
      facilityId={owner.facilityId}
      initialClasses={classes}
      sports={sports}
      instructors={instructors}
    />
  );
}
