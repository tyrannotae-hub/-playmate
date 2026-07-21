import { getCurrentClubOwner, getMyClubBookings } from "@/lib/club-data";
import BookingsClient from "./BookingsClient";

export default async function ClubBookingsPage() {
  const owner = await getCurrentClubOwner();
  if (!owner) return null;

  const bookings = await getMyClubBookings(owner.facilityId);

  return <BookingsClient bookings={bookings} />;
}
