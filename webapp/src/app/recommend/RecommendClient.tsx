"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import { Sport } from "@/lib/types";

const TRAIT_OPTIONS = [
  "에너지 넘치고 활동적",
  "차분하고 집중력 좋음",
  "사교적, 친구와 잘 어울림",
  "승부욕이 강한 편",
  "표현하는 걸 좋아함",
];

export default function RecommendClient({
  sports,
  classCounts,
}: {
  sports: Sport[];
  classCounts: Record<string, number>;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(trait: string) {
    setSelected((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait]
    );
  }

  const ranked = useMemo(() => {
    return sports
      .map((sport) => {
        const overlap = sport.traits.filter((t) =>
          selected.some((s) => s.includes(t) || t.includes(s.slice(0, 2)))
        ).length;
        const score = Math.round(
          (overlap / Math.max(sport.traits.length, 1)) * 60 + 35
        );
        return { sport, score: Math.min(score, 97) };
      })
      .sort((a, b) => b.score - a.score);
  }, [sports, selected]);

  if (step === 2) {
    return (
      <>
        <TopNav title="추천 결과" back />
        <main className="px-4 pb-10 pt-4">
          <h2 className="mb-5 text-lg font-bold leading-snug">
            우리 아이에게 이런 운동을
            <br />
            추천해요
          </h2>
          <div className="flex flex-col gap-3">
            {ranked.map(({ sport, score }) => (
              <Link
                key={sport.id}
                href={`/search?sport=${sport.id}`}
                className="block rounded-2xl border border-line bg-surface p-4 hover:border-rink"
              >
                <div className="flex items-center justify-between">
                  <div className="text-base font-bold">
                    {sport.emoji} {sport.name}
                  </div>
                  <span className="rounded-full bg-rink-soft px-2.5 py-1 text-xs font-bold text-rink-deep tabular-nums">
                    {score}% 맞음
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-muted">{sport.traits.join(" · ")}</p>
                <p className="mt-2 text-sm font-semibold text-rink-deep">
                  이 지역 클래스 {classCounts[sport.id] ?? 0}개 →
                </p>
              </Link>
            ))}
          </div>
          <button
            onClick={() => setStep(1)}
            className="mt-6 w-full rounded-full border border-line py-3 text-sm font-bold text-muted"
          >
            다시 선택할래요
          </button>
        </main>
      </>
    );
  }

  return (
    <>
      <TopNav title="종목 추천" back />
      <main className="px-4 pb-10 pt-4">
        <p className="mb-1 text-xs font-bold text-energy">1/1 · 성향</p>
        <h2 className="mb-6 text-lg font-bold leading-snug">
          우리 아이는 평소에
          <br />
          어떤 편인가요?
        </h2>

        <div className="flex flex-col gap-2.5">
          {TRAIT_OPTIONS.map((trait) => {
            const active = selected.includes(trait);
            return (
              <button
                key={trait}
                onClick={() => toggle(trait)}
                className={`rounded-xl border px-4 py-3.5 text-left text-sm font-semibold transition ${
                  active
                    ? "border-rink bg-rink-soft text-rink-deep"
                    : "border-line bg-surface text-foreground"
                }`}
              >
                {trait}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted">복수 선택 가능</p>

        <button
          disabled={selected.length === 0}
          onClick={() => setStep(2)}
          className="mt-8 w-full rounded-full bg-energy py-3.5 text-sm font-bold text-[#1A0E08] disabled:opacity-40"
        >
          다음 →
        </button>
      </main>
    </>
  );
}
