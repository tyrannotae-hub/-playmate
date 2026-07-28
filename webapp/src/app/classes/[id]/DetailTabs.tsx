"use client";

import { useState } from "react";
import Image from "next/image";
import { Review, TeamClass } from "@/lib/types";
import InstructorWishlistButton from "@/components/InstructorWishlistButton";

const TABS = ["프로필", "상세소개", "시간표", "리뷰"] as const;
type Tab = (typeof TABS)[number];

export default function DetailTabs({
  item,
  reviews,
  wishedInstructorIds = [],
}: {
  item: TeamClass;
  reviews: Review[];
  wishedInstructorIds?: string[];
}) {
  const [tab, setTab] = useState<Tab>("프로필");
  const wishedInstructorSet = new Set(wishedInstructorIds);

  return (
    <div>
      <div className="mb-4 flex gap-1.5 rounded-full bg-surface-2 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full py-2 text-xs font-bold transition ${
              tab === t ? "bg-rink text-white" : "text-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "프로필" && (
        <div>
          {item.instructors.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {item.instructors.map((instructor) => (
                <div
                  key={instructor.id}
                  className="w-[150px] shrink-0 overflow-hidden rounded-sm border border-line"
                >
                  <div className="relative aspect-square bg-surface-2">
                    {instructor.profileImageUrl ? (
                      <Image
                        src={instructor.profileImageUrl}
                        alt=""
                        fill
                        sizes="150px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl">
                        🧑
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <div className="flex items-start justify-between gap-1.5">
                      <p className="truncate text-sm font-bold">{instructor.name} 코치</p>
                      <InstructorWishlistButton
                        instructorId={instructor.id}
                        initialWished={wishedInstructorSet.has(instructor.id)}
                        initialCount={instructor.wishCount}
                        size="sm"
                      />
                    </div>
                    <p className="mt-0.5 text-xs text-muted">경력 {instructor.careerYears}년</p>
                    {instructor.certified && (
                      <p className="btn-label mt-1.5 inline-flex items-center gap-1 rounded-full bg-rink-soft px-2 py-0.5 text-[10px] font-bold text-rink-deep">
                        🏅 자격 인증
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-3 text-sm text-muted">담당 코치가 아직 배정되지 않았어요.</p>
          )}
        </div>
      )}

      {tab === "상세소개" && (
        <div className="whitespace-pre-line text-sm leading-relaxed">
          {item.description || (
            <span className="text-muted">
              대상 연령 {item.ageMin}–{item.ageMax}세의{" "}
              {item.classType === "team" ? "팀" : item.classType === "group" ? "그룹" : "개인"}{" "}
              수업입니다. 아직 클럽에서 상세 소개를 등록하지 않았어요.
            </span>
          )}
        </div>
      )}

      {tab === "시간표" && (
        <div className="flex flex-col gap-2">
          {item.schedules.map((s, i) => {
            const hasSpotsInfo = s.availableSpots != null;
            const isFull = hasSpotsInfo && s.availableSpots! <= 0;
            return (
              <div
                key={i}
                className="flex items-center justify-between rounded-sm border border-line px-3.5 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-rink-soft text-xs font-bold text-rink-deep">
                    {s.dayLabel}
                  </span>
                  <span className="text-sm font-bold">{s.timeLabel}</span>
                </div>
                {hasSpotsInfo && (
                  <p
                    className={`text-xs font-bold tabular-nums ${
                      isFull ? "text-muted" : "text-good"
                    }`}
                  >
                    {isFull ? "마감" : `잔여 ${s.availableSpots}석`}
                  </p>
                )}
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
            <div className="flex flex-col items-center py-9 text-center text-muted">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="mb-2.5 text-line">
                <path d="M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7-5.4-4.8 7.1-.7Z" />
              </svg>
              <p className="text-sm font-bold text-foreground">아직 등록된 리뷰가 없어요</p>
              <p className="mt-1 text-xs">첫 수강 후기를 남겨주시면 다른 학부모님께 큰 도움이 돼요</p>
            </div>
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
                        className="h-16 w-16 shrink-0 rounded-sm border border-line bg-surface-2 bg-cover bg-center"
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
