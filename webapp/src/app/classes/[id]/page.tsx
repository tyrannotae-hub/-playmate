import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import TopNav from "@/components/TopNav";
import DetailTabs from "./DetailTabs";
import ClassGallery from "./ClassGallery";
import StickyBookingCta from "./StickyBookingCta";
import SportIcon from "@/components/icons/SportIcon";
import {
  getClassById,
  getCurrentParent,
  getMyInstructorWishlistIds,
  getMyWishlistIds,
  getReviewsForClass,
  getSports,
} from "@/lib/data";
import WishlistButton from "@/components/WishlistButton";
import {
  effectivePrice,
  effectiveTrialPrice,
  isDiscountActive,
  isTrialDiscountActive,
} from "@/lib/pricing";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, reviews, user, sports] = await Promise.all([
    getClassById(id),
    getReviewsForClass(id),
    getCurrentParent(),
    getSports(),
  ]);
  if (!item) notFound();

  const [wishedIds, wishedInstructorIds] = user
    ? await Promise.all([getMyWishlistIds(user.id), getMyInstructorWishlistIds(user.id)])
    : [[], []];
  const wished = wishedIds.includes(item.id);
  const sport = sports.find((s) => s.id === item.sportId);

  const discountPct = isDiscountActive(item)
    ? Math.round((1 - effectivePrice(item) / item.price) * 100)
    : null;
  const trialDiscountPct =
    item.allowTrial && item.trialPrice != null && isTrialDiscountActive(item)
      ? Math.round((1 - effectiveTrialPrice(item)! / item.trialPrice) * 100)
      : null;

  return (
    <>
      <TopNav back />
      <main className="pb-36">
        <ClassGallery
          images={item.images}
          sportId={item.sportId}
          bannerTitle={item.bannerTitle}
          bannerSubtitle={item.bannerSubtitle}
          phone={item.facility.phone}
          instagramUrl={item.facility.instagramUrl}
          facilityName={item.facility.name}
        />

        <div className="px-4 pt-4">
          <div className="mb-2.5 flex items-center gap-1.5">
            {sport && (
              <span className="btn-label inline-flex items-center gap-1 rounded-xs bg-rink-soft px-2.5 py-1 text-xs font-bold text-rink-deep">
                <SportIcon sportId={sport.id} size={14} /> {sport.name}
              </span>
            )}
            {item.allowTrial && (
              <span className="rounded-xs bg-rink-soft px-2.5 py-1 text-xs font-bold text-rink-deep">
                원데이 체험 가능
              </span>
            )}
          </div>

          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl leading-snug">{item.name}</h1>
            <WishlistButton classId={item.id} initialWished={wished} initialCount={item.wishCount} />
          </div>

          {(item.facility.address || item.reviewCount > 0) && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
              {item.facility.address && (
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="shrink-0"
                >
                  <path d="M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21Z" />
                  <circle cx="12" cy="10.5" r="2.3" />
                </svg>
              )}
              <span className="truncate">
                {item.facility.address}
                {item.facility.address && item.reviewCount > 0 && " · "}
                {item.reviewCount > 0 && `★ ${item.rating} (리뷰 ${item.reviewCount})`}
              </span>
            </div>
          )}

          <div className="mt-4 rounded-xs border border-line bg-surface-2 p-4">
            <div className="flex items-center justify-between border-b border-dashed border-line pb-3">
              <div>
                <p className="text-xs font-bold text-muted">정기</p>
                <div className="mt-0.5 flex items-baseline gap-1.5 tabular-nums">
                  {item.showPrice ? (
                    isDiscountActive(item) ? (
                      <>
                        <span className="text-xs text-muted line-through">
                          {item.priceUnit} {item.price.toLocaleString()}원
                        </span>
                        <span className="text-lg font-extrabold">
                          {item.priceUnit} {effectivePrice(item).toLocaleString()}원
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-extrabold">
                        {item.priceUnit} {item.price.toLocaleString()}원
                      </span>
                    )
                  ) : (
                    <span className="text-lg font-extrabold text-muted">가격문의</span>
                  )}
                </div>
              </div>
              {discountPct != null && (
                <span className="shrink-0 rounded-xs bg-energy px-2.5 py-1 text-xs font-bold text-white">
                  {discountPct}% 할인
                </span>
              )}
            </div>

            {item.allowTrial && item.trialPrice != null && (
              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-xs font-bold text-muted">원데이</p>
                  <div className="mt-0.5 flex items-baseline gap-1.5 tabular-nums">
                    {item.showTrialPrice ? (
                      isTrialDiscountActive(item) ? (
                        <>
                          <span className="text-xs text-muted line-through">
                            {item.trialPrice.toLocaleString()}원
                          </span>
                          <span className="text-lg font-extrabold">
                            {effectiveTrialPrice(item)!.toLocaleString()}원
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-extrabold">
                          {item.trialPrice.toLocaleString()}원
                        </span>
                      )
                    ) : (
                      <span className="text-lg font-extrabold text-muted">가격문의</span>
                    )}
                  </div>
                </div>
                {trialDiscountPct != null && (
                  <span className="shrink-0 rounded-xs bg-energy px-2.5 py-1 text-xs font-bold text-white">
                    {trialDiscountPct}% 할인
                  </span>
                )}
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-muted">💳 현장 결제 또는 계좌이체로 진행돼요</p>

          <Link
            href={`/facilities/${item.facility.id}`}
            className="mt-5 flex items-center gap-2.5 rounded-lg border border-line px-3 py-2"
          >
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-rink to-rink-deep text-sm font-extrabold text-white">
              {item.facility.profileImageUrl ? (
                <Image
                  src={item.facility.profileImageUrl}
                  alt=""
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              ) : (
                item.facility.name.slice(0, 1)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold">{item.facility.name}</p>
              {item.facility.address && (
                <p className="truncate text-[11px] text-muted">{item.facility.address}</p>
              )}
            </div>
          </Link>

          <div className="mt-6">
            <DetailTabs item={item} reviews={reviews} wishedInstructorIds={wishedInstructorIds} />
          </div>
        </div>
      </main>

      <StickyBookingCta classId={item.id} />
    </>
  );
}
