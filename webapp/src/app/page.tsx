import Link from "next/link";
import TopNav from "@/components/TopNav";
import ServiceTypeTabs, { HomeTab } from "@/components/ServiceTypeTabs";
import ClassCardCompact from "@/components/ClassCardCompact";
import FacilityCard from "@/components/FacilityCard";
import SportCategoryRow from "@/components/SportCategoryRow";
import PromoBanner from "@/components/PromoBanner";
import InstructorHoverGrid from "@/components/InstructorHoverGrid";
import DayFilterBrowser from "@/components/DayFilterBrowser";
import { namesWithSuffix } from "@/lib/korean";
import {
  facilitiesFromClasses,
  getAllClasses,
  getCurrentParent,
  getFeaturedInstructors,
  getHomeBanners,
  getMyChildren,
  getMyFacilityWishlistIds,
  getMyInstructorWishlistIds,
  getMyWishlistIds,
  getSports,
} from "@/lib/data";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// 파트너(클럽) 수가 늘면 클래스 수도 같이 늘어나는데, 이 그리드를 무제한으로
// 렌더링하면 페이지 payload가 계속 커진다 — 일정 개수 이후는 검색 페이지로 유도.
const BROWSE_CLASSES_LIMIT = 20;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const typeParam = (await searchParams).type;
  const type: HomeTab =
    typeParam === "lesson" ? "lesson" : typeParam === "trial" ? "trial" : "academy";

  const [allClasses, sports, instructors, user, banners] = await Promise.all([
    getAllClasses(),
    getSports(),
    getFeaturedInstructors(),
    getCurrentParent(),
    getHomeBanners(),
  ]);
  const classes =
    type === "trial" ? allClasses.filter((c) => c.allowTrial) : allClasses.filter((c) => c.serviceType === type);
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
  const greetingNames = children.map((c) => `${c.name}(${c.age}세)`).join(", ");
  const recommendCta =
    children.length > 0
      ? `${namesWithSuffix(children.map((c) => c.name))}에게 맞는 운동 찾기`
      : "우리 아이에게 맞는 운동 찾기";
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
      <ServiceTypeTabs active={type} />
      <main className="pb-10">
        <div className="px-4 pt-3">
          <PromoBanner banners={banners} />
        </div>

        <div className="px-4 pt-4">
          <Link
            href="/recommend"
            className="flex items-center gap-3 rounded-sm bg-[#0d3f63] px-4 py-4 text-white transition hover:opacity-90"
          >
            {children.length >= 2 ? (
              <div className="flex shrink-0 -space-x-3">
                {children.slice(0, 2).map((c) => (
                  <div
                    key={c.id}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-rink-deep bg-white/15 bg-cover bg-center text-sm font-bold"
                    style={c.photoUrl ? { backgroundImage: `url(${c.photoUrl})` } : undefined}
                  >
                    {!c.photoUrl && c.name.slice(0, 1)}
                  </div>
                ))}
              </div>
            ) : children.length === 1 ? (
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 bg-cover bg-center text-base font-bold"
                style={children[0].photoUrl ? { backgroundImage: `url(${children[0].photoUrl})` } : undefined}
              >
                {!children[0].photoUrl && children[0].name.slice(0, 1)}
              </div>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 17h-2v-2h2Zm2.07-7.75-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25Z" />
              </svg>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white/75">
                {children.length > 0
                  ? `안녕하세요 👋 ${greetingNames}의 운동을 찾아볼까요?`
                  : "안녕하세요 👋 우리 아이에게 맞는 운동을 찾아볼까요?"}
              </p>
              <p className="mt-0.5 text-sm font-bold">{recommendCta}</p>
            </div>
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
                전체보기
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
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">전체 클래스 둘러보기</h2>
              {browseClasses.length > BROWSE_CLASSES_LIMIT && (
                <Link href="/search" className="text-xs font-bold text-rink-deep">
                  전체보기
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {browseClasses.slice(0, BROWSE_CLASSES_LIMIT).map((c) => (
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
