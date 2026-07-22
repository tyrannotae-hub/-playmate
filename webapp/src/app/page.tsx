import Link from "next/link";
import TopNav from "@/components/TopNav";
import ClassCardCompact from "@/components/ClassCardCompact";
import ScrollSection from "@/components/ScrollSection";
import SportCategoryRow from "@/components/SportCategoryRow";
import { HoverExpand_001 } from "@/components/ui/skiper-ui/skiper52";
import { getAllClasses, getCurrentParent, getMyChildren, getMyWishlistIds, getSports } from "@/lib/data";
import { cardClass } from "@/lib/ui";

export const runtime = "edge";

export default async function HomePage() {
  const [classes, sports, user] = await Promise.all([
    getAllClasses(),
    getSports(),
    getCurrentParent(),
  ]);
  const [children, wishedIds] = user
    ? await Promise.all([getMyChildren(), getMyWishlistIds(user.id)])
    : [[], []];
  const child = children[0];
  const wishedSet = new Set(wishedIds);

  const popular = [...classes].sort((a, b) => b.rating - a.rating).slice(0, 10);
  const newest = [...classes]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 10);
  const sportCounts: Record<string, number> = {};
  classes.forEach((c) => {
    sportCounts[c.sportId] = (sportCounts[c.sportId] ?? 0) + 1;
  });

  return (
    <>
      <TopNav />
      <main className="pb-10 pt-2">
        <div className="px-4">
          <div className="mb-5 flex items-center gap-2.5">
            {child?.photoUrl && (
              <div
                className="h-8 w-8 shrink-0 rounded-full border border-line bg-surface-2 bg-cover bg-center"
                style={{ backgroundImage: `url(${child.photoUrl})` }}
              />
            )}
            <p className="text-[15px] text-muted">
              {child
                ? `안녕하세요 👋 ${child.name}(${child.age}세)의 운동을 찾아볼까요?`
                : "안녕하세요 👋 우리 아이에게 맞는 운동을 찾아볼까요?"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/recommend" className={cardClass("transition hover:border-rink")}>
              <div className="text-xs font-bold text-muted">종목을 모르겠어요</div>
              <div className="mt-1 text-sm font-extrabold text-rink-deep">추천받기 →</div>
            </Link>
            <Link href="/search" className={cardClass("transition hover:border-rink")}>
              <div className="text-xs font-bold text-muted">종목을 이미 알아요</div>
              <div className="mt-1 text-sm font-extrabold text-rink-deep">바로 검색 →</div>
            </Link>
          </div>
        </div>

        {sports.length > 0 && (
          <ScrollSection title="🏷️ 종목별로 둘러보기">
            <SportCategoryRow sports={sports} counts={sportCounts} />
          </ScrollSection>
        )}

        <div className="mt-8">
          <h2 className="mb-3 px-4 text-base font-bold">🔥 인기 클래스</h2>
          {popular.length > 0 ? (
            <div className="px-4">
              <HoverExpand_001 classes={popular.slice(0, 8)} />
            </div>
          ) : (
            <p className="px-4 py-6 text-sm text-muted">곧 클래스가 열려요.</p>
          )}
        </div>

        {newest.length > 0 && (
          <ScrollSection title="🆕 새로 등록된 클래스">
            {newest.map((c) => (
              <ClassCardCompact key={c.id} item={c} wished={wishedSet.has(c.id)} />
            ))}
          </ScrollSection>
        )}
      </main>
    </>
  );
}
