"use client";

import Link from "next/link";
import { useState } from "react";
import CategoryDrawer from "./CategoryDrawer";
import NotificationBell from "./NotificationBell";
import PlayMateLogo from "./PlayMateLogo";

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
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur">
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
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <rect x="2" y="4" width="16" height="2.6" rx="1.3" />
                <rect x="2" y="8.7" width="16" height="2.6" rx="1.3" />
                <rect x="2" y="13.4" width="16" height="2.6" rx="1.3" />
              </svg>
            </button>
          )}
          {title ? (
            <h1 className="text-base font-bold">{title}</h1>
          ) : (
            <Link href="/" aria-label="PlayMate 홈">
              <PlayMateLogo />
            </Link>
          )}
          <div className="-mr-1.5 ml-auto flex items-center">
            <Link
              href="/search"
              aria-label="검색"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition hover:bg-line/50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.47 6.47 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z" />
              </svg>
            </Link>
            <NotificationBell />
          </div>
        </div>
      </header>

      <CategoryDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
