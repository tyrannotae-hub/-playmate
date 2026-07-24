"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cardClass } from "@/lib/ui";
import { AppNotification, NotificationType } from "@/lib/types";

const TYPE_ICON: Record<NotificationType, string> = {
  booking_confirmed: "✅",
  booking_cancelled: "🚫",
  booking_completed: "🏅",
  booking_change_approved: "🔄",
  booking_change_rejected: "↩️",
  booking_cancel_approved: "🚫",
  booking_cancel_rejected: "↩️",
};

export default function NotificationList({ initial }: { initial: AppNotification[] }) {
  const [items, setItems] = useState(initial);
  const router = useRouter();

  async function handleClick(n: AppNotification) {
    if (!n.read) {
      setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read: true } : i)));
      const supabase = createClient();
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", n.id);
    }
    router.push("/mypage");
  }

  if (items.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted">
        아직 알림이 없어요. 예약 상태가 바뀌면 여기에서 알려드릴게요.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((n) => (
        <button
          key={n.id}
          type="button"
          onClick={() => handleClick(n)}
          className={cardClass(
            `w-full text-left transition ${n.read ? "opacity-60" : "border-rink"}`
          )}
        >
          <div className="flex items-start gap-2.5">
            <span className="text-lg leading-none">{TYPE_ICON[n.type] ?? "🔔"}</span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm ${n.read ? "font-medium" : "font-bold"}`}>{n.message}</p>
              <p className="mt-1 text-xs text-muted">{formatRelative(n.createdAt)}</p>
            </div>
            {!n.read && (
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-energy" aria-hidden />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
