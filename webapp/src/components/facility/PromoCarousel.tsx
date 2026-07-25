"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const AUTO_SLIDE_MS = 4000;

export type PromoSlide = { url: string; title?: string };

function SlideCaption({ title }: { title?: string }) {
  if (!title) return null;
  return (
    <div className="absolute inset-x-0 top-3/4 -translate-y-1/2 px-5 text-center text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">
      <p className="text-xl font-extrabold tracking-tight">{title}</p>
    </div>
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
        <SlideCaption title={images[0].title} />
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
          <SlideCaption title={slide.title} />
        </div>
      ))}
    </div>
  );
}
