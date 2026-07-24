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
      <div className={cardClass("mt-2.5 divide-y divide-line p-0")}>
        {(
          [
            { href: "/club/bookings?status=requested", label: "확인중", count: pending.length, color: "text-warn" },
            { href: "/club/bookings?status=confirmed", label: "승인", count: confirmed.length, color: "text-good" },
            { href: "/club/bookings?status=completed", label: "완료", count: completed.length, color: "text-foreground" },
            { href: "/club/bookings?status=cancelled", label: "취소된 예약", count: cancelled.length, color: "text-muted" },
            {
              href: "/club/bookings?status=change_requested",
              label: "변경 요청된 예약",
              count: changeRequested.length,
              color: "text-warn",
            },
          ] as const
        ).map((row) => (
          <Link
            key={row.href}
            href={row.href}
            className="flex items-center justify-between px-4 py-3 transition hover:bg-surface-2"
          >
            <span className="text-sm">{row.label}</span>
            <span className={`text-base font-extrabold tabular-nums ${row.color}`}>{row.count}건</span>
          </Link>
        ))}
      </div>

      <Link href="/club/home" className={cardClass("mt-6 block transition hover:border-rink")}>
        <p className="font-bold">{isSoloCoach ? "프로필 꾸미기" : "클럽 홈 꾸미기"}</p>
        <p className="mt-1 text-sm text-muted">프로필·홍보사진·진열장·소개·공지사항을 관리해요 →</p>
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
