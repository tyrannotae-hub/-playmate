"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ClubOwner } from "@/lib/types";
import { buttonClass, cardClass } from "@/lib/ui";

const WITHDRAWAL_ERROR_MESSAGE: Record<string, string> = {
  ACTIVE_BOOKINGS_EXIST: "처리 중인 예약이 있어 탈퇴할 수 없어요. 예약을 먼저 정리해주세요.",
  ALREADY_REQUESTED: "이미 탈퇴 신청이 접수되어 있어요.",
};

export default function SettingsForm({
  owner,
  initialPendingWithdrawal = false,
}: {
  owner: ClubOwner;
  initialPendingWithdrawal?: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(owner.name);
  const [savingName, setSavingName] = useState(false);
  const [nameErrorMsg, setNameErrorMsg] = useState("");
  const [nameSaved, setNameSaved] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [pendingWithdrawal, setPendingWithdrawal] = useState(initialPendingWithdrawal);
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
  const [withdrawalErrorMsg, setWithdrawalErrorMsg] = useState("");
  const [withdrawalRequested, setWithdrawalRequested] = useState(false);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setSavingName(true);
    setNameErrorMsg("");
    setNameSaved(false);
    const supabase = createClient();

    const { error } = await supabase.rpc("update_my_club_owner_name", { p_name: name });

    setSavingName(false);
    if (error) {
      setNameErrorMsg("저장에 실패했어요. 다시 시도해주세요.");
      return;
    }
    setNameSaved(true);
    router.refresh();
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordErrorMsg("비밀번호는 8자 이상이어야 해요.");
      return;
    }
    setSavingPassword(true);
    setPasswordErrorMsg("");
    setPasswordSaved(false);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setSavingPassword(false);
    if (error) {
      setPasswordErrorMsg("변경에 실패했어요. 다시 시도해주세요.");
      return;
    }
    setNewPassword("");
    setPasswordSaved(true);
  }

  async function requestWithdrawal() {
    setSubmittingWithdrawal(true);
    setWithdrawalErrorMsg("");
    const supabase = createClient();

    const { error } = await supabase.rpc("request_club_withdrawal");

    setSubmittingWithdrawal(false);
    if (error) {
      setWithdrawalErrorMsg(
        WITHDRAWAL_ERROR_MESSAGE[error.message] ?? "처리에 실패했어요. 다시 시도해주세요."
      );
      return;
    }
    setPendingWithdrawal(true);
    setWithdrawalRequested(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={saveName} className={cardClass("flex flex-col gap-3")}>
        <p className="font-bold">내 프로필</p>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-muted">이름</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-sm border border-line bg-background px-3.5 py-3 text-sm"
          />
        </div>
        {nameErrorMsg && <p className="text-xs text-negative">{nameErrorMsg}</p>}
        {nameSaved && <p className="text-xs font-bold text-good">저장됐어요</p>}
        <button
          type="submit"
          disabled={savingName}
          className={buttonClass({ variant: "custom", size: "sm", full: false, className: "bg-rink text-white" })}
        >
          {savingName ? "저장 중..." : "저장"}
        </button>
      </form>

      <form onSubmit={changePassword} className={cardClass("flex flex-col gap-3")}>
        <p className="font-bold">비밀번호 변경</p>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-muted">새 비밀번호</label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="8자 이상"
            className="w-full rounded-sm border border-line bg-background px-3.5 py-3 text-sm"
          />
        </div>
        {passwordErrorMsg && <p className="text-xs text-negative">{passwordErrorMsg}</p>}
        {passwordSaved && <p className="text-xs font-bold text-good">변경됐어요</p>}
        <button
          type="submit"
          disabled={savingPassword}
          className={buttonClass({ variant: "custom", size: "sm", full: false, className: "bg-rink text-white" })}
        >
          {savingPassword ? "변경 중..." : "비밀번호 변경"}
        </button>
      </form>

      <div className={cardClass("flex flex-col gap-3")}>
        <p className="font-bold">클럽 탈퇴</p>
        <p className="text-xs text-muted">
          탈퇴를 신청하면 관리자 검토 후 처리돼요. 처리 중인 예약(승인 대기・확정)이 있으면 신청할 수 없어요.
        </p>
        {withdrawalErrorMsg && <p className="text-xs text-negative">{withdrawalErrorMsg}</p>}
        {pendingWithdrawal ? (
          <p className="text-xs font-bold text-warn">
            {withdrawalRequested
              ? "탈퇴 신청이 접수됐어요. 관리자 승인 후 처리됩니다."
              : "이미 탈퇴 신청이 접수되어 있어요. 관리자 승인 후 처리됩니다."}
          </p>
        ) : (
          <button
            type="button"
            disabled={submittingWithdrawal}
            onClick={requestWithdrawal}
            className={buttonClass({ variant: "outline", size: "sm", full: false, className: "text-negative" })}
          >
            {submittingWithdrawal ? "신청 중..." : "탈퇴 신청"}
          </button>
        )}
      </div>
    </div>
  );
}
