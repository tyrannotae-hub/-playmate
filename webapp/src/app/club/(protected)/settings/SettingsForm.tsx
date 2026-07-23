"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ClubOwner } from "@/lib/types";
import { buttonClass, cardClass } from "@/lib/ui";

export default function SettingsForm({ owner }: { owner: ClubOwner }) {
  const router = useRouter();
  const [name, setName] = useState(owner.name);
  const [savingName, setSavingName] = useState(false);
  const [nameErrorMsg, setNameErrorMsg] = useState("");
  const [nameSaved, setNameSaved] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

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
            className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
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
            className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
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
    </div>
  );
}
