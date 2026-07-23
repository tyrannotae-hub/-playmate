"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/club/dashboard", label: "대시보드" },
  { href: "/club/home", label: "홈 꾸미기" },
  { href: "/club/instructors", label: "코치 관리" },
  { href: "/club/classes", label: "클래스 관리" },
  { href: "/club/bookings", label: "예약 관리" },
  { href: "/club/settings", label: "계정 설정" },
];

export default function ClubMenuDrawer({
  open,
  onClose,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col bg-surface shadow-elevated transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
          <p className="text-base font-bold">클래스관리센터</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center rounded-full text-lg transition hover:bg-line/50"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <div className="flex flex-col">
            {ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`btn-label rounded-md px-3 py-2.5 text-sm font-bold transition ${
                    active
                      ? "bg-rink-soft text-rink-deep"
                      : "text-foreground hover:bg-rink-soft"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-line px-2 py-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="btn-label block w-full rounded-md px-3 py-2.5 text-left text-sm font-bold text-muted transition hover:bg-rink-soft"
          >
            로그아웃
          </button>
        </div>
      </aside>
    </>
  );
}
