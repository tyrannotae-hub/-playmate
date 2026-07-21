import Link from "next/link";
import { TeamClass } from "@/lib/types";
import { sportEmoji } from "@/lib/sport-meta";

export default function ClassCardCompact({ item }: { item: TeamClass }) {
  const cover = item.images[0];

  return (
    <Link href={`/classes/${item.id}`} className="w-36 flex-shrink-0">
      <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl bg-rink-soft text-3xl">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : (
          sportEmoji(item.sportId)
        )}
      </div>
      <p className="mt-2 truncate text-[11px] font-semibold text-muted">{item.facility.name}</p>
      <p className="truncate text-sm font-bold">{item.name}</p>
      <p className="mt-0.5 text-xs text-muted tabular-nums">
        {item.priceUnit} {item.price.toLocaleString()}원
      </p>
    </Link>
  );
}
