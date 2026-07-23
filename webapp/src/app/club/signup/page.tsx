import { getSports } from "@/lib/data";
import ClubSignupClient from "./ClubSignupClient";

export default async function ClubSignupPage() {
  const sports = await getSports();
  return <ClubSignupClient sports={sports} />;
}
