"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import SportIcon from "@/components/icons/SportIcon";
import { Sport } from "@/lib/types";
import { buttonClass } from "@/lib/ui";

const TRAIT_OPTIONS = [
  "에너지 넘치고 활동적",
  "차분하고 집중력 좋음",
  "사교적, 친구와 잘 어울림",
  "승부욕이 강한 편",
  "표현하는 걸 좋아함",
];

const PARENT_GOAL_OPTIONS = [
  "체력을 길렀으면 해요",
  "친구를 사귀었으면 해요",
  "전문적으로 배웠으면 해요",
  "그냥 재미있게 즐겼으면 해요",
  "차분함과 집중력을 길렀으면 해요",
];

const ABILITY_OPTIONS = [
  "운동은 거의 처음이에요",
  "몸을 잘 쓰는 편이에요",
  "이 종목 계열을 배워본 적 있어요",
  "운동 신경이 좋고 승부욕도 있어요",
];

const STEPS = [
  { key: "trait", title: "우리 아이는 평소에\n어떤 편인가요?", options: TRAIT_OPTIONS },
  { key: "goal", title: "부모님은 어떤 걸\n기대하세요?", options: PARENT_GOAL_OPTIONS },
  { key: "ability", title: "아이의 운동 능력이나\n경력은 어느 정도인가요?", options: ABILITY_OPTIONS },
] as const;

export default function RecommendClient({
  sports,
  classCounts,
}: {
  sports: Sport[];
  classCounts: Record<string, number>;
}) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const showResult = step === STEPS.length;

  function toggle(option: string) {
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((t) => t !== option) : [...prev, option]
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

  if (showResult) {
    const [top, ...rest] = ranked;

    return (
      <>
        <TopNav title="추천 결과" back />
        <main className="px-4 pb-10 pt-4">
          <h2 className="mb-5 text-lg font-bold leading-snug">
            우리 아이에게 이런 운동을
            <br />
            추천해요
          </h2>

          {top && (
            <Link
              href={`/search?sport=${top.sport.id}`}
              className="block rounded-md border-2 border-rink bg-rink-soft p-5 transition hover:opacity-90"
            >
              <p className="btn-label text-xs font-bold text-rink-deep">가장 잘 맞아요</p>
              <div className="mt-2 flex items-center gap-2 text-rink-deep">
                <SportIcon sportId={top.sport.id} size={32} />
                <span className="text-xl font-extrabold">{top.sport.name}</span>
              </div>
              <p className="mt-2 text-sm text-rink-deep">{top.sport.traits.join(" · ")}</p>
              <p className="mt-3 text-sm font-bold text-rink-deep">
                이 지역 클래스 {classCounts[top.sport.id] ?? 0}개 보기 →
              </p>
            </Link>
          )}

          {rest.length > 0 && (
            <div className="mt-5 flex flex-col divide-y divide-line border-y border-line">
              {rest.map(({ sport, score }) => (
                <Link
                  key={sport.id}
                  href={`/search?sport=${sport.id}`}
                  className="flex items-center gap-3 py-3.5"
                >
                  <SportIcon sportId={sport.id} size={24} className="shrink-0 text-rink-deep" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{sport.name}</p>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-rink"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-muted tabular-nums">
                    {classCounts[sport.id] ?? 0}개
                  </span>
                </Link>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              setStep(0);
              setSelected([]);
            }}
            className={buttonClass({ variant: "outline", className: "mt-6" })}
          >
            다시 선택할래요
          </button>
        </main>
      </>
    );
  }

  const current = STEPS[step];

  return (
    <>
      <TopNav title="종목 추천" back />
      <main className="px-4 pb-10 pt-4">
        <p className="mb-1 text-xs font-bold text-energy">
          {step + 1}/{STEPS.length}
        </p>
        <h2 className="mb-6 whitespace-pre-line text-lg font-bold leading-snug">
          {current.title}
        </h2>

        <div className="flex flex-col gap-2.5">
          {current.options.map((option) => {
            const active = selected.includes(option);
            return (
              <button
                key={option}
                onClick={() => toggle(option)}
                className={`rounded-md border px-4 py-3.5 text-left text-sm font-semibold transition ${
                  active
                    ? "border-rink bg-rink-soft text-rink-deep"
                    : "border-line bg-surface text-foreground"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted">복수 선택 가능</p>

        <div className="mt-8 flex flex-col gap-2.5">
          <button onClick={() => setStep((s) => s + 1)} className={buttonClass()}>
            {step === STEPS.length - 1 ? "결과 보기 →" : "다음 →"}
          </button>
          <button
            onClick={() => setStep((s) => s + 1)}
            className={buttonClass({ variant: "outline" })}
          >
            잘 모르겠어요, 건너뛸게요
          </button>
        </div>
      </main>
    </>
  );
}
