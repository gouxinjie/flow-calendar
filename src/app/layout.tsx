import type { Metadata } from "next";
import { Manrope, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const notoSansSc = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lime Calendar | 青柠日历",
  description: "面向手机浏览器的月历式生活记录产品，用月历留住已经发生的事。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${notoSansSc.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <noscript>
          <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#F3FAF7] px-6">
            <p className="text-[#1F2A2A] text-[16px] font-medium">请启用 JavaScript</p>
            <p className="mt-2 text-[#6B7A7A] text-[14px]">青柠日历 需要 JavaScript 才能运行</p>
          </div>
        </noscript>
      </body>
    </html>
  );
}
