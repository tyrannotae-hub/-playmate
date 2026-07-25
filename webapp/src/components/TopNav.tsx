"use client";

import Link from "next/link";
import { useState } from "react";
import CategoryDrawer from "./CategoryDrawer";
import NotificationBell from "./NotificationBell";

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
          <div className="-mr-1.5 ml-auto flex items-center">
            <NotificationBell />
            <Link
              href="/mypage"
              aria-label="마이페이지"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition hover:bg-line/50"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="10" cy="6.5" r="3" />
                <path d="M4 17c1-3.2 3.4-4.8 6-4.8s5 1.6 6 4.8" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <CategoryDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
