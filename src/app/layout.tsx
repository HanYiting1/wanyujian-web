import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "万语鉴 · 多语言跨文化 AI 风险预检",
    template: "%s · 万语鉴",
  },
  description:
    "面向涉外品牌的多语言跨文化 AI 风险预检工作台。上传文案，选择目标市场，提前识别文化误读、表达歧义与合规风险。",
  applicationName: "万语鉴",
  keywords: ["跨文化传播", "多语言", "内容合规", "品牌出海", "AI 风险预检"],
};

export const viewport: Viewport = {
  themeColor: "#071e2a",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
