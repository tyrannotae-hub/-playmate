"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "홈", Icon: HomeIcon },
  { href: "/search", label: "검색", Icon: SearchIcon },
  { href: "/wishlist", label: "찜", Icon: HeartIcon },
  { href: "/mypage/bookings", label: "내 클래스", Icon: ClassIcon },
  { href: "/mypage", label: "마이", Icon: ProfileIcon },
];

// 스크롤을 내리면 숨기고 올리면 다시 보여준다 (네이티브 앱의 흔한 하단 탭바 동작).
// 맨 위 근처(스크롤량이 작을 때)는 방향과 무관하게 항상 보여줘서 깜빡임을 줄인다.
const HIDE_THRESHOLD = 12;

export default function BottomNav() {
  const pathname = usePathname();
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

  return (
    <nav
      className={`fixed inset-x-0 bottom-0 z-20 bg-background/90 backdrop-blur transition-transform duration-300 ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex max-w-md items-start justify-around pt-2.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`btn-label flex flex-1 flex-col items-center gap-1 transition ${
                active ? "text-rink" : "text-foreground"
              }`}
            >
              <Icon />
              <span className="text-[11px] font-bold leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

// 돋보기(검색) + 햄버거(카테고리) 를 하나로 합친 아이콘 — 원 안에 짧은 가로줄 2개
function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.47 6.47 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z" />
      <rect x="5.8" y="7.4" width="7.4" height="1.4" rx="0.7" />
      <rect x="5.8" y="10.6" width="7.4" height="1.4" rx="0.7" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54Z" />
    </svg>
  );
}

function ClassIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 12h-5v5h5v-5ZM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1zm3 18H5V8h14Z" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />
    </svg>
  );
}
