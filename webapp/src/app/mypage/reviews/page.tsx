import { redirect } from "next/navigation";
import TopNav from "@/components/TopNav";
import { getCurrentParent, getMyReviews } from "@/lib/data";
import { cardClass } from "@/lib/ui";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function MyReviewsPage() {
  const user = await getCurrentParent();
  if (!user) redirect("/login?next=/mypage/reviews");

  const reviews = await getMyReviews(user.id);

  return (
    <>
      <TopNav title="내가 쓴 리뷰" back />
      <main className="px-4 pb-10 pt-4">
        <div className="flex flex-col gap-2.5">
          {reviews.map((r) => (
            <div key={r.id} className={cardClass()}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold">{r.className}</p>
                <span className="text-xs font-bold">
                  <span className="text-energy">{"★".repeat(r.rating)}</span>
                  <span className="text-line">{"★".repeat(5 - r.rating)}</span>
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted">{r.facilityName}</p>
              {r.content && <p className="mt-2 whitespace-pre-line text-sm">{r.content}</p>}
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="py-4 text-sm text-muted">아직 작성한 리뷰가 없어요.</p>
          )}
        </div>
      </main>
    </>
  );
}
