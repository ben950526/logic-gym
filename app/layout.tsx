import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Logic Gym 謎題本",
  description: "給幼稚園到小四的互動邏輯謎題：數織、一筆畫、數獨，每一題都驗算過答案只有一個。",
  applicationName: "Logic Gym 謎題本",
  appleWebApp: { capable: true, title: "謎題本", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
  themeColor: "#f4eddd",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className="antialiased">{children}</body>
    </html>
  );
}
