import Link from "next/link";
import { getCurrentClubOwner, getMyClubBookings, getMyFacility } from "@/lib/club-data";
import BookingRow from "@/components/club/BookingRow";
import RefreshButton from "@/components/club/RefreshButton";
import { cardClass } from "@/lib/ui";

export default async function ClubDashboardPage() {
  const owner = await getCurrentClubOwner();
  if (!owner) return null;

  const [facility, bookings] = await Promise.all([
    getMyFacility(owner.facilityId),
    getMyClubBookings(owner.facilityId),
  ]);
  const isSoloCoach = facility?.ownerType === "solo_coach";

  const pending = bookings.filter((b) => b.status === "requested");
  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const completed = bookings.filter((b) => b.status === "completed");
  const cancelled = bookings.filter((b) => b.status === "cancelled");
  const changeRequested = bookings.filter((b) => b.changeRequestedAt);

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-muted">예약 현황</p>
        <RefreshButton />
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-2.5">
        <Link
          href="/club/bookings?status=requested"
          className={cardClass("text-center transition hover:border-rink")}
        >
          <p className="text-2xl font-extrabold text-warn">{pending.length}</p>
          <p className="mt-1 text-xs text-muted">확인중</p>
        </Link>
        <Link
          href="/club/bookings?status=confirmed"
          className={cardClass("text-center transition hover:border-rink")}
        >
          <p className="text-2xl font-extrabold text-good">{confirmed.length}</p>
          <p className="mt-1 text-xs text-muted">승인</p>
        </Link>
        <Link
          href="/club/bookings?status=completed"
          className={cardClass("text-center transition hover:border-rink")}
        >
          <p className="text-2xl font-extrabold">{completed.length}</p>
          <p className="mt-1 text-xs text-muted">완료</p>
        </Link>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm font-bold text-muted">취소·변경 현황</p>
        <RefreshButton />
      </div>
      <div className="mt-2.5 flex flex-col gap-2.5">
        <Link
          href="/club/bookings?status=cancelled"
          className={cardClass("flex items-center justify-between transition hover:border-rink")}
        >
          <span>
            <span className="block text-2xl font-extrabold text-muted">{cancelled.length}</span>
            <span className="mt-1 block text-xs text-muted">취소된 예약</span>
          </span>
          <span className="text-xs font-bold text-rink">전체 보기 →</span>
        </Link>
        <Link
          href="/club/bookings?status=change_requested"
          className={cardClass("flex items-center justify-between transition hover:border-rink")}
        >
          <span>
            <span className="block text-2xl font-extrabold text-warn">{changeRequested.length}</span>
            <span className="mt-1 block text-xs text-muted">변경 요청된 예약</span>
          </span>
          <span className="text-xs font-bold text-rink">전체 보기 →</span>
        </Link>
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
