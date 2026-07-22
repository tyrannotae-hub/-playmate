"use client";

import Link from "next/link";
import { useState } from "react";
import CategoryDrawer from "./CategoryDrawer";

export default function TopNav({
  title,
  back,
}: {
  title?: string;
  back?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="shadow-card sticky top-0 z-20 border-b border-line bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3.5">
          {back ? (
            <button
              type="button"
              onClick={() => history.back()}
              aria-label="뒤로"
              className="-ml-1.5 flex h-8 w-8 items-center justify-center rounded-full text-lg transition hover:bg-line/50"
            >
              ←
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="종목별 카테고리 열기"
              className="-ml-1.5 flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-line/50"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 5h14" />
                <path d="M3 10h14" />
                <path d="M3 15h14" />
              </svg>
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

      <CategoryDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
