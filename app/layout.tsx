import type { Metadata } from 'next';
import './globals.css';
const siteOrigin = process.env.SITE_URL || 'http://localhost:3000';
export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: 'AI 黔驴 · 下一站，去贵州',
  description:
    '贵州旅行规划：链接生成攻略、地图时间轴、今日游玩指数、路线优化与发现约伴。数据仅供参考。',
  openGraph: {
    title: 'AI 黔驴 · 下一站，去贵州',
    description: '山水与烟火之间，找到属于你的旅行节奏。',
    locale: 'zh_CN',
    type: 'website',
    images: [
      {
        url: new URL('/og.png', siteOrigin).href,
        alt: 'AI 黔驴 · 下一站，去贵州',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI 黔驴 · 下一站，去贵州',
    description: '山水与烟火之间，找到属于你的旅行节奏。',
    images: [new URL('/og.png', siteOrigin).href],
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-theme="coral" data-icon-set="line">
      <body>{children}</body>
    </html>
  );
}
