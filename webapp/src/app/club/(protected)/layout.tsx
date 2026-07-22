import { redirect } from "next/navigation";
import ClubNav from "@/components/ClubNav";
import { getCurrentClubOwner, getMyFacility } from "@/lib/club-data";

export default async function ClubProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const owner = await getCurrentClubOwner();
  if (!owner) redirect("/club/login");

  const facility = await getMyFacility(owner.facilityId);

  return (
    <>
      <ClubNav
        facilityName={facility?.name ?? "내 클럽"}
        ownerType={facility?.ownerType ?? "club"}
      />
      <main className="px-4 pb-10 pt-5">{children}</main>
    </>
  );
}
