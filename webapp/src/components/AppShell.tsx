"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isClub = pathname?.startsWith("/club") ?? false;

  return (
    <>
      <div className={`mx-auto w-full flex-1 ${isClub ? "max-w-3xl pb-10" : "max-w-md pb-20"}`}>
        {children}
      </div>
      {!isClub && <BottomNav />}
    </>
  );
}
