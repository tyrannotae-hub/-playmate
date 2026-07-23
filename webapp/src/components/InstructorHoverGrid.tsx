"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FeaturedInstructor } from "@/lib/types";

export default function InstructorHoverGrid({
  instructors,
}: {
  instructors: FeaturedInstructor[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="flex gap-3 overflow-x-auto px-4 pb-1">
      {instructors.map((item) => {
        const active = activeId === item.id;

        return (
          <Link
            key={item.id}
            href={`/facilities/${item.facilityId}`}
            className="relative block h-40 w-32 flex-shrink-0 overflow-hidden rounded-md bg-surface-2"
            onMouseEnter={() => setActiveId(item.id)}
            onMouseLeave={() => setActiveId(null)}
            onFocus={() => setActiveId(item.id)}
            onBlur={() => setActiveId(null)}
            onTouchStart={() => setActiveId((cur) => (cur === item.id ? null : item.id))}
          >
            <Image
              src={item.profileImageUrl}
              alt=""
              fill
              sizes="128px"
              className="object-cover"
            />

            <AnimatePresence>
              {active && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {active && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="absolute inset-x-0 bottom-0 p-2.5"
                >
                  {item.certified && (
                    <p className="btn-label mb-1 inline-block whitespace-nowrap rounded bg-energy px-1.5 py-0.5 text-[10px] font-bold text-[#1a0e08]">
                      인증 지도자
                    </p>
                  )}
                  <p className="truncate text-sm font-extrabold text-white">{item.name}</p>
                  <p className="truncate text-[11px] text-white/80">
                    {item.facilityName} · 경력 {item.careerYears}년
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {!active && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2.5">
                <p className="truncate text-xs font-bold text-white">{item.name}</p>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}

/**
 * Skiper UI(skiper-ui.com)의 "skiper6"(Hover Members) 컴포넌트 컨셉 — 인물 사진에
 * 호버하면 이름이 부드럽게 드러나는 인터랙션 — 을 참고해 PlayMate 지도자 데이터/디자인
 * 토큰에 맞게 새로 작성함. skiper6은 Pro(유료) 컴포넌트라 원본 코드는 사용하지 않음.
 */
