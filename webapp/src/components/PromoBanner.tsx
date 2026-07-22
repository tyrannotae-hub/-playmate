"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Banner = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  className: string;
};

const BANNERS: Banner[] = [
  {
    id: "recommend",
    title: "종목 추천받기",
    subtitle: "아직 어떤 운동이 좋을지 모르겠다면? 3가지 질문으로 찾아드려요",
    href: "/recommend",
    className: "bg-rink text-white",
  },
  {
    id: "popular",
    title: "인기 클래스 확인하기",
    subtitle: "다른 부모들이 많이 찜한 클래스를 만나보세요",
    href: "/#popular",
    className: "bg-energy text-[#1a0e08]",
  },
  {
    id: "search",
    title: "우리 아이에게 맞는 클래스 찾기",
    subtitle: "종목·지역으로 딱 맞는 클래스를 검색해보세요",
    href: "/search",
    className: "bg-rink-deep text-white",
  },
];

const AUTO_SLIDE_MS = 4000;

export default function PromoBanner() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % BANNERS.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, AUTO_SLIDE_MS);
    return () => clearInterval(timer);
  }, []);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  function goTo(i: number) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="pt-2">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {BANNERS.map((b) => (
          <Link
            key={b.id}
            href={b.href}
            className={`flex aspect-[21/8] w-full shrink-0 snap-center flex-col justify-center gap-1 px-5 ${b.className}`}
          >
            <p className="text-base font-extrabold">{b.title}</p>
            <p className="text-sm opacity-90">{b.subtitle}</p>
          </Link>
        ))}
      </div>
      <div className="mt-2.5 flex items-center justify-center gap-1.5">
        {BANNERS.map((b, i) => (
          <button
            key={b.id}
            type="button"
            aria-label={`${i + 1}번째 배너로 이동`}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-4 bg-rink" : "w-1.5 bg-line"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
