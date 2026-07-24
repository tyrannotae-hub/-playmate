import { notFound } from "next/navigation";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import DetailTabs from "./DetailTabs";
import ClassGallery from "./ClassGallery";
import {
  getClassById,
  getCurrentParent,
  getMyInstructorWishlistIds,
  getMyWishlistIds,
  getReviewsForClass,
} from "@/lib/data";
import { buttonClass } from "@/lib/ui";
import WishlistButton from "@/components/WishlistButton";
import FacilityContactLinks from "@/components/FacilityContactLinks";
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
  const [item, reviews, user] = await Promise.all([
    getClassById(id),
    getReviewsForClass(id),
    getCurrentParent(),
  ]);
  if (!item) notFound();

  const [wishedIds, wishedInstructorIds] = user
    ? await Promise.all([getMyWishlistIds(user.id), getMyInstructorWishlistIds(user.id)])
    : [[], []];
  const wished = wishedIds.includes(item.id);

  return (
    <>
      <TopNav back />
      <main className="pb-36">
        <ClassGallery images={item.images} sportId={item.sportId} />

        <div className="px-4 pt-4">
          <div className="flex items-start justify-between gap-3">
            <Link href={`/facilities/${item.facility.id}`} className="text-xs font-bold text-rink-deep">
              {item.facility.name} →
            </Link>
            <div className="flex shrink-0 items-center gap-1">
              <FacilityContactLinks
                phone={item.facility.phone}
                instagramUrl={item.facility.instagramUrl}
                facilityName={item.facility.name}
              />
              <WishlistButton classId={item.id} initialWished={wished} initialCount={item.wishCount} />
            </div>
          </div>
          <h1 className="mt-1 text-xl font-extrabold">{item.name}</h1>
          <p className="mt-1.5 text-sm text-muted">
            {item.reviewCount > 0
              ? `★ ${item.rating} (리뷰 ${item.reviewCount})`
              : "아직 리뷰가 없어요"}{" "}
            · {item.facility.address}
          </p>
          {item.allowTrial && (
            <span className="mt-2 inline-block rounded-md bg-rink/10 px-2 py-0.5 text-xs font-bold text-rink-deep">
              원데이 체험 가능
            </span>
          )}

          <div className="mt-5">
            <DetailTabs item={item} reviews={reviews} wishedInstructorIds={wishedInstructorIds} />
          </div>

          <div className="mt-6 border-t border-line pt-6">
            {item.showPrice ? (
              isDiscountActive(item) ? (
                <div className="flex items-baseline gap-2">
                  <p className="text-sm text-muted line-through tabular-nums">
                    {item.priceUnit} {item.price.toLocaleString()}원
                  </p>
                  <p className="text-lg font-extrabold text-energy tabular-nums">
                    {item.priceUnit} {effectivePrice(item).toLocaleString()}원
                  </p>
                </div>
              ) : (
                <p className="text-lg font-extrabold tabular-nums">
                  {item.priceUnit} {item.price.toLocaleString()}원
                </p>
              )
            ) : (
              <p className="text-lg font-extrabold tabular-nums">가격 문의</p>
            )}
            {item.allowTrial && item.trialPrice != null && (
              <p className="mt-1 text-sm text-muted tabular-nums">
                {item.showTrialPrice ? (
                  isTrialDiscountActive(item) ? (
                    <>
                      원데이 체험{" "}
                      <span className="line-through">{item.trialPrice.toLocaleString()}원</span>{" "}
                      <span className="font-bold text-energy">
                        {effectiveTrialPrice(item)!.toLocaleString()}원
                      </span>
                    </>
                  ) : (
                    `원데이 체험 ${item.trialPrice.toLocaleString()}원`
                  )
                ) : (
                  "원데이 체험 문의"
                )}
              </p>
            )}
            <p className="mt-1 text-xs text-muted">현장 결제 또는 계좌이체로 진행돼요</p>
          </div>
        </div>
      </main>

      <div className="shadow-elevated fixed inset-x-0 bottom-[4.5rem] z-20 mx-auto w-full max-w-md border-t border-line bg-surface px-4 py-3">
        <Link href={`/booking/${item.id}`} className={buttonClass({ className: "text-center" })}>
          예약 신청하기
        </Link>
      </div>
    </>
  );
}
