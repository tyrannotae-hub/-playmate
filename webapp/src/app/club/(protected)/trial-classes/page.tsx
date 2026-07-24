import { getCurrentClubOwner, getMyClasses } from "@/lib/club-data";
import TrialClassesCalendar from "./TrialClassesCalendar";

export default async function ClubTrialClassesPage() {
  const owner = await getCurrentClubOwner();
  if (!owner) return null;

  const classes = await getMyClasses(owner.facilityId);

  return <TrialClassesCalendar classes={classes} />;
}
