"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const PUFFINS_FACILITY_ID = "b59ee112-2b7d-4155-98ad-c30b4b828875";
const PUFFINS_RINK_PHOTO =
  "https://unazmttaqqukrlupmnhr.supabase.co/storage/v1/object/public/facility-covers/b59ee112-2b7d-4155-98ad-c30b4b828875/cover.jpg";
const PUFFINS_PROMO_PHOTO =
  "https://unazmttaqqukrlupmnhr.supabase.co/storage/v1/object/public/facility-covers/b59ee112-2b7d-4155-98ad-c30b4b828875/promo/626c4b06-9b06-4638-9f79-25d8275e64e5.jpg";

type Banner =
  | {
      id: string;
      href: string;
      backgroundImageUrl?: string;
      gradientClassName?: string;
      layout: "logo";
      caption: string;
    }
  | {
      id: string;
      href: string;
      backgroundImageUrl?: string;
      gradientClassName?: string;
      layout: "text";
      title: string;
      subtitle: string;
    };

const BANNERS: Banner[] = [
  {
    id: "playmate",
    href: "/",
    backgroundImageUrl: PUFFINS_RINK_PHOTO,
    layout: "logo",
    caption: "우리아이 체육은 플레이메이트랑 함께 시작해요",
  },
  {
    id: "puffins",
    href: `/facilities/${PUFFINS_FACILITY_ID}`,
    backgroundImageUrl: PUFFINS_PROMO_PHOTO,
    layout: "text",
    title: "퍼핀스 아카데미",
    subtitle: "역삼・목동・신사・동탄, 4개 지점 아이스하키 아카데미",
  },
  {
    id: "recommend",
    href: "/recommend",
    gradientClassName: "bg-gradient-to-br from-[#0d3f63] to-[#1768ac]",
    layout: "text",
    title: "플레이메이트가 찾아줘요",
    subtitle: "우리 아이에게 맞는 운동 찾기",
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
    <div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="mx-auto flex w-[85%] snap-x snap-mandatory overflow-x-auto rounded-xs shadow-elevated [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {BANNERS.map((b) => (
          <Link
            key={b.id}
            href={b.href}
            style={
              b.backgroundImageUrl
                ? { backgroundImage: `url(${b.backgroundImageUrl})` }
                : undefined
            }
            className={`relative flex aspect-square w-full shrink-0 snap-center overflow-hidden rounded-xs bg-cover bg-center text-white ${
              b.gradientClassName ?? ""
            }`}
          >
            {b.backgroundImageUrl && (
              <div
                className={`absolute inset-0 ${
                  b.layout === "logo"
                    ? "bg-gradient-to-b from-black/55 via-black/20 to-black/60"
                    : "bg-gradient-to-t from-black/80 via-black/10 to-transparent"
                }`}
              />
            )}

            {b.layout === "logo" ? (
              <div className="relative flex flex-1 flex-col items-center justify-center gap-2.5 px-6 text-center">
                <p className="text-2xl font-extrabold tracking-tight">
                  PlayMate<span className="text-energy">.</span>
                </p>
                <p className="text-[15px] font-bold leading-snug tracking-tight">{b.caption}</p>
              </div>
            ) : (
              <div className="relative flex flex-1 flex-col justify-end gap-1 px-4 pb-4">
                <p className="text-lg font-extrabold tracking-tight">{b.title}</p>
                <p className="text-xs leading-snug text-white/85">{b.subtitle}</p>
              </div>
            )}
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
