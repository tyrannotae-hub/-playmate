"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import SportIcon from "@/components/icons/SportIcon";

export default function ClassGallery({
  images,
  sportId,
}: {
  images: string[];
  sportId: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center bg-rink-soft text-rink-deep">
        <SportIcon sportId={sportId} size={56} />
      </div>
    );
  }

  function onScroll() {
    const el = trackRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActive(index);
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex aspect-square w-full snap-x snap-mandatory overflow-x-auto"
      >
        {images.map((url, i) => (
          <div key={i} className="relative h-full w-full flex-shrink-0 snap-center">
            <Image src={url} alt="" fill sizes="100vw" className="object-cover" />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-2.5 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${
                i === active ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
