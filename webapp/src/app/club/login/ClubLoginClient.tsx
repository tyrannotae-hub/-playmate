"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ClubLoginClient() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    const supabase = createClient();

    const { data: email, error: lookupError } = await supabase.rpc(
      "get_club_login_email",
      { p_username: username }
    );

    if (lookupError || !email) {
      setSubmitting(false);
      setErrorMsg("아이디 또는 비밀번호가 올바르지 않아요.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      setErrorMsg("아이디 또는 비밀번호가 올바르지 않아요.");
      return;
    }
    router.push("/club/dashboard");
    router.refresh();
  }

  return (
    <main className="flex flex-col items-center px-6 pb-10 pt-16 text-center">
      <div className="text-2xl font-extrabold tracking-tight">
        PlayMate<span className="text-energy">.</span> 클럽 관리
      </div>
      <p className="mt-2 text-sm text-muted">내 시설·클래스·예약을 관리하세요</p>

      <form onSubmit={login} className="mt-8 w-full text-left">
        <div className="flex flex-col gap-3">
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value.trim())}
            placeholder="클럽 아이디"
            autoCapitalize="none"
            className="w-full rounded-xl border border-line bg-surface px-4 py-3.5 text-sm"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-full rounded-xl border border-line bg-surface px-4 py-3.5 text-sm"
          />
        </div>

        {errorMsg && <p className="mt-3 text-sm text-energy">{errorMsg}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 w-full rounded-xl bg-rink py-3.5 text-sm font-bold text-white disabled:opacity-40"
        >
          로그인
        </button>
      </form>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        클럽 계정은 플레이메이트 담당자가 만들어드려요. 계정이 없으시면 문의해주세요.
      </p>
    </main>
  );
}
