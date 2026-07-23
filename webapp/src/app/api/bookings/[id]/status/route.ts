import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToParent } from "@/lib/push";

const NOTIFICATION_TYPE: Record<string, string> = {
  confirmed: "booking_confirmed",
  cancelled: "booking_cancelled",
  completed: "booking_completed",
};

function notificationMessage(status: string, className: string): string {
  switch (status) {
    case "confirmed":
      return `${className} 예약이 확정됐어요`;
    case "cancelled":
      return `${className} 예약이 취소됐어요`;
    case "completed":
      return `${className} 수업이 완료됐어요, 후기를 남겨보세요`;
    default:
      return `${className} 예약 상태가 변경됐어요`;
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = await request.json();

  if (!["confirmed", "cancelled", "completed"].includes(status)) {
    return NextResponse.json({ error: "INVALID_STATUS" }, { status: 400 });
  }

  const supabase = await createClient();

  const patch: Record<string, unknown> = { status };
  if (status === "confirmed") patch.confirmed_at = new Date().toISOString();
  if (status === "cancelled") patch.cancelled_at = new Date().toISOString();

  const { error } = await supabase.from("bookings").update(patch).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select("parent_id, team_class:teams_classes(name)")
    .eq("id", id)
    .maybeSingle();

  const teamClass = booking?.team_class as unknown as { name: string } | null;

  if (booking?.parent_id) {
    const notificationType = NOTIFICATION_TYPE[status];
    if (notificationType) {
      const message = notificationMessage(status, teamClass?.name ?? "클래스");

      await supabase.from("notifications").insert({
        parent_id: booking.parent_id,
        booking_id: id,
        type: notificationType,
        message,
      });
      // 알림 생성 실패는 예약 상태 처리 자체를 막지 않음 (에러는 무시)

      await sendPushToParent(booking.parent_id, {
        title: "PlayMate",
        body: message,
        url: "/mypage",
      }).catch(() => {
        // 푸시 발송 실패(구독 없음/만료 등)도 예약 상태 처리를 막지 않음
      });
    }
  }

  return NextResponse.json({ ok: true });
}
