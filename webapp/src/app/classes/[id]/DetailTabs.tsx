"use client";

import { useState } from "react";
import { Review, TeamClass } from "@/lib/types";

const TABS = ["프로필", "커리큘럼", "시간표", "리뷰"] as const;
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
            className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-bold transition ${
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
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-xs font-bold text-muted">담당 코치</p>
            <p className="mt-1 text-base font-bold">{item.instructor.name}</p>
            {item.instructor.certified && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-rink-soft px-2.5 py-1 text-xs font-bold text-rink-deep">
                🏅 {item.instructor.certifiedBy} 인증완료
              </p>
            )}
            <p className="mt-2 text-sm text-muted">
              경력 {item.instructor.careerYears}년
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-xs font-bold text-muted">시설</p>
            <p className="mt-1 text-base font-bold">{item.facility.name}</p>
            <p className="mt-1 text-sm text-muted">{item.facility.address}</p>
          </div>
        </div>
      )}

      {tab === "커리큘럼" && (
        <div className="rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed text-muted">
          기초 체력·스케이팅 훈련으로 시작해 퍽 컨트롤, 팀 전술까지 단계별로
          진행합니다. 대상 연령 {item.ageMin}–{item.ageMax}세, 정원{" "}
          {item.schedules[0].capacity}명의 {item.classType === "team" ? "팀" : item.classType === "group" ? "그룹" : "개인"} 수업입니다.
        </div>
      )}

      {tab === "시간표" && (
        <div className="flex flex-col gap-2">
          {item.schedules.map((s, i) => {
            const isFull = s.booked >= s.capacity;
            return (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-line bg-surface p-4"
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
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted">
            실제 예약·등록 이력이 있는 학부모만 작성할 수 있는 후기입니다.
          </p>
          {reviews.length === 0 && (
            <p className="py-6 text-center text-sm text-muted">
              아직 등록된 후기가 없어요.
            </p>
          )}
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-line bg-surface p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">{r.parentName}</p>
                <p className="text-sm font-bold text-rink-deep">★ {r.rating}</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{r.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
