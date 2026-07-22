// Spotify에서 차용한 pill 버튼 geometry(무조건 rounded-full)와 그림자 기반 카드 입체감을
// 앱 전체에서 일관되게 쓰기 위한 클래스 조합 헬퍼. 한글 UI라 uppercase는 의미가 없어서
// 대신 살짝 넓은 letter-spacing(.btn-label)으로 "시스템 라벨" 느낌만 차용.

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "custom";
type ButtonSize = "md" | "sm";

const BUTTON_SIZES: Record<ButtonSize, string> = {
  md: "px-5 py-3.5 text-sm",
  sm: "px-3.5 py-2 text-xs",
};

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-energy text-[#1a0e08]",
  secondary: "bg-foreground text-background",
  outline: "border border-line text-muted",
  ghost: "text-muted",
  custom: "",
};

export function buttonClass({
  variant = "primary",
  size = "md",
  className = "",
  full = true,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  full?: boolean;
} = {}) {
  return [
    "btn-label inline-flex items-center justify-center gap-1.5 rounded-full font-bold transition disabled:opacity-40 disabled:pointer-events-none",
    full ? "w-full" : "",
    BUTTON_SIZES[size],
    BUTTON_VARIANTS[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function cardClass(className = "") {
  return ["rounded-2xl border border-line bg-surface p-4 shadow-card", className]
    .filter(Boolean)
    .join(" ");
}

// 박스(테두리+그림자) 대신 얇은 구분선으로만 항목을 나누는 리스트 로우.
// 클래스101/에이블리처럼 "카드 그리드"가 아니라 "구획을 나눈 게시물 목록" 느낌을 낼 때 사용.
export function listRowClass(className = "") {
  return ["border-b border-line py-4 first:pt-0 last:border-b-0", className]
    .filter(Boolean)
    .join(" ");
}
