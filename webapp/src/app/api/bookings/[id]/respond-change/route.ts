import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToParent } from "@/lib/push";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { approve } = await request.json();

  if (typeof approve !== "boolean") {
    return NextResponse.json({ error: "INVALID_APPROVE" }, { status: 400 });
  }

  const supabase = await createClient();

  // 변경 요청 정보는 RPC가 처리하며 지워버리므로, 알림 메시지에 쓸 정보는 먼저 읽어둔다.
  const { data: before } = await supabase
    .from("bookings")
    .select(
      "parent_id, requested_trial_date, team_class:teams_classes(name), requested_schedule:class_schedules!bookings_requested_schedule_id_fkey(day_label, time_label)"
    )
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.rpc("respond_booking_change", {
    p_booking_id: id,
    p_approve: approve,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const teamClass = before?.team_class as unknown as { name: string } | null;
  const requestedSchedule = before?.requested_schedule as unknown as {
    day_label: string;
    time_label: string;
  } | null;
  const className = teamClass?.name ?? "클래스";

  if (before?.parent_id) {
    const changeDetail = requestedSchedule
      ? `${requestedSchedule.day_label} ${requestedSchedule.time_label}`
      : before.requested_trial_date
        ? `체험 ${before.requested_trial_date}`
        : "";

    const message = approve
      ? `${className} 예약 변경 요청이 승인됐어요${changeDetail ? ` (${changeDetail})` : ""}`
      : `${className} 예약 변경 요청이 거절됐어요`;

    await supabase.from("notifications").insert({
      parent_id: before.parent_id,
      booking_id: id,
      type: approve ? "booking_change_approved" : "booking_change_rejected",
      message,
    });
    // 알림 생성 실패는 변경 승인/거절 처리 자체를 막지 않음 (에러는 무시)

    await sendPushToParent(before.parent_id, {
      title: "PlayMate",
      body: message,
      url: "/mypage",
    }).catch(() => {
      // 푸시 발송 실패(구독 없음/만료 등)도 처리를 막지 않음
    });
  }

  return NextResponse.json({ ok: true });
}
