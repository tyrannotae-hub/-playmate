// 종목 아이콘: 플랫폼 기본 이모지는 기기마다(특히 iOS) 입체감 있는 글로시
// 렌더링이라, 대신 Twemoji(트위터 오픈소스 이모지, 그림자/그라디언트 없는
// 완전 평면 2D 벡터 스타일) SVG를 이미지로 붙여서 기기와 무관하게 항상 같은
// 납작한 룩으로 보이게 한다. 버전 고정(15.0.0)으로 CDN 경로가 갑자기
// 바뀌는 것을 방지.
const TWEMOJI_BASE = "https://cdn.jsdelivr.net/npm/@twemoji/svg@15.0.0";

type SportIconProps = {
  sportId: string;
  size?: number;
  className?: string;
};

// 이모지 유니코드 코드포인트(소문자 16진수, 여러 개면 "-"로 연결) — Twemoji
// 파일명 규칙과 동일.
const CODEPOINT: Record<string, string> = {
  "ice-hockey": "1f3d2", // 🏒
  "figure-skating": "26f8", // ⛸
  soccer: "26bd", // ⚽
  baseball: "26be", // ⚾
  basketball: "1f3c0", // 🏀
  swimming: "1f3ca", // 🏊
  "inline-hockey": "1f6fc", // 🛼
  rugby: "1f3c9", // 🏉
  ballet: "1fa70", // 🩰
  "korean-dance": "1f483", // 💃
  "modern-dance": "1f938", // 🤸
  dance: "1f57a", // 🕺
  taekwondo: "1f94b", // 🥋
  tennis: "1f3be", // 🎾
  golf: "26f3", // ⛳
  climbing: "1f9d7", // 🧗
};

const FALLBACK_CODEPOINT = "1f3c5"; // 🏅

export default function SportIcon({ sportId, size = 24, className = "" }: SportIconProps) {
  const codepoint = CODEPOINT[sportId] ?? FALLBACK_CODEPOINT;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${TWEMOJI_BASE}/${codepoint}.svg`}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`inline-block shrink-0 ${className}`}
    />
  );
}
