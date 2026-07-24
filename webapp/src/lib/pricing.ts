// discount_price + discount_start_date/discount_end_date로 표현되는 클래스 할인을
// "오늘 기준으로 할인이 적용 중인가"로 판정해서 실제 노출 가격을 계산하는 공용 헬퍼.
// 여러 화면(검색결과/홈 카드/클래스 상세)에서 판정 로직이 갈라지지 않도록 여기 하나로 모음.

export type DiscountableClass = {
  price: number;
  discountPrice?: number;
  discountStartDate?: string;
  discountEndDate?: string;
};

export function isDiscountActive(item: DiscountableClass, today = new Date()): boolean {
  if (item.discountPrice == null || !item.discountStartDate || !item.discountEndDate) {
    return false;
  }
  const todayIso = today.toISOString().slice(0, 10);
  return todayIso >= item.discountStartDate && todayIso <= item.discountEndDate;
}

export function effectivePrice(item: DiscountableClass, today = new Date()): number {
  return isDiscountActive(item, today) ? item.discountPrice! : item.price;
}

// 할인 중일 때 정가 대비 할인율(%, 내림). 할인 중이 아니면 0.
export function discountPercent(item: DiscountableClass, today = new Date()): number {
  if (!isDiscountActive(item, today) || item.price <= 0) return 0;
  return Math.floor((1 - item.discountPrice! / item.price) * 100);
}
