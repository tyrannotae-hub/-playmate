import Image from "next/image";
import Link from "next/link";
import { FacilitySummary } from "@/lib/types";
import { regionLabel } from "@/lib/region-meta";
import SportIcon from "@/components/icons/SportIcon";

export default function FacilityCard({
  item,
  variant = "scroll",
}: {
  item: FacilitySummary;
  /** "scroll": 가로 스크롤용 고정폭(w-40) / "grid": 그리드용 유동폭(w-full) */
  variant?: "scroll" | "grid";
}) {
  return (
    <Link
      href={`/facilities/${item.id}`}
      className={variant === "grid" ? "w-full" : "w-40 flex-shrink-0"}
    >
      <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-none bg-rink-soft text-rink-deep">
        {item.coverImageUrl ? (
          <Image src={item.coverImageUrl} alt="" fill sizes="160px" className="object-cover" />
        ) : (
          <span className="text-3xl">🏟️</span>
        )}
        <span className="absolute left-1.5 top-1.5 rounded-md bg-foreground/80 px-1.5 py-0.5 text-[10px] font-bold text-background">
          {item.ownerType === "solo_coach" ? "개인 코치" : "클럽"}
        </span>
      </div>
      <p className="mt-2 truncate text-sm font-bold">{item.name}</p>
      <p className="mt-0.5 truncate text-xs text-muted">
        {regionLabel(item.region) || item.address} · 클래스 {item.classCount}개
      </p>
      <div className="mt-1 flex items-center gap-1.5">
        <div className="flex items-center gap-1">
          {item.sportIds.slice(0, 4).map((sportId) => (
            <SportIcon key={sportId} sportId={sportId} size={13} className="shrink-0 text-muted" />
          ))}
        </div>
        {item.reviewCount > 0 && (
          <span className="text-xs font-semibold text-rink-deep">
            ★ {item.rating} ({item.reviewCount})
          </span>
        )}
      </div>
    </Link>
  );
}
