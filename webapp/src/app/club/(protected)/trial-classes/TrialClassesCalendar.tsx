"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ClubClass } from "@/lib/types";
import { parseDayLabel } from "@/lib/schedule-dates";
import { buttonClass } from "@/lib/ui";

const DAY_CHARS_BY_JS_DAY = ["일", "월", "화", "수", "목", "금", "토"] as const;

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSameDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

type Match = { classId: string; className: string; timeLabel: string; isHoliday: boolean };

export default function TrialClassesCalendar({ classes }: { classes: ClubClass[] }) {
  const router = useRouter();
  const [holidaysByClass, setHolidaysByClass] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(classes.map((c) => [c.id, c.holidays]))
  );
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  const trialClasses = useMemo(
    () => classes.filter((c) => c.schedules.some((s) => s.allowTrial)),
    [classes]
  );

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

  function matchesForDate(date: Date): Match[] {
    const iso = toIsoDate(date);
    const dayChar = DAY_CHARS_BY_JS_DAY[date.getDay()];
    const matched: Match[] = [];
    for (const c of trialClasses) {
      const holidays = holidaysByClass[c.id] ?? [];
      for (const s of c.schedules) {
        if (!s.allowTrial) continue;
        if (!parseDayLabel(s.dayLabel).includes(dayChar)) continue;
        matched.push({
          classId: c.id,
          className: c.name,
          timeLabel: s.timeLabel,
          isHoliday: holidays.includes(iso),
        });
      }
    }
    return matched;
  }

  async function toggleHoliday(classId: string, iso: string, holiday: boolean) {
    const key = `${classId}-${iso}`;
    setTogglingKey(key);
    const supabase = createClient();

    if (holiday) {
      const { error } = await supabase
        .from("class_holidays")
        .insert({ team_class_id: classId, holiday_date: iso });
      setTogglingKey(null);
      if (error) return;
      setHolidaysByClass((prev) => ({
        ...prev,
        [classId]: [...(prev[classId] ?? []), iso],
      }));
    } else {
      const { error } = await supabase
        .from("class_holidays")
        .delete()
        .eq("team_class_id", classId)
        .eq("holiday_date", iso);
      setTogglingKey(null);
      if (error) return;
      setHolidaysByClass((prev) => ({
        ...prev,
        [classId]: (prev[classId] ?? []).filter((d) => d !== iso),
      }));
    }
    router.refresh();
  }

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

  const selectedIso = toIsoDate(selectedDate);
  const selectedMatches = matchesForDate(selectedDate);

  if (trialClasses.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted">
        원데이 체험이 가능한 시간대가 없어요. 클래스 관리에서 시간대별로 &quot;원데이
        가능&quot;을 켜면 여기서 휴무를 관리할 수 있어요.
      </p>
    );
  }

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
              const matches = matchesForDate(date);
              const hasHoliday = matches.length > 0 && matches.every((m) => m.isHoliday);
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
                  {matches.length > 0 && (
                    <span
                      className={`h-1 w-1 rounded-full ${
                        isSelected ? "bg-white" : hasHoliday ? "bg-muted" : "bg-rink"
                      }`}
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
          {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 원데이 시간대
        </p>
        {selectedMatches.length > 0 ? (
          <div className="flex flex-col divide-y divide-line">
            {selectedMatches.map((m, i) => (
              <div key={`${m.classId}-${i}`} className="flex items-center justify-between gap-2 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{m.className}</p>
                  <p className="text-xs text-muted">{m.timeLabel}</p>
                </div>
                <button
                  disabled={togglingKey === `${m.classId}-${selectedIso}`}
                  onClick={() => toggleHoliday(m.classId, selectedIso, !m.isHoliday)}
                  className={buttonClass({
                    variant: m.isHoliday ? "secondary" : "outline",
                    size: "sm",
                    full: false,
                  })}
                >
                  {m.isHoliday ? "휴무 해제" : "휴무로 설정"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-sm text-muted">이 날은 원데이 시간대가 없어요.</p>
        )}
      </div>
    </div>
  );
}
