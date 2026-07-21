"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "홈" },
  { href: "/search", label: "검색" },
  { href: "/mypage", label: "예약" },
  { href: "/mypage", label: "마이" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="shadow-elevated fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {ITEMS.map((item, i) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label + i}
              href={item.href}
              prefetch={false}
              className={`btn-label flex-1 py-3 text-center text-xs font-bold transition ${
                active ? "text-rink" : "text-muted"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
