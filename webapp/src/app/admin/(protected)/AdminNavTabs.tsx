"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "가입 신청" },
  { href: "/admin/sports", label: "종목 관리" },
];

export default function AdminNavTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1.5 border-b border-line px-4">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`btn-label -mb-px border-b-2 px-2 py-2.5 text-sm font-bold transition ${
              active ? "border-rink text-rink-deep" : "border-transparent text-muted"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
