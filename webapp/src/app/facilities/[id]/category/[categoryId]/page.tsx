import { notFound } from "next/navigation";
import TopNav from "@/components/TopNav";
import ClassCardCompact from "@/components/ClassCardCompact";
import { getCurrentParent, getFacilityHome, getMyWishlistIds } from "@/lib/data";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function FacilityCategoryPage({
  params,
}: {
  params: Promise<{ id: string; categoryId: string }>;
}) {
  const { id, categoryId } = await params;
  const [user, facility] = await Promise.all([getCurrentParent(), getFacilityHome(id)]);
  if (!facility) notFound();

  const category = facility.homeCategories.find((c) => c.id === categoryId);
  if (!category) notFound();

  const wishedIds = user ? await getMyWishlistIds(user.id) : [];
  const wishedSet = new Set(wishedIds);

  const classById = new Map(facility.classes.map((c) => [c.id, c]));
  const classes = category.classIds
    .map((cid) => classById.get(cid))
    .filter((c): c is NonNullable<typeof c> => !!c);

  return (
    <>
      <TopNav title={category.name} back />
      <main className="px-4 pb-10 pt-4">
        {classes.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {classes.map((c) => (
              <ClassCardCompact key={c.id} item={c} wished={wishedSet.has(c.id)} variant="grid" />
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted">이 카테고리에 등록된 클래스가 없어요.</p>
        )}
      </main>
    </>
  );
}
