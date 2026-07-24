"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const AUTO_SLIDE_MS = 4000;

export default function PromoCarousel({ images }: { images: string[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

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
        <Image src={images[0]} alt="" fill sizes="100vw" className="object-cover" />
      </div>
    );
  }

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((url, i) => (
          <div key={i} className="relative aspect-square w-full shrink-0 snap-center">
            <Image src={url} alt="" fill sizes="100vw" className="object-cover" />
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-2.5 flex items-center justify-center gap-1.5">
        {images.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-4 bg-white" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
