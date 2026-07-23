"use client";

import { useState } from "react";
import TopNav from "@/components/TopNav";
import { createClient } from "@/lib/supabase/client";
import { Child, TeamClass } from "@/lib/types";
import { buttonClass } from "@/lib/ui";

type Phase = "add-child" | "form" | "requested" | "error";

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
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
    setSubmitting(true);
    setErrorMsg("");
    const supabase = createClient();
    const { error } = await supabase.rpc("request_booking", {
      p_child_id: childId,
      p_schedule_id: item.schedules[0].id,
    });
    setSubmitting(false);

    if (error) {
      setErrorMsg(
        error.message === "FULL"
          ? "방금 정원이 마감됐어요. 다른 시간대를 확인해주세요."
          : "예약 신청에 실패했어요. 다시 시도해주세요."
      );
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
        <p className="mt-1 text-sm text-muted">
          {item.schedules[0].dayLabel} {item.schedules[0].timeLabel}
        </p>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-bold">신청 자녀</label>
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

          <p className="rounded-md bg-energy-soft px-3.5 py-3 text-xs leading-relaxed text-[color:var(--foreground)]">
            ⚠️ 결제는 현장/계좌이체로 시설과 직접 진행됩니다
          </p>

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
