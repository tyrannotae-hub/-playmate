"use client";

import { useState } from "react";
import TopNav from "@/components/TopNav";
import { createClient } from "@/lib/supabase/client";
import { Booking } from "@/lib/types";

export default function ReviewForm({ booking }: { booking: Booking }) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [nickname, setNickname] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [done, setDone] = useState(false);

  async function submit() {
    setSubmitting(true);
    setErrorMsg("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("reviews").insert({
      booking_id: booking.id,
      parent_id: user.id,
      target_type: "team_class",
      target_id: booking.classId,
      rating,
      content,
      author_label: nickname.trim() || "학부모",
    });

    setSubmitting(false);
    if (error) {
      setErrorMsg("후기 등록에 실패했어요. 이미 작성했는지 확인해주세요.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <>
        <TopNav title="리뷰 작성" back />
        <main className="flex flex-col items-center px-6 pb-10 pt-20 text-center">
          <div className="text-4xl">🙌</div>
          <h2 className="mt-4 text-lg font-bold">후기가 등록됐어요</h2>
          <p className="mt-2 text-sm text-muted">
            소중한 후기 감사합니다, 다른 학부모에게 큰 도움이 돼요.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <TopNav title="리뷰 작성" back />
      <main className="px-4 pb-10 pt-4">
        <p className="text-sm font-bold text-muted">
          {booking.className} · {booking.facilityName}
        </p>

        <div className="mt-5 flex gap-1 text-3xl">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              aria-label={`별점 ${n}점`}
              className={n <= rating ? "text-energy" : "text-line"}
            >
              ★
            </button>
          ))}
        </div>

        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임 (예: 민준맘, 비워두면 '학부모'로 표시)"
          className="mt-4 w-full rounded-xl border border-line bg-surface p-3.5 text-sm"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="후기를 남겨주세요..."
          className="mt-3 w-full rounded-xl border border-line bg-surface p-3.5 text-sm"
          rows={5}
        />

        <p className="mt-3 text-xs text-muted">
          아이 얼굴 노출에 주의해주세요 (모자이크 권장)
        </p>

        {errorMsg && <p className="mt-2 text-sm text-energy">{errorMsg}</p>}

        <button
          onClick={submit}
          disabled={content.trim().length === 0 || submitting}
          className="mt-6 w-full rounded-full bg-energy py-3.5 text-sm font-bold text-[#1A0E08] disabled:opacity-40"
        >
          {submitting ? "등록 중..." : "등록하기"}
        </button>
      </main>
    </>
  );
}
