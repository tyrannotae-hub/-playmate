"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { buttonClass } from "@/lib/ui";

const ITEMS = [
  { href: "/club/dashboard", label: "대시보드" },
  { href: "/club/home", label: "홈 꾸미기" },
  { href: "/club/instructors", label: "코치 관리" },
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
    <header className="shadow-card sticky top-0 z-20 border-b border-line bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3.5">
        <div>
          <p className="btn-label text-xs font-bold text-muted">클럽 관리</p>
          <p className="text-base font-extrabold">{facilityName}</p>
        </div>
        <nav className="flex items-center gap-1.5">
          {ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={buttonClass({
                  variant: active ? "secondary" : "outline",
                  size: "sm",
                  full: false,
                })}
              >
                {item.label}
              </Link>
            );
          })}
          <button onClick={logout} className={buttonClass({ variant: "outline", size: "sm", full: false })}>
            로그아웃
          </button>
        </nav>
      </div>
    </header>
  );
}
