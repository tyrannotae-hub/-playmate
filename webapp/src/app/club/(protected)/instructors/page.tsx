import { getCurrentClubOwner, getMyInstructors } from "@/lib/club-data";
import InstructorsClient from "./InstructorsClient";

export default async function ClubInstructorsPage() {
  const owner = await getCurrentClubOwner();
  if (!owner) return null;

  const instructors = await getMyInstructors(owner.facilityId);

  return <InstructorsClient facilityId={owner.facilityId} initialInstructors={instructors} />;
}
