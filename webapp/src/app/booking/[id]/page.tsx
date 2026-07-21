import { notFound } from "next/navigation";
import BookingForm from "./BookingForm";
import { getClassById } from "@/lib/mock-data";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = getClassById(id);
  if (!item) notFound();

  return <BookingForm item={item} />;
}
