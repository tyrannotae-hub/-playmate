// discount_price + discount_start_date/discount_end_date로 표현되는 클래스 할인을
// "오늘 기준으로 할인이 적용 중인가"로 판정해서 실제 노출 가격을 계산하는 공용 헬퍼.
// 여러 화면(검색결과/홈 카드/클래스 상세)에서 판정 로직이 갈라지지 않도록 여기 하나로 모음.

export type DiscountableClass = {
  price: number;
  discountPrice?: number;
  discountStartDate?: string;
  discountEndDate?: string;
};

function isWithinWindow(startDate: string | undefined, endDate: string | undefined, today: Date): boolean {
  if (!startDate || !endDate) return false;
  const todayIso = today.toISOString().slice(0, 10);
  return todayIso >= startDate && todayIso <= endDate;
}

export function isDiscountActive(item: DiscountableClass, today = new Date()): boolean {
  return item.discountPrice != null && isWithinWindow(item.discountStartDate, item.discountEndDate, today);
}

export function effectivePrice(item: DiscountableClass, today = new Date()): number {
  return isDiscountActive(item, today) ? item.discountPrice! : item.price;
}

// 원데이(체험) 가격 할인. 정가 할인과는 독립적인 자기만의 기간
// (trial_discount_start_date/trial_discount_end_date)을 가진다.
export type TrialDiscountableClass = {
  trialPrice?: number;
  trialDiscountPrice?: number;
  trialDiscountStartDate?: string;
  trialDiscountEndDate?: string;
};

export function isTrialDiscountActive(item: TrialDiscountableClass, today = new Date()): boolean {
  return (
    item.trialPrice != null &&
    item.trialDiscountPrice != null &&
    isWithinWindow(item.trialDiscountStartDate, item.trialDiscountEndDate, today)
  );
}

export function effectiveTrialPrice(
  item: TrialDiscountableClass,
  today = new Date()
): number | undefined {
  if (item.trialPrice == null) return undefined;
  return isTrialDiscountActive(item, today) ? item.trialDiscountPrice! : item.trialPrice;
}
