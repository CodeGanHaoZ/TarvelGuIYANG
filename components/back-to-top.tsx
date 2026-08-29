'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from '@/components/travel-icons';

export function BackToTop({ threshold = 400 }: { threshold?: number }) {
  const [visible, setVisible] = useState(false);
  const awaitingTopRef = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > threshold);
      // 返回顶部完成后重置滚动揭示动画
      if (awaitingTopRef.current && window.scrollY <= 8) {
        awaitingTopRef.current = false;
        window.dispatchEvent(new Event('scroll-reveal:reset'));
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  const scrollToTop = () => {
    awaitingTopRef.current = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // 兜底：若用户在途中滚动取消、或 smooth 异常，500ms 后清掉标记
    setTimeout(() => {
      if (window.scrollY > 8) awaitingTopRef.current = false;
    }, 1500);
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
