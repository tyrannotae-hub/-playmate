"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { TeamClass } from "@/lib/types";
import { sportEmoji } from "@/lib/sport-meta";

const HoverExpand_001 = ({
  classes,
  className = "",
}: {
  classes: TeamClass[];
  className?: string;
}) => {
  const [activeId, setActiveId] = useState<string | null>(classes[0]?.id ?? null);

  return (
    <div className={["flex items-stretch gap-1.5 overflow-x-auto pb-1", className].join(" ")}>
      {classes.map((item) => {
        const active = activeId === item.id;
        const cover = item.images[0];

        return (
          <motion.div
            key={item.id}
            className="relative flex-shrink-0 cursor-pointer overflow-hidden rounded-none bg-rink-soft"
            style={{ height: "13rem" }}
            initial={false}
            animate={{ width: active ? "13.5rem" : "3rem" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={() => setActiveId(item.id)}
            onHoverStart={() => setActiveId(item.id)}
          >
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl">
                {sportEmoji(item.sportId)}
              </div>
            )}

            <AnimatePresence>
              {active && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {active && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  className="absolute inset-x-0 bottom-0 overflow-hidden p-3"
                >
                  <Link href={`/classes/${item.id}`} className="block">
                    <p className="btn-label inline-block whitespace-nowrap rounded bg-energy px-2 py-0.5 text-[11px] font-bold text-[#1a0e08]">
                      {item.reviewCount > 0 ? `★ ${item.rating}` : "신규 오픈"}
                    </p>
                    <p className="mt-1.5 truncate whitespace-nowrap text-sm font-extrabold text-white">
                      {item.name}
                    </p>
                    <p className="truncate whitespace-nowrap text-xs text-white/80 tabular-nums">
                      {item.facility.name} · {item.priceUnit} {item.price.toLocaleString()}원
                    </p>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

export { HoverExpand_001 };

/**
 * Skiper UI(skiper-ui.com) skiper52 "ExpandOnHover"를 PlayMate 클래스 카드용으로 재구성.
 * 원본은 이미지 갤러리용 데모였고, 이 버전은 TeamClass 데이터/디자인 토큰에 맞게 새로 작성함.
 * Attribution: https://skiper-ui.com (free tier 사용 시 출처 표기 요구사항)
 */
