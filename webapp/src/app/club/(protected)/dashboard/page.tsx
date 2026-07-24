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
  const changeApplied = bookings.filter((b) => b.lastChangeAppliedAt);
  const cancelRequested = bookings.filter((b) => b.cancelRequestedAt);

  // 에이블리 대시보드의 한국/일본/총 컬럼 구조를 참고 — 항목별 건수를 정기/원데이/총으로 나눠 보여준다.
  function toStatRows(
    rows: { href: string; label: string; list: typeof bookings; color: string }[]
  ) {
    return rows.map((row) => ({
      href: row.href,
      label: row.label,
      color: row.color,
      enrollment: row.list.filter((b) => b.bookingType === "enrollment").length,
      trial: row.list.filter((b) => b.bookingType === "trial").length,
      total: row.list.length,
    }));
  }

  function StatTable({ rows }: { rows: ReturnType<typeof toStatRows> }) {
    return (
      <div className={cardClass("mt-2.5 p-0")}>
        <div className="grid grid-cols-[1fr_2.75rem_2.75rem_2.75rem] gap-x-2 px-4 pt-3 text-xs font-bold text-muted">
          <span />
          <span className="text-right">정기</span>
          <span className="text-right">원데이</span>
          <span className="text-right">총</span>
        </div>
        <div className="mt-1.5 divide-y divide-line">
          {rows.map((row) => (
            <Link
              key={row.href}
              href={row.href}
              className="grid grid-cols-[1fr_2.75rem_2.75rem_2.75rem] items-center gap-x-2 px-4 py-3 transition hover:bg-surface-2"
            >
              <span className="text-sm">{row.label}</span>
              <span className="text-right text-sm tabular-nums text-muted">{row.enrollment}</span>
              <span className="text-right text-sm tabular-nums text-muted">{row.trial}</span>
              <span className={`text-right text-base font-extrabold tabular-nums ${row.color}`}>
                {row.total}
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const bookingStatusRows = toStatRows([
    { href: "/club/bookings?status=requested", label: "확인중", list: pending, color: "text-warn" },
    { href: "/club/bookings?status=confirmed", label: "승인", list: confirmed, color: "text-good" },
    { href: "/club/bookings?status=completed", label: "완료", list: completed, color: "text-foreground" },
  ]);

  const changeCancelRows = toStatRows([
    {
      href: "/club/bookings?status=change_requested",
      label: "변경요청",
      list: changeRequested,
      color: "text-warn",
    },
    { href: "/club/bookings", label: "변경완료", list: changeApplied, color: "text-good" },
    {
      href: "/club/bookings?status=cancel_requested",
      label: "취소요청",
      list: cancelRequested,
      color: "text-warn",
    },
    { href: "/club/bookings?status=cancelled", label: "취소완료", list: cancelled, color: "text-muted" },
  ]);

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-muted">예약 현황</p>
        <RefreshButton />
      </div>
      <StatTable rows={bookingStatusRows} />

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm font-bold text-muted">변경・취소</p>
      </div>
      <StatTable rows={changeCancelRows} />

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
