import Link from "next/link";
import { Sport } from "@/lib/types";
import SportIcon from "@/components/icons/SportIcon";

export default function SportCategoryRow({
  sports,
  counts,
}: {
  sports: Sport[];
  counts: Record<string, number>;
}) {
  return (
    <>
      {sports.map((s) => (
        <Link
          key={s.id}
          href={`/search?sport=${s.id}`}
          className="flex w-20 flex-shrink-0 flex-col items-center gap-1.5"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rink-soft text-rink-deep">
            <SportIcon sportId={s.id} size={28} />
          </div>
          <p className="text-center text-xs font-bold">{s.name}</p>
          <p className="text-[10px] text-muted">{counts[s.id] ?? 0}개</p>
        </Link>
      ))}
    </>
  );
}
