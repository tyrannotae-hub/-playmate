"use client";

import { useState } from "react";
import TopNav from "@/components/TopNav";
import { Booking } from "@/lib/types";

export default function ReviewForm({ booking }: { booking: Booking }) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [done, setDone] = useState(false);

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

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="후기를 남겨주세요..."
          className="mt-5 w-full rounded-xl border border-line bg-surface p-3.5 text-sm"
          rows={5}
        />

        <button
          type="button"
          className="mt-3 rounded-full border border-line px-4 py-2 text-sm font-bold text-muted"
        >
          📷 사진 추가
        </button>
        <p className="mt-2 text-xs text-muted">
          아이 얼굴 노출에 주의해주세요 (모자이크 권장)
        </p>

        <button
          onClick={() => setDone(true)}
          disabled={content.trim().length === 0}
          className="mt-6 w-full rounded-full bg-energy py-3.5 text-sm font-bold text-[#1A0E08] disabled:opacity-40"
        >
          등록하기
        </button>
      </main>
    </>
  );
}
