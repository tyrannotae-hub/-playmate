"use client";

import { useState } from "react";
import Image from "next/image";
import { FacilityHome } from "@/lib/types";
import InstructorWishlistButton from "@/components/InstructorWishlistButton";
import FacilityScheduleCalendar from "./FacilityScheduleCalendar";

const TABS = ["소개", "코치 소개", "일정표", "공지사항"] as const;
type Tab = (typeof TABS)[number];

function InstructorRow({
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

export default function FacilityDetailTabs({
  facility,
  wishedInstructorIds = [],
}: {
  facility: FacilityHome;
  wishedInstructorIds?: string[];
}) {
  const [tab, setTab] = useState<Tab>("소개");
  const wishedInstructorSet = new Set(wishedInstructorIds);

  return (
    <div>
      <div className="flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`btn-label -mb-px border-b-2 px-3 py-2.5 text-sm font-bold transition ${
              tab === t ? "border-rink text-rink-deep" : "border-transparent text-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="pt-4">
        {tab === "소개" &&
          (facility.description ? (
            <p className="whitespace-pre-line text-sm leading-relaxed">{facility.description}</p>
          ) : (
            <p className="py-6 text-center text-sm text-muted">
              아직 {facility.ownerType === "solo_coach" ? "코치" : "클럽"} 소개가 없어요.
            </p>
          ))}

        {tab === "코치 소개" && (
          <div className="flex flex-col divide-y divide-line">
            {facility.instructors.length > 0 ? (
              facility.instructors.map((i) => (
                <InstructorRow key={i.id} instructor={i} wished={wishedInstructorSet.has(i.id)} />
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted">등록된 코치가 없어요.</p>
            )}
          </div>
        )}

        {tab === "일정표" &&
          (facility.classes.length > 0 ? (
            <FacilityScheduleCalendar classes={facility.classes} />
          ) : (
            <p className="py-6 text-center text-sm text-muted">등록된 클래스가 없어요.</p>
          ))}

        {tab === "공지사항" && (
          <div className="flex flex-col divide-y divide-line">
            {facility.notices.length > 0 ? (
              facility.notices.map((n) => (
                <div key={n.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="font-bold">{n.title}</p>
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-muted">
                    {n.content}
                  </p>
                  <p className="mt-1.5 text-[11px] text-muted">
                    {new Date(n.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted">등록된 공지사항이 없어요.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
