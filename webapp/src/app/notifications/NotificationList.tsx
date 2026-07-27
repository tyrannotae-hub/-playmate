"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buttonClass, cardClass } from "@/lib/ui";
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

// 알림 종류별로 눌렀을 때 이동할 곳. 완료 알림만 리뷰 작성으로 바로 연결하고,
// 나머지는 예약 내역에서 확인하는 게 자연스러워서 그쪽으로 보낸다.
function targetHref(n: AppNotification): string {
  if (n.type === "booking_completed" && n.bookingId) return `/review/${n.bookingId}`;
  return "/mypage/bookings";
}

export default function NotificationList({ initial }: { initial: AppNotification[] }) {
  const [items, setItems] = useState(initial);
  const router = useRouter();

  async function markRead(n: AppNotification) {
    if (n.read) return;
    setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read: true } : i)));
    const supabase = createClient();
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", n.id);
  }

  async function handleRowClick(n: AppNotification) {
    await markRead(n);
    router.push(targetHref(n));
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
        <div
          key={n.id}
          role="button"
          tabIndex={0}
          onClick={() => handleRowClick(n)}
          onKeyDown={(e) => e.key === "Enter" && handleRowClick(n)}
          className={cardClass(
            `w-full cursor-pointer text-left transition ${n.read ? "opacity-60" : "border-rink"}`
          )}
        >
          <div className="flex items-start gap-2.5">
            <span className="text-lg leading-none">{TYPE_ICON[n.type] ?? "🔔"}</span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm ${n.read ? "font-medium" : "font-bold"}`}>{n.message}</p>
              <p className="mt-1 text-xs text-muted">{formatRelative(n.createdAt)}</p>
              {n.type === "booking_completed" && n.bookingId && (
                <Link
                  href={`/review/${n.bookingId}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    markRead(n);
                  }}
                  className={buttonClass({
                    variant: "custom",
                    size: "sm",
                    full: false,
                    className: "mt-2 bg-rink text-white",
                  })}
                >
                  리뷰 쓰기
                </Link>
              )}
            </div>
            {!n.read && (
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-energy" aria-hidden />
            )}
          </div>
        </div>
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
