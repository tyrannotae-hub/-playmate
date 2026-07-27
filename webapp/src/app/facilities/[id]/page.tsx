import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import TopNav from "@/components/TopNav";
import FacilityWishlistButton from "@/components/FacilityWishlistButton";
import { getCurrentParent, getFacilityHome, getFacilityWishInfo, getMyWishlistIds } from "@/lib/data";
import FacilityContactLinks from "@/components/FacilityContactLinks";
import PromoCarousel from "@/components/facility/PromoCarousel";
import HomeCategoryShowcase from "./HomeCategoryShowcase";
import FacilityClassGrid from "./FacilityClassGrid";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function FacilityHomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, facility] = await Promise.all([getCurrentParent(), getFacilityHome(id)]);
  const [facilityWishInfo, wishedClassIds] = user
    ? await Promise.all([getFacilityWishInfo(id, user.id), getMyWishlistIds(user.id)])
    : [await getFacilityWishInfo(id), []];
  if (!facility) notFound();

  // 홍보 캐러셀에 올릴 사진이 아직 없으면, 예전 방식으로 올려둔 커버 사진 1장을 그대로 보여준다.
  const heroImages =
    facility.promoImages.length > 0
      ? facility.promoImages
      : facility.coverImageUrl
        ? [{ url: facility.coverImageUrl }]
        : [];

  return (
    <>
      <TopNav back />
      <main className="pb-10">
        <div className="px-4 pt-3">
          {heroImages.length > 0 ? (
            <PromoCarousel images={heroImages} facilityId={facility.id} />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-rink-soft">
              <span className="text-4xl">🏟️</span>
            </div>
          )}
        </div>

        <div className="px-4 pt-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-rink-soft text-rink-deep">
              {facility.profileImageUrl ? (
                <Image
                  src={facility.profileImageUrl}
                  alt={facility.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <span className="text-2xl">🏟️</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="truncate text-base font-extrabold">{facility.name}</h1>
                <FacilityWishlistButton
                  facilityId={facility.id}
                  initialWished={facilityWishInfo.wished}
                  initialCount={facilityWishInfo.count}
                  size="sm"
                />
              </div>
              <div className="mt-1.5">
                <FacilityContactLinks
                  phone={facility.phone}
                  instagramUrl={facility.instagramUrl}
                  facilityName={facility.name}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pt-4">
          <Link
            href={`/facilities/${facility.id}/info`}
            className="flex items-center justify-between rounded-xs border border-line px-3.5 py-3"
          >
            <span className="text-sm font-bold">클럽 정보</span>
            <span className="text-muted">{">"}</span>
          </Link>
        </div>

        <HomeCategoryShowcase
          categories={facility.homeCategories}
          allClasses={facility.classes}
          wishedIds={wishedClassIds}
        />

        <div className="mt-8">
          <FacilityClassGrid classes={facility.classes} wishedIds={wishedClassIds} />
        </div>
      </main>
    </>
  );
}
