import Link from "next/link";
import { getCurrentClubOwner, getMyClasses, getMyClubBookings, getMyFacility } from "@/lib/club-data";
import BookingRow from "@/components/club/BookingRow";
import FacilityInfoForm from "./FacilityInfoForm";

export default async function ClubDashboardPage() {
  const owner = await getCurrentClubOwner();
  if (!owner) return null;

  const [facility, classes, bookings] = await Promise.all([
    getMyFacility(owner.facilityId),
    getMyClasses(owner.facilityId),
    getMyClubBookings(owner.facilityId),
  ]);

  const pending = bookings.filter((b) => b.status === "requested");
  const confirmed = bookings.filter((b) => b.status === "confirmed");

  return (
    <>
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl border border-line bg-surface p-4 text-center">
          <p className="text-2xl font-extrabold">{classes.length}</p>
          <p className="mt-1 text-xs text-muted">운영 클래스</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4 text-center">
          <p className="text-2xl font-extrabold text-warn">{pending.length}</p>
          <p className="mt-1 text-xs text-muted">승인 대기</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4 text-center">
          <p className="text-2xl font-extrabold text-good">{confirmed.length}</p>
          <p className="mt-1 text-xs text-muted">확정 예약</p>
        </div>
      </div>

      {facility && (
        <div className="mt-6">
          <p className="mb-2.5 text-sm font-bold text-muted">시설 정보</p>
          <FacilityInfoForm facility={facility} />
        </div>
      )}

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
