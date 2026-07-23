import Link from "next/link";
import { TeamClass } from "@/lib/types";
import SportIcon from "@/components/icons/SportIcon";
import { cardClass } from "@/lib/ui";
import WishlistButton from "@/components/WishlistButton";

export default function ClassCard({ item, wished = false }: { item: TeamClass; wished?: boolean }) {
  const schedule = item.schedules[0];
  const isFull = schedule.booked >= schedule.capacity;

  return (
    <Link
      href={`/classes/${item.id}`}
      className={cardClass("block transition hover:border-rink")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-muted">
            <SportIcon sportId={item.sportId} size={14} className="shrink-0" />
            <span className="min-w-0 break-all">{item.facility.name}</span>
          </div>
          <h3 className="break-words text-base font-bold">{item.name}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-1 text-sm font-semibold text-rink-deep">
            ★ {item.rating}
            <span className="font-normal text-muted">({item.reviewCount})</span>
          </div>
          <WishlistButton
            classId={item.id}
            initialWished={wished}
            initialCount={item.wishCount}
            size="sm"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted tabular-nums">
        <span>{item.distanceKm.toFixed(1)}km</span>
        <span aria-hidden>·</span>
        <span>
          {item.priceUnit} {item.price.toLocaleString()}원
        </span>
        <span aria-hidden>·</span>
        <span
          className={
            isFull
              ? "font-semibold text-muted"
              : "font-semibold text-good"
          }
        >
          {isFull ? "마감" : `빈자리 ${schedule.capacity - schedule.booked}`}
        </span>
      </div>
    </Link>
  );
}
