"use client";

import { useEffect, useRef, useState } from "react";

// BottomNav의 탭 행(아이콘+라벨) 고정 높이. 세이프에어리어 패딩은 별도로 더해진다.
// StickyBookingCta 등 탭바 위에 겹쳐 떠야 하는 다른 고정 요소가 정확히 이 값만큼
// 띄워야 탭바와 겹치지 않는다 — 두 곳에서 각자 다른 값을 추정하지 않도록 여기 하나로 모음.
export const BOTTOM_NAV_ROW_HEIGHT = "3.5rem";
export const BOTTOM_NAV_TOTAL_HEIGHT = `calc(${BOTTOM_NAV_ROW_HEIGHT} + env(safe-area-inset-bottom))`;

// 아래로 스크롤하면 true(숨김), 위로 올리면 false(다시 보임)를 돌려준다.
// BottomNav와 그 위에 겹쳐 뜨는 고정 CTA(예: 예약 신청하기)가 같은 스크롤
// 상태를 각자 구독해서, 탭바가 숨을 때 CTA도 같이 내려가 탭바 자리를 채우게 한다.
const HIDE_THRESHOLD = 12;

export function useHideOnScroll() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const diff = y - lastY.current;
        if (y < HIDE_THRESHOLD) {
          setHidden(false);
        } else if (diff > 4) {
          setHidden(true);
        } else if (diff < -4) {
          setHidden(false);
        }
        lastY.current = y;
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}
