import Link from "next/link";
import { redirect } from "next/navigation";
import TopNav from "@/components/TopNav";
import StatusBadge from "@/components/StatusBadge";
import CancelBookingButton from "../CancelBookingButton";
import ChangeBookingButton from "../ChangeBookingButton";
import { getCurrentParent, getMyBookings } from "@/lib/data";
import { cardClass } from "@/lib/ui";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function MyBookingsPage() {
  const user = await getCurrentParent();
  if (!user) redirect("/login?next=/mypage/bookings");

  const bookings = await getMyBookings();

  return (
    <>
      <TopNav title="예약 내역" back />
      <main className="px-4 pb-10 pt-4">
        <div className="flex flex-col gap-2.5">
          {bookings.map((b) => (
            <div key={b.id} className={cardClass()}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{b.className}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {b.facilityName} · {b.childName}
                  </p>
                  <p className="mt-1 text-xs text-muted">{b.scheduleLabel}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              {b.status === "completed" && (
                <Link
                  href={`/review/${b.id}`}
                  className="btn-label mt-3 inline-block rounded-md bg-rink-soft px-3 py-1.5 text-xs font-bold text-rink-deep"
                >
                  리뷰 쓰기
                </Link>
              )}
              {(b.status === "requested" || b.status === "confirmed") && (
                <>
                  <CancelBookingButton booking={b} />
                  <ChangeBookingButton booking={b} />
                </>
              )}
            </div>
          ))}
          {bookings.length === 0 && (
            <p className="py-4 text-sm text-muted">아직 예약 내역이 없어요.</p>
          )}
        </div>
      </main>
    </>
  );
}
