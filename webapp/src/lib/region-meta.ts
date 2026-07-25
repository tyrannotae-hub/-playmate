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
  // 경기도 31개 시・군. 서울 자치구와 헷갈리지 않도록 "경기 " 접두어를 붙임.
  "gyeonggi-suwon": "경기 수원시",
  "gyeonggi-seongnam": "경기 성남시",
  "gyeonggi-goyang": "경기 고양시",
  "gyeonggi-yongin": "경기 용인시",
  "gyeonggi-bucheon": "경기 부천시",
  "gyeonggi-ansan": "경기 안산시",
  "gyeonggi-anyang": "경기 안양시",
  "gyeonggi-namyangju": "경기 남양주시",
  "gyeonggi-hwaseong": "경기 화성시",
  "gyeonggi-pyeongtaek": "경기 평택시",
  "gyeonggi-uijeongbu": "경기 의정부시",
  "gyeonggi-siheung": "경기 시흥시",
  "gyeonggi-paju": "경기 파주시",
  "gyeonggi-gimpo": "경기 김포시",
  "gyeonggi-gwangmyeong": "경기 광명시",
  "gyeonggi-gwangju": "경기 광주시",
  "gyeonggi-gunpo": "경기 군포시",
  "gyeonggi-icheon": "경기 이천시",
  "gyeonggi-yangju": "경기 양주시",
  "gyeonggi-osan": "경기 오산시",
  "gyeonggi-guri": "경기 구리시",
  "gyeonggi-anseong": "경기 안성시",
  "gyeonggi-pocheon": "경기 포천시",
  "gyeonggi-uiwang": "경기 의왕시",
  "gyeonggi-hanam": "경기 하남시",
  "gyeonggi-yeoju": "경기 여주시",
  "gyeonggi-dongducheon": "경기 동두천시",
  "gyeonggi-gwacheon": "경기 과천시",
  "gyeonggi-yangpyeong": "경기 양평군",
  "gyeonggi-gapyeong": "경기 가평군",
  "gyeonggi-yeoncheon": "경기 연천군",
};

// 클래스가 실제로 매칭돼야 할 지역 코드 목록. 클래스 자체에 region_code가
// 지정돼 있으면 그것만(한 시설이 여러 지점을 운영할 수 있어서 시설 전체
// 지역으로 잡으면 안 됨), 없으면 예전처럼 시설의 다중 지역(facility_regions)
// 전부를 후보로 본다.
export function classRegionCodes(item: {
  regionCode?: string;
  facility: { regions: string[] };
}): string[] {
  return item.regionCode ? [item.regionCode] : item.facility.regions;
}

export function regionLabel(code: string | null | undefined): string {
  if (!code) return "";
  return REGION_LABEL[code] ?? code;
}

export const REGION_OPTIONS = Object.entries(REGION_LABEL)
  .map(([code, label]) => ({ code, label }))
  .sort((a, b) => a.label.localeCompare(b.label, "ko"));
