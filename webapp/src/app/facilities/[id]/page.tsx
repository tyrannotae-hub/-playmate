import Image from "next/image";
import { notFound } from "next/navigation";
import TopNav from "@/components/TopNav";
import InstructorWishlistButton from "@/components/InstructorWishlistButton";
import FacilityWishlistButton from "@/components/FacilityWishlistButton";
import {
  getCurrentParent,
  getFacilityHome,
  getFacilityWishInfo,
  getMyInstructorWishlistIds,
  getMyWishlistIds,
} from "@/lib/data";
import { FacilityHome } from "@/lib/types";
import FacilityContactLinks from "@/components/FacilityContactLinks";
import PromoCarousel from "@/components/facility/PromoCarousel";
import HomeCategoryShowcase from "./HomeCategoryShowcase";
import FacilityClassGrid from "./FacilityClassGrid";
import FacilityScheduleCalendar from "./FacilityScheduleCalendar";

export const runtime = "edge";
export const dynamic = "force-dynamic";

function InstructorCard({
  instructor,
  wished,
}: {
  instructor: FacilityHome["instructors"][number];
  wished: boolean;
}) {
  return (
    <div className="flex gap-3 py-3 first:pt-0 last:pb-0">
      {instructor.profileImageUrl ? (
        <Image
          src={instructor.profileImageUrl}
          alt={instructor.name}
          width={56}
          height={56}
          className="h-14 w-14 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-rink-soft text-xl">
          {instructor.name ? instructor.name[0] : "🧑"}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="font-bold">{instructor.name}</p>
          <InstructorWishlistButton
            instructorId={instructor.id}
            initialWished={wished}
            initialCount={instructor.wishCount}
            size="sm"
          />
        </div>
        <p className="mt-0.5 text-sm text-muted">경력 {instructor.careerYears}년</p>
        {instructor.certified && (
          <p className="btn-label mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-rink-soft px-2.5 py-1 text-xs font-bold text-rink-deep">
            🏅 {instructor.certifiedBy ?? "자격 인증"} 인증완료
          </p>
        )}
        {instructor.bio && (
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">{instructor.bio}</p>
        )}
      </div>
    </div>
  );
}

export default async function FacilityHomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, facility] = await Promise.all([getCurrentParent(), getFacilityHome(id)]);
  const [wishedInstructorIds, facilityWishInfo, wishedClassIds] = user
    ? await Promise.all([
        getMyInstructorWishlistIds(user.id),
        getFacilityWishInfo(id, user.id),
        getMyWishlistIds(user.id),
      ])
    : [[], await getFacilityWishInfo(id), []];
  if (!facility) notFound();

  const wishedInstructorSet = new Set(wishedInstructorIds);
  // 홍보 캐러셀에 올릴 사진이 아직 없으면, 예전 방식으로 올려둔 커버 사진 1장을 그대로 보여준다.
  const heroImages = facility.promoImages.length > 0 ? facility.promoImages : facility.coverImageUrl ? [facility.coverImageUrl] : [];

  return (
    <>
      <TopNav back />
      <main className="pb-10">
        {heroImages.length > 0 ? (
          <PromoCarousel images={heroImages} />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center bg-rink-soft">
            <span className="text-4xl">🏟️</span>
          </div>
        )}

        <div className="px-4 pt-4">
          <div className="flex items-start gap-3">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-rink-soft text-rink-deep">
              {facility.profileImageUrl ? (
                <Image
                  src={facility.profileImageUrl}
                  alt={facility.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <span className="text-2xl">🏟️</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-xl font-extrabold">{facility.name}</h1>
                  <p className="mt-1 text-sm text-muted">{facility.address}</p>
                  {facility.phone && <p className="mt-0.5 text-sm text-muted">{facility.phone}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <FacilityWishlistButton
                    facilityId={facility.id}
                    initialWished={facilityWishInfo.wished}
                    initialCount={facilityWishInfo.count}
                  />
                  <FacilityContactLinks
                    phone={facility.phone}
                    instagramUrl={facility.instagramUrl}
                    facilityName={facility.name}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <HomeCategoryShowcase
          categories={facility.homeCategories}
          allClasses={facility.classes}
          wishedIds={wishedClassIds}
        />

        <div className="mt-8">
          <FacilityClassGrid classes={facility.classes} wishedIds={wishedClassIds} />
        </div>

        <div className="px-4">
          {facility.description && (
            <div className="mt-6 border-t border-line pt-6">
              <p className="mb-2.5 text-sm font-bold text-muted">
                {facility.ownerType === "solo_coach" ? "코치 소개" : "클럽 소개"}
              </p>
              <p className="whitespace-pre-line text-sm leading-relaxed">{facility.description}</p>
            </div>
          )}

          {facility.instructors.length > 0 && (
            <div className="mt-6 border-t border-line pt-6">
              <p className="mb-2.5 text-sm font-bold text-muted">
                감독・코치 소개 ({facility.instructors.length})
              </p>
              <div className="flex flex-col divide-y divide-line">
                {facility.instructors.map((i) => (
                  <InstructorCard key={i.id} instructor={i} wished={wishedInstructorSet.has(i.id)} />
                ))}
              </div>
            </div>
          )}

          {facility.classes.length > 0 && (
            <div className="mt-6 border-t border-line pt-6">
              <p className="mb-2.5 text-sm font-bold text-muted">일정표</p>
              <FacilityScheduleCalendar classes={facility.classes} />
            </div>
          )}

          {facility.notices.length > 0 && (
            <div className="mt-6 border-t border-line pt-6">
              <p className="mb-2.5 text-sm font-bold text-muted">공지사항</p>
              <div className="flex flex-col divide-y divide-line">
                {facility.notices.map((n) => (
                  <div key={n.id} className="py-3 first:pt-0 last:pb-0">
                    <p className="font-bold">{n.title}</p>
                    <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-muted">{n.content}</p>
                    <p className="mt-1.5 text-[11px] text-muted">
                      {new Date(n.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
