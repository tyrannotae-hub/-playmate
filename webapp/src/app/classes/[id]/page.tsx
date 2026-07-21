import { notFound } from "next/navigation";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import DetailTabs from "./DetailTabs";
import { getClassById, getReviewsForClass, getSportById } from "@/lib/mock-data";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = getClassById(id);
  if (!item) notFound();

  const sport = getSportById(item.sportId);
  const reviews = getReviewsForClass(item.id);

  return (
    <>
      <TopNav back />
      <main className="pb-28">
        <div className="flex h-40 items-center justify-center bg-rink-soft text-5xl">
          {sport?.emoji}
        </div>

        <div className="px-4 pt-4">
          <p className="text-xs font-bold text-muted">{item.facility.name}</p>
          <h1 className="mt-1 text-xl font-extrabold">{item.name}</h1>
          <p className="mt-1.5 text-sm text-muted">
            ★ {item.rating} (리뷰 {item.reviewCount}) · {item.facility.address}
          </p>

          <div className="mt-5">
            <DetailTabs item={item} reviews={reviews} />
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-surface p-4">
            <p className="text-lg font-extrabold tabular-nums">
              {item.priceUnit} {item.price.toLocaleString()}원
            </p>
            <p className="mt-1 text-xs text-muted">현장 결제 또는 계좌이체로 진행돼요</p>
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-16 z-20 mx-auto w-full max-w-md border-t border-line bg-surface px-4 py-3">
        <Link
          href={`/booking/${item.id}`}
          className="block w-full rounded-full bg-energy py-3.5 text-center text-sm font-bold text-[#1A0E08]"
        >
          예약 신청하기
        </Link>
      </div>
    </>
  );
}
