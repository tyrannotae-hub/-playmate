import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const STATUS_LABEL: Record<string, string> = {
  confirmed: "확정",
  cancelled: "취소",
  completed: "완료",
};

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
    .select(
      "notify_email, team_class:teams_classes(name, facility:facilities(name)), class_schedule:class_schedules(day_label, time_label)"
    )
    .eq("id", id)
    .maybeSingle();

  const notifyEmail = booking?.notify_email as string | null | undefined;

  if (notifyEmail && process.env.RESEND_API_KEY) {
    const teamClass = booking?.team_class as unknown as {
      name: string;
      facility: { name: string } | null;
    } | null;
    const schedule = booking?.class_schedule as unknown as {
      day_label: string;
      time_label: string;
    } | null;

    await sendStatusEmail({
      to: notifyEmail,
      className: teamClass?.name ?? "클래스",
      facilityName: teamClass?.facility?.name ?? "",
      scheduleLabel: schedule ? `${schedule.day_label} ${schedule.time_label}` : "",
      status,
    }).catch(() => {
      // 이메일 발송 실패는 예약 상태 처리 자체를 막지 않음 (로그만 남기고 무시)
    });
  }

  return NextResponse.json({ ok: true });
}

async function sendStatusEmail({
  to,
  className,
  facilityName,
  scheduleLabel,
  status,
}: {
  to: string;
  className: string;
  facilityName: string;
  scheduleLabel: string;
  status: string;
}) {
  const label = STATUS_LABEL[status] ?? status;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "PlayMate <onboarding@resend.dev>",
      to,
      subject: `[PlayMate] ${className} 예약이 ${label}됐어요`,
      text: `${facilityName} · ${className}\n${scheduleLabel}\n\n예약 상태가 "${label}"(으)로 변경됐어요. 마이페이지에서 자세한 내용을 확인하세요.`,
    }),
  });
}
