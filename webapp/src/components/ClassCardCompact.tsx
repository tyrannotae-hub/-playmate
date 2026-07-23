import Image from "next/image";
import Link from "next/link";
import { TeamClass } from "@/lib/types";
import SportIcon from "@/components/icons/SportIcon";
import WishlistButton from "@/components/WishlistButton";

export default function ClassCardCompact({
  item,
  wished = false,
  variant = "scroll",
}: {
  item: TeamClass;
  wished?: boolean;
  /** "scroll": 가로 스크롤용 고정폭(w-36) / "grid": 그리드용 유동폭(w-full) */
  variant?: "scroll" | "grid";
}) {
  const cover = item.images[0];

  return (
    <Link
      href={`/classes/${item.id}`}
      className={variant === "grid" ? "w-full" : "w-36 flex-shrink-0"}
    >
      <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-none bg-rink-soft text-rink-deep">
        {cover ? (
          <Image src={cover} alt="" fill sizes="144px" className="object-cover" />
        ) : (
          <SportIcon sportId={item.sportId} size={30} />
        )}
        <div className="absolute right-1.5 top-1.5">
          <WishlistButton
            classId={item.id}
            initialWished={wished}
            initialCount={item.wishCount}
            size="sm"
          />
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
