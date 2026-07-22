"use client";

import { useState } from "react";
import BookingRow from "@/components/club/BookingRow";
import { BookingStatus, ClubBooking } from "@/lib/types";
import { buttonClass } from "@/lib/ui";

const TABS: { key: BookingStatus | "all"; label: string }[] = [
  { key: "requested", label: "승인 대기" },
  { key: "confirmed", label: "확정" },
  { key: "completed", label: "완료" },
  { key: "cancelled", label: "취소" },
  { key: "all", label: "전체" },
];

export default function BookingsClient({ bookings }: { bookings: ClubBooking[] }) {
  const [tab, setTab] = useState<BookingStatus | "all">("requested");
  const filtered = tab === "all" ? bookings : bookings.filter((b) => b.status === tab);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={buttonClass({
              variant: tab === t.key ? "secondary" : "outline",
              size: "sm",
              full: false,
            })}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {filtered.map((b) => (
          <BookingRow key={b.id} booking={b} />
        ))}
        {filtered.length === 0 && (
          <p className="py-4 text-sm text-muted">해당하는 예약이 없어요.</p>
        )}
      </div>
    </>
  );
}
