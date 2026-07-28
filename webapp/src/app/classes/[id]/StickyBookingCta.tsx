"use client";

import Link from "next/link";
import { buttonClass } from "@/lib/ui";
import { useHideOnScroll } from "@/lib/useHideOnScroll";

// 하단 탭바가 스크롤에 따라 숨었다 나타났다 하는데(useHideOnScroll), 이 CTA는
// 원래 탭바 위에 겹쳐 떠 있는 자리라 탭바가 숨으면 그 빈자리로 같이 내려가야
// 자연스럽다 — 탭바와 같은 훅으로 같은 스크롤 상태를 구독해서 위치를 맞춘다.
export default function StickyBookingCta({ classId }: { classId: string }) {
  const navHidden = useHideOnScroll();

  return (
    <div
      className={`shadow-elevated fixed inset-x-0 z-20 mx-auto w-full max-w-md bg-surface px-4 pt-3 transition-[bottom] duration-300 ${
        navHidden
          ? "bottom-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
          : "bottom-[4.75rem] pb-3"
      }`}
    >
      <Link
        href={`/booking/${classId}`}
        className={buttonClass({ radius: "round", className: "text-center" })}
      >
        예약 신청하기
      </Link>
    </div>
  );
}
