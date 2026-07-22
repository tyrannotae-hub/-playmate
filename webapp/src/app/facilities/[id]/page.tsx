import { notFound } from "next/navigation";
import TopNav from "@/components/TopNav";
import ClassCard from "@/components/ClassCard";
import { getFacilityHome } from "@/lib/data";
import { FacilityHome, TeamClass } from "@/lib/types";
import { cardClass } from "@/lib/ui";

const DAY_ORDER = ["월", "화", "수", "목", "금", "토", "일"];

type DaySlot = { className: string; timeLabel: string };

function buildWeeklySchedule(classes: TeamClass[]): [string, DaySlot[]][] {
  const map = new Map<string, DaySlot[]>();
  for (const c of classes) {
    for (const s of c.schedules) {
      const days = s.dayLabel
        .split(/[·,\s]+/)
        .map((d) => d.trim())
        .filter(Boolean);
      for (const day of days) {
        const list = map.get(day) ?? [];
        list.push({ className: c.name, timeLabel: s.timeLabel });
        map.set(day, list);
      }
    }
  }
  return DAY_ORDER.filter((d) => map.has(d)).map((d) => [d, map.get(d)!]);
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" />
    </svg>
  );
}

function InstructorCard({ instructor }: { instructor: FacilityHome["instructors"][number] }) {
  return (
    <div className={cardClass("flex gap-3")}>
      {instructor.profileImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={instructor.profileImageUrl}
          alt={instructor.name}
          className="h-14 w-14 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-rink-soft text-xl">
          {instructor.name ? instructor.name[0] : "🧑"}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-bold">{instructor.name}</p>
        <p className="mt-0.5 text-sm text-muted">경력 {instructor.careerYears}년</p>
        {instructor.certified && (
          <p className="btn-label mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-rink-soft px-2.5 py-1 text-xs font-bold text-rink-deep">
            🏅 {instructor.certifiedBy ?? "자격 인증"} 인증완료
          </p>
        )}
        {instructor.bio && (
          <p className="mt-2 text-sm leading-relaxed text-muted">{instructor.bio}</p>
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
  const facility = await getFacilityHome(id);
  if (!facility) notFound();

  const weeklySchedule = buildWeeklySchedule(facility.classes);

  return (
    <>
      <TopNav back />
      <main className="pb-10">
        <div
          className="flex aspect-[16/9] w-full items-center justify-center bg-rink-soft bg-cover bg-center"
          style={facility.coverImageUrl ? { backgroundImage: `url(${facility.coverImageUrl})` } : undefined}
        >
          {!facility.coverImageUrl && <span className="text-4xl">🏟️</span>}
        </div>

        <div className="px-4 pt-4">
          <h1 className="text-xl font-extrabold">{facility.name}</h1>
          <p className="mt-1 text-sm text-muted">{facility.address}</p>
          {facility.phone && <p className="mt-0.5 text-sm text-muted">{facility.phone}</p>}

          {facility.instagramUrl && (
            <div className="mt-6 border-t border-line pt-6">
              <p className="mb-2.5 text-sm font-bold text-muted">인스타그램 바로가기</p>
              <a
                href={facility.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClass(
                  "flex items-center gap-2.5 text-sm font-bold text-rink-deep transition hover:opacity-80"
                )}
              >
                <InstagramIcon />
                {facility.name} 인스타그램에서 보기
              </a>
            </div>
          )}

          {facility.description && (
            <div className="mt-6 border-t border-line pt-6">
              <p className="mb-2.5 text-sm font-bold text-muted">
                {facility.ownerType === "solo_coach" ? "코치 소개" : "클럽 소개"}
              </p>
              <div className={cardClass("text-sm leading-relaxed")}>{facility.description}</div>
            </div>
          )}

          {facility.instructors.length > 0 && (
            <div className="mt-6 border-t border-line pt-6">
              <p className="mb-2.5 text-sm font-bold text-muted">
                감독・코치 소개 ({facility.instructors.length})
              </p>
              <div className="flex flex-col gap-2.5">
                {facility.instructors.map((i) => (
                  <InstructorCard key={i.id} instructor={i} />
                ))}
              </div>
            </div>
          )}

          {weeklySchedule.length > 0 && (
            <div className="mt-6 border-t border-line pt-6">
              <p className="mb-2.5 text-sm font-bold text-muted">주간 시간표</p>
              <div className={cardClass("flex flex-col divide-y divide-line p-0")}>
                {weeklySchedule.map(([day, slots]) => (
                  <div key={day} className="flex gap-3 px-4 py-3">
                    <p className="w-8 shrink-0 text-sm font-bold text-rink-deep">{day}</p>
                    <div className="flex flex-1 flex-col gap-1">
                      {slots.map((s, i) => (
                        <p key={i} className="text-sm leading-relaxed">
                          <span className="font-bold">{s.className}</span>{" "}
                          <span className="text-muted">{s.timeLabel}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {facility.notices.length > 0 && (
            <div className="mt-6 border-t border-line pt-6">
              <p className="mb-2.5 text-sm font-bold text-muted">공지사항</p>
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

          <div className="mt-6 border-t border-line pt-6">
            <p className="mb-2.5 text-sm font-bold text-muted">
              운영 중인 클래스 ({facility.classes.length})
            </p>
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
