"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import TopNav from "@/components/TopNav";
import { createClient } from "@/lib/supabase/client";

export default function LoginClient() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/";

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setSubmitting(false);
    if (error) {
      setErrorMsg("전송에 실패했어요. 이메일을 확인해주세요.");
      return;
    }
    setSent(true);
  }

  return (
    <>
      <TopNav />
      <main className="flex flex-col items-center px-6 pb-10 pt-16 text-center">
        <div className="text-2xl font-extrabold tracking-tight">
          PlayMate<span className="text-energy">.</span>
        </div>
        <p className="mt-2 text-sm text-muted">아이 체육, 맞춰서 찾다</p>

        <div className="mt-10 w-full">
          {sent ? (
            <>
              <div className="text-4xl">📩</div>
              <h2 className="mt-4 text-lg font-bold">메일함을 확인해주세요</h2>
              <p className="mt-2 text-sm text-muted">
                {email}로 로그인 링크를 보냈어요. 메일 안의 링크를 누르면 바로
                로그인돼요. (스팸함도 확인해주세요)
              </p>
            </>
          ) : (
            <form onSubmit={sendLink}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소 입력"
                className="w-full rounded-xl border border-line bg-surface px-4 py-3.5 text-center text-sm"
              />
              {errorMsg && <p className="mt-2 text-sm text-energy">{errorMsg}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="mt-3 w-full rounded-xl bg-energy py-3.5 text-sm font-bold text-[#1A0E08] disabled:opacity-40"
              >
                로그인 링크 받기 →
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-xs leading-relaxed text-muted">
          가입 시 이용약관과 개인정보 처리방침에 동의합니다
        </p>
      </main>
    </>
  );
}
