"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { ClubBooking } from "@/lib/types";
import { buttonClass, cardClass } from "@/lib/ui";

export default function BookingRow({ booking }: { booking: ClubBooking }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function updateStatus(
    status: "confirmed" | "cancelled" | "completed"
  ) {
    setSubmitting(true);
    setErrorMsg("");

    const res = await fetch(`/api/bookings/${booking.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    setSubmitting(false);
    if (!res.ok) {
      setErrorMsg("처리에 실패했어요. 다시 시도해주세요.");
      return;
    }
    router.refresh();
  }

  return (
    <div className={cardClass()}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="break-words font-bold">{booking.className}</p>
          <p className="mt-0.5 text-xs text-muted">
            {booking.childName} ({booking.childAge}세{booking.gender ? `, ${booking.gender === "male" ? "남" : "여"}` : ""})
          </p>
          <p className="mt-1 text-xs text-muted">{booking.scheduleLabel}</p>
          {(booking.heightCm || booking.shoeSizeMm) && (
            <p className="mt-1 text-xs text-muted">
              {booking.heightCm && `키 ${booking.heightCm}cm`}
              {booking.heightCm && booking.shoeSizeMm && " · "}
              {booking.shoeSizeMm && `발사이즈 ${booking.shoeSizeMm}mm`}
            </p>
          )}
          {booking.residence && (
            <p className="mt-1 text-xs text-muted">거주지 {booking.residence}</p>
          )}
          {booking.contactPhone && (
            <p className="mt-1 text-xs text-muted">연락처 {booking.contactPhone}</p>
          )}
          <p className="mt-1 text-[11px] text-muted">
            신청일 {new Date(booking.requestedAt).toLocaleDateString("ko-KR")}
          </p>
        </div>
        <div className="shrink-0">
          <StatusBadge status={booking.status} />
        </div>
      </div>

      {errorMsg && <p className="mt-2 text-xs text-negative">{errorMsg}</p>}

      {booking.status === "requested" && (
        <div className="mt-3 flex gap-2">
          <button
            disabled={submitting}
            onClick={() => updateStatus("confirmed")}
            className={buttonClass({
              variant: "custom",
              size: "sm",
              full: false,
              className: "flex-1 bg-rink text-white",
            })}
          >
            승인
          </button>
          <button
            disabled={submitting}
            onClick={() => updateStatus("cancelled")}
            className={buttonClass({ variant: "outline", size: "sm", full: false, className: "flex-1" })}
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
            className={buttonClass({
              variant: "custom",
              size: "sm",
              full: false,
              className: "flex-1 bg-good text-white",
            })}
          >
            완료 처리
          </button>
          <button
            disabled={submitting}
            onClick={() => updateStatus("cancelled")}
            className={buttonClass({ variant: "outline", size: "sm", full: false, className: "flex-1" })}
          >
            취소
          </button>
        </div>
      )}
    </div>
  );
}
