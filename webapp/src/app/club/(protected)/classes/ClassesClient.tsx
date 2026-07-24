"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ClubClass, FacilityInstructor, Sport } from "@/lib/types";
import { buttonClass, cardClass } from "@/lib/ui";
import DayLabelPicker from "@/components/club/DayLabelPicker";
import ClassCard from "./ClassCard";

export default function ClassesClient({
  facilityId,
  initialClasses,
  sports,
  instructors,
}: {
  facilityId: string;
  initialClasses: ClubClass[];
  sports: Sport[];
  instructors: FacilityInstructor[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [name, setName] = useState("");
  const [sportId, setSportId] = useState(sports[0]?.id ?? "");
  const [instructorIds, setInstructorIds] = useState<string[]>([]);
  const [ageMin, setAgeMin] = useState(5);
  const [ageMax, setAgeMax] = useState(12);
  const [classType, setClassType] = useState<"individual" | "group" | "team">("group");
  const [price, setPrice] = useState(150000);
  const [priceUnit, setPriceUnit] = useState("월");
  const [dayLabel, setDayLabel] = useState("");
  const [timeLabel, setTimeLabel] = useState("");
  const [capacity, setCapacity] = useState(6);
  const [collectHeight, setCollectHeight] = useState(false);
  const [collectShoeSize, setCollectShoeSize] = useState(false);
  const [collectResidence, setCollectResidence] = useState(false);
  const [showPrice, setShowPrice] = useState(true);
  const [allowTrial, setAllowTrial] = useState(false);
  const [trialPrice, setTrialPrice] = useState("");

  function toggleInstructor(id: string) {
    setInstructorIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  async function createClass(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    const supabase = createClient();

    const { data: newClass, error: classError } = await supabase
      .from("teams_classes")
      .insert({
        name,
        sport_id: sportId,
        facility_id: facilityId,
        age_min: ageMin,
        age_max: ageMax,
        class_type: classType,
        price,
        price_unit: priceUnit,
        collect_height: collectHeight,
        collect_shoe_size: collectShoeSize,
        collect_residence: collectResidence,
        show_price: showPrice,
        allow_trial: allowTrial,
        trial_price: allowTrial && trialPrice ? Number(trialPrice) : null,
      })
      .select("id")
      .single();

    if (classError || !newClass) {
      setSubmitting(false);
      setErrorMsg("클래스 등록에 실패했어요.");
      return;
    }

    if (instructorIds.length > 0) {
      const { error: instructorLinkError } = await supabase.from("class_instructors").insert(
        instructorIds.map((instructorId) => ({
          team_class_id: newClass.id,
          instructor_id: instructorId,
        }))
      );
      if (instructorLinkError) {
        setSubmitting(false);
        setErrorMsg("코치 배정에 실패했어요.");
        return;
      }
    }

    if (dayLabel.trim() && timeLabel.trim()) {
      await supabase.from("class_schedules").insert({
        team_class_id: newClass.id,
        day_label: dayLabel.trim(),
        time_label: timeLabel.trim(),
        slot_capacity: capacity,
      });
    }

    setSubmitting(false);
    setAdding(false);
    setName("");
    setInstructorIds([]);
    setDayLabel("");
    setTimeLabel("");
    setCollectHeight(false);
    setCollectShoeSize(false);
    setCollectResidence(false);
    setShowPrice(true);
    setAllowTrial(false);
    setTrialPrice("");
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-muted">운영 중인 클래스</p>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className={buttonClass({
              variant: "custom",
              size: "sm",
              full: false,
              className: "bg-rink text-white",
            })}
          >
            + 새 클래스 등록
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={createClass} className={cardClass("mt-3 flex flex-col gap-3")}>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted">클래스 이름</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 주니어 초급반"
              className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-bold text-muted">종목</label>
              <select
                value={sportId}
                onChange={(e) => setSportId(e.target.value)}
                className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
              >
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-bold text-muted">클래스 형태</label>
              <select
                value={classType}
                onChange={(e) => setClassType(e.target.value as typeof classType)}
                className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
              >
                <option value="group">그룹</option>
                <option value="individual">개인</option>
                <option value="team">팀</option>
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
                  const selected = instructorIds.includes(i.id);
                  return (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => toggleInstructor(i.id)}
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
                value={ageMin}
                onChange={(e) => setAgeMin(Number(e.target.value))}
                className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-bold text-muted">최대 나이</label>
              <input
                type="number"
                required
                min={0}
                value={ageMax}
                onChange={(e) => setAgeMax(Number(e.target.value))}
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
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
              />
            </div>
            <div className="w-24">
              <label className="mb-1.5 block text-xs font-bold text-muted">단위</label>
              <input
                required
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value)}
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
              checked={showPrice}
              onChange={(e) => setShowPrice(e.target.checked)}
              className="h-5 w-5 flex-shrink-0 accent-rink"
            />
          </label>

          <label className="flex items-center justify-between rounded-md border border-line px-3.5 py-3">
            <span className="text-sm font-bold">
              원데이 체험 받기
              <span className="mt-0.5 block text-xs font-normal text-muted">
                켜면 학부모가 예약 시 체험(1회)을 선택할 수 있어요
              </span>
            </span>
            <input
              type="checkbox"
              checked={allowTrial}
              onChange={(e) => setAllowTrial(e.target.checked)}
              className="h-5 w-5 flex-shrink-0 accent-rink"
            />
          </label>
          {allowTrial && (
            <div>
              <label className="mb-1.5 block text-xs font-bold text-muted">
                체험 가격 <span className="font-normal">(선택, 비워두면 정가와 동일)</span>
              </label>
              <input
                type="number"
                min={0}
                value={trialPrice}
                onChange={(e) => setTrialPrice(e.target.value)}
                placeholder="예: 30000"
                className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
              />
              <p className="mt-1.5 text-xs text-muted">
                체험 가능 날짜는 클래스 등록 후 &quot;정보 수정&quot;에서 추가할 수 있어요.
              </p>
            </div>
          )}

          <p className="mt-1 text-xs font-bold text-muted">첫 수업 시간대 (선택, 나중에 추가 가능)</p>
          <DayLabelPicker value={dayLabel} onChange={setDayLabel} />
          <input
            value={timeLabel}
            onChange={(e) => setTimeLabel(e.target.value)}
            placeholder="시간 (예: 16:00)"
            className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
          />
          <input
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            placeholder="정원"
            className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
          />

          <div>
            <p className="mb-1.5 text-xs font-bold text-muted">
              예약 신청 시 추가로 받을 정보 (성별·나이·연락처는 항상 받아요)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["키", collectHeight, setCollectHeight],
                  ["발사이즈", collectShoeSize, setCollectShoeSize],
                  ["거주지", collectResidence, setCollectResidence],
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

          {errorMsg && <p className="text-xs text-negative">{errorMsg}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className={buttonClass({
                variant: "custom",
                full: false,
                className: "flex-1 bg-rink text-white",
              })}
            >
              {submitting ? "등록 중..." : "클래스 등록"}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className={buttonClass({ variant: "outline", full: false, className: "px-5" })}
            >
              취소
            </button>
          </div>
        </form>
      )}

      <div className="mt-4 flex flex-col gap-2.5">
        {initialClasses.map((c) => (
          <ClassCard
            key={c.id}
            item={c}
            sports={sports}
            facilityId={facilityId}
            instructors={instructors}
          />
        ))}
        {initialClasses.length === 0 && !adding && (
          <p className="py-4 text-sm text-muted">등록된 클래스가 없어요.</p>
        )}
      </div>
    </>
  );
}
