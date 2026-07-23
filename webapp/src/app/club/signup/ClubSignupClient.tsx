"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { buttonClass } from "@/lib/ui";

const EMAIL_DOMAIN = "club.playmate.local";

function isValidPassword(pw: string): boolean {
  return pw.length >= 8 && /[A-Za-z]/.test(pw) && /[0-9]/.test(pw);
}

export default function ClubSignupClient() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [ownerType, setOwnerType] = useState<"club" | "solo_coach">("club");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function signup(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (password !== passwordConfirm) {
      setErrorMsg("비밀번호가 서로 달라요.");
      return;
    }
    if (!isValidPassword(password)) {
      setErrorMsg("비밀번호는 영문+숫자 포함 8자 이상이어야 해요.");
      return;
    }
    if (!name.trim()) {
      setErrorMsg("이름(클럽명 또는 코치 이름)을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    const { data: signedUp, error: signUpError } = await supabase.auth.signUp({
      email: `${username}@${EMAIL_DOMAIN}`,
      password,
    });

    if (signUpError || !signedUp.user) {
      setSubmitting(false);
      setErrorMsg(
        signUpError?.message.includes("already registered")
          ? "이미 사용 중인 아이디예요."
          : "가입 신청에 실패했어요. 다른 아이디로 시도해주세요."
      );
      return;
    }

    const { error: requestError } = await supabase.from("club_signup_requests").insert({
      auth_user_id: signedUp.user.id,
      username,
      name: name.trim(),
      owner_type: ownerType,
    });

    // 로그인 상태로 둬봤자 club_owners 행이 없어서 아무 화면도 못 들어가니, 결과와 무관하게
    // 바로 로그아웃시키고 승인 후 /club/login으로 다시 로그인하게 유도한다.
    await supabase.auth.signOut();

    setSubmitting(false);

    if (requestError) {
      setErrorMsg("가입 신청 접수에 실패했어요. 다시 시도해주세요.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="flex flex-col items-center px-6 pb-10 pt-16 text-center">
        <div className="text-2xl font-extrabold tracking-tight">
          PlayMate<span className="text-energy">.</span> 클래스관리센터
        </div>
        <p className="mt-6 text-base font-bold">신청이 접수됐어요</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          운영자 검토 후 승인되면 신청하신 아이디로
          <br />
          로그인하실 수 있어요.
        </p>
        <Link href="/club/login" className={buttonClass({ variant: "outline", className: "mt-8" })}>
          로그인 화면으로
        </Link>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center px-6 pb-10 pt-16 text-center">
      <div className="text-2xl font-extrabold tracking-tight">
        PlayMate<span className="text-energy">.</span> 클래스관리센터
      </div>
      <p className="mt-2 text-sm text-muted">클럽·개인 코치 가입 신청</p>

      <form onSubmit={signup} className="mt-8 w-full text-left">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOwnerType("club")}
              className={buttonClass({
                variant: ownerType === "club" ? "secondary" : "outline",
                size: "sm",
                full: false,
                className: "flex-1 py-2.5 text-sm",
              })}
            >
              클럽/팀
            </button>
            <button
              type="button"
              onClick={() => setOwnerType("solo_coach")}
              className={buttonClass({
                variant: ownerType === "solo_coach" ? "secondary" : "outline",
                size: "sm",
                full: false,
                className: "flex-1 py-2.5 text-sm",
              })}
            >
              개인 코치
            </button>
          </div>

          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={ownerType === "club" ? "클럽/팀 이름" : "코치 이름"}
            className="w-full rounded-md border border-line bg-surface px-4 py-3.5 text-sm"
          />
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value.trim())}
            placeholder="아이디"
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
          <p className="-mt-1 text-left text-xs text-muted">영문+숫자 포함 8자 이상</p>
          <input
            type="password"
            required
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="비밀번호 확인"
            className="w-full rounded-md border border-line bg-surface px-4 py-3.5 text-sm"
          />
        </div>

        {errorMsg && <p className="mt-3 text-sm text-negative">{errorMsg}</p>}

        <button
          type="submit"
          disabled={submitting}
          className={buttonClass({ variant: "custom", className: "mt-4 bg-rink text-white" })}
        >
          가입 신청하기
        </button>
      </form>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        신청 후 운영자 승인이 필요해요.
        <br />
        이미 계정이 있으신가요?{" "}
        <Link href="/club/login" className="font-bold text-rink">
          로그인
        </Link>
      </p>
    </main>
  );
}
