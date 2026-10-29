import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PICK ONE",
  description: "질문 하나, 선택지 3개로 만드는 투표",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col items-center bg-zinc-50 px-4 py-12 dark:bg-black">
        <main className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-950">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">PICK ONE</h1>
          {children}
        </main>
      </body>
    </html>
  );
}
