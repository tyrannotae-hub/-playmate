import { redirect } from "next/navigation";
import { getCurrentClubOwner } from "@/lib/club-data";
import SettingsForm from "./SettingsForm";

export default async function ClubSettingsPage() {
  const owner = await getCurrentClubOwner();
  if (!owner) redirect("/club/login");

  return <SettingsForm owner={owner} />;
}
