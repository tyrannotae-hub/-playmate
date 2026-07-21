"use client";

import { useState } from "react";
import TopNav from "@/components/TopNav";
import { children } from "@/lib/mock-data";
import { TeamClass } from "@/lib/types";

type Phase = "form" | "requested" | "confirmed";

export default function BookingForm({ item }: { item: TeamClass }) {
  const [phase, setPhase] = useState<Phase>("form");
  const [childId, setChildId] = useState(children[0]?.id ?? "");
  const [date, setDate] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setPhase("requested");
    window.setTimeout(() => setPhase("confirmed"), 1800);
  }

  if (phase !== "form") {
    return (
      <>
        <TopNav title="예약 상태" back />
        <main className="flex flex-col items-center px-6 pb-10 pt-16 text-center">
          {phase === "requested" ? (
            <>
              <div className="text-4xl">⏳</div>
              <h2 className="mt-4 text-lg font-bold">예약 신청이 접수됐어요</h2>
              <p className="mt-2 text-sm text-muted">
                시설에서 확인 후 알림톡으로 알려드려요
              </p>
            </>
          ) : (
            <>
              <div className="text-4xl">✅</div>
              <h2 className="mt-4 text-lg font-bold">예약이 확정됐어요!</h2>
              <p className="mt-2 text-sm text-muted">
                {item.name} · {item.schedules[0].dayLabel} {item.schedules[0].timeLabel}
              </p>
              <div className="mt-6 flex w-full gap-2">
                <button className="flex-1 rounded-full border border-line py-3 text-sm font-bold">
                  시설 위치보기
                </button>
                <button className="flex-1 rounded-full border border-line py-3 text-sm font-bold">
                  문의하기
                </button>
              </div>
            </>
          )}
        </main>
      </>
    );
  }

  return (
    <>
      <TopNav title="예약 신청" back />
      <main className="px-4 pb-10 pt-4">
        <p className="text-xs font-bold text-muted">{item.facility.name}</p>
        <h1 className="mt-1 text-lg font-extrabold">{item.name}</h1>
        <p className="mt-1 text-sm text-muted">
          {item.schedules[0].dayLabel} {item.schedules[0].timeLabel}
        </p>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-bold">신청 자녀</label>
            <select
              value={childId}
              onChange={(e) => setChildId(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-sm"
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.age}세)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold">시작 희망일</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-sm"
            />
          </div>

          <p className="rounded-xl bg-energy-soft px-3.5 py-3 text-xs leading-relaxed text-[color:var(--foreground)]">
            ⚠️ 결제는 현장/계좌이체로 시설과 직접 진행됩니다
          </p>

          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-energy py-3.5 text-sm font-bold text-[#1A0E08]"
          >
            예약 신청 보내기
          </button>
        </form>
      </main>
    </>
  );
}
