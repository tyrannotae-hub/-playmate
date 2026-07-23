"use client";

import { useState } from "react";
import Image from "next/image";
import { Review, TeamClass } from "@/lib/types";

const TABS = ["프로필", "상세소개", "시간표", "리뷰"] as const;
type Tab = (typeof TABS)[number];

export default function DetailTabs({
  item,
  reviews,
}: {
  item: TeamClass;
  reviews: Review[];
}) {
  const [tab, setTab] = useState<Tab>("프로필");

  return (
    <div>
      <div className="mb-4 flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`btn-label -mb-px border-b-2 px-3 py-2.5 text-sm font-bold transition ${
              tab === t
                ? "border-rink text-rink-deep"
                : "border-transparent text-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "프로필" && (
        <div className="flex flex-col divide-y divide-line">
          {item.instructors.length > 0 ? (
            item.instructors.map((instructor) => (
              <div key={instructor.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                {instructor.profileImageUrl && (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-surface-2">
                    <Image
                      src={instructor.profileImageUrl}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-muted">담당 코치</p>
                  <p className="mt-1 text-base font-bold">{instructor.name}</p>
                  {instructor.certified && (
                    <p className="btn-label mt-2 inline-flex items-center gap-1.5 rounded bg-rink-soft px-2.5 py-1 text-xs font-bold text-rink-deep">
                      🏅 {instructor.certifiedBy} 인증완료
                    </p>
                  )}
                  <p className="mt-2 text-sm text-muted">
                    경력 {instructor.careerYears}년
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-3 first:pt-0 last:pb-0">
              <p className="text-xs font-bold text-muted">담당 코치</p>
              <p className="mt-1 text-base font-bold">미정</p>
            </div>
          )}
          <div className="py-3 first:pt-0 last:pb-0">
            <p className="text-xs font-bold text-muted">시설</p>
            <p className="mt-1 text-base font-bold">{item.facility.name}</p>
            <p className="mt-1 text-sm text-muted">{item.facility.address}</p>
          </div>
        </div>
      )}

      {tab === "상세소개" && (
        <div className="whitespace-pre-line text-sm leading-relaxed">
          {item.description || (
            <span className="text-muted">
              대상 연령 {item.ageMin}–{item.ageMax}세, 정원 {item.schedules[0].capacity}명의{" "}
              {item.classType === "team" ? "팀" : item.classType === "group" ? "그룹" : "개인"}{" "}
              수업입니다. 아직 클럽에서 상세 소개를 등록하지 않았어요.
            </span>
          )}
        </div>
      )}

      {tab === "시간표" && (
        <div className="flex flex-col divide-y divide-line">
          {item.schedules.map((s, i) => {
            const isFull = s.booked >= s.capacity;
            return (
              <div
                key={i}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-bold">{s.dayLabel}</p>
                  <p className="text-sm text-muted">{s.timeLabel}</p>
                </div>
                <p
                  className={`text-sm font-bold tabular-nums ${
                    isFull ? "text-muted" : "text-good"
                  }`}
                >
                  {isFull ? "마감" : `잔여 ${s.capacity - s.booked}/${s.capacity}석`}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {tab === "리뷰" && (
        <div className="flex flex-col">
          <p className="mb-3 text-xs text-muted">
            실제 예약·등록 이력이 있는 학부모만 작성할 수 있는 후기입니다.
          </p>
          {reviews.length === 0 && (
            <p className="py-6 text-center text-sm text-muted">
              아직 등록된 후기가 없어요.
            </p>
          )}
          <div className="flex flex-col divide-y divide-line">
            {reviews.map((r) => (
              <div key={r.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">{r.parentName}</p>
                  <p className="text-sm font-bold text-rink-deep">★ {r.rating}</p>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">{r.content}</p>
                {r.photoUrls.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {r.photoUrls.map((url) => (
                      <div
                        key={url}
                        className="h-16 w-16 shrink-0 rounded-md border border-line bg-surface-2 bg-cover bg-center"
                        style={{ backgroundImage: `url(${url})` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
