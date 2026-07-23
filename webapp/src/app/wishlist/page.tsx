import { redirect } from "next/navigation";
import TopNav from "@/components/TopNav";
import {
  getCurrentParent,
  getMyWishlistClasses,
  getMyWishlistedFacilities,
  getMyWishlistedInstructors,
} from "@/lib/data";
import WishlistTabs from "./WishlistTabs";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const user = await getCurrentParent();
  if (!user) redirect("/login?next=/wishlist");

  const [classes, instructors, facilities] = await Promise.all([
    getMyWishlistClasses(user.id),
    getMyWishlistedInstructors(user.id),
    getMyWishlistedFacilities(user.id),
  ]);

  return (
    <>
      <TopNav title="찜" />
      <main className="px-4 pb-10 pt-4">
        <WishlistTabs classes={classes} instructors={instructors} facilities={facilities} />
      </main>
    </>
  );
}
