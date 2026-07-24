"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Booking } from "@/lib/types";
import { buttonClass } from "@/lib/ui";
import {
  formatIsoDateToKoreanShort,
  upcomingDatesForDayLabel,
} from "@/lib/schedule-dates";

// 로컬 자정 기준 Date를 "YYYY-MM-DD"로. toISOString()은 UTC 변환 중 하루 밀릴 수 있음.
function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

type ScheduleOption = { id: string; label: string };

// 예약 변경 요청. bookings 테이블에는 학부모용 UPDATE RLS가 없어서(club-owners.sql 참고)
// request_booking_change()/cancel_booking_change() security definer RPC를 통해서만 처리한다.
export default function ChangeBookingButton({ booking }: { booking: Booking }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [scheduleOptions, setScheduleOptions] = useState<ScheduleOption[]>([]);
  const [trialDateOptions, setTrialDateOptions] = useState<string[]>([]);
  const [scheduleId, setScheduleId] = useState("");
  const [trialDate, setTrialDate] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      const supabase = createClient();

      if (booking.bookingType === "trial") {
        // 원데이 체험은 이제 특정 시간대(schedule)에 딸린 속성이라, 그 schedule의
        // 요일(day_label)로 반복 날짜를 계산하고, 클래스 전체 휴무(class_schedule_id
        // null)와 이 시간대만의 휴무(class_schedule_id=이 스케줄)를 모두 제외한다
        // (BookingForm.tsx의 최초 예약 시 계산 로직과 동일하게 맞춤).
        const [{ data: scheduleRow }, { data: holidayRows }] = await Promise.all([
          supabase
            .from("class_schedules")
            .select("day_label")
            .eq("id", booking.scheduleId)
            .maybeSingle(),
          supabase
            .from("class_holidays")
            .select("holiday_date")
            .eq("team_class_id", booking.classId)
            .or(`class_schedule_id.is.null,class_schedule_id.eq.${booking.scheduleId}`),
        ]);
        if (cancelled) return;
        const todayIso = toIsoDate(new Date());
        const holidaySet = new Set((holidayRows ?? []).map((h) => h.holiday_date as string));
        const dates = scheduleRow?.day_label
          ? upcomingDatesForDayLabel(scheduleRow.day_label).map(toIsoDate)
          : [];
        setTrialDateOptions(
          dates.filter((d) => d >= todayIso && !holidaySet.has(d)).sort()
        );
      } else {
        const { data } = await supabase
          .from("class_schedules")
          .select("id, day_label, time_label")
          .eq("team_class_id", booking.classId);
        if (cancelled) return;
        setScheduleOptions(
          (data ?? []).map((s) => ({
            id: s.id,
            label: `${s.day_label} ${s.time_label}`,
          }))
        );
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [open, booking.classId, booking.bookingType, booking.scheduleId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    const supabase = createClient();
    const { data, error } = await supabase.rpc("request_booking_change", {
      p_booking_id: booking.id,
      p_schedule_id: booking.bookingType === "enrollment" ? scheduleId || null : null,
      p_trial_date: booking.bookingType === "trial" ? trialDate || null : null,
      p_note: note.trim() || null,
    });

    setSubmitting(false);
    if (error) {
      setErrorMsg("변경 요청에 실패했어요. 다시 시도해주세요.");
      return;
    }
    if (data === "applied") {
      window.alert("변경이 바로 반영됐어요.");
    } else {
      window.alert("변경 요청을 보냈어요. 클럽에서 승인하면 반영돼요.");
    }
    setOpen(false);
    router.refresh();
  }

  async function cancelChangeRequest() {
    setSubmitting(true);
    const supabase = createClient();
    await supabase.rpc("cancel_booking_change", { p_booking_id: booking.id });
    setSubmitting(false);
    router.refresh();
  }

  if (booking.changeRequestedAt) {
    return (
      <div className="mt-3 rounded-md border border-energy bg-energy-soft px-3 py-2.5">
        <p className="text-xs font-bold text-[color:var(--foreground)]">
          변경 요청 중
          {booking.requestedScheduleLabel && ` · ${booking.requestedScheduleLabel}`}
          {booking.requestedTrialDate &&
            ` · 체험 ${formatIsoDateToKoreanShort(booking.requestedTrialDate)}`}
        </p>
        <p className="mt-1 text-xs text-muted">시설에서 승인하면 바로 반영돼요.</p>
        <button
          type="button"
          disabled={submitting}
          onClick={cancelChangeRequest}
          className={buttonClass({ variant: "outline", size: "sm", full: false, className: "mt-2" })}
        >
          요청 취소
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={buttonClass({ variant: "outline", size: "sm", full: false })}
        >
          일정 변경 요청
        </button>
      ) : (
        <form onSubmit={submit} className="rounded-md border border-line px-3 py-3">
          {loading ? (
            <p className="text-xs text-muted">불러오는 중...</p>
          ) : booking.bookingType === "trial" ? (
            trialDateOptions.length > 0 ? (
              <div>
                <label className="mb-1.5 block text-xs font-bold text-muted">
                  변경할 체험 날짜
                </label>
                <select
                  required
                  value={trialDate}
                  onChange={(e) => setTrialDate(e.target.value)}
                  className="w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm"
                >
                  <option value="">날짜를 선택해주세요</option>
                  {trialDateOptions
                    .filter((d) => d !== booking.trialDate)
                    .map((d) => (
                      <option key={d} value={d}>
                        {formatIsoDateToKoreanShort(d)}
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <p className="text-xs text-muted">선택 가능한 다른 체험 날짜가 없어요.</p>
            )
          ) : scheduleOptions.length > 0 ? (
            <div>
              <label className="mb-1.5 block text-xs font-bold text-muted">변경할 시간대</label>
              <select
                required
                value={scheduleId}
                onChange={(e) => setScheduleId(e.target.value)}
                className="w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm"
              >
                <option value="">시간대를 선택해주세요</option>
                {scheduleOptions
                  .filter((s) => s.id !== booking.scheduleId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
              </select>
            </div>
          ) : (
            <p className="text-xs text-muted">선택 가능한 다른 시간대가 없어요.</p>
          )}

          <div className="mt-2.5">
            <label className="mb-1.5 block text-xs font-bold text-muted">
              사유 <span className="font-normal">(선택)</span>
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="예: 아이 학원 시간이 바뀌었어요"
              className="w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm"
            />
          </div>

          {errorMsg && <p className="mt-2 text-xs text-negative">{errorMsg}</p>}

          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={
                submitting ||
                loading ||
                (booking.bookingType === "trial" ? !trialDate : !scheduleId)
              }
              className={buttonClass({
                variant: "custom",
                size: "sm",
                full: false,
                className: "flex-1 bg-rink text-white",
              })}
            >
              {submitting ? "요청 중..." : "변경 요청 보내기"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={buttonClass({ variant: "outline", size: "sm", full: false, className: "px-4" })}
            >
              취소
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
