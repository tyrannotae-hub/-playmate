"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TopNav from "@/components/TopNav";
import { createClient } from "@/lib/supabase/client";

export default function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ email });
    setSubmitting(false);
    if (error) {
      setErrorMsg("인증번호 전송에 실패했어요. 이메일을 확인해주세요.");
      return;
    }
    setStep("code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    setSubmitting(false);
    if (error) {
      setErrorMsg("인증번호가 올바르지 않아요.");
      return;
    }
    router.push(next);
    router.refresh();
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
          {step === "email" ? (
            <form onSubmit={sendCode}>
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
                인증번호 받기 →
              </button>
            </form>
          ) : (
            <form onSubmit={verifyCode}>
              <p className="mb-3 text-xs text-muted">{email}로 전송된 6자리 코드를 입력해주세요</p>
              <input
                type="text"
                inputMode="numeric"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="인증번호 6자리"
                className="w-full rounded-xl border border-line bg-surface px-4 py-3.5 text-center text-sm"
              />
              {errorMsg && <p className="mt-2 text-sm text-energy">{errorMsg}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="mt-3 w-full rounded-xl bg-energy py-3.5 text-sm font-bold text-[#1A0E08] disabled:opacity-40"
              >
                확인
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
