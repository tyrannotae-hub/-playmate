import { notFound, redirect } from "next/navigation";
import BookingForm from "./BookingForm";
import { getClassById, getCurrentParent, getMyChildren } from "@/lib/data";

export const runtime = "edge";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentParent();
  if (!user) redirect(`/login?next=/booking/${id}`);

  const item = await getClassById(id);
  if (!item) notFound();

  const children = await getMyChildren();

  return <BookingForm item={item} initialChildren={children} />;
}
