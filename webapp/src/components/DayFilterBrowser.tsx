"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sport, TeamClass } from "@/lib/types";
import SportIcon from "@/components/icons/SportIcon";
import { regionLabel } from "@/lib/region-meta";
import { buttonClass } from "@/lib/ui";
import WishlistButton from "@/components/WishlistButton";

const DAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;
const TIME_SLOTS = ["전체", "오전", "오후", "저녁"] as const;
type TimeSlot = (typeof TIME_SLOTS)[number];

function timeSlotOf(timeLabel: string): Exclude<TimeSlot, "전체"> {
  const startHour = parseInt(timeLabel.split(":")[0], 10);
  if (startHour < 12) return "오전";
  if (startHour < 18) return "오후";
  return "저녁";
}

export default function DayFilterBrowser({
  classes,
  sports = [],
  wishedIds = [],
}: {
  classes: TeamClass[];
  sports?: Sport[];
  wishedIds?: string[];
}) {
  const wishedSet = useMemo(() => new Set(wishedIds), [wishedIds]);
  const todayIdx = (new Date().getDay() + 6) % 7; // getDay()는 일요일이 0이라 월요일 시작 인덱스로 보정

  const [day, setDay] = useState<(typeof DAYS)[number]>(DAYS[todayIdx]);
  const [time, setTime] = useState<TimeSlot>("전체");
  const [region, setRegion] = useState("all");
  const [sportId, setSportId] = useState("all");

  const regions = useMemo(() => {
    const codes = Array.from(new Set(classes.map((c) => c.facility.region).filter(Boolean)));
    return codes.map((code) => ({ code, label: regionLabel(code) }));
  }, [classes]);

  const matches = useMemo(() => {
    return classes
      .map((c) => {
        const schedule = c.schedules.find(
          (s) => s.dayLabel.includes(day) && (time === "전체" || timeSlotOf(s.timeLabel) === time)
        );
        return schedule ? { item: c, schedule } : null;
      })
      .filter((row): row is { item: TeamClass; schedule: TeamClass["schedules"][number] } => {
        if (!row) return false;
        if (region !== "all" && row.item.facility.region !== region) return false;
        if (sportId !== "all" && row.item.sportId !== sportId) return false;
        return true;
      });
  }, [classes, day, time, region, sportId]);

  return (
    <div className="mt-8">
      <h2 className="mb-3 px-4 text-base font-bold">📅 무슨 요일이 편하세요?</h2>

      <div className="flex gap-1.5 overflow-x-auto px-4 pb-1">
        <select
          value={sportId}
          onChange={(e) => setSportId(e.target.value)}
          className="h-9 flex-shrink-0 rounded-md border border-line bg-surface px-2.5 text-xs font-bold"
        >
          <option value="all">전체 종목</option>
          {sports.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {DAYS.map((d, i) => (
          <button
            key={d}
            onClick={() => setDay(d)}
            className={`flex h-9 w-9 flex-shrink-0 flex-col items-center justify-center rounded-md text-sm font-bold transition ${
              day === d ? "bg-rink text-white" : "border border-line text-muted"
            }`}
          >
            {d}
            {i === todayIdx && <span className="text-[8px] font-normal leading-none">오늘</span>}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {TIME_SLOTS.map((t) => (
          <button
            key={t}
            onClick={() => setTime(t)}
            className={buttonClass({
              variant: time === t ? "secondary" : "outline",
              size: "sm",
              full: false,
              className: "flex-shrink-0",
            })}
          >
            {t}
          </button>
        ))}
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="flex-shrink-0 rounded-md border border-line bg-surface px-3 py-2 text-xs font-bold"
        >
          <option value="all">전체 지역</option>
          {regions.map((r) => (
            <option key={r.code} value={r.code}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex flex-col divide-y divide-line border-y border-line px-4">
        {matches.map(({ item, schedule }) => (
          <Link
            key={item.id}
            href={`/classes/${item.id}`}
            className="flex items-center gap-3 py-3"
          >
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-rink-soft text-rink-deep">
              {item.images[0] ? (
                <Image src={item.images[0]} alt="" fill sizes="56px" className="object-cover" />
              ) : (
                <SportIcon sportId={item.sportId} size={26} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-rink-deep">
                {day}요일 {schedule.timeLabel}
              </p>
              <p className="truncate text-sm font-bold">{item.name}</p>
              <p className="truncate text-xs text-muted">{item.facility.name}</p>
            </div>
            <WishlistButton classId={item.id} initialWished={wishedSet.has(item.id)} size="sm" />
          </Link>
        ))}
        {matches.length === 0 && (
          <p className="py-6 text-center text-sm text-muted">이 조건에 맞는 클래스가 없어요.</p>
        )}
      </div>
    </div>
  );
}
