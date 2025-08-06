import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BottomNav from '@/components/layout/BottomNav';
import { GlobalActions } from '@/components/layout/GlobalActions';
import { getPlots, getActivityTypes, getRecordCategoryTypes } from '@/lib/data';
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
  title: "我的农场",
  description: "一个现代化的农场管理工具，用于追踪生产周期、农事活动和财务状况。",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png', sizes: '96x96' },
      { url: '/favicon.ico', type: 'image/x-icon' }
    ],
    apple: '/apple-icon.png'
  },
  appleWebApp: {
    title: 'MyFarm',
    statusBarStyle: "black-translucent"
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [plots, activityTypes, recordCategoryTypes] = await Promise.all([
    getPlots(), // Fetch inuse plots
    getActivityTypes(),
    getRecordCategoryTypes(),
  ]);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex flex-col`}
      >
        {children}
        <BottomNav />
        <GlobalActions
          plots={plots}
          activityTypes={activityTypes}
          recordCategoryTypes={recordCategoryTypes}
        />
      </body>
    </html>
  );
}
