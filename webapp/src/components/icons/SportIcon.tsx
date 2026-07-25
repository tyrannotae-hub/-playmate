// 종목 아이콘: 선화(라인) 대신 실제 이모지를 써서 여러 색상의 2D 일러스트
// 느낌을 낸다. 플랫폼 내장 이모지 렌더러를 그대로 활용(별도 이미지 에셋 불필요).

type SportIconProps = {
  sportId: string;
  size?: number;
  className?: string;
};

const EMOJI: Record<string, string> = {
  "ice-hockey": "🏒",
  "figure-skating": "⛸️",
  soccer: "⚽",
  baseball: "⚾",
  basketball: "🏀",
  swimming: "🏊",
  "inline-hockey": "🛼",
  rugby: "🏉",
  ballet: "🩰",
  "korean-dance": "💃",
  "modern-dance": "🤸",
  dance: "🕺",
  taekwondo: "🥋",
  tennis: "🎾",
  golf: "🏌️",
  climbing: "🧗",
};

const FALLBACK_EMOJI = "🏅";

export default function SportIcon({ sportId, size = 24, className = "" }: SportIconProps) {
  const emoji = EMOJI[sportId] ?? FALLBACK_EMOJI;
  return (
    <span
      role="img"
      aria-label={sportId}
      style={{ width: size, height: size, fontSize: size * 0.85 }}
      className={`inline-flex shrink-0 items-center justify-center leading-none ${className}`}
    >
      {emoji}
    </span>
  );
}
