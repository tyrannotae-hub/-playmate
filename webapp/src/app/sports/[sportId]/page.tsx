import { notFound } from "next/navigation";
import TopNav from "@/components/TopNav";
import SportIcon from "@/components/icons/SportIcon";
import DayFilterBrowser from "@/components/DayFilterBrowser";
import InstructorHoverGrid from "@/components/InstructorHoverGrid";
import { HoverExpand_001 } from "@/components/ui/skiper-ui/skiper52";
import {
  getAllClasses,
  getCurrentParent,
  getMyInstructorWishlistIds,
  getMyWishlistIds,
  getSports,
} from "@/lib/data";
import { FeaturedInstructor } from "@/lib/types";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function SportDetailPage({
  params,
}: {
  params: Promise<{ sportId: string }>;
}) {
  const { sportId } = await params;

  const [allClasses, sports, user] = await Promise.all([
    getAllClasses(),
    getSports(),
    getCurrentParent(),
  ]);

  const sport = sports.find((s) => s.id === sportId);
  if (!sport) notFound();

  const [wishedIds, wishedInstructorIds] = user
    ? await Promise.all([getMyWishlistIds(user.id), getMyInstructorWishlistIds(user.id)])
    : [[], []];

  const classes = allClasses.filter((c) => c.sportId === sportId);
  const popular = [...classes].sort((a, b) => b.rating - a.rating).slice(0, 8);

  const instructorMap = new Map<string, FeaturedInstructor>();
  classes.forEach((c) => {
    c.instructors.forEach((i) => {
      if (instructorMap.has(i.id) || !i.profileImageUrl) return;
      instructorMap.set(i.id, {
        id: i.id,
        name: i.name,
        careerYears: i.careerYears,
        certified: i.certified,
        certifiedBy: i.certifiedBy,
        profileImageUrl: i.profileImageUrl,
        facilityId: c.facility.id,
        facilityName: c.facility.name,
        wishCount: i.wishCount,
      });
    });
  });
  const instructors = [...instructorMap.values()].sort(
    (a, b) => b.careerYears - a.careerYears
  );

  return (
    <>
      <TopNav back />
      <main className="pb-10">
        <div className="flex items-center gap-3 px-4 pt-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-rink-soft text-rink-deep">
            <SportIcon sportId={sport.id} size={30} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold">{sport.name}</h1>
            <p className="text-sm text-muted">클래스 {classes.length}개</p>
          </div>
        </div>

        {popular.length > 0 && (
          <div className="mt-8" id="popular">
            <h2 className="mb-3 px-4 text-lg font-bold">지금 인기있는 팀</h2>
            <div className="px-4">
              <HoverExpand_001 classes={popular} />
            </div>
          </div>
        )}

        {instructors.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 px-4 text-lg font-bold">지금 인기있는 코치</h2>
            <InstructorHoverGrid instructors={instructors} wishedInstructorIds={wishedInstructorIds} />
          </div>
        )}

        {classes.length > 0 && (
          <DayFilterBrowser classes={classes} wishedIds={wishedIds} />
        )}

        {classes.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-muted">
            곧 {sport.name} 클래스가 열려요.
          </p>
        )}
      </main>
    </>
  );
}
