"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !active) return;

      const { count: unread } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .is("read_at", null);

      if (active) setCount(unread ?? 0);
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <Link
      href="/notifications"
      aria-label={count > 0 ? `알림 (안읽음 ${count}개)` : "알림"}
      className="relative -mr-1.5 ml-auto flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition hover:bg-line/50"
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
        <path d="M4.5 8a5.5 5.5 0 0 1 11 0c0 3 .8 4.2 1.5 5H3c.7-.8 1.5-2 1.5-5Z" />
        <path d="M8.3 15.5a1.9 1.9 0 0 0 3.4 0" />
      </svg>
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-negative px-1 text-[9px] font-bold leading-none text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
