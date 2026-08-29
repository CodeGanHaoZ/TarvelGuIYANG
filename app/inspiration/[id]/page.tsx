import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { socialPosts } from '@/lib/travel';
import { SocialContentPage } from '@/components/social-content-page';

export function generateStaticParams() {
  return socialPosts.map((post) => ({ id: post.id }));
}

type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = socialPosts.find((p) => p.id === id);
  if (!post)
    return {
      title: '内容不存在 · AI 黔驴',
      openGraph: { images: [] },
      twitter: { images: [] },
    };
  const origin = process.env.SITE_URL || 'http://localhost:3000';
  const image = new URL(post.cover, origin).href;
  return {
    title: post.title + ' · AI 黔驴',
    description: post.intro,
    openGraph: {
      title: post.title,
      description: post.intro,
      type: 'article',
      images: [{ url: image, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.intro,
      images: [image],
    },
  };
}
export default async function InspirationPage({ params }: Props) {
  const { id } = await params;
  const post = socialPosts.find((p) => p.id === id);
  if (!post) notFound();
  return <SocialContentPage post={post} />;
}
