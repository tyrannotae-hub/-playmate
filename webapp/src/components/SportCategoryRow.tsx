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
    <div className="grid grid-cols-4 gap-x-2 gap-y-5">
      {sports.map((s) => (
        <Link
          key={s.id}
          href={`/search?sport=${s.id}`}
          className="flex flex-col items-center gap-1.5 text-rink-deep"
        >
          <SportIcon sportId={s.id} size={28} />
          <p className="text-center text-xs font-bold text-foreground">{s.name}</p>
          <p className="text-[10px] text-muted">{counts[s.id] ?? 0}개</p>
        </Link>
      ))}
    </div>
  );
}
