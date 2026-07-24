"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TeamClass } from "@/lib/types";
import { parseDayLabel } from "@/lib/schedule-dates";

const DAY_CHARS_BY_JS_DAY = ["일", "월", "화", "수", "목", "금", "토"] as const;

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSameDate(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

type MatchedClass = {
  classId: string;
  className: string;
  timeLabel: string;
  isTrial: boolean;
};

// 원데이 체험 가능 여부는 이제 클래스 단위가 아니라 시간대(schedule) 단위 필드
// (schedule.allowTrial)라, 그 시간대의 요일(dayLabel)이 곧 반복 요일이 된다 —
// 별도 trial_day_label/class_trial_dates 없이 휴일(class_holidays)만 제외하면 됨.
function matchesForDate(classes: TeamClass[], date: Date): MatchedClass[] {
  const iso = toIsoDate(date);
  const dayChar = DAY_CHARS_BY_JS_DAY[date.getDay()];
  const matched: MatchedClass[] = [];

  for (const c of classes) {
    for (const s of c.schedules) {
      if (!parseDayLabel(s.dayLabel).includes(dayChar)) continue;
      matched.push({
        classId: c.id,
        className: c.name,
        timeLabel: s.timeLabel,
        isTrial: s.allowTrial && !c.holidays.includes(iso),
      });
    }
  }

  return matched;
}

export default function FacilityScheduleCalendar({ classes }: { classes: TeamClass[] }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const weeks = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startOffset = firstOfMonth.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(viewYear, viewMonth, day));
    while (cells.length % 7 !== 0) cells.push(null);

    const rows: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [viewYear, viewMonth]);

  function goToPrevMonth() {
    const next = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  function goToNextMonth() {
    const next = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  const selectedMatches = useMemo(() => matchesForDate(classes, selectedDate), [classes, selectedDate]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          onClick={goToPrevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-rink-soft"
          aria-label="이전 달"
        >
          ‹
        </button>
        <p className="text-sm font-bold">
          {viewYear}년 {viewMonth + 1}월
        </p>
        <button
          onClick={goToNextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-rink-soft"
          aria-label="다음 달"
        >
          ›
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 text-center text-xs font-bold text-muted">
        {DAY_CHARS_BY_JS_DAY.map((d) => (
          <div key={d} className="py-1.5">
            {d}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        {weeks.map((row, i) => (
          <div key={i} className="grid grid-cols-7 gap-1">
            {row.map((date, j) => {
              if (!date) return <div key={j} />;
              const isToday = isSameDate(date, today);
              const isSelected = isSameDate(date, selectedDate);
              const hasClasses = matchesForDate(classes, date).length > 0;
              return (
                <button
                  key={j}
                  onClick={() => setSelectedDate(date)}
                  className={`flex h-11 flex-col items-center justify-center gap-0.5 rounded-md text-sm transition ${
                    isSelected
                      ? "bg-rink text-white font-bold"
                      : isToday
                        ? "bg-rink-soft font-bold text-rink-deep"
                        : "text-foreground"
                  }`}
                >
                  {date.getDate()}
                  {hasClasses && (
                    <span
                      className={`h-1 w-1 rounded-full ${isSelected ? "bg-white" : "bg-rink"}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-line pt-4">
        <p className="mb-2.5 text-sm font-bold">
          {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 ({DAY_CHARS_BY_JS_DAY[selectedDate.getDay()]})
          운영 클래스
        </p>
        {selectedMatches.length > 0 ? (
          <div className="flex flex-col divide-y divide-line">
            {selectedMatches.map((m, i) => (
              <Link
                key={`${m.classId}-${i}`}
                href={`/classes/${m.classId}`}
                className="flex items-center gap-2 py-2.5"
              >
                {m.isTrial ? (
                  <span className="shrink-0 rounded-md bg-rink px-1.5 py-0.5 text-[10px] font-bold text-white">
                    원데이
                  </span>
                ) : (
                  <span className="shrink-0 rounded-md bg-rink-soft px-1.5 py-0.5 text-[10px] font-bold text-rink-deep">
                    정규
                  </span>
                )}
                <p className="truncate text-sm font-bold">{m.className}</p>
                {m.timeLabel && <p className="shrink-0 text-xs text-muted">{m.timeLabel}</p>}
              </Link>
            ))}
          </div>
        ) : (
          <p className="py-4 text-sm text-muted">이 날은 운영되는 클래스가 없어요.</p>
        )}
      </div>
    </div>
  );
}
