"use client";

import { useState } from "react";
import Link from "next/link";
import { TeamClass } from "@/lib/types";
import SportIcon from "@/components/icons/SportIcon";

export default function ClassSearchBox({ classes }: { classes: TeamClass[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const results =
    q.length === 0
      ? []
      : classes.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.facility.name.toLowerCase().includes(q) ||
            c.instructors.some((i) => i.name.toLowerCase().includes(q))
        );

  return (
    <div className="relative px-4">
      <div className="relative">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="m20 20-4.3-4.3" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="클래스, 팀, 코치 이름으로 검색"
          className="w-full rounded-md border border-line bg-surface py-3 pl-10 pr-3.5 text-sm"
        />
      </div>

      {q.length > 0 && (
        <div className="absolute inset-x-4 top-full z-10 mt-1.5 max-h-80 overflow-y-auto rounded-md border border-line bg-surface shadow-elevated">
          {results.length === 0 ? (
            <p className="px-3.5 py-4 text-sm text-muted">검색 결과가 없어요.</p>
          ) : (
            results.map((c) => (
              <Link
                key={c.id}
                href={`/classes/${c.id}`}
                className="flex items-center gap-3 border-b border-line px-3.5 py-3 transition last:border-0 hover:bg-surface-2"
              >
                <SportIcon sportId={c.sportId} size={20} className="shrink-0 text-rink-deep" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{c.name}</p>
                  <p className="truncate text-xs text-muted">
                    {c.facility.name}
                    {c.instructors.length > 0 && ` · ${c.instructors.map((i) => i.name).join(", ")}`}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
