import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AppShell from "@/components/AppShell";

// 본문용 그로테스크 — 브라우저 로컬 폰트에만 기대지 않도록 직접 셀프호스팅한다.
const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

// 제목/배너용 디스플레이 폰트 — SemiBold(배너)/Bold(그 외 제목)를 한 family로 묶어
// font-weight로 자동 선택되게 한다.
const paperlogy = localFont({
  src: [
    { path: "../fonts/Paperlogy-SemiBold.woff2", weight: "600 650", style: "normal" },
    { path: "../fonts/Paperlogy-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-paperlogy",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PlayMate — 아이에게 맞는 운동을 찾는 가장 빠른 길",
  description:
    "체육시설·강사·클럽팀을 비교하고 후기를 확인하고 등록까지. 아이스하키부터 시작하는 어린이 체육 매칭 서비스, 플레이메이트.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`h-full antialiased ${pretendard.variable} ${paperlogy.variable}`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
