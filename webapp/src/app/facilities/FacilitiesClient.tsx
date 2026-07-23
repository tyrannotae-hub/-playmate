"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import TopNav from "@/components/TopNav";
import FacilityCard from "@/components/FacilityCard";
import SportIcon from "@/components/icons/SportIcon";
import { FacilitySummary, Sport } from "@/lib/types";
import { regionLabel } from "@/lib/region-meta";
import { buttonClass } from "@/lib/ui";

type SortKey = "popular" | "rating" | "classCount";

const SORTERS: Record<SortKey, (a: FacilitySummary, b: FacilitySummary) => number> = {
  popular: (a, b) => b.popularity - a.popularity,
  rating: (a, b) => b.rating - a.rating,
  classCount: (a, b) => b.classCount - a.classCount,
};

export default function FacilitiesClient({
  facilities,
  sports,
  initialRegion = "",
}: {
  facilities: FacilitySummary[];
  sports: Sport[];
  initialRegion?: string;
}) {
  const params = useSearchParams();
  const initialSport = params.get("sport") ?? "all";

  const [sportId, setSportId] = useState(initialSport);
  const [region, setRegion] = useState(initialRegion || "all");
  const [sort, setSort] = useState<SortKey>("popular");

  const regions = useMemo(() => {
    const codes = Array.from(new Set(facilities.map((f) => f.region).filter(Boolean)));
    return codes.map((code) => ({ code, label: regionLabel(code) }));
  }, [facilities]);

  const results = useMemo(() => {
    const bySport =
      sportId === "all" ? facilities : facilities.filter((f) => f.sportIds.includes(sportId));
    const byRegion = region === "all" ? bySport : bySport.filter((f) => f.region === region);
    return [...byRegion].sort(SORTERS[sort]);
  }, [facilities, sportId, region, sort]);

  return (
    <>
      <TopNav title="팀・클럽" back />
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
              <SportIcon sportId={s.id} size={15} />
              {s.name}
            </button>
          ))}
        </div>

        <div className="mb-4 flex gap-2 px-4">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="flex-1 rounded-md border border-line bg-surface px-3 py-2 text-sm font-semibold"
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
            className="rounded-md border border-line bg-surface px-3 py-2 text-sm font-semibold"
          >
            <option value="popular">인기순</option>
            <option value="rating">평점순</option>
            <option value="classCount">클래스 많은순</option>
          </select>
        </div>

        <p className="mb-3 px-4 text-xs font-semibold text-muted">
          {region === "all" ? "전체 지역" : regionLabel(region)} · {results.length}개 결과
        </p>

        <div className="grid grid-cols-2 gap-4 px-4">
          {results.map((f) => (
            <FacilityCard key={f.id} item={f} variant="grid" />
          ))}
          {results.length === 0 && (
            <p className="col-span-2 py-10 text-center text-sm text-muted">
              조건에 맞는 팀・클럽이 아직 없어요.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
