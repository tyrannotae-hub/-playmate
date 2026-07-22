import { Coach } from "@/lib/types";
import { cardClass } from "@/lib/ui";

export default function CoachCard({ coach }: { coach: Coach }) {
  return (
    <div className={cardClass("w-44 flex-shrink-0")}>
      <div
        className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-rink-soft bg-cover bg-center text-2xl"
        style={coach.profileImageUrl ? { backgroundImage: `url(${coach.profileImageUrl})` } : undefined}
      >
        {!coach.profileImageUrl && "🧑‍🏫"}
      </div>
      <p className="mt-2.5 font-bold">{coach.name}</p>
      <div className="mt-1 flex flex-wrap items-center gap-1 text-[11px] font-semibold text-muted">
        {coach.careerYears > 0 && <span>경력 {coach.careerYears}년</span>}
        {coach.certified && (
          <span className="rounded-full bg-good/10 px-1.5 py-0.5 text-good">
            인증{coach.certifiedBy ? ` · ${coach.certifiedBy}` : ""}
          </span>
        )}
      </div>
      {coach.bio && <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted">{coach.bio}</p>}
    </div>
  );
}
