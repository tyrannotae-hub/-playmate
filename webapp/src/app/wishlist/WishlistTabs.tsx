"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ClassCard from "@/components/ClassCard";
import FacilityCard from "@/components/FacilityCard";
import InstructorWishlistButton from "@/components/InstructorWishlistButton";
import { FacilitySummary, FeaturedInstructor, TeamClass } from "@/lib/types";
import { cardClass } from "@/lib/ui";

const TABS = ["클래스", "클럽·강사"] as const;
type Tab = (typeof TABS)[number];

export default function WishlistTabs({
  classes,
  instructors,
  facilities,
}: {
  classes: TeamClass[];
  instructors: FeaturedInstructor[];
  facilities: FacilitySummary[];
}) {
  const [tab, setTab] = useState<Tab>("클래스");

  return (
    <>
      <div className="mb-4 flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`btn-label -mb-px border-b-2 px-3 py-2.5 text-sm font-bold transition ${
              tab === t ? "border-rink text-rink-deep" : "border-transparent text-muted"
            }`}
          >
            찜한 {t}
          </button>
        ))}
      </div>

      {tab === "클래스" ? (
        <div className="flex flex-col gap-3">
          {classes.map((c) => (
            <ClassCard key={c.id} item={c} wished />
          ))}
          {classes.length === 0 && (
            <p className="py-10 text-center text-sm text-muted">
              아직 찜한 클래스가 없어요. 마음에 드는 클래스에서 ♡를 눌러보세요.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {facilities.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-bold text-muted">찜한 팀・클럽</h2>
              <div className="grid grid-cols-2 gap-4">
                {facilities.map((f) => (
                  <FacilityCard key={f.id} item={f} variant="grid" wished />
                ))}
              </div>
            </div>
          )}

          {instructors.length > 0 && (
            <div>
              {facilities.length > 0 && (
                <h2 className="mb-3 text-sm font-bold text-muted">찜한 강사</h2>
              )}
              <div className="flex flex-col gap-3">
                {instructors.map((i) => (
                  <Link key={i.id} href={`/facilities/${i.facilityId}`} className={cardClass("block")}>
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-surface-2">
                        {i.profileImageUrl && (
                          <Image src={i.profileImageUrl} alt="" fill sizes="56px" className="object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">{i.name}</p>
                        <p className="truncate text-xs text-muted">
                          {i.facilityName} · 경력 {i.careerYears}년
                        </p>
                      </div>
                      <InstructorWishlistButton
                        instructorId={i.id}
                        initialWished
                        initialCount={i.wishCount}
                        size="sm"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {facilities.length === 0 && instructors.length === 0 && (
            <p className="py-10 text-center text-sm text-muted">
              아직 찜한 클럽·강사가 없어요. 마음에 드는 팀이나 코치에게서 ♡를 눌러보세요.
            </p>
          )}
        </div>
      )}
    </>
  );
}
