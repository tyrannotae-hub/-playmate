"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TopNav from "@/components/TopNav";
import { createClient } from "@/lib/supabase/client";

const EMAIL_DOMAIN = "playmate.local";

export default function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    const supabase = createClient();

    const { data: email, error: lookupError } = await supabase.rpc(
      "get_login_email",
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
    router.push(next);
    router.refresh();
  }

  async function signup(e: React.FormEvent) {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setErrorMsg("비밀번호가 서로 달라요.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("비밀번호는 6자 이상이어야 해요.");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: `${username}@${EMAIL_DOMAIN}`,
      password,
      options: { data: { username } },
    });

    setSubmitting(false);
    if (error) {
      setErrorMsg(
        error.message.includes("already registered")
          ? "이미 사용 중인 아이디예요."
          : "가입에 실패했어요. 다른 아이디로 시도해주세요."
      );
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function loginWithKakao() {
    setErrorMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) setErrorMsg("카카오 로그인에 실패했어요.");
  }

  const submit = mode === "login" ? login : signup;

  return (
    <>
      <TopNav />
      <main className="flex flex-col items-center px-6 pb-10 pt-16 text-center">
        <div className="text-2xl font-extrabold tracking-tight">
          PlayMate<span className="text-energy">.</span>
        </div>
        <p className="mt-2 text-sm text-muted">아이 체육, 맞춰서 찾다</p>

        <div className="mt-8 flex w-full gap-2">
          <button
            onClick={() => {
              setMode("login");
              setErrorMsg("");
            }}
            className={`flex-1 rounded-full py-2.5 text-sm font-bold ${
              mode === "login" ? "bg-foreground text-background" : "border border-line text-muted"
            }`}
          >
            로그인
          </button>
          <button
            onClick={() => {
              setMode("signup");
              setErrorMsg("");
            }}
            className={`flex-1 rounded-full py-2.5 text-sm font-bold ${
              mode === "signup" ? "bg-foreground text-background" : "border border-line text-muted"
            }`}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 w-full text-left">
          <div className="flex flex-col gap-3">
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              placeholder="아이디"
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
            {mode === "signup" && (
              <input
                type="password"
                required
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호 확인"
                className="w-full rounded-xl border border-line bg-surface px-4 py-3.5 text-sm"
              />
            )}
          </div>

          {errorMsg && <p className="mt-3 text-sm text-energy">{errorMsg}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full rounded-xl bg-energy py-3.5 text-sm font-bold text-[#1A0E08] disabled:opacity-40"
          >
            {mode === "login" ? "로그인" : "가입하고 시작하기"}
          </button>
        </form>

        <div className="mt-5 flex w-full items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-line" />
          또는
          <span className="h-px flex-1 bg-line" />
        </div>

        <button
          onClick={loginWithKakao}
          className="mt-5 w-full rounded-xl bg-[#FEE500] py-3.5 text-sm font-bold text-[#191600]"
        >
          카카오로 시작하기
        </button>

        <p className="mt-6 text-xs leading-relaxed text-muted">
          가입 시 이용약관과 개인정보 처리방침에 동의합니다
        </p>
      </main>
    </>
  );
}
