import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "快乐屋 - 多媒体内容平台",
  description: "发现小说、动漫、电视剧、综艺、短剧",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
