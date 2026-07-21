// region_code(예: "seoul-gangnam") → 화면 표시용 한글 지역명(서울 25개 자치구) 매핑
export const REGION_LABEL: Record<string, string> = {
  "seoul-gangnam": "강남구",
  "seoul-gangdong": "강동구",
  "seoul-gangbuk": "강북구",
  "seoul-gangseo": "강서구",
  "seoul-gwanak": "관악구",
  "seoul-gwangjin": "광진구",
  "seoul-guro": "구로구",
  "seoul-geumcheon": "금천구",
  "seoul-nowon": "노원구",
  "seoul-dobong": "도봉구",
  "seoul-dongdaemun": "동대문구",
  "seoul-dongjak": "동작구",
  "seoul-mapo": "마포구",
  "seoul-seodaemun": "서대문구",
  "seoul-seocho": "서초구",
  "seoul-seongdong": "성동구",
  "seoul-seongbuk": "성북구",
  "seoul-songpa": "송파구",
  "seoul-yangcheon": "양천구",
  "seoul-yeongdeungpo": "영등포구",
  "seoul-yongsan": "용산구",
  "seoul-eunpyeong": "은평구",
  "seoul-jongno": "종로구",
  "seoul-jung": "중구",
  "seoul-jungnang": "중랑구",
};

export function regionLabel(code: string | null | undefined): string {
  if (!code) return "";
  return REGION_LABEL[code] ?? code;
}

export const REGION_OPTIONS = Object.entries(REGION_LABEL)
  .map(([code, label]) => ({ code, label }))
  .sort((a, b) => a.label.localeCompare(b.label, "ko"));
