"use client";

import Image from "next/image";
import SportIcon from "@/components/icons/SportIcon";

export default function ClassGallery({
  images,
  sportId,
  bannerTitle,
  bannerSubtitle,
}: {
  images: string[];
  sportId: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
}) {
  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center bg-rink-soft text-rink-deep">
        <SportIcon sportId={sportId} size={56} />
      </div>
    );
  }

  return (
    <div className="flex aspect-square w-full snap-x snap-mandatory overflow-x-auto">
      {images.map((url, i) => (
        <div key={i} className="relative h-full w-full flex-shrink-0 snap-center">
          <Image src={url} alt="" fill sizes="100vw" className="object-cover" />
          {/* 배너 문구는 첫 장에서만 노출(스크롤로 넘어가면 사라짐) */}
          {i === 0 && (bannerTitle || bannerSubtitle) && (
            <>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-6 px-5 text-white">
                {bannerTitle && <p className="text-xl font-extrabold tracking-tight">{bannerTitle}</p>}
                {bannerSubtitle && <p className="mt-1 text-xs text-white/85">{bannerSubtitle}</p>}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
