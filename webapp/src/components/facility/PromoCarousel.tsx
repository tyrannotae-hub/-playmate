"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const AUTO_SLIDE_MS = 4000;

export type PromoSlide = { url: string; title?: string; subtitle?: string };

function SlideCaption({ title, subtitle }: { title?: string; subtitle?: string }) {
  if (!title && !subtitle) return null;
  return (
    <>
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-6 px-5 text-white">
        {title && <p className="text-xl font-extrabold tracking-tight">{title}</p>}
        {subtitle && <p className="mt-1 text-xs text-white/85">{subtitle}</p>}
      </div>
    </>
  );
}

export default function PromoCarousel({ images }: { images: PromoSlide[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % images.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, AUTO_SLIDE_MS);
    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="relative aspect-square w-full">
        <Image src={images[0].url} alt="" fill sizes="100vw" className="object-cover" />
        <SlideCaption title={images[0].title} subtitle={images[0].subtitle} />
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {images.map((slide, i) => (
        <div key={i} className="relative aspect-square w-full shrink-0 snap-center">
          <Image src={slide.url} alt="" fill sizes="100vw" className="object-cover" />
          <SlideCaption title={slide.title} subtitle={slide.subtitle} />
        </div>
      ))}
    </div>
  );
}
