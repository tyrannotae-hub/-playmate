import { notFound, redirect } from "next/navigation";
import BookingForm from "./BookingForm";
import { getClassById, getCurrentParent, getMyChildren } from "@/lib/data";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [user, item] = await Promise.all([getCurrentParent(), getClassById(id)]);
  if (!user) redirect(`/login?next=/booking/${id}`);
  if (!item) notFound();

  const children = await getMyChildren();

  return <BookingForm item={item} initialChildren={children} />;
}
