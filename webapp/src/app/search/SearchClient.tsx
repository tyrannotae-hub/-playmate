"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import TopNav from "@/components/TopNav";
import ClassCard from "@/components/ClassCard";
import { Sport, TeamClass } from "@/lib/types";

type SortKey = "distance" | "rating" | "price";

const SORTERS: Record<SortKey, (a: TeamClass, b: TeamClass) => number> = {
  distance: (a, b) => a.distanceKm - b.distanceKm,
  rating: (a, b) => b.rating - a.rating,
  price: (a, b) => a.price - b.price,
};

export default function SearchClient({
  classes,
  sports,
}: {
  classes: TeamClass[];
  sports: Sport[];
}) {
  const params = useSearchParams();
  const initialSport = params.get("sport") ?? "all";

  const [sportId, setSportId] = useState(initialSport);
  const [sort, setSort] = useState<SortKey>("distance");

  const results = useMemo(() => {
    const filtered =
      sportId === "all" ? classes : classes.filter((c) => c.sportId === sportId);
    return [...filtered].sort(SORTERS[sort]);
  }, [classes, sportId, sort]);

  return (
    <>
      <TopNav
        title={sportId === "all" ? "검색" : sports.find((s) => s.id === sportId)?.name}
        back
      />
      <main className="px-4 pb-10 pt-3">
        <div className="mb-4 flex gap-2">
          <select
            value={sportId}
            onChange={(e) => setSportId(e.target.value)}
            className="flex-1 rounded-full border border-line bg-surface px-3 py-2 text-sm font-semibold"
          >
            <option value="all">전체 종목</option>
            {sports.map((s) => (
              <option key={s.id} value={s.id}>
                {s.emoji} {s.name}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-full border border-line bg-surface px-3 py-2 text-sm font-semibold"
          >
            <option value="distance">거리순</option>
            <option value="rating">평점순</option>
            <option value="price">가격순</option>
          </select>
        </div>

        <p className="mb-3 text-xs font-semibold text-muted">
          강남·구로 · {results.length}개 결과
        </p>

        <div className="flex flex-col gap-3">
          {results.map((c) => (
            <ClassCard key={c.id} item={c} />
          ))}
          {results.length === 0 && (
            <p className="py-10 text-center text-sm text-muted">
              조건에 맞는 클래스가 아직 없어요.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
