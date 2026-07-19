import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "C — 김세아 · 여전히 빈 집에 있습니다",
  description: "기억의 비지속성과 가변성을 탐구하는 영상·라디오 수신기 전시 작품",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
