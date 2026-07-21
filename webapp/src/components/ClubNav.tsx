"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ITEMS = [
  { href: "/club/dashboard", label: "대시보드" },
  { href: "/club/classes", label: "클래스 관리" },
  { href: "/club/bookings", label: "예약 관리" },
];

export default function ClubNav({ facilityName }: { facilityName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/club/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3.5">
        <div>
          <p className="text-xs font-bold text-muted">클럽 관리</p>
          <p className="text-base font-extrabold">{facilityName}</p>
        </div>
        <nav className="flex items-center gap-1.5">
          {ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3.5 py-2 text-xs font-bold ${
                  active ? "bg-foreground text-background" : "border border-line text-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={logout}
            className="rounded-full border border-line px-3.5 py-2 text-xs font-bold text-muted"
          >
            로그아웃
          </button>
        </nav>
      </div>
    </header>
  );
}
