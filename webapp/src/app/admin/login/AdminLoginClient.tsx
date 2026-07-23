"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { buttonClass } from "@/lib/ui";

export default function AdminLoginClient() {
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
      "get_admin_login_email",
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
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex flex-col items-center px-6 pb-10 pt-16 text-center">
      <div className="text-2xl font-extrabold tracking-tight">
        PlayMate<span className="text-energy">.</span> 관리자
      </div>
      <p className="mt-2 text-sm text-muted">가입 신청을 검토하고 승인하세요</p>

      <form onSubmit={login} className="mt-8 w-full text-left">
        <div className="flex flex-col gap-3">
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value.trim())}
            placeholder="관리자 아이디"
            autoCapitalize="none"
            className="w-full rounded-md border border-line bg-surface px-4 py-3.5 text-sm"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-full rounded-md border border-line bg-surface px-4 py-3.5 text-sm"
          />
        </div>

        {errorMsg && <p className="mt-3 text-sm text-negative">{errorMsg}</p>}

        <button
          type="submit"
          disabled={submitting}
          className={buttonClass({ variant: "secondary", className: "mt-4" })}
        >
          로그인
        </button>
      </form>
    </main>
  );
}
