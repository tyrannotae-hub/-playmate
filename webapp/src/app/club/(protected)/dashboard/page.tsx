import Link from "next/link";
import {
  getCurrentClubOwner,
  getMyClasses,
  getMyClubBookings,
  getMyFacility,
} from "@/lib/club-data";
import BookingRow from "@/components/club/BookingRow";
import { cardClass } from "@/lib/ui";

export default async function ClubDashboardPage() {
  const owner = await getCurrentClubOwner();
  if (!owner) return null;

  const [facility, classes, bookings] = await Promise.all([
    getMyFacility(owner.facilityId),
    getMyClasses(owner.facilityId),
    getMyClubBookings(owner.facilityId),
  ]);
  const isSoloCoach = facility?.ownerType === "solo_coach";

  const pending = bookings.filter((b) => b.status === "requested");
  const confirmed = bookings.filter((b) => b.status === "confirmed");

  return (
    <>
      <div className="grid grid-cols-3 gap-2.5">
        <div className={cardClass("text-center")}>
          <p className="text-2xl font-extrabold">{classes.length}</p>
          <p className="mt-1 text-xs text-muted">운영 클래스</p>
        </div>
        <div className={cardClass("text-center")}>
          <p className="text-2xl font-extrabold text-warn">{pending.length}</p>
          <p className="mt-1 text-xs text-muted">승인 대기</p>
        </div>
        <div className={cardClass("text-center")}>
          <p className="text-2xl font-extrabold text-good">{confirmed.length}</p>
          <p className="mt-1 text-xs text-muted">확정 예약</p>
        </div>
      </div>

      <Link href="/club/home" className={cardClass("mt-6 block transition hover:border-rink")}>
        <p className="font-bold">{isSoloCoach ? "프로필 꾸미기" : "클럽 홈 꾸미기"}</p>
        <p className="mt-1 text-sm text-muted">커버 이미지·소개·공지사항을 관리해요 →</p>
      </Link>

      <div className="mt-7 flex items-center justify-between">
        <p className="text-sm font-bold text-muted">승인 대기 중인 예약</p>
        <Link href="/club/bookings" className="text-xs font-bold text-rink">
          전체 예약 보기 →
        </Link>
      </div>
      <div className="mt-2.5 flex flex-col gap-2.5">
        {pending.map((b) => (
          <BookingRow key={b.id} booking={b} />
        ))}
        {pending.length === 0 && (
          <p className="py-4 text-sm text-muted">승인 대기 중인 예약이 없어요.</p>
        )}
      </div>
    </>
  );
}
