"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/StatusBadge";
import { ClubBooking } from "@/lib/types";
import { cardClass } from "@/lib/ui";

export default function BookingRow({ booking }: { booking: ClubBooking }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function updateStatus(
    status: "confirmed" | "cancelled" | "completed"
  ) {
    setSubmitting(true);
    setErrorMsg("");
    const supabase = createClient();

    const patch: Record<string, unknown> = { status };
    if (status === "confirmed") patch.confirmed_at = new Date().toISOString();
    if (status === "cancelled") patch.cancelled_at = new Date().toISOString();

    const { error } = await supabase.from("bookings").update(patch).eq("id", booking.id);

    setSubmitting(false);
    if (error) {
      setErrorMsg("처리에 실패했어요. 다시 시도해주세요.");
      return;
    }
    router.refresh();
  }

  return (
    <div className={cardClass()}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold">{booking.className}</p>
          <p className="mt-0.5 text-xs text-muted">
            {booking.childName} ({booking.childAge}세)
          </p>
          <p className="mt-1 text-xs text-muted">{booking.scheduleLabel}</p>
          <p className="mt-1 text-[11px] text-muted">
            신청일 {new Date(booking.requestedAt).toLocaleDateString("ko-KR")}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {errorMsg && <p className="mt-2 text-xs text-negative">{errorMsg}</p>}

      {booking.status === "requested" && (
        <div className="mt-3 flex gap-2">
          <button
            disabled={submitting}
            onClick={() => updateStatus("confirmed")}
            className="btn-label flex-1 rounded-full bg-rink py-2.5 text-xs font-bold text-white disabled:opacity-40"
          >
            승인
          </button>
          <button
            disabled={submitting}
            onClick={() => updateStatus("cancelled")}
            className="btn-label flex-1 rounded-full border border-line py-2.5 text-xs font-bold text-muted disabled:opacity-40"
          >
            거절
          </button>
        </div>
      )}

      {booking.status === "confirmed" && (
        <div className="mt-3 flex gap-2">
          <button
            disabled={submitting}
            onClick={() => updateStatus("completed")}
            className="btn-label flex-1 rounded-full bg-good py-2.5 text-xs font-bold text-white disabled:opacity-40"
          >
            완료 처리
          </button>
          <button
            disabled={submitting}
            onClick={() => updateStatus("cancelled")}
            className="btn-label flex-1 rounded-full border border-line py-2.5 text-xs font-bold text-muted disabled:opacity-40"
          >
            취소
          </button>
        </div>
      )}
    </div>
  );
}
