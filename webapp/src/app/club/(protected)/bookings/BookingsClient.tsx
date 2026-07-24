"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BookingRow from "@/components/club/BookingRow";
import RefreshButton from "@/components/club/RefreshButton";
import { BookingStatus, ClubBooking } from "@/lib/types";
import { buttonClass } from "@/lib/ui";

type TabKey = BookingStatus | "all" | "change_requested";
type TypeTabKey = "all" | "enrollment" | "trial";

const TABS: { key: TabKey; label: string }[] = [
  { key: "requested", label: "승인 대기" },
  { key: "confirmed", label: "확정" },
  { key: "completed", label: "완료" },
  { key: "cancelled", label: "취소" },
  { key: "change_requested", label: "변경 요청" },
  { key: "all", label: "전체" },
];

const TYPE_TABS: { key: TypeTabKey; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "enrollment", label: "정기" },
  { key: "trial", label: "원데이" },
];

function BookingsClientInner({ bookings }: { bookings: ClubBooking[] }) {
  const params = useSearchParams();
  const initialStatus = (params.get("status") as TabKey | null) ?? "requested";
  const classId = params.get("classId");

  const [tab, setTab] = useState<TabKey>(initialStatus);
  const [typeTab, setTypeTab] = useState<TypeTabKey>("all");

  const className = useMemo(
    () => (classId ? bookings.find((b) => b.classId === classId)?.className : undefined),
    [bookings, classId]
  );

  const filtered = bookings
    .filter((b) => !classId || b.classId === classId)
    .filter((b) => {
      if (tab === "all") return true;
      if (tab === "change_requested") return !!b.changeRequestedAt;
      return b.status === tab;
    })
    .filter((b) => typeTab === "all" || b.bookingType === typeTab);

  return (
    <>
      <div className="flex items-center justify-between gap-2">
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
        <RefreshButton />
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {TYPE_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTypeTab(t.key)}
            className={`h-8 flex-shrink-0 rounded-md px-3 text-xs font-bold transition ${
              typeTab === t.key ? "bg-rink text-white" : "bg-rink-soft text-rink-deep"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {classId && (
        <div className="mt-3 flex items-center justify-between rounded-md border border-line bg-surface-2 px-3 py-2">
          <p className="text-xs font-bold text-muted">
            {className ?? "선택한 클래스"} 예약만 보는 중
          </p>
          <Link href="/club/bookings" className="text-xs font-bold text-rink-deep">
            필터 해제 ✕
          </Link>
        </div>
      )}

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

export default function BookingsClient({ bookings }: { bookings: ClubBooking[] }) {
  return (
    <Suspense fallback={null}>
      <BookingsClientInner bookings={bookings} />
    </Suspense>
  );
}
