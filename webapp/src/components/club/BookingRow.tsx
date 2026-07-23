"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { ClubBooking } from "@/lib/types";
import { buttonClass, cardClass } from "@/lib/ui";
import { formatIsoDateToKoreanShort } from "@/lib/schedule-dates";
import { createClient } from "@/lib/supabase/client";

export default function BookingRow({
  booking,
  linkToDetail = true,
}: {
  booking: ClubBooking;
  /** 상세페이지 자체에서 이 컴포넌트를 재사용할 때는 "상세보기" 링크를 숨김 */
  linkToDetail?: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [changeSubmitting, setChangeSubmitting] = useState(false);
  const [changeErrorMsg, setChangeErrorMsg] = useState("");

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

  async function respondToChange(approve: boolean) {
    setChangeSubmitting(true);
    setChangeErrorMsg("");

    const supabase = createClient();
    const { error } = await supabase.rpc("respond_booking_change", {
      p_booking_id: booking.id,
      p_approve: approve,
    });

    setChangeSubmitting(false);
    if (error) {
      setChangeErrorMsg(
        error.message === "FULL"
          ? "요청한 시간대의 정원이 마감됐어요."
          : "처리에 실패했어요. 다시 시도해주세요."
      );
      return;
    }
    router.refresh();
  }

  return (
    <div className={cardClass()}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="break-words font-bold">{booking.className}</p>
            <span
              className={`btn-label inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                booking.bookingType === "trial"
                  ? "bg-energy-soft text-[color:var(--foreground)]"
                  : "border border-line text-muted"
              }`}
            >
              {booking.bookingType === "trial"
                ? `체험${booking.trialDate ? ` · ${formatIsoDateToKoreanShort(booking.trialDate)}` : ""}`
                : "정기 등록"}
            </span>
          </div>
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
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <StatusBadge status={booking.status} />
          {linkToDetail && (
            <Link href={`/club/bookings/${booking.id}`} className="text-[11px] font-bold text-rink-deep">
              상세보기 →
            </Link>
          )}
        </div>
      </div>

      {booking.changeRequestedAt && (
        <div className="mt-3 rounded-md border border-energy bg-energy-soft px-3 py-2.5">
          <p className="text-xs font-bold text-[color:var(--foreground)]">
            변경 요청됨
            {booking.requestedScheduleLabel && ` · ${booking.requestedScheduleLabel}`}
            {booking.requestedTrialDate &&
              ` · 체험 ${formatIsoDateToKoreanShort(booking.requestedTrialDate)}`}
          </p>
          {booking.changeNote && (
            <p className="mt-1 text-xs text-muted">사유: {booking.changeNote}</p>
          )}
          {changeErrorMsg && <p className="mt-1.5 text-xs text-negative">{changeErrorMsg}</p>}
          <div className="mt-2 flex gap-2">
            <button
              disabled={changeSubmitting}
              onClick={() => respondToChange(true)}
              className={buttonClass({
                variant: "custom",
                size: "sm",
                full: false,
                className: "flex-1 bg-rink text-white",
              })}
            >
              변경 승인
            </button>
            <button
              disabled={changeSubmitting}
              onClick={() => respondToChange(false)}
              className={buttonClass({ variant: "outline", size: "sm", full: false, className: "flex-1" })}
            >
              변경 거절
            </button>
          </div>
        </div>
      )}

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
