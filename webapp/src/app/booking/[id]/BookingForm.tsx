"use client";

import { useMemo, useState } from "react";
import TopNav from "@/components/TopNav";
import { createClient } from "@/lib/supabase/client";
import { Child, TeamClass } from "@/lib/types";
import { buttonClass } from "@/lib/ui";
import { formatIsoDateToKoreanShort, upcomingDatesForDayLabel } from "@/lib/schedule-dates";
import { effectiveTrialPrice, isTrialDiscountActive } from "@/lib/pricing";

type Phase = "add-child" | "form" | "requested" | "error";
type Gender = "male" | "female";
type BookingType = "trial" | "enrollment";

export default function BookingForm({
  item,
  initialChildren,
}: {
  item: TeamClass;
  initialChildren: Child[];
}) {
  const [children, setChildren] = useState(initialChildren);
  const [phase, setPhase] = useState<Phase>(
    initialChildren.length === 0 ? "add-child" : "form"
  );
  const [childId, setChildId] = useState(initialChildren[0]?.id ?? "");
  const [childName, setChildName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [scheduleId, setScheduleId] = useState(item.schedules[0]?.id ?? "");
  const [bookingType, setBookingType] = useState<BookingType>("enrollment");
  const [trialDate, setTrialDate] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [heightCm, setHeightCm] = useState("");
  const [shoeSizeMm, setShoeSizeMm] = useState("");
  const [residence, setResidence] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const selectedSchedule = item.schedules.find((s) => s.id === scheduleId) ?? item.schedules[0];

  function selectSchedule(id: string) {
    setScheduleId(id);
    const next = item.schedules.find((s) => s.id === id);
    if (!next?.allowTrial) {
      setBookingType("enrollment");
      setTrialDate("");
    }
  }

  // 원데이 체험 가능 여부/반복 요일은 이제 클래스 전체가 아니라 선택된 시간대(schedule)
  // 단위 필드라, 그 schedule의 dayLabel을 반복 요일로 그대로 쓴다.
  const trialDateOptions = useMemo(() => {
    if (!selectedSchedule?.allowTrial) return [];

    // 로컬 자정 기준 Date를 "YYYY-MM-DD"로 변환. toISOString()은 UTC 변환 과정에서
    // 하루 밀릴 수 있어 연/월/일을 직접 조합한다.
    const toIsoDate = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;

    const todayIso = toIsoDate(new Date());
    const holidaySet = new Set(item.holidays);

    return upcomingDatesForDayLabel(selectedSchedule.dayLabel)
      .map(toIsoDate)
      .filter((iso) => iso >= todayIso && !holidaySet.has(iso))
      .sort()
      .map((iso) => ({ iso, label: formatIsoDateToKoreanShort(iso) }));
  }, [selectedSchedule, item.holidays]);

  async function addChild(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("children")
      .insert({ parent_id: user.id, name: childName, birth_date: birthDate })
      .select("id, name, birth_date")
      .single();

    setSubmitting(false);
    if (error || !data) {
      setErrorMsg("자녀 등록에 실패했어요. 다시 시도해주세요.");
      return;
    }
    const age =
      new Date().getFullYear() - new Date(data.birth_date).getFullYear();
    const newChild = { id: data.id, name: data.name, age, photoUrl: "" };
    setChildren([newChild]);
    setChildId(newChild.id);
    setPhase("form");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setErrorMsg("개인정보 수집·이용에 동의해주세요.");
      return;
    }
    if (bookingType === "trial" && !trialDate) {
      setErrorMsg("체험 참여 날짜를 선택해주세요.");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    const supabase = createClient();
    const { error } = await supabase.rpc("request_booking", {
      p_child_id: childId,
      p_schedule_id: scheduleId,
      p_contact_phone: contactPhone || null,
      p_gender: gender,
      p_height_cm: heightCm ? Number(heightCm) : null,
      p_shoe_size_mm: shoeSizeMm ? Number(shoeSizeMm) : null,
      p_residence: residence || null,
      p_consent: consent,
      p_booking_type: bookingType,
      p_trial_date: bookingType === "trial" ? trialDate : null,
    });
    setSubmitting(false);

    if (error) {
      const MESSAGES: Record<string, string> = {
        FULL: "방금 정원이 마감됐어요. 다른 시간대를 확인해주세요.",
        HOLIDAY_DATE: "그 날짜는 휴무일이에요. 다른 날짜를 선택해주세요.",
        SCHEDULE_NOT_TRIAL: "이 시간대는 원데이 체험을 받지 않아요.",
      };
      setErrorMsg(MESSAGES[error.message] ?? "예약 신청에 실패했어요. 다시 시도해주세요.");
      setPhase("error");
      return;
    }
    setPhase("requested");
  }

  if (phase === "add-child") {
    return (
      <>
        <TopNav title="자녀 등록" back />
        <main className="px-4 pb-10 pt-4">
          <p className="text-sm text-muted">
            예약 전에 자녀 정보를 먼저 등록해주세요.
          </p>
          <form onSubmit={addChild} className="mt-5 flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-bold">자녀 이름</label>
              <input
                required
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="예: 민준"
                className="w-full rounded-md border border-line bg-surface px-3.5 py-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold">생년월일</label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full rounded-md border border-line bg-surface px-3.5 py-3 text-sm"
              />
            </div>
            {errorMsg && <p className="text-sm text-negative">{errorMsg}</p>}
            <button
              type="submit"
              disabled={submitting}
              className={buttonClass({ className: "mt-2" })}
            >
              등록하고 계속하기
            </button>
          </form>
        </main>
      </>
    );
  }

  if (phase === "requested" || phase === "error") {
    return (
      <>
        <TopNav title="예약 상태" back />
        <main className="flex flex-col items-center px-6 pb-10 pt-16 text-center">
          {phase === "requested" ? (
            <>
              <div className="text-4xl">⏳</div>
              <h2 className="mt-4 text-lg font-bold">예약 신청이 접수됐어요</h2>
              <p className="mt-2 text-sm text-muted">
                시설에서 확인 후 알림으로 알려드려요. 마이페이지에서 진행 상황을
                확인할 수 있어요.
              </p>
            </>
          ) : (
            <>
              <div className="text-4xl">⚠️</div>
              <h2 className="mt-4 text-lg font-bold">예약 신청에 실패했어요</h2>
              <p className="mt-2 text-sm text-muted">{errorMsg}</p>
              <button
                onClick={() => setPhase("form")}
                className={buttonClass({ variant: "outline", className: "mt-6" })}
              >
                다시 시도하기
              </button>
            </>
          )}
        </main>
      </>
    );
  }

  return (
    <>
      <TopNav title="예약 신청" back />
      <main className="px-4 pb-10 pt-4">
        <p className="text-xs font-bold text-muted">{item.facility.name}</p>
        <h1 className="mt-1 text-lg font-extrabold">{item.name}</h1>

        {item.schedules.length > 1 ? (
          <div className="mt-3">
            <label className="mb-1.5 block text-sm font-bold">시간대 선택</label>
            <div className="flex flex-col gap-2">
              {item.schedules.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => selectSchedule(s.id)}
                  className={buttonClass({
                    variant: scheduleId === s.id ? "secondary" : "outline",
                    className: "justify-between",
                  })}
                >
                  <span>
                    {s.dayLabel} {s.timeLabel}
                  </span>
                  {s.allowTrial && <span className="text-xs font-normal">원데이 가능</span>}
                </button>
              ))}
            </div>
          </div>
        ) : item.schedules[0] ? (
          <p className="mt-1 text-sm text-muted">
            {item.schedules[0].dayLabel} {item.schedules[0].timeLabel}
          </p>
        ) : (
          <p className="mt-1 text-sm text-negative">등록된 시간대가 없어 예약할 수 없어요.</p>
        )}

        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          {selectedSchedule?.allowTrial && (
            <div>
              <label className="mb-1.5 block text-sm font-bold">신청 유형</label>
              <div className="flex gap-2">
                {(
                  [
                    { value: "trial" as const, label: "체험(1회)" },
                    { value: "enrollment" as const, label: "정기 등록" },
                  ]
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setBookingType(opt.value)}
                    className={buttonClass({
                      variant: bookingType === opt.value ? "secondary" : "outline",
                      size: "sm",
                      full: false,
                      className: "flex-1",
                    })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedSchedule?.allowTrial && bookingType === "trial" && (
            <div>
              <label className="mb-1.5 block text-sm font-bold">체험 참여 날짜</label>
              {trialDateOptions.length > 0 ? (
                <select
                  value={trialDate}
                  onChange={(e) => setTrialDate(e.target.value)}
                  className="w-full rounded-md border border-line bg-surface px-3.5 py-3 text-sm"
                >
                  <option value="">날짜를 선택해주세요</option>
                  {trialDateOptions.map((opt) => (
                    <option key={opt.iso} value={opt.iso}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-muted">
                  선택 가능한 날짜가 없어요. 시설에 직접 문의해주세요.
                </p>
              )}
              {item.trialPrice != null && (
                <p className="mt-1.5 text-xs text-muted">
                  {item.showTrialPrice ? (
                    isTrialDiscountActive(item) ? (
                      <>
                        체험 가격:{" "}
                        <span className="line-through">{item.trialPrice.toLocaleString()}원</span>{" "}
                        <span className="font-bold text-energy">
                          {effectiveTrialPrice(item)!.toLocaleString()}원
                        </span>
                      </>
                    ) : (
                      `체험 가격: ${item.trialPrice.toLocaleString()}원`
                    )
                  ) : (
                    "체험 문의"
                  )}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-bold">수강생(자녀)</label>
            <select
              value={childId}
              onChange={(e) => setChildId(e.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3.5 py-3 text-sm"
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.age}세)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold">성별</label>
            <div className="flex gap-2">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={buttonClass({
                    variant: gender === g ? "secondary" : "outline",
                    size: "sm",
                    full: false,
                    className: "flex-1",
                  })}
                >
                  {g === "male" ? "남" : "여"}
                </button>
              ))}
            </div>
          </div>

          {(item.collectHeight || item.collectShoeSize) && (
            <div className="grid grid-cols-2 gap-3">
              {item.collectHeight && (
                <div>
                  <label className="mb-1.5 block text-sm font-bold">
                    키(cm) <span className="font-normal text-muted">(선택)</span>
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="120"
                    className="w-full rounded-md border border-line bg-surface px-3.5 py-3 text-sm"
                  />
                </div>
              )}
              {item.collectShoeSize && (
                <div>
                  <label className="mb-1.5 block text-sm font-bold">
                    발사이즈(mm) <span className="font-normal text-muted">(선택)</span>
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={shoeSizeMm}
                    onChange={(e) => setShoeSizeMm(e.target.value)}
                    placeholder="180"
                    className="w-full rounded-md border border-line bg-surface px-3.5 py-3 text-sm"
                  />
                </div>
              )}
            </div>
          )}

          {item.collectResidence && (
            <div>
              <label className="mb-1.5 block text-sm font-bold">
                거주지 <span className="font-normal text-muted">(선택)</span>
              </label>
              <input
                value={residence}
                onChange={(e) => setResidence(e.target.value)}
                placeholder="예: 서울 강남구"
                className="w-full rounded-md border border-line bg-surface px-3.5 py-3 text-sm"
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-bold">
              보호자 연락처 <span className="font-normal text-muted">(선택)</span>
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="010-1234-5678"
              className="w-full rounded-md border border-line bg-surface px-3.5 py-3 text-sm"
            />
          </div>

          <p className="rounded-md bg-energy-soft px-3.5 py-3 text-xs leading-relaxed text-[color:var(--foreground)]">
            ⚠️ 결제는 현장/계좌이체로 시설과 직접 진행됩니다
          </p>

          <label className="flex items-start gap-2.5 rounded-md border border-line px-3.5 py-3">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 flex-shrink-0 accent-rink"
            />
            <span className="text-xs leading-relaxed text-muted">
              (필수) 개인정보 수집·이용에 동의합니다.
              <br />
              수집 목적: 신청자에 대한 서비스 안내 · 보유 기간: 수집일로부터 1년
            </span>
          </label>

          {errorMsg && <p className="text-sm text-negative">{errorMsg}</p>}

          <button
            type="submit"
            disabled={submitting}
            className={buttonClass({ className: "mt-2" })}
          >
            {submitting ? "신청 중..." : "예약 신청 보내기"}
          </button>
        </form>
      </main>
    </>
  );
}
