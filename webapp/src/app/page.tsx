import Link from "next/link";
import TopNav from "@/components/TopNav";
import ClassCardCompact from "@/components/ClassCardCompact";
import FacilityCard from "@/components/FacilityCard";
import SportCategoryRow from "@/components/SportCategoryRow";
import PromoBanner from "@/components/PromoBanner";
import InstructorHoverGrid from "@/components/InstructorHoverGrid";
import DayFilterBrowser from "@/components/DayFilterBrowser";
import {
  facilitiesFromClasses,
  getAllClasses,
  getCurrentParent,
  getFeaturedInstructors,
  getMyChildren,
  getMyFacilityWishlistIds,
  getMyInstructorWishlistIds,
  getMyWishlistIds,
  getSports,
} from "@/lib/data";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [classes, sports, instructors, user] = await Promise.all([
    getAllClasses(),
    getSports(),
    getFeaturedInstructors(),
    getCurrentParent(),
  ]);
  const facilities = await facilitiesFromClasses(classes);
  const popularFacilities = [...facilities]
    .sort((a, b) => b.popularity - a.popularity || b.classCount - a.classCount)
    .slice(0, 10);
  const [children, wishedIds, wishedInstructorIds, wishedFacilityIds] = user
    ? await Promise.all([
        getMyChildren(),
        getMyWishlistIds(user.id),
        getMyInstructorWishlistIds(user.id),
        getMyFacilityWishlistIds(user.id),
      ])
    : [[], [], [], []];
  const child = children[0];
  const wishedSet = new Set(wishedIds);
  const wishedFacilitySet = new Set(wishedFacilityIds);

  const popular = [...classes].sort((a, b) => b.rating - a.rating).slice(0, 10);
  const browseClasses = [...classes].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  );
  const sportCounts: Record<string, number> = {};
  classes.forEach((c) => {
    sportCounts[c.sportId] = (sportCounts[c.sportId] ?? 0) + 1;
  });

  return (
    <>
      <TopNav />
      <main className="pb-10">
        <PromoBanner />
        <div className="px-4 pt-4">
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

          <Link
            href="/recommend"
            className="flex items-center gap-3 rounded-md bg-rink-deep px-4 py-4 text-white transition hover:opacity-90"
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M9.5 9.5a2.5 2.5 0 0 1 4.7 1.2c0 1.6-2.2 1.8-2.2 3.3" />
              <path d="M12 17.5v.1" />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">아직 종목을 못 정하셨나요?</p>
              <p className="text-xs text-white/75">우리 아이에게 맞는 운동 추천받기</p>
            </div>
            <span className="shrink-0 text-lg">→</span>
          </Link>
        </div>

        {sports.length > 0 && (
          <div className="mt-8 px-4">
            <h2 className="mb-3 text-lg font-bold">종목별로 둘러보기</h2>
            <SportCategoryRow sports={sports} counts={sportCounts} />
          </div>
        )}

        {classes.length > 0 && (
          <DayFilterBrowser classes={classes} sports={sports} wishedIds={wishedIds} />
        )}

        <div className="mt-8" id="popular">
          <h2 className="mb-3 px-4 text-lg font-bold">인기 클래스</h2>
          {popular.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto px-4 pb-1">
              {popular.slice(0, 8).map((c) => (
                <ClassCardCompact key={c.id} item={c} wished={wishedSet.has(c.id)} />
              ))}
            </div>
          ) : (
            <p className="px-4 py-6 text-sm text-muted">곧 클래스가 열려요.</p>
          )}
        </div>

        {popularFacilities.length > 0 && (
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between px-4">
              <h2 className="text-lg font-bold">인기 팀・클럽</h2>
              <Link href="/facilities" className="text-xs font-bold text-rink-deep">
                전체보기 →
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto px-4 pb-1">
              {popularFacilities.map((f) => (
                <FacilityCard key={f.id} item={f} wished={wishedFacilitySet.has(f.id)} />
              ))}
            </div>
          </div>
        )}

        {instructors.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 px-4 text-lg font-bold">우리 지도자들</h2>
            <InstructorHoverGrid instructors={instructors} wishedInstructorIds={wishedInstructorIds} />
          </div>
        )}

        {browseClasses.length > 0 && (
          <div className="mt-8 px-4">
            <h2 className="mb-3 text-lg font-bold">전체 클래스 둘러보기</h2>
            <div className="grid grid-cols-2 gap-3">
              {browseClasses.map((c) => (
                <ClassCardCompact
                  key={c.id}
                  item={c}
                  wished={wishedSet.has(c.id)}
                  variant="grid"
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
