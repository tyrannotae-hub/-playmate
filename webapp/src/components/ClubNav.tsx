"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ClubMenuDrawer from "./ClubMenuDrawer";

export default function ClubNav({
  facilityName,
}: {
  facilityName: string;
  ownerType?: "club" | "solo_coach";
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/club/login");
    router.refresh();
  }

  return (
    <>
      <header className="shadow-card sticky top-0 z-20 border-b border-line bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3.5">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="메뉴 열기"
            className="-ml-1.5 flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-line/50"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 5h14" />
              <path d="M3 10h14" />
              <path d="M3 15h14" />
            </svg>
          </button>
          <div>
            <p className="btn-label text-xs font-bold text-muted">클래스관리센터</p>
            <p className="text-base font-extrabold">{facilityName}</p>
          </div>
        </div>
      </header>

      <ClubMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} onLogout={logout} />
    </>
  );
}
