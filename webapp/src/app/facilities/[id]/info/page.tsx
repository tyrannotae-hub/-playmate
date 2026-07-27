import { notFound } from "next/navigation";
import TopNav from "@/components/TopNav";
import { getCurrentParent, getFacilityHome, getMyInstructorWishlistIds } from "@/lib/data";
import FacilityDetailTabs from "../FacilityDetailTabs";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function FacilityInfoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, facility] = await Promise.all([getCurrentParent(), getFacilityHome(id)]);
  if (!facility) notFound();

  const wishedInstructorIds = user ? await getMyInstructorWishlistIds(user.id) : [];

  return (
    <>
      <TopNav back title="클럽 정보" />
      <main className="px-4 pb-10 pt-4">
        <FacilityDetailTabs facility={facility} wishedInstructorIds={wishedInstructorIds} />
      </main>
    </>
  );
}
