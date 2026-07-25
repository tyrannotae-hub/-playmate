import { getCurrentClubOwner, getMyClasses, getMyFacility, getMyInstructors } from "@/lib/club-data";
import { getSports } from "@/lib/data";
import ClassesClient from "./ClassesClient";

export default async function ClubClassesPage() {
  const owner = await getCurrentClubOwner();
  if (!owner) return null;

  const [classes, sports, instructors, facility] = await Promise.all([
    getMyClasses(owner.facilityId),
    getSports(),
    getMyInstructors(owner.facilityId),
    getMyFacility(owner.facilityId),
  ]);

  return (
    <ClassesClient
      facilityId={owner.facilityId}
      initialClasses={classes}
      sports={sports}
      instructors={instructors}
      offersAcademy={facility?.offersAcademy ?? true}
      offersLesson={facility?.offersLesson ?? false}
    />
  );
}
