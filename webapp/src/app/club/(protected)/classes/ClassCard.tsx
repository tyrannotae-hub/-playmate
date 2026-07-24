"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ClubClass, FacilityInstructor, Sport } from "@/lib/types";
import { buttonClass, cardClass } from "@/lib/ui";
import SportIcon from "@/components/icons/SportIcon";
import ClassMediaManager from "./ClassMediaManager";
import DayLabelPicker from "@/components/club/DayLabelPicker";
import { formatIsoDateToKoreanShort } from "@/lib/schedule-dates";

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
  const [newScheduleAllowTrial, setNewScheduleAllowTrial] = useState(false);
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
  const [editShowPrice, setEditShowPrice] = useState(item.showPrice);
  const [editTrialPrice, setEditTrialPrice] = useState(
    item.trialPrice != null ? String(item.trialPrice) : ""
  );
  const [editShowTrialPrice, setEditShowTrialPrice] = useState(item.showTrialPrice);
  const [editUseDiscount, setEditUseDiscount] = useState(item.discountPrice != null);
  const [editDiscountPrice, setEditDiscountPrice] = useState(
    item.discountPrice != null ? String(item.discountPrice) : ""
  );
  const [editDiscountStartDate, setEditDiscountStartDate] = useState(
    item.discountStartDate ?? ""
  );
  const [editDiscountEndDate, setEditDiscountEndDate] = useState(item.discountEndDate ?? "");
  const [editUseTrialDiscount, setEditUseTrialDiscount] = useState(
    item.trialDiscountPrice != null
  );
  const [editTrialDiscountPrice, setEditTrialDiscountPrice] = useState(
    item.trialDiscountPrice != null ? String(item.trialDiscountPrice) : ""
  );
  const [editTrialDiscountStartDate, setEditTrialDiscountStartDate] = useState(
    item.trialDiscountStartDate ?? ""
  );
  const [editTrialDiscountEndDate, setEditTrialDiscountEndDate] = useState(
    item.trialDiscountEndDate ?? ""
  );
  const [savingEdit, setSavingEdit] = useState(false);
  const [editErrorMsg, setEditErrorMsg] = useState("");

  const [addingHoliday, setAddingHoliday] = useState(false);
  const [newHoliday, setNewHoliday] = useState("");
  const [holidayErrorMsg, setHolidayErrorMsg] = useState("");

  function toggleEditInstructor(id: string) {
    setEditInstructorIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    setEditErrorMsg("");

    if (
      editUseDiscount &&
      (!editDiscountPrice || !editDiscountStartDate || !editDiscountEndDate)
    ) {
      setEditErrorMsg("할인 적용 시 할인가와 시작일·종료일을 모두 입력해주세요.");
      return;
    }

    if (
      editUseTrialDiscount &&
      (!editTrialDiscountPrice || !editTrialDiscountStartDate || !editTrialDiscountEndDate)
    ) {
      setEditErrorMsg("원데이 할인 적용 시 할인가와 시작일·종료일을 모두 입력해주세요.");
      return;
    }

    setSavingEdit(true);
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
        show_price: editShowPrice,
        trial_price: item.allowTrial && editTrialPrice ? Number(editTrialPrice) : null,
        show_trial_price: editShowTrialPrice,
        discount_price: editUseDiscount ? Number(editDiscountPrice) : null,
        discount_start_date: editUseDiscount ? editDiscountStartDate : null,
        discount_end_date: editUseDiscount ? editDiscountEndDate : null,
        trial_discount_price:
          item.allowTrial && editUseTrialDiscount && editTrialDiscountPrice
            ? Number(editTrialDiscountPrice)
            : null,
        trial_discount_start_date:
          item.allowTrial && editUseTrialDiscount ? editTrialDiscountStartDate : null,
        trial_discount_end_date:
          item.allowTrial && editUseTrialDiscount ? editTrialDiscountEndDate : null,
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

    if (!dayLabel) {
      setSubmitting(false);
      setErrorMsg("요일을 하나 이상 선택해주세요.");
      return;
    }

    const { error } = await supabase.from("class_schedules").insert({
      team_class_id: item.id,
      day_label: dayLabel,
      time_label: timeLabel,
      slot_capacity: capacity,
      allow_trial: newScheduleAllowTrial,
    });

    setSubmitting(false);
    if (error) {
      setErrorMsg("시간대 추가에 실패했어요.");
      return;
    }
    setDayLabel("");
    setTimeLabel("");
    setCapacity(6);
    setNewScheduleAllowTrial(false);
    setAddingSchedule(false);
    router.refresh();
  }

  async function deleteSchedule(scheduleId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("class_schedules").delete().eq("id", scheduleId);
    if (!error) router.refresh();
  }

  async function toggleScheduleTrial(scheduleId: string, allowTrial: boolean) {
    const supabase = createClient();
    const { error } = await supabase
      .from("class_schedules")
      .update({ allow_trial: allowTrial })
      .eq("id", scheduleId);
    if (!error) router.refresh();
  }

  async function addHoliday(e: React.FormEvent) {
    e.preventDefault();
    if (!newHoliday) return;
    setAddingHoliday(true);
    setHolidayErrorMsg("");
    const supabase = createClient();

    const { error } = await supabase
      .from("class_holidays")
      .insert({ team_class_id: item.id, holiday_date: newHoliday });

    setAddingHoliday(false);
    if (error) {
      setHolidayErrorMsg(
        error.code === "23505" ? "이미 등록된 날짜예요." : "휴일 추가에 실패했어요."
      );
      return;
    }
    setNewHoliday("");
    router.refresh();
  }

  async function deleteHoliday(holidayDate: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("class_holidays")
      .delete()
      .eq("team_class_id", item.id)
      .eq("holiday_date", holidayDate);
    if (!error) router.refresh();
  }

  async function deleteClass() {
    if (!confirm(`"${item.name}" 클래스를 삭제할까요?`)) return;
    const supabase = createClient();
    const { error } = await supabase.rpc("delete_class", { p_class_id: item.id });
    if (error) {
      alert(
        error.message === "ACTIVE_BOOKINGS_EXIST"
          ? "신청/확정 상태인 예약이 있어 삭제할 수 없어요. 먼저 완료 또는 취소 처리해주세요."
          : "삭제에 실패했어요. 다시 시도해주세요."
      );
      return;
    }
    router.refresh();
  }

  return (
    <div className={cardClass()}>
      {!editing ? (
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="flex items-center gap-1 break-words text-xs font-bold text-muted">
              {sport && <SportIcon sportId={sport.id} size={13} className="shrink-0" />}
              <span className="min-w-0 break-words">
                {sport ? sport.name : item.sportId} ·{" "}
                {item.instructors.length > 0
                  ? item.instructors.map((i) => i.name).join(" · ")
                  : "코치 미정"}
              </span>
            </p>
            <p className="mt-0.5 break-words font-bold">{item.name}</p>
            <p className="mt-1 text-xs text-muted">
              {item.ageMin}~{item.ageMax}세 ·{" "}
              {item.showPrice ? `${item.price.toLocaleString()}원/${item.priceUnit}` : "가격 비공개"}
            </p>
            {item.allowTrial && (
              <span className="mt-1 inline-block rounded-md bg-rink/10 px-2 py-0.5 text-[11px] font-bold text-rink-deep">
                원데이 체험 가능
                {item.trialPrice != null && ` · ${item.trialPrice.toLocaleString()}원`}
              </span>
            )}
            <Link
              href={`/club/bookings?classId=${item.id}`}
              className="mt-1.5 block text-xs font-bold text-rink-deep"
            >
              이 클래스 예약 현황 보기 →
            </Link>
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
            <div className="min-w-0 flex-1">
              <label className="mb-1.5 block text-xs font-bold text-muted">종목</label>
              <select
                value={editSportId}
                onChange={(e) => setEditSportId(e.target.value)}
                className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
              >
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0 flex-1">
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
            <div className="min-w-0 flex-1">
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
            <div className="min-w-0 flex-1">
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
            <div className="min-w-0 flex-1">
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
          <label className="flex items-center justify-between rounded-md border border-line px-3.5 py-3">
            <span className="text-sm font-bold">
              가격 공개
              <span className="mt-0.5 block text-xs font-normal text-muted">
                끄면 학부모 화면에 가격 대신 &quot;가격 문의&quot;로 표시돼요
              </span>
            </span>
            <input
              type="checkbox"
              checked={editShowPrice}
              onChange={(e) => setEditShowPrice(e.target.checked)}
              className="h-5 w-5 flex-shrink-0 accent-rink"
            />
          </label>
          <p className="rounded-md border border-dashed border-line px-3.5 py-3 text-xs text-muted">
            원데이 체험 허용 여부는 이제 시간대별로 설정해요. 아래 &quot;시간대&quot; 목록에서
            시간대마다 원데이 가능을 켜고 끌 수 있어요.
          </p>
          {item.allowTrial && (
            <div>
              <label className="mb-1.5 block text-xs font-bold text-muted">
                체험 가격 <span className="font-normal">(선택, 비워두면 정가와 동일)</span>
              </label>
              <input
                type="number"
                min={0}
                value={editTrialPrice}
                onChange={(e) => setEditTrialPrice(e.target.value)}
                placeholder="예: 30000"
                className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
              />
            </div>
          )}
          {item.allowTrial && (
            <label className="flex items-center justify-between rounded-md border border-line px-3.5 py-3">
              <span className="text-sm font-bold">
                체험가 공개
                <span className="mt-0.5 block text-xs font-normal text-muted">
                  끄면 학부모 화면에 체험 가격 대신 &quot;가격 문의&quot;로 표시돼요
                </span>
              </span>
              <input
                type="checkbox"
                checked={editShowTrialPrice}
                onChange={(e) => setEditShowTrialPrice(e.target.checked)}
                className="h-5 w-5 flex-shrink-0 accent-rink"
              />
            </label>
          )}
          <label className="flex items-center justify-between rounded-md border border-line px-3.5 py-3">
            <span className="text-sm font-bold">
              할인 적용
              <span className="mt-0.5 block text-xs font-normal text-muted">
                기간을 정해 정가 대신 할인가를 노출해요
              </span>
            </span>
            <input
              type="checkbox"
              checked={editUseDiscount}
              onChange={(e) => setEditUseDiscount(e.target.checked)}
              className="h-5 w-5 flex-shrink-0 accent-rink"
            />
          </label>
          {editUseDiscount && (
            <div className="flex flex-col gap-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-muted">할인가</label>
                <input
                  type="number"
                  min={0}
                  value={editDiscountPrice}
                  onChange={(e) => setEditDiscountPrice(e.target.value)}
                  placeholder="예: 25000"
                  className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <label className="mb-1.5 block text-xs font-bold text-muted">할인 시작일</label>
                  <input
                    type="date"
                    value={editDiscountStartDate}
                    onChange={(e) => setEditDiscountStartDate(e.target.value)}
                    className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <label className="mb-1.5 block text-xs font-bold text-muted">할인 종료일</label>
                  <input
                    type="date"
                    value={editDiscountEndDate}
                    onChange={(e) => setEditDiscountEndDate(e.target.value)}
                    className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
          {item.allowTrial && (
            <label className="flex items-center justify-between rounded-md border border-line px-3.5 py-3">
              <span className="text-sm font-bold">
                원데이 할인 적용
                <span className="mt-0.5 block text-xs font-normal text-muted">
                  정가 할인과 별개로, 원데이 체험가만 다른 기간에 할인할 수 있어요
                </span>
              </span>
              <input
                type="checkbox"
                checked={editUseTrialDiscount}
                onChange={(e) => setEditUseTrialDiscount(e.target.checked)}
                className="h-5 w-5 flex-shrink-0 accent-rink"
              />
            </label>
          )}
          {item.allowTrial && editUseTrialDiscount && (
            <div className="flex flex-col gap-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-muted">원데이 할인가</label>
                <input
                  type="number"
                  min={0}
                  value={editTrialDiscountPrice}
                  onChange={(e) => setEditTrialDiscountPrice(e.target.value)}
                  placeholder="예: 20000"
                  className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <label className="mb-1.5 block text-xs font-bold text-muted">할인 시작일</label>
                  <input
                    type="date"
                    value={editTrialDiscountStartDate}
                    onChange={(e) => setEditTrialDiscountStartDate(e.target.value)}
                    className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <label className="mb-1.5 block text-xs font-bold text-muted">할인 종료일</label>
                  <input
                    type="date"
                    value={editTrialDiscountEndDate}
                    onChange={(e) => setEditTrialDiscountEndDate(e.target.value)}
                    className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
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
            <div className="flex shrink-0 items-center gap-3">
              <label className="flex items-center gap-1.5 font-bold text-muted">
                <input
                  type="checkbox"
                  checked={s.allowTrial}
                  onChange={(e) => toggleScheduleTrial(s.id, e.target.checked)}
                  className="h-4 w-4 accent-rink"
                />
                원데이 가능
              </label>
              <button
                onClick={() => deleteSchedule(s.id)}
                className="font-bold text-muted"
                aria-label="시간대 삭제"
              >
                ✕
              </button>
            </div>
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
          <DayLabelPicker value={dayLabel} onChange={setDayLabel} />
          <input
            required
            value={timeLabel}
            onChange={(e) => setTimeLabel(e.target.value)}
            placeholder="시간 (예: 16:00)"
            className="w-full rounded-md border border-line bg-background px-3 py-2.5 text-xs"
          />
          <input
            type="number"
            required
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            placeholder="정원"
            className="w-full rounded-md border border-line bg-background px-3 py-2.5 text-xs"
          />
          <label className="flex items-center gap-1.5 text-xs font-bold text-muted">
            <input
              type="checkbox"
              checked={newScheduleAllowTrial}
              onChange={(e) => setNewScheduleAllowTrial(e.target.checked)}
              className="h-4 w-4 accent-rink"
            />
            원데이 체험 가능
          </label>
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

      <div className="mt-3 border-t border-line pt-3">
        <p className="mb-1.5 text-xs font-bold text-muted">휴일(운영 안 하는 날)</p>
        <div className="flex flex-col gap-1.5">
          {item.holidays
            .slice()
            .sort()
            .map((d) => (
              <div
                key={d}
                className="flex items-center justify-between rounded-md bg-background px-3 py-2 text-xs"
              >
                <span>{formatIsoDateToKoreanShort(d)}</span>
                <button
                  onClick={() => deleteHoliday(d)}
                  className="font-bold text-muted"
                  aria-label="휴일 삭제"
                >
                  ✕
                </button>
              </div>
            ))}
          {item.holidays.length === 0 && (
            <p className="text-xs text-muted">등록된 휴일이 없어요.</p>
          )}
        </div>
        <form onSubmit={addHoliday} className="mt-2 flex gap-2">
          <input
            type="date"
            required
            value={newHoliday}
            onChange={(e) => setNewHoliday(e.target.value)}
            className="flex-1 rounded-md border border-line bg-background px-3 py-2.5 text-xs"
          />
          <button
            type="submit"
            disabled={addingHoliday}
            className={buttonClass({ variant: "outline", size: "sm", full: false })}
          >
            추가
          </button>
        </form>
        {holidayErrorMsg && <p className="mt-1 text-xs text-negative">{holidayErrorMsg}</p>}
      </div>

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
