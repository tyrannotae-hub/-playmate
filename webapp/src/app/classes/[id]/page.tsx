import { notFound } from "next/navigation";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import DetailTabs from "./DetailTabs";
import ClassGallery from "./ClassGallery";
import { getClassById, getCurrentParent, getMyWishlistIds, getReviewsForClass } from "@/lib/data";
import { sportEmoji } from "@/lib/sport-meta";
import { buttonClass, cardClass } from "@/lib/ui";
import WishlistButton from "@/components/WishlistButton";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getClassById(id);
  if (!item) notFound();

  const [reviews, user] = await Promise.all([getReviewsForClass(item.id), getCurrentParent()]);
  const wishedIds = user ? await getMyWishlistIds() : [];
  const wished = wishedIds.includes(item.id);

  return (
    <>
      <TopNav back />
      <main className="pb-36">
        <ClassGallery images={item.images} emoji={sportEmoji(item.sportId)} />

        <div className="px-4 pt-4">
          <div className="flex items-start justify-between gap-3">
            <Link href={`/facilities/${item.facility.id}`} className="text-xs font-bold text-rink-deep">
              {item.facility.name} →
            </Link>
            <WishlistButton classId={item.id} initialWished={wished} />
          </div>
          <h1 className="mt-1 text-xl font-extrabold">{item.name}</h1>
          <p className="mt-1.5 text-sm text-muted">
            {item.reviewCount > 0
              ? `★ ${item.rating} (리뷰 ${item.reviewCount})`
              : "아직 리뷰가 없어요"}{" "}
            · {item.facility.address}
          </p>

          <div className="mt-5">
            <DetailTabs item={item} reviews={reviews} />
          </div>

          <div className={cardClass("mt-6")}>
            <p className="text-lg font-extrabold tabular-nums">
              {item.priceUnit} {item.price.toLocaleString()}원
            </p>
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
