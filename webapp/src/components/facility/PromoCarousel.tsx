"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

const AUTO_SLIDE_MS = 4000;

export type PromoSlide = { url: string; title?: string; categoryId?: string };

function SlideCaption({ title }: { title?: string }) {
  if (!title) return null;
  return (
    <div className="absolute inset-x-0 top-3/4 -translate-y-1/2 px-5 text-center text-white [text-shadow:0_1px_1.5px_rgba(0,0,0,0.2)]">
      <p className="text-xl font-extrabold tracking-tight">{title}</p>
    </div>
  );
}

function Slide({ slide, className }: { slide: PromoSlide; className: string }) {
  const content = (
    <>
      <Image src={slide.url} alt="" fill sizes="100vw" className="object-cover" />
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
    return <Slide slide={images[0]} className="relative block aspect-square w-full" />;
  }

  return (
    <div
      ref={scrollRef}
      className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {images.map((slide, i) => (
        <Slide
          key={i}
          slide={slide}
          className="relative block aspect-square w-full shrink-0 snap-center"
        />
      ))}
    </div>
  );
}
