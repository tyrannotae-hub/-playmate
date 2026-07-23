// 클래스의 dayLabel(예: "월·수·금")을 기반으로 실제 캘린더 날짜를 계산하는 헬퍼.
// 체험(원데이) 신청 시 "이번주/다음주 중 어느 날에 올지" 학부모가 직접 골라야 해서 필요함.
// dayLabel 파싱 방식은 facilities/[id]/page.tsx의 buildWeeklySchedule()과 동일하게
// /[·,\s]+/ 로 분리한다.

const DAY_CHARS = ["월", "화", "수", "목", "금", "토", "일"] as const;
type DayChar = (typeof DAY_CHARS)[number];

// JS Date.getDay(): 0=일 ~ 6=토. 요일 문자 -> getDay() 값 매핑.
const DAY_CHAR_TO_JS_DAY: Record<DayChar, number> = {
  일: 0,
  월: 1,
  화: 2,
  수: 3,
  목: 4,
  금: 5,
  토: 6,
};

export function parseDayLabel(dayLabel: string): DayChar[] {
  return dayLabel
    .split(/[·,\s]+/)
    .map((d) => d.trim())
    .filter((d): d is DayChar => (DAY_CHARS as readonly string[]).includes(d));
}

// dayLabel의 요일 패턴에 맞는, 오늘부터 향후 weeks주(기본 4주 ≈ 28일) 이내의
// 실제 날짜들을 오름차순으로 반환한다. 오늘도 해당 요일이면 포함한다.
export function upcomingDatesForDayLabel(dayLabel: string, weeks = 4): Date[] {
  const targetDays = new Set(parseDayLabel(dayLabel).map((d) => DAY_CHAR_TO_JS_DAY[d]));
  if (targetDays.size === 0) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates: Date[] = [];
  const totalDays = weeks * 7;
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (targetDays.has(d.getDay())) {
      dates.push(d);
    }
  }
  return dates;
}

const DAY_CHARS_BY_JS_DAY: DayChar[] = ["일", "월", "화", "수", "목", "금", "토"];

// "7/28(월)" 형식으로 표시
export function formatKoreanShortDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}(${DAY_CHARS_BY_JS_DAY[date.getDay()]})`;
}

export function formatIsoDateToKoreanShort(iso: string): string {
  // "2026-07-28" 같은 date-only 문자열을 로컬 타임존 기준으로 파싱(new Date(iso)는 UTC로
  // 해석돼 하루 밀릴 수 있어 연-월-일을 직접 분해한다).
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return formatKoreanShortDate(new Date(y, m - 1, d));
}
