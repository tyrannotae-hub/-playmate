// 종목 아이콘: BottomNav.tsx와 동일한 스타일(직접 그린 인라인 SVG, 24x24 viewBox,
// stroke="currentColor" 기반 선화, strokeLinecap/strokeLinejoin="round")로 통일.
// 이모지 대신 이 컴포넌트를 사용한다. sportId가 매핑에 없으면 fallback(리본 메달) 아이콘을 그린다.

import type { ReactNode } from "react";

type SportIconProps = {
  sportId: string;
  size?: number;
  className?: string;
};

export default function SportIcon({ sportId, size = 24, className = "" }: SportIconProps) {
  const Glyph = GLYPHS[sportId] ?? FallbackGlyph;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <Glyph />
    </svg>
  );
}

type Glyph = () => ReactNode;

const GLYPHS: Record<string, Glyph> = {
  "ice-hockey": IceHockeyGlyph,
  "figure-skating": FigureSkatingGlyph,
  soccer: SoccerGlyph,
  baseball: BaseballGlyph,
  basketball: BasketballGlyph,
  swimming: SwimmingGlyph,
  "inline-hockey": InlineHockeyGlyph,
  rugby: RugbyGlyph,
  ballet: BalletGlyph,
  "korean-dance": KoreanDanceGlyph,
  "modern-dance": ModernDanceGlyph,
  dance: DanceGlyph,
  taekwondo: TaekwondoGlyph,
  tennis: TennisGlyph,
  golf: GolfGlyph,
  climbing: ClimbingGlyph,
};

// 아이스하키: 스틱 + 퍽
function IceHockeyGlyph() {
  return (
    <>
      <path d="M8 3 12 15q0.6 2 2.6 1.7L18 16" />
      <ellipse cx="18.5" cy="19.5" rx="3" ry="1.3" />
    </>
  );
}

// 피겨스케이팅: 스케이트화 + 곡선 블레이드
function FigureSkatingGlyph() {
  return (
    <>
      <path d="M6 14V9.5Q6 7 8.5 7h5Q16 7 16 9.5V13" />
      <path d="M8.5 7V4.5" />
      <path d="M3.5 16.5Q10 20.5 20 15" />
      <path d="M4.5 15.3 3.5 16.5" />
    </>
  );
}

// 축구: 공(원) + 오각형 패턴
function SoccerGlyph() {
  return (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8 15.8 10.8 14.3 15.2 9.7 15.2 8.2 10.8Z" />
      <path d="M12 8 12 3.5" />
      <path d="M15.8 10.8 20 9" />
      <path d="M14.3 15.2 17 19" />
      <path d="M9.7 15.2 7 19" />
      <path d="M8.2 10.8 4 9" />
    </>
  );
}

// 야구: 공 + 양쪽 실밥 곡선
function BaseballGlyph() {
  return (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M6.5 6.5Q10 12 6.5 17.5" />
      <path d="M17.5 6.5Q14 12 17.5 17.5" />
      <path d="M7.5 8.2 8.6 9" />
      <path d="M7.5 15.8 8.6 15" />
      <path d="M16.5 8.2 15.4 9" />
      <path d="M16.5 15.8 15.4 15" />
    </>
  );
}

// 농구: 공 + 세로선 + 패널 곡선
function BasketballGlyph() {
  return (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18" />
      <path d="M4.7 7Q9 12 4.7 17" />
      <path d="M19.3 7Q15 12 19.3 17" />
    </>
  );
}

// 수영: 물결 + 헤엄치는 사람
function SwimmingGlyph() {
  return (
    <>
      <circle cx="6.5" cy="7" r="2" />
      <path d="M8.7 9.3Q13.5 5 18.5 8.3" />
      <path d="M2 15.5Q4.5 13 7 15.5T12 15.5T17 15.5T22 15.5" />
      <path d="M2 19.5Q4.5 17 7 19.5T12 19.5T17 19.5T22 19.5" />
    </>
  );
}

// 인라인하키: 인라인스케이트(부츠 + 바퀴 3개)
function InlineHockeyGlyph() {
  return (
    <>
      <path d="M5 16V9.5Q5 7 7.5 7h6Q16 7 16 9.5V16" />
      <path d="M16 12h3.5" />
      <path d="M5 16h15" />
      <circle cx="7.5" cy="18.3" r="1.5" />
      <circle cx="12" cy="18.3" r="1.5" />
      <circle cx="16.5" cy="18.3" r="1.5" />
    </>
  );
}

// 럭비: 타원공 + 중앙 솔기 + 레이스
function RugbyGlyph() {
  return (
    <g transform="rotate(-28 12 12)">
      <ellipse cx="12" cy="12" rx="9" ry="5" />
      <path d="M3 12h18" />
      <path d="M8 10v4" />
      <path d="M12 10v4" />
      <path d="M16 10v4" />
    </g>
  );
}

// 발레: 포인트 슈즈 + 리본 크로스
function BalletGlyph() {
  return (
    <>
      <path d="M4.5 18Q4.5 20 7 20h7Q18.5 20 18.5 15.8Q18.5 11.5 13 10.8Q9.5 10.3 7.5 13Q6 15 4.5 18Z" />
      <path d="M9 10 15.5 5.5" />
      <path d="M15 10 8.5 5.5" />
      <circle cx="12" cy="5.3" r="1" />
    </>
  );
}

// 한국무용: 부채(접부채)
function KoreanDanceGlyph() {
  return (
    <>
      <path d="M4 10.5Q12 2.5 20 10.5" />
      <path d="M12 20.5 4 10.5" />
      <path d="M12 20.5 8 8" />
      <path d="M12 20.5 12 6.5" />
      <path d="M12 20.5 16 8" />
      <path d="M12 20.5 20 10.5" />
      <path d="M12 20.5V22.5" />
    </>
  );
}

// 현대무용: 곡선적인 몸짓의 무용수
function ModernDanceGlyph() {
  return (
    <>
      <circle cx="12.5" cy="4.7" r="1.9" />
      <path d="M12 6.6Q9 11 13 15" />
      <path d="M11.5 8.5Q7.5 7 4.5 9.5" />
      <path d="M12.5 9.8Q17 11.5 19 8" />
      <path d="M13 15Q11 19 7.5 20.5" />
      <path d="M13 15Q16.5 17.5 19.5 17" />
    </>
  );
}

// 댄스: 다이나믹한 춤 동작 + 음표
function DanceGlyph() {
  return (
    <>
      <circle cx="8" cy="4.7" r="1.9" />
      <path d="M8 6.6V13" />
      <path d="M8 8.5 3.5 6.5" />
      <path d="M8 9.5 12.5 11.5" />
      <path d="M8 13 4.5 19.5" />
      <path d="M8 13 11.5 18" />
      <path d="M17 6v8.2" />
      <path d="M17 6q3-1 3 2" />
      <ellipse cx="15.6" cy="15" rx="1.6" ry="1.2" transform="rotate(-20 15.6 15)" />
    </>
  );
}

// 태권도: 옆차기 동작 + 도복 띠
function TaekwondoGlyph() {
  return (
    <>
      <circle cx="7" cy="4.7" r="1.9" />
      <path d="M7 6.6 9 13" />
      <path d="M9 13 7 20.5" />
      <path d="M9 13 18 9" />
      <path d="M17 8 18 9 17.3 10.3" />
      <path d="M8 9 4.5 11" />
      <path d="M8.7 10 12 8.3" />
    </>
  );
}

// 테니스: 라켓 + 공
function TennisGlyph() {
  return (
    <>
      <ellipse cx="9.3" cy="8.3" rx="5" ry="6" transform="rotate(-25 9.3 8.3)" />
      <path d="M9.3 2.3v12" transform="rotate(-25 9.3 8.3)" />
      <path d="M4.3 8.3h10" transform="rotate(-25 9.3 8.3)" />
      <path d="M12.7 13.5 18 19" />
      <path d="M17 18 19.5 20.5" />
      <circle cx="19" cy="6" r="2" />
    </>
  );
}

// 골프: 클럽 + 공
function GolfGlyph() {
  return (
    <>
      <path d="M7 21.5 14 4" />
      <path d="M14 4 17.5 5.3 16 8.7 12.6 8.2Z" />
      <path d="M2.5 21.5h9" />
      <circle cx="18.5" cy="19" r="1.8" />
    </>
  );
}

// 클라이밍: 벽면 + 홀드를 잡고 오르는 사람
function ClimbingGlyph() {
  return (
    <>
      <path d="M3 2v20" />
      <circle cx="14" cy="4.5" r="1.9" />
      <path d="M13 6.3 10.5 11" />
      <path d="M10.5 11 7 8" />
      <circle cx="6.3" cy="7.3" r="1.1" />
      <path d="M10.5 11 14.5 9" />
      <circle cx="15.5" cy="8.3" r="1.1" />
      <path d="M10.5 11 8 17" />
      <circle cx="7.3" cy="18" r="1.1" />
      <path d="M10.5 11 13.5 16.5" />
      <circle cx="14.5" cy="17.5" r="1.1" />
    </>
  );
}

function FallbackGlyph() {
  return (
    <>
      <circle cx="12" cy="9" r="5.5" />
      <path d="M9 13.8 7 21l5-2.5L17 21l-2-7.2" />
    </>
  );
}
