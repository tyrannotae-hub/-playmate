"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const AUTO_SLIDE_MS = 4000;

export type PromoSlide = { url: string; title?: string; categoryId?: string };

function SlideCaption({ title }: { title?: string }) {
  if (!title) return null;
  return (
    <div className="absolute inset-x-0 top-3/4 -translate-y-1/2 px-5 text-center text-white">
      <p className="animate-fade-up-bright whitespace-pre-line text-base font-extrabold leading-snug tracking-tight">
        {title}
      </p>
    </div>
  );
}

function Slide({ slide, className }: { slide: PromoSlide; className: string }) {
  const content = (
    <>
      <Image src={slide.url} alt="" fill sizes="100vw" className="object-cover brightness-75" />
      <SlideCaption title={slide.title} />
    </>
  );

  if (slide.categoryId) {
    return (
      <Link href={`#category-${slide.categoryId}`} className={className}>
        {content}
      </Link>
    );
  }
  return <div className={className}>{content}</div>;
}

export default function PromoCarousel({ images }: { images: PromoSlide[] }) {
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

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="relative mx-auto w-[85%] overflow-hidden rounded-xs shadow-elevated">
        <Slide slide={images[0]} className="relative block aspect-video w-full" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-[85%] overflow-hidden rounded-xs shadow-elevated">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((slide, i) => (
          <Slide
            key={i}
            slide={slide}
            className="relative block aspect-video w-full shrink-0 snap-center"
          />
        ))}
      </div>
      <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white">
        {index + 1}/{images.length}
      </span>
    </div>
  );
}
