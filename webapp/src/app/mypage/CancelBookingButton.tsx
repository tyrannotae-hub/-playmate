"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Booking } from "@/lib/types";
import { buttonClass } from "@/lib/ui";

// requested 예약은 클럽 승인 없이 바로 취소(이력 없이 삭제)되고, confirmed 예약은
// 클럽이 승인해야 최종 취소되는 요청으로 전환된다 — cancel_booking() RPC가 상태에 따라
// 분기해서 처리하고 어떤 처리를 했는지('deleted'|'requested') 반환한다.
// bookings 테이블 UPDATE/DELETE는 club owner RLS만 있어 학부모는 직접 할 수 없으므로
// RPC를 통해서만 취소한다.
export default function CancelBookingButton({ booking }: { booking: Booking }) {
  const [pending, setPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  async function cancel() {
    if (!window.confirm("예약을 취소할까요?")) return;
    const reason = window.prompt("취소 사유가 있다면 입력해주세요 (선택 사항)");

    setPending(true);
    setErrorMsg("");

    const supabase = createClient();
    const { data, error } = await supabase.rpc("cancel_booking", {
      p_booking_id: booking.id,
      p_reason: reason?.trim() ? reason.trim() : null,
    });

    setPending(false);
    if (error) {
      setErrorMsg("취소에 실패했어요. 다시 시도해주세요.");
      return;
    }
    if (data === "requested") {
      window.alert("취소 요청을 보냈어요. 클럽에서 승인하면 최종 취소돼요.");
    }
    router.refresh();
  }

  async function cancelCancelRequest() {
    setPending(true);
    const supabase = createClient();
    await supabase.rpc("cancel_cancel_request", { p_booking_id: booking.id });
    setPending(false);
    router.refresh();
  }

  if (booking.cancelRequestedAt) {
    return (
      <div className="mt-3 rounded-md border border-negative bg-negative/5 px-3 py-2.5">
        <p className="text-xs font-bold text-negative">취소 요청 중</p>
        <p className="mt-1 text-xs text-muted">클럽에서 승인하면 최종 취소돼요.</p>
        <button
          type="button"
          disabled={pending}
          onClick={cancelCancelRequest}
          className={buttonClass({ variant: "outline", size: "sm", full: false, className: "mt-2" })}
        >
          요청 취소
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={cancel}
        disabled={pending}
        className={buttonClass({
          variant: "outline",
          size: "sm",
          full: false,
          className: "text-negative",
        })}
      >
        {pending ? "취소 중..." : "예약 취소"}
      </button>
      {errorMsg && <p className="mt-1.5 text-xs text-negative">{errorMsg}</p>}
    </div>
  );
}
