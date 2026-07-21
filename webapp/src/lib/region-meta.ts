// region_code(예: "seoul-gangnam") → 화면 표시용 한글 지역명 매핑
export const REGION_LABEL: Record<string, string> = {
  "seoul-gangnam": "강남",
  "seoul-guro": "구로",
  "seoul-mokdong": "목동",
};

export function regionLabel(code: string | null | undefined): string {
  if (!code) return "";
  return REGION_LABEL[code] ?? code;
}
