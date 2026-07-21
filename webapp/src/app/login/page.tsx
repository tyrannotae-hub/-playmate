"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");

  return (
    <>
      <TopNav />
      <main className="flex flex-col items-center px-6 pb-10 pt-16 text-center">
        <div className="text-2xl font-extrabold tracking-tight">
          PlayMate<span className="text-energy">.</span>
        </div>
        <p className="mt-2 text-sm text-muted">아이 체육, 맞춰서 찾다</p>

        <div className="mt-10 w-full">
          {step === "phone" ? (
            <>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="휴대폰 번호 입력"
                className="w-full rounded-xl border border-line bg-surface px-4 py-3.5 text-center text-sm"
              />
              <button
                disabled={phone.trim().length < 9}
                onClick={() => setStep("code")}
                className="mt-3 w-full rounded-xl bg-energy py-3.5 text-sm font-bold text-[#1A0E08] disabled:opacity-40"
              >
                인증번호 받기 →
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="인증번호 6자리"
                className="w-full rounded-xl border border-line bg-surface px-4 py-3.5 text-center text-sm"
              />
              <button
                disabled={code.trim().length < 4}
                onClick={() => router.push("/")}
                className="mt-3 w-full rounded-xl bg-energy py-3.5 text-sm font-bold text-[#1A0E08] disabled:opacity-40"
              >
                확인
              </button>
            </>
          )}
        </div>

        <p className="mt-6 text-xs leading-relaxed text-muted">
          가입 시 이용약관과 개인정보 처리방침에 동의합니다
        </p>
      </main>
    </>
  );
}
