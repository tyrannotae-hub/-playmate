"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ClubClass, FacilityInstructor, Sport } from "@/lib/types";
import { buttonClass, cardClass } from "@/lib/ui";
import ClassMediaManager from "./ClassMediaManager";

const CLASS_TYPE_LABEL: Record<ClubClass["classType"], string> = {
  group: "그룹",
  individual: "개인",
  team: "팀",
};

export default function ClassCard({
  item,
  sports,
  facilityId,
  instructors,
}: {
  item: ClubClass;
  sports: Sport[];
  facilityId: string;
  instructors: FacilityInstructor[];
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

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editSportId, setEditSportId] = useState(item.sportId);
  const [editClassType, setEditClassType] = useState(item.classType);
  const [editAgeMin, setEditAgeMin] = useState(item.ageMin);
  const [editAgeMax, setEditAgeMax] = useState(item.ageMax);
  const [editPrice, setEditPrice] = useState(item.price);
  const [editPriceUnit, setEditPriceUnit] = useState(item.priceUnit);
  const [editInstructorIds, setEditInstructorIds] = useState<string[]>(
    item.instructors.map((i) => i.id)
  );
  const [editCollectHeight, setEditCollectHeight] = useState(item.collectHeight);
  const [editCollectShoeSize, setEditCollectShoeSize] = useState(item.collectShoeSize);
  const [editCollectResidence, setEditCollectResidence] = useState(item.collectResidence);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editErrorMsg, setEditErrorMsg] = useState("");

  function toggleEditInstructor(id: string) {
    setEditInstructorIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    setSavingEdit(true);
    setEditErrorMsg("");
    const supabase = createClient();

    const { error: updateError } = await supabase
      .from("teams_classes")
      .update({
        name: editName,
        sport_id: editSportId,
        class_type: editClassType,
        age_min: editAgeMin,
        age_max: editAgeMax,
        price: editPrice,
        price_unit: editPriceUnit,
        collect_height: editCollectHeight,
        collect_shoe_size: editCollectShoeSize,
        collect_residence: editCollectResidence,
      })
      .eq("id", item.id);

    if (updateError) {
      setSavingEdit(false);
      setEditErrorMsg("저장에 실패했어요. 다시 시도해주세요.");
      return;
    }

    const { error: deleteLinksError } = await supabase
      .from("class_instructors")
      .delete()
      .eq("team_class_id", item.id);

    if (deleteLinksError) {
      setSavingEdit(false);
      setEditErrorMsg("코치 배정 수정에 실패했어요.");
      return;
    }

    if (editInstructorIds.length > 0) {
      const { error: insertLinksError } = await supabase.from("class_instructors").insert(
        editInstructorIds.map((instructorId) => ({
          team_class_id: item.id,
          instructor_id: instructorId,
        }))
      );
      if (insertLinksError) {
        setSavingEdit(false);
        setEditErrorMsg("코치 배정 수정에 실패했어요.");
        return;
      }
    }

    setSavingEdit(false);
    setEditing(false);
    router.refresh();
  }

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
      {!editing ? (
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="break-words text-xs font-bold text-muted">
              {sport ? `${sport.emoji} ${sport.name}` : item.sportId} ·{" "}
              {item.instructors.length > 0
                ? item.instructors.map((i) => i.name).join(" · ")
                : "코치 미정"}
            </p>
            <p className="mt-0.5 break-words font-bold">{item.name}</p>
            <p className="mt-1 text-xs text-muted">
              {item.ageMin}~{item.ageMax}세 · {item.price.toLocaleString()}원/{item.priceUnit}
            </p>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <button
              onClick={() => setEditing(true)}
              className={buttonClass({ variant: "outline", size: "sm", full: false })}
            >
              정보 수정
            </button>
            <button
              onClick={deleteClass}
              className={buttonClass({ variant: "outline", size: "sm", full: false })}
            >
              삭제
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={saveEdit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted">클래스 이름</label>
            <input
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-bold text-muted">종목</label>
              <select
                value={editSportId}
                onChange={(e) => setEditSportId(e.target.value)}
                className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
              >
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.emoji} {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-bold text-muted">클래스 형태</label>
              <select
                value={editClassType}
                onChange={(e) => setEditClassType(e.target.value as ClubClass["classType"])}
                className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
              >
                {Object.entries(CLASS_TYPE_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted">
              담당 코치 (선택, 복수 선택 가능)
            </label>
            {instructors.length === 0 ? (
              <p className="rounded-md border border-dashed border-line px-3.5 py-3 text-xs text-muted">
                먼저{" "}
                <Link href="/club/instructors" className="font-bold text-rink-deep underline">
                  코치 관리
                </Link>
                에서 코치를 등록해주세요.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {instructors.map((i) => {
                  const selected = editInstructorIds.includes(i.id);
                  return (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => toggleEditInstructor(i.id)}
                      className={buttonClass({
                        variant: selected ? "secondary" : "outline",
                        size: "sm",
                        full: false,
                      })}
                    >
                      {selected ? "✓ " : ""}
                      {i.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-bold text-muted">최소 나이</label>
              <input
                type="number"
                required
                min={0}
                value={editAgeMin}
                onChange={(e) => setEditAgeMin(Number(e.target.value))}
                className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-bold text-muted">최대 나이</label>
              <input
                type="number"
                required
                min={0}
                value={editAgeMax}
                onChange={(e) => setEditAgeMax(Number(e.target.value))}
                className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-bold text-muted">가격</label>
              <input
                type="number"
                required
                min={0}
                value={editPrice}
                onChange={(e) => setEditPrice(Number(e.target.value))}
                className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
              />
            </div>
            <div className="w-24">
              <label className="mb-1.5 block text-xs font-bold text-muted">단위</label>
              <input
                required
                value={editPriceUnit}
                onChange={(e) => setEditPriceUnit(e.target.value)}
                className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
              />
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-bold text-muted">
              예약 신청 시 추가로 받을 정보 (성별·나이·연락처는 항상 받아요)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["키", editCollectHeight, setEditCollectHeight],
                  ["발사이즈", editCollectShoeSize, setEditCollectShoeSize],
                  ["거주지", editCollectResidence, setEditCollectResidence],
                ] as const
              ).map(([label, checked, setChecked]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setChecked(!checked)}
                  className={buttonClass({
                    variant: checked ? "secondary" : "outline",
                    size: "sm",
                    full: false,
                  })}
                >
                  {checked ? "✓ " : ""}
                  {label}
                </button>
              ))}
            </div>
          </div>
          {editErrorMsg && <p className="text-xs text-negative">{editErrorMsg}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={savingEdit}
              className={buttonClass({
                variant: "custom",
                size: "sm",
                full: false,
                className: "flex-1 bg-rink text-white",
              })}
            >
              {savingEdit ? "저장 중..." : "저장"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className={buttonClass({ variant: "outline", size: "sm", full: false, className: "px-4" })}
            >
              취소
            </button>
          </div>
        </form>
      )}

      {!editing && (
      <>
      <div className="mt-3 flex flex-col gap-1.5">
        {item.schedules.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-md bg-background px-3 py-2 text-xs"
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
              className="w-1/2 rounded-md border border-line bg-background px-3 py-2.5 text-xs"
            />
            <input
              required
              value={timeLabel}
              onChange={(e) => setTimeLabel(e.target.value)}
              placeholder="시간 (예: 16:00)"
              className="w-1/2 rounded-md border border-line bg-background px-3 py-2.5 text-xs"
            />
          </div>
          <input
            type="number"
            required
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            placeholder="정원"
            className="w-full rounded-md border border-line bg-background px-3 py-2.5 text-xs"
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
      </>
      )}
    </div>
  );
}
