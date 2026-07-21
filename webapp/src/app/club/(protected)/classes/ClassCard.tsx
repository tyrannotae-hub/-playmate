"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ClubClass, Sport } from "@/lib/types";
import { buttonClass, cardClass } from "@/lib/ui";
import ClassMediaManager from "./ClassMediaManager";

export default function ClassCard({
  item,
  sports,
  facilityId,
}: {
  item: ClubClass;
  sports: Sport[];
  facilityId: string;
}) {
  const router = useRouter();
  const sport = sports.find((s) => s.id === item.sportId);
  const [showMedia, setShowMedia] = useState(false);
  const [addingSchedule, setAddingSchedule] = useState(false);
  const [dayLabel, setDayLabel] = useState("");
  const [timeLabel, setTimeLabel] = useState("");
  const [capacity, setCapacity] = useState(6);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function addSchedule(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    const supabase = createClient();

    const { error } = await supabase.from("class_schedules").insert({
      team_class_id: item.id,
      day_label: dayLabel,
      time_label: timeLabel,
      slot_capacity: capacity,
    });

    setSubmitting(false);
    if (error) {
      setErrorMsg("시간대 추가에 실패했어요.");
      return;
    }
    setDayLabel("");
    setTimeLabel("");
    setCapacity(6);
    setAddingSchedule(false);
    router.refresh();
  }

  async function deleteSchedule(scheduleId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("class_schedules").delete().eq("id", scheduleId);
    if (!error) router.refresh();
  }

  async function deleteClass() {
    if (!confirm(`"${item.name}" 클래스를 삭제할까요?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("teams_classes").delete().eq("id", item.id);
    if (error) {
      alert("예약 이력이 있는 클래스는 삭제할 수 없어요.");
      return;
    }
    router.refresh();
  }

  return (
    <div className={cardClass()}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-muted">
            {sport ? `${sport.emoji} ${sport.name}` : item.sportId} · {item.instructorName}
          </p>
          <p className="mt-0.5 font-bold">{item.name}</p>
          <p className="mt-1 text-xs text-muted">
            {item.ageMin}~{item.ageMax}세 · {item.price.toLocaleString()}원/{item.priceUnit}
          </p>
        </div>
        <button
          onClick={deleteClass}
          className={buttonClass({ variant: "outline", size: "sm", full: false })}
        >
          삭제
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-1.5">
        {item.schedules.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-xl bg-background px-3 py-2 text-xs"
          >
            <span>
              {s.dayLabel} {s.timeLabel} · {s.booked}/{s.capacity}명
            </span>
            <button
              onClick={() => deleteSchedule(s.id)}
              className="font-bold text-muted"
              aria-label="시간대 삭제"
            >
              ✕
            </button>
          </div>
        ))}
        {item.schedules.length === 0 && (
          <p className="text-xs text-muted">등록된 시간대가 없어요.</p>
        )}
      </div>

      {!addingSchedule ? (
        <button
          onClick={() => setAddingSchedule(true)}
          className={buttonClass({
            variant: "custom",
            size: "sm",
            className: "mt-3 border border-dashed border-line text-muted",
          })}
        >
          + 시간대 추가
        </button>
      ) : (
        <form onSubmit={addSchedule} className="mt-3 flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              required
              value={dayLabel}
              onChange={(e) => setDayLabel(e.target.value)}
              placeholder="요일 (예: 화·목)"
              className="w-1/2 rounded-xl border border-line bg-background px-3 py-2.5 text-xs"
            />
            <input
              required
              value={timeLabel}
              onChange={(e) => setTimeLabel(e.target.value)}
              placeholder="시간 (예: 16:00)"
              className="w-1/2 rounded-xl border border-line bg-background px-3 py-2.5 text-xs"
            />
          </div>
          <input
            type="number"
            required
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            placeholder="정원"
            className="w-full rounded-xl border border-line bg-background px-3 py-2.5 text-xs"
          />
          {errorMsg && <p className="text-xs text-negative">{errorMsg}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className={buttonClass({
                variant: "custom",
                size: "sm",
                full: false,
                className: "flex-1 bg-rink text-white",
              })}
            >
              추가
            </button>
            <button
              type="button"
              onClick={() => setAddingSchedule(false)}
              className={buttonClass({ variant: "outline", size: "sm", full: false, className: "px-4" })}
            >
              취소
            </button>
          </div>
        </form>
      )}

      <button
        onClick={() => setShowMedia((v) => !v)}
        className="mt-3 w-full text-center text-xs font-bold text-rink-deep"
      >
        {showMedia ? "사진/소개 관리 닫기 ▲" : "사진/소개 관리 ▼"}
      </button>
      {showMedia && (
        <ClassMediaManager
          facilityId={facilityId}
          classId={item.id}
          initialImages={item.images}
          initialDescription={item.description}
        />
      )}
    </div>
  );
}
