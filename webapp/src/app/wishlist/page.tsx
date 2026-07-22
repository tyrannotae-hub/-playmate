import { redirect } from "next/navigation";
import TopNav from "@/components/TopNav";
import ClassCard from "@/components/ClassCard";
import { getCurrentParent, getMyWishlistClasses } from "@/lib/data";

export default async function WishlistPage() {
  const user = await getCurrentParent();
  if (!user) redirect("/login?next=/wishlist");

  const classes = await getMyWishlistClasses(user.id);

  return (
    <>
      <TopNav title="찜한 클래스" />
      <main className="px-4 pb-10 pt-4">
        <div className="flex flex-col gap-3">
          {classes.map((c) => (
            <ClassCard key={c.id} item={c} wished />
          ))}
          {classes.length === 0 && (
            <p className="py-10 text-center text-sm text-muted">
              아직 찜한 클래스가 없어요. 마음에 드는 클래스에서 ♡를 눌러보세요.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
