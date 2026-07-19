import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "邏輯思考練功平台 | Logic Gym",
  description: "每天動動腦，解謎練邏輯",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
