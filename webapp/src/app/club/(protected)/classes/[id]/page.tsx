import { notFound } from "next/navigation";
import { getCurrentClubOwner, getMyClasses, getMyFacility, getMyInstructors } from "@/lib/club-data";
import { getSports } from "@/lib/data";
import ClassDetailClient from "./ClassDetailClient";

export default async function ClubClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const owner = await getCurrentClubOwner();
  if (!owner) return null;

  const [classes, sports, instructors, facility] = await Promise.all([
    getMyClasses(owner.facilityId, id),
    getSports(),
    getMyInstructors(owner.facilityId),
    getMyFacility(owner.facilityId),
  ]);

  const item = classes[0];
  if (!item) notFound();

  return (
    <ClassDetailClient
      item={item}
      sports={sports}
      facilityId={owner.facilityId}
      instructors={instructors}
      offersAcademy={facility?.offersAcademy ?? true}
      offersLesson={facility?.offersLesson ?? false}
    />
  );
}
