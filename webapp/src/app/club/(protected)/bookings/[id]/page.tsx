import Link from "next/link";
import { notFound } from "next/navigation";
import BookingRow from "@/components/club/BookingRow";
import { getClubBookingById, getCurrentClubOwner } from "@/lib/club-data";

export default async function ClubBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const owner = await getCurrentClubOwner();
  if (!owner) return null;

  const booking = await getClubBookingById(owner.facilityId, id);
  if (!booking) notFound();

  return (
    <>
      <Link href="/club/bookings" className="text-xs font-bold text-muted">
        ← 예약 목록으로
      </Link>
      <div className="mt-3">
        <BookingRow booking={booking} linkToDetail={false} />
      </div>
      <Link
        href={`/club/bookings?classId=${booking.classId}`}
        className="mt-4 inline-block text-xs font-bold text-rink-deep"
      >
        이 클래스의 예약 전체 보기 →
      </Link>
    </>
  );
}
