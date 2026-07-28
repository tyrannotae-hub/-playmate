"use client";

import { useState } from "react";
import Image from "next/image";
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
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <rect x="2" y="4" width="16" height="2.6" rx="1.3" />
              <rect x="2" y="8.7" width="16" height="2.6" rx="1.3" />
              <rect x="2" y="13.4" width="16" height="2.6" rx="1.3" />
            </svg>
          </button>
          <Image
            src="/icon.png"
            alt="PlayMate"
            width={28}
            height={28}
            className="shrink-0 rounded-sm"
          />
          <div className="min-w-0">
            <p className="btn-label text-xs font-bold text-muted">클럽 관리센터</p>
            <p className="truncate text-base font-extrabold">{facilityName}</p>
          </div>
        </div>
      </header>

      <ClubMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} onLogout={logout} />
    </>
  );
}
