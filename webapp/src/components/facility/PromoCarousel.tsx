"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const AUTO_SLIDE_MS = 4000;

export type PromoSlide = { url: string; title?: string; categoryId?: string };

// key를 활성 슬라이드가 될 때마다 바꿔서(remount) 매번 fade-up-bright 애니메이션이
// 새로 재생되게 한다 — 그냥 CSS 애니메이션만 걸어두면 최초 마운트(=페이지 로드) 때
// 한 번만 재생되고, 슬라이드를 넘겨도 이미 마운트돼 있던 캡션은 다시 재생되지 않는다.
function SlideCaption({ title, active, index }: { title?: string; active: boolean; index: number }) {
  if (!title) return null;
  return (
    <div className="absolute inset-x-0 top-3/4 -translate-y-1/2 px-5 text-center text-white">
      <p
        key={active ? `active-${index}` : "idle"}
        className="font-banner-title animate-fade-up-bright whitespace-pre-line text-lg leading-snug tracking-tight"
      >
        {title}
      </p>
    </div>
  );
}

function Slide({
  slide,
  facilityId,
  className,
  active,
  index,
}: {
  slide: PromoSlide;
  facilityId: string;
  className: string;
  active: boolean;
  index: number;
}) {
  const content = (
    <>
      <Image src={slide.url} alt="" fill sizes="100vw" className="object-cover brightness-75" />
      <SlideCaption title={slide.title} active={active} index={index} />
    </>
  );

  if (slide.categoryId) {
    return (
      <Link href={`/facilities/${facilityId}/category/${slide.categoryId}`} className={className}>
        {content}
      </Link>
    );
  }
  return <div className={className}>{content}</div>;
}

export default function PromoCarousel({
  images,
  facilityId,
}: {
  images: PromoSlide[];
  facilityId: string;
}) {
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
      <div className="relative overflow-hidden rounded-xl shadow-elevated">
        <Slide
          slide={images[0]}
          facilityId={facilityId}
          className="relative block aspect-video w-full"
          active
          index={0}
        />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl shadow-elevated">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((slide, i) => (
          <Slide
            key={i}
            slide={slide}
            facilityId={facilityId}
            className="relative block aspect-video w-full shrink-0 snap-center"
            active={i === index}
            index={index}
          />
        ))}
      </div>
      <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white">
        {index + 1}/{images.length}
      </span>
    </div>
  );
}
