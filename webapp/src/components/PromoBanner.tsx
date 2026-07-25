"use client";

import Link from "next/link";
import { useRef, useState } from "react";

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

export default function PromoBanner() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div className="relative mx-auto w-[90%] overflow-hidden rounded-xs shadow-elevated">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
            className={`relative flex aspect-square w-full shrink-0 snap-center bg-cover bg-center text-white ${
              b.gradientClassName ?? ""
            }`}
          >
            {b.layout === "logo" ? (
              <div className="relative flex flex-1 flex-col items-center justify-center gap-2.5 px-6 pb-9 text-center [text-shadow:0_1px_1.5px_rgba(0,0,0,0.2)]">
                <p className="text-2xl font-extrabold tracking-tight">
                  PlayMate<span className="text-energy">.</span>
                </p>
                <p className="text-[15px] font-bold leading-snug tracking-tight">{b.caption}</p>
              </div>
            ) : (
              <div className="relative flex flex-1 flex-col justify-end gap-1 px-4 pb-9 [text-shadow:0_1px_1.5px_rgba(0,0,0,0.2)]">
                <p className="text-lg font-extrabold tracking-tight">{b.title}</p>
                <p className="text-xs leading-snug text-white/85">{b.subtitle}</p>
              </div>
            )}
          </Link>
        ))}
      </div>
      <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white">
        {index + 1}/{BANNERS.length}
      </span>
    </div>
  );
}
