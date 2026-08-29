'use client';
import { useEffect, useState } from 'react';
import { ArrowUp } from '@/components/travel-icons';

export function BackToTop({ threshold = 400 }: { threshold?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > threshold);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      className={'back-to-top' + (visible ? ' is-visible' : '')}
      onClick={scrollToTop}
      aria-label="回到顶部"
    >
      <ArrowUp size={20} />
    </button>
  );
}
