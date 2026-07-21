"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import TopNav from "@/components/TopNav";
import ClassCard from "@/components/ClassCard";
import { Sport, TeamClass } from "@/lib/types";
import { regionLabel } from "@/lib/region-meta";
import { buttonClass } from "@/lib/ui";

type SortKey = "distance" | "rating" | "price";

const SORTERS: Record<SortKey, (a: TeamClass, b: TeamClass) => number> = {
  distance: (a, b) => a.distanceKm - b.distanceKm,
  rating: (a, b) => b.rating - a.rating,
  price: (a, b) => a.price - b.price,
};

export default function SearchClient({
  classes,
  sports,
  initialRegion = "",
}: {
  classes: TeamClass[];
  sports: Sport[];
  initialRegion?: string;
}) {
  const params = useSearchParams();
  const initialSport = params.get("sport") ?? "all";

  const [sportId, setSportId] = useState(initialSport);
  const [region, setRegion] = useState(initialRegion || "all");
  const [sort, setSort] = useState<SortKey>("distance");

  const regions = useMemo(() => {
    const codes = Array.from(new Set(classes.map((c) => c.facility.region).filter(Boolean)));
    return codes.map((code) => ({ code, label: regionLabel(code) }));
  }, [classes]);

  const results = useMemo(() => {
    const bySport =
      sportId === "all" ? classes : classes.filter((c) => c.sportId === sportId);
    const byRegion =
      region === "all" ? bySport : bySport.filter((c) => c.facility.region === region);
    return [...byRegion].sort(SORTERS[sort]);
  }, [classes, sportId, region, sort]);

  return (
    <>
      <TopNav
        title={sportId === "all" ? "검색" : sports.find((s) => s.id === sportId)?.name}
        back
      />
      <main className="pb-10 pt-3">
        <div className="mb-3 flex gap-2 overflow-x-auto px-4 pb-1">
          <button
            onClick={() => setSportId("all")}
            className={buttonClass({
              variant: sportId === "all" ? "secondary" : "outline",
              size: "sm",
              full: false,
              className: "flex-shrink-0",
            })}
          >
            전체 종목
          </button>
          {sports.map((s) => (
            <button
              key={s.id}
              onClick={() => setSportId(s.id)}
              className={buttonClass({
                variant: sportId === s.id ? "secondary" : "outline",
                size: "sm",
                full: false,
                className: "flex-shrink-0",
              })}
            >
              {s.emoji} {s.name}
            </button>
          ))}
        </div>

        <div className="mb-4 flex gap-2 px-4">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="flex-1 rounded-full border border-line bg-surface px-3 py-2 text-sm font-semibold"
          >
            <option value="all">전체 지역</option>
            {regions.map((r) => (
              <option key={r.code} value={r.code}>
                {r.label}
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

        <p className="mb-3 px-4 text-xs font-semibold text-muted">
          {region === "all" ? "전체 지역" : regionLabel(region)} · {results.length}개 결과
        </p>

        <div className="flex flex-col gap-3 px-4">
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
