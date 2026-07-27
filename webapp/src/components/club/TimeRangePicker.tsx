"use client";

// 시작/종료 시간을 자유 텍스트로 입력받으면 "16시", "4:00pm", "16:00~18:00" 등
// 표기가 제각각이라 timeSlotOf() 같은 파싱 로직이 깨지기 쉬웠다. DayLabelPicker와
// 같은 이유로, 30분 단위 선택지 중에서만 고르게 해서 "HH:MM - HH:MM" 형식을 강제한다.
const TIME_OPTIONS = Array.from({ length: (22 - 6) * 2 + 1 }, (_, i) => {
  const totalMinutes = 6 * 60 + i * 30;
  const h = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const m = String(totalMinutes % 60).padStart(2, "0");
  return `${h}:${m}`;
});

function parseRange(value: string): { start: string; end: string } {
  const [start = "", end = ""] = value.split(" - ").map((v) => v.trim());
  return { start, end };
}

export default function TimeRangePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { start, end } = parseRange(value);

  function handleStart(next: string) {
    onChange(end ? `${next} - ${end}` : next);
  }

  function handleEnd(next: string) {
    onChange(start ? `${start} - ${next}` : next);
  }

  return (
    <div className="flex items-center gap-2">
      <select
        required
        value={start}
        onChange={(e) => handleStart(e.target.value)}
        className="w-full rounded-xs border border-line bg-background px-3.5 py-3 text-sm"
      >
        <option value="" disabled>
          시작 시간
        </option>
        {TIME_OPTIONS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <span className="shrink-0 text-muted">~</span>
      <select
        required
        value={end}
        onChange={(e) => handleEnd(e.target.value)}
        className="w-full rounded-xs border border-line bg-background px-3.5 py-3 text-sm"
      >
        <option value="" disabled>
          종료 시간
        </option>
        {TIME_OPTIONS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}
