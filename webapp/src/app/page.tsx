import Link from "next/link";
import TopNav from "@/components/TopNav";
import ClassCardCompact from "@/components/ClassCardCompact";
import ScrollSection from "@/components/ScrollSection";
import SportCategoryRow from "@/components/SportCategoryRow";
import { getAllClasses, getCurrentParent, getMyChildren, getMyWishlistIds, getSports } from "@/lib/data";
import { cardClass } from "@/lib/ui";

export default async function HomePage() {
  const [classes, sports, user] = await Promise.all([
    getAllClasses(),
    getSports(),
    getCurrentParent(),
  ]);
  const [children, wishedIds] = user
    ? await Promise.all([getMyChildren(), getMyWishlistIds()])
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
          <p className="mb-5 text-[15px] text-muted">
            {child
              ? `안녕하세요 👋 ${child.name}(${child.age}세)의 운동을 찾아볼까요?`
              : "안녕하세요 👋 우리 아이에게 맞는 운동을 찾아볼까요?"}
          </p>

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

        <ScrollSection title="🔥 인기 클래스">
          {popular.map((c) => (
            <ClassCardCompact key={c.id} item={c} wished={wishedSet.has(c.id)} />
          ))}
          {popular.length === 0 && (
            <p className="py-6 text-sm text-muted">곧 클래스가 열려요.</p>
          )}
        </ScrollSection>

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
