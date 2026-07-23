"use client";

import { useState } from "react";
import Link from "next/link";
import { Sport } from "@/lib/types";
import SportIcon from "@/components/icons/SportIcon";

const COLLAPSED_COUNT = 9;

// 종목별 상세페이지(/sports/[sportId])는 아직 아이스하키만 시범 적용
const SPORT_PAGE_PILOT = new Set(["ice-hockey"]);

export default function SportCategoryRow({
  sports,
  counts,
}: {
  sports: Sport[];
  counts: Record<string, number>;
}) {
  const [expanded, setExpanded] = useState(false);
  const canCollapse = sports.length > COLLAPSED_COUNT;
  const shown = expanded ? sports : sports.slice(0, COLLAPSED_COUNT);

  return (
    <div className="grid grid-cols-5 gap-x-2 gap-y-5">
      {shown.map((s) => (
        <Link
          key={s.id}
          href={SPORT_PAGE_PILOT.has(s.id) ? `/sports/${s.id}` : `/search?sport=${s.id}`}
          className="flex flex-col items-center gap-1.5 text-rink-deep"
        >
          <SportIcon sportId={s.id} size={26} />
          <p className="text-center text-xs font-bold text-foreground">{s.name}</p>
          <p className="text-[10px] text-muted">{counts[s.id] ?? 0}개</p>
        </Link>
      ))}
      {canCollapse && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-col items-center gap-1.5 text-muted"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
          <p className="text-center text-xs font-bold">{expanded ? "접기" : "더보기"}</p>
        </button>
      )}
    </div>
  );
}
