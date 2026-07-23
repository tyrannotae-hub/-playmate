"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { buttonClass } from "@/lib/ui";

// requested/confirmed 예약 취소. bookings 테이블 UPDATE는 club owner RLS 정책만 있어
// 학부모는 직접 update 할 수 없으므로 cancel_booking() security definer RPC를 통해서만 취소한다.
export default function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [pending, setPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  async function cancel() {
    if (!window.confirm("예약을 취소할까요?")) return;
    const reason = window.prompt("취소 사유가 있다면 입력해주세요 (선택 사항)");

    setPending(true);
    setErrorMsg("");

    const supabase = createClient();
    const { error } = await supabase.rpc("cancel_booking", {
      p_booking_id: bookingId,
      p_reason: reason?.trim() ? reason.trim() : null,
    });

    setPending(false);
    if (error) {
      setErrorMsg("취소에 실패했어요. 다시 시도해주세요.");
      return;
    }
    router.refresh();
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
