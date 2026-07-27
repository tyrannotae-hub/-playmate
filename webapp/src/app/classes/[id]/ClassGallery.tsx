"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import SportIcon from "@/components/icons/SportIcon";

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.02-3.58.07-4.85c.15-3.23 1.67-4.77 4.92-4.92 1.27-.06 1.65-.07 4.85-.07ZM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.7.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.35 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84ZM12 16a4 4 0 1 1 4-4 4 4 0 0 1-4 4Zm6.41-10.85a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44Z" />
    </svg>
  );
}

export default function ClassGallery({
  images,
  sportId,
  bannerTitle,
  bannerSubtitle,
  phone,
  instagramUrl,
  facilityName,
}: {
  images: string[];
  sportId: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
  phone?: string;
  instagramUrl?: string;
  facilityName: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div className="relative">
      {/* 뒤로가기는 TopNav(좌상단)에 이미 있어서 여기서는 중복으로 두지 않는다 */}
      {(phone || instagramUrl) && (
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-end gap-2 p-3">
          {phone && (
            <a
              href={`tel:${phone}`}
              aria-label={`${facilityName}에 전화 걸기`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur"
            >
              <PhoneIcon />
            </a>
          )}
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${facilityName} 인스타그램 바로가기`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur"
            >
              <InstagramIcon />
            </a>
          )}
        </div>
      )}

      {images.length === 0 ? (
        <div className="flex aspect-square w-full items-center justify-center bg-rink-soft text-rink-deep">
          <SportIcon sportId={sportId} size={56} />
        </div>
      ) : (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex aspect-square w-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((url, i) => (
            <div key={i} className="relative h-full w-full flex-shrink-0 snap-center">
              <Image src={url} alt="" fill sizes="100vw" className="object-cover" />
              {/* 배너 문구는 첫 장에서만 노출(스크롤로 넘어가면 사라짐) */}
              {i === 0 && (bannerTitle || bannerSubtitle) && (
                <>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-6 px-5 text-white">
                    {bannerTitle && (
                      <p className="font-banner-title text-xl tracking-tight">{bannerTitle}</p>
                    )}
                    {bannerSubtitle && (
                      <p className="mt-1 text-xs text-white/85">{bannerSubtitle}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length > 1 && (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-3.5 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-[18px] bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
          <span className="absolute bottom-3.5 right-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white">
            {index + 1}/{images.length}
          </span>
        </>
      )}
    </div>
  );
}
