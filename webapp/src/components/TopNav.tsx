"use client";

import Link from "next/link";

export default function TopNav({
  title,
  back,
}: {
  title?: string;
  back?: boolean;
}) {
  return (
    <header className="shadow-card sticky top-0 z-20 border-b border-line bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3.5">
        {back && (
          <button
            type="button"
            onClick={() => history.back()}
            aria-label="뒤로"
            className="-ml-1.5 flex h-8 w-8 items-center justify-center rounded-full text-lg transition hover:bg-line/50"
          >
            ←
          </button>
        )}
        {title ? (
          <h1 className="text-base font-bold">{title}</h1>
        ) : (
          <Link href="/" className="text-lg font-extrabold tracking-tight">
            PlayMate<span className="text-energy">.</span>
          </Link>
        )}
      </div>
    </header>
  );
}
