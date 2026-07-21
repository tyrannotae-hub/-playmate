import { getCurrentClubOwner, getMyClasses } from "@/lib/club-data";
import { getSports } from "@/lib/data";
import ClassesClient from "./ClassesClient";

export default async function ClubClassesPage() {
  const owner = await getCurrentClubOwner();
  if (!owner) return null;

  const [classes, sports] = await Promise.all([
    getMyClasses(owner.facilityId),
    getSports(),
  ]);

  return <ClassesClient facilityId={owner.facilityId} initialClasses={classes} sports={sports} />;
}
