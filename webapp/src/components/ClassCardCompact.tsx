import Link from "next/link";
import { TeamClass } from "@/lib/types";
import { sportEmoji } from "@/lib/sport-meta";
import WishlistButton from "@/components/WishlistButton";

export default function ClassCardCompact({
  item,
  wished = false,
}: {
  item: TeamClass;
  wished?: boolean;
}) {
  const cover = item.images[0];

  return (
    <Link href={`/classes/${item.id}`} className="w-36 flex-shrink-0">
      <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-none bg-rink-soft text-3xl">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : (
          sportEmoji(item.sportId)
        )}
        <div className="absolute right-1.5 top-1.5">
          <WishlistButton classId={item.id} initialWished={wished} size="sm" />
        </div>
      </div>
      <p className="mt-2 truncate text-[11px] font-semibold text-muted">{item.facility.name}</p>
      <p className="truncate text-sm font-bold">{item.name}</p>
      <p className="mt-0.5 text-xs text-muted tabular-nums">
        {item.priceUnit} {item.price.toLocaleString()}원
      </p>
    </Link>
  );
}
