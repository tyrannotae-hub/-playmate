"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import PlayMateLogo from "@/components/PlayMateLogo";
import { HomeBanner } from "@/lib/types";

export default function PromoBanner({ banners }: { banners: HomeBanner[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  if (banners.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-xs shadow-elevated">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {banners.map((b) => (
          <Link
            key={b.id}
            href={b.href}
            className="relative flex aspect-square w-full shrink-0 snap-center bg-rink-deep text-white"
          >
            {b.backgroundImageUrl && (
              <div
                style={{ backgroundImage: `url(${b.backgroundImageUrl})` }}
                className="absolute inset-0 bg-cover bg-center brightness-75"
              />
            )}
            {b.layout === "logo" ? (
              <div className="relative flex flex-1 flex-col items-center justify-center gap-2.5 px-6 pb-9 text-center">
                <PlayMateLogo className="h-6 w-auto" />
                {b.caption && (
                  <p className="text-[15px] font-bold leading-snug tracking-tight">{b.caption}</p>
                )}
              </div>
            ) : (
              <div className="relative flex flex-1 flex-col justify-end gap-1 px-4 pb-9">
                {b.title && (
                  <p className="font-banner-title text-lg tracking-tight">{b.title}</p>
                )}
                {b.subtitle && <p className="text-xs leading-snug text-white/85">{b.subtitle}</p>}
              </div>
            )}
          </Link>
        ))}
      </div>
      {banners.length > 1 && (
        <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white">
          {index + 1}/{banners.length}
        </span>
      )}
    </div>
  );
}
