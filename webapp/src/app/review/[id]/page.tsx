import { notFound } from "next/navigation";
import ReviewForm from "./ReviewForm";
import { bookings } from "@/lib/mock-data";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = bookings.find((b) => b.id === id);
  if (!booking) notFound();

  return <ReviewForm booking={booking} />;
}
