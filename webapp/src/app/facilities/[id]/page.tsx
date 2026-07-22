import { notFound } from "next/navigation";
import TopNav from "@/components/TopNav";
import ClassCard from "@/components/ClassCard";
import ScrollSection from "@/components/ScrollSection";
import CoachCard from "./CoachCard";
import { getFacilityHome } from "@/lib/data";
import { cardClass } from "@/lib/ui";

export default async function FacilityHomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const facility = await getFacilityHome(id);
  if (!facility) notFound();

  return (
    <>
      <TopNav back />
      <main className="pb-10">
        <div
          className="relative flex aspect-[4/3] w-full items-end bg-rink-soft bg-cover bg-center"
          style={facility.coverImageUrl ? { backgroundImage: `url(${facility.coverImageUrl})` } : undefined}
        >
          {!facility.coverImageUrl && (
            <span className="absolute inset-0 flex items-center justify-center text-5xl">🏟️</span>
          )}
          <div className="relative w-full bg-gradient-to-t from-black/75 via-black/20 to-transparent px-4 pb-4 pt-14">
            <h1 className="text-2xl font-extrabold text-white">{facility.name}</h1>
            <p className="mt-1 text-sm text-white/85">{facility.address}</p>
          </div>
        </div>

        <div className="px-4 pt-4">
          {(facility.instagramUrl || facility.phone) && (
            <div className="flex flex-wrap gap-2">
              {facility.instagramUrl && (
                <a
                  href={facility.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-xs font-bold transition hover:border-rink"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
                  </svg>
                  인스타그램 바로가기
                </a>
              )}
              {facility.phone && (
                <a
                  href={`tel:${facility.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-xs font-bold transition hover:border-rink"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v4a2 2 0 0 1-2 2C9.5 21 3 14.5 3 6a2 2 0 0 1 1-2Z" />
                  </svg>
                  {facility.phone}
                </a>
              )}
            </div>
          )}

          {facility.description && (
            <div className="mt-6">
              <h2 className="mb-2.5 text-base font-bold">팀 소개</h2>
              <div className={cardClass()}>
                <p className="text-sm leading-relaxed whitespace-pre-line">{facility.description}</p>
              </div>
            </div>
          )}
        </div>

        {facility.coaches.length > 0 && (
          <ScrollSection title="코치 소개">
            {facility.coaches.map((c) => (
              <CoachCard key={c.id} coach={c} />
            ))}
          </ScrollSection>
        )}

        <div className="px-4">
          {facility.notices.length > 0 && (
            <div className="mt-7">
              <h2 className="mb-2.5 text-base font-bold">공지사항</h2>
              <div className="flex flex-col gap-2.5">
                {facility.notices.map((n) => (
                  <div key={n.id} className={cardClass()}>
                    <p className="font-bold">{n.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{n.content}</p>
                    <p className="mt-1.5 text-[11px] text-muted">
                      {new Date(n.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7">
            <h2 className="mb-2.5 text-base font-bold">
              운영 중인 클래스 ({facility.classes.length})
            </h2>
            <div className="flex flex-col gap-3">
              {facility.classes.map((c) => (
                <ClassCard key={c.id} item={c} />
              ))}
              {facility.classes.length === 0 && (
                <p className="py-4 text-sm text-muted">등록된 클래스가 없어요.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
