"use client";

import { useMemo, useState } from "react";
import { TeamClass } from "@/lib/types";
import { parseDayLabel } from "@/lib/schedule-dates";
import ClassCardCompact from "@/components/ClassCardCompact";

const DAYS = ["전체", "월", "화", "수", "목", "금", "토", "일"] as const;
const TIME_SLOTS = ["전체", "오전", "오후"] as const;
type TimeSlot = (typeof TIME_SLOTS)[number];

function timeSlotOf(timeLabel: string): Exclude<TimeSlot, "전체"> {
  const startHour = parseInt(timeLabel.split(":")[0], 10);
  return startHour < 12 ? "오전" : "오후";
}

export default function FacilityClassGrid({
  classes,
  wishedIds = [],
}: {
  classes: TeamClass[];
  wishedIds?: string[];
}) {
  const wishedSet = useMemo(() => new Set(wishedIds), [wishedIds]);
  const [day, setDay] = useState<(typeof DAYS)[number]>("전체");
  const [time, setTime] = useState<TimeSlot>("전체");

  const filtered = useMemo(() => {
    if (day === "전체") return classes;
    return classes.filter((c) =>
      c.schedules.some(
        (s) =>
          parseDayLabel(s.dayLabel).includes(day) &&
          (time === "전체" || timeSlotOf(s.timeLabel) === time)
      )
    );
  }, [classes, day, time]);

  return (
    <div>
      <h2 className="mb-3 px-4 text-lg font-bold">전체 클래스</h2>

      <div className="flex gap-2 overflow-x-auto px-4 pb-1">
        {DAYS.map((d) => (
          <button
            key={d}
            onClick={() => setDay(d)}
            className={`flex h-9 flex-shrink-0 items-center justify-center rounded-full px-3.5 text-sm font-medium transition ${
              day === d ? "bg-rink text-white" : "text-foreground"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="mt-2 flex gap-1.5 overflow-x-auto px-4 pb-1">
        {TIME_SLOTS.map((t) => (
          <button
            key={t}
            onClick={() => setTime(t)}
            className={`h-9 flex-shrink-0 rounded-md px-3.5 text-xs font-bold transition ${
              time === t ? "bg-rink text-white" : "bg-rink-soft text-rink-deep"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3 px-4">
          {filtered.map((c) => (
            <ClassCardCompact key={c.id} item={c} variant="grid" wished={wishedSet.has(c.id)} />
          ))}
        </div>
      ) : (
        <p className="mt-6 px-4 text-center text-sm text-muted">이 조건에 맞는 클래스가 없어요.</p>
      )}
    </div>
  );
}
