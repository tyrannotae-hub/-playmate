import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

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
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
