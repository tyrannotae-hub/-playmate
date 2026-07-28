import { redirect } from "next/navigation";
import { getCurrentClubOwner, hasPendingWithdrawalRequest } from "@/lib/club-data";
import SettingsForm from "./SettingsForm";

export default async function ClubSettingsPage() {
  const owner = await getCurrentClubOwner();
  if (!owner) redirect("/club/login");

  const pendingWithdrawal = await hasPendingWithdrawalRequest(owner.facilityId);

  return <SettingsForm owner={owner} initialPendingWithdrawal={pendingWithdrawal} />;
}
