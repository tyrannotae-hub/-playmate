import Link from "next/link";
import { TeamClass } from "@/lib/types";
import SportIcon from "@/components/icons/SportIcon";
import { cardClass } from "@/lib/ui";
import WishlistButton from "@/components/WishlistButton";
import { effectivePrice, isDiscountActive } from "@/lib/pricing";

export default function ClassCard({ item, wished = false }: { item: TeamClass; wished?: boolean }) {
  const schedule = item.schedules[0] as typeof item.schedules[number] | undefined;
  const isFull = !!schedule && schedule.booked >= schedule.capacity;

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
          {item.allowTrial && (
            <span className="mt-1 inline-block rounded-md bg-rink/10 px-2 py-0.5 text-[11px] font-bold text-rink-deep">
              원데이 체험 가능
            </span>
          )}
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
          {item.showPrice ? (
            isDiscountActive(item) ? (
              <>
                <span className="text-muted line-through">
                  {item.priceUnit} {item.price.toLocaleString()}원
                </span>{" "}
                <span className="font-bold text-energy">
                  {item.priceUnit} {effectivePrice(item).toLocaleString()}원
                </span>
              </>
            ) : (
              `${item.priceUnit} ${item.price.toLocaleString()}원`
            )
          ) : (
            "가격 문의"
          )}
        </span>
        {schedule && (
          <>
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
          </>
        )}
      </div>
    </Link>
  );
}
