"use client";

import { useState } from "react";
import BookingRow from "@/components/club/BookingRow";
import { BookingStatus, ClubBooking } from "@/lib/types";

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
            className={`rounded-full px-3.5 py-2 text-xs font-bold ${
              tab === t.key ? "bg-foreground text-background" : "border border-line text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
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
