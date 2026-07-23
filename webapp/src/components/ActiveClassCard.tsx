import Image from "next/image";
import Link from "next/link";
import { ActiveClass } from "@/lib/types";
import SportIcon from "@/components/icons/SportIcon";

// 마이페이지 "수강중인 클래스" 섹션 전용 카드: 16:9 대표 이미지 (ClassCardCompact의 4:3과 구분)
export default function ActiveClassCard({ item }: { item: ActiveClass }) {
  const cover = item.images[0];

  return (
    <Link href={`/classes/${item.classId}`} className="w-64 flex-shrink-0">
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border border-line bg-rink-soft text-rink-deep">
        {cover ? (
          <Image src={cover} alt="" fill sizes="256px" className="object-cover" />
        ) : (
          <SportIcon sportId={item.sportId} size={36} />
        )}
      </div>
      <p className="mt-2 truncate text-[11px] font-semibold text-muted">{item.facilityName}</p>
      <p className="truncate text-sm font-bold">{item.name}</p>
      {item.scheduleLabel && (
        <p className="mt-0.5 text-xs text-muted">{item.scheduleLabel}</p>
      )}
    </Link>
  );
}
