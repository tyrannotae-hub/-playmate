import Link from "next/link";
import { ClubClass, Sport } from "@/lib/types";
import { cardClass } from "@/lib/ui";
import { regionLabel } from "@/lib/region-meta";
import SportIcon from "@/components/icons/SportIcon";

export default function ClassCard({
  item,
  sports,
  offersAcademy,
  offersLesson,
}: {
  item: ClubClass;
  sports: Sport[];
  offersAcademy: boolean;
  offersLesson: boolean;
}) {
  const sport = sports.find((s) => s.id === item.sportId);

  return (
    <Link
      href={`/club/classes/${item.id}`}
      className={cardClass("flex items-start justify-between gap-2 transition hover:border-rink")}
    >
      <div className="min-w-0">
        <p className="flex items-center gap-1 break-words text-xs font-bold text-muted">
          {sport && <SportIcon sportId={sport.id} size={13} className="shrink-0" />}
          <span className="min-w-0 break-words">
            {sport ? sport.name : item.sportId} ·{" "}
            {item.instructors.length > 0
              ? item.instructors.map((i) => i.name).join(" · ")
              : "코치 미정"}
          </span>
        </p>
        <p className="mt-0.5 break-words font-bold">
          {item.name}
          {offersAcademy && offersLesson && (
            <span className="ml-1.5 rounded-xs bg-surface-2 px-1.5 py-0.5 align-middle text-[11px] font-bold text-muted">
              {item.serviceType === "academy" ? "아카데미" : "레슨"}
            </span>
          )}
        </p>
        <p className="mt-1 text-xs text-muted">
          {item.ageMin}~{item.ageMax}세 ·{" "}
          {item.showPrice ? `${item.price.toLocaleString()}원/${item.priceUnit}` : "가격 비공개"}
          {item.regionCode && ` · ${regionLabel(item.regionCode)}`}
        </p>
        {item.allowTrial && (
          <span className="mt-1 inline-block rounded-xs bg-[#1768ac]/10 px-2 py-0.5 text-[11px] font-bold text-[#0d3f63]">
            원데이 체험 가능
            {item.trialPrice != null && ` · ${item.trialPrice.toLocaleString()}원`}
          </span>
        )}
      </div>
      <span className="shrink-0 text-lg text-line">{">"}</span>
    </Link>
  );
}
