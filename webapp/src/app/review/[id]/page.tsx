import { notFound, redirect } from "next/navigation";
import ReviewForm from "./ReviewForm";
import { getBookingById, getCurrentParent } from "@/lib/data";

export const runtime = "edge";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentParent();
  if (!user) redirect(`/login?next=/review/${id}`);

  const booking = await getBookingById(id);
  if (!booking) notFound();
  if (booking.status !== "completed") notFound();

  return <ReviewForm booking={booking} />;
}
