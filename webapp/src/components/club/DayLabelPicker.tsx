"use client";

const DAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;

// day_label을 항상 "월,수,금"처럼 콤마로 구분된 축약 요일 문자로만 저장하기 위한
// 다중 선택 버튼. 예전엔 자유 텍스트 입력이라 "화·목"/"토요일"처럼 표기가 제각각이라
// 요일 매칭 로직에서 버그가 났었음(퍼핀스 목동 토요일 스케줄이 일요일 필터에도 걸리던 문제).
export default function DayLabelPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const selected = new Set(value ? value.split(",") : []);

  function toggle(day: (typeof DAYS)[number]) {
    const next = new Set(selected);
    if (next.has(day)) next.delete(day);
    else next.add(day);
    onChange(DAYS.filter((d) => next.has(d)).join(","));
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {DAYS.map((d) => {
        const isSelected = selected.has(d);
        return (
          <button
            key={d}
            type="button"
            onClick={() => toggle(d)}
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium transition ${
              isSelected ? "bg-rink text-white" : "text-foreground"
            }`}
          >
            {d}
          </button>
        );
      })}
    </div>
  );
}
