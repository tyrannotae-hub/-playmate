// 종목 이모지는 검색/카드 UI 장식용 정적 매핑 (실 데이터는 sports 테이블 참고)
export const SPORT_EMOJI: Record<string, string> = {
  "ice-hockey": "🏒",
  "figure-skating": "⛸️",
};

export function sportEmoji(sportId: string): string {
  return SPORT_EMOJI[sportId] ?? "🏅";
}
