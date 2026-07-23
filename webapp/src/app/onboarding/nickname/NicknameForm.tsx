"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { buttonClass } from "@/lib/ui";

export default function NicknameForm({ userId }: { userId: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";

  const [nickname, setNickname] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (trimmed.length < 2 || trimmed.length > 12) {
      setErrorMsg("닉네임은 2~12자로 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    const supabase = createClient();
    const { error } = await supabase.from("parents").update({ name: trimmed }).eq("id", userId);

    setSubmitting(false);
    if (error) {
      setErrorMsg("저장에 실패했어요. 다시 시도해주세요.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-8 w-full text-left">
      <input
        autoFocus
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="예: 민준맘"
        maxLength={12}
        className="w-full rounded-md border border-line bg-surface px-4 py-3.5 text-sm"
      />
      {errorMsg && <p className="mt-3 text-sm text-negative">{errorMsg}</p>}
      <button type="submit" disabled={submitting} className={buttonClass({ className: "mt-4" })}>
        {submitting ? "저장 중..." : "시작하기"}
      </button>
    </form>
  );
}
