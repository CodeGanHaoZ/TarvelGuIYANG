import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ScrollReveal } from '@/components/scroll-reveal';
const siteOrigin = process.env.SITE_URL || 'http://localhost:3000';
/* H5 地图应用：禁用页面级缩放，双指手势交给地图（拖拽/缩放）处理 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: 'AI 黔驴 · 下一站，去贵州',
  description:
    '贵州旅行规划：链接生成攻略、地图时间轴、今日游玩指数、路线优化与发现约伴。数据仅供参考。',
  icons: {
    icon: '/qianlv-avatar.png',
  },
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
      <body>
        <ScrollReveal />
        {children}
      </body>
    </html>
  );
}
