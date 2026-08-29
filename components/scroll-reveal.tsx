'use client';

import { useEffect } from 'react';

/**
 * ScrollReveal - 滚动揭示动效
 *
 * 选择器约定：
 *  - .reveal-on-scroll：单个元素进入视口时淡入上滑
 *  - [data-reveal]：同上（方便在不写 class 的场景使用）
 *  - .reveal-stagger：容器进入视口后子项依次错落淡入上滑
 *  - .stagger-children：同 .reveal-stagger
 *  - .reveal-children：容器本身立即出现，直接子项**逐个**进入视口时各自淡入上滑
 *    （适合时间轴、长列表这类长滚动容器；每个子项独立观察）
 *
 * 全局入口：
 *  - window.__scrollRevealRefresh()：重新扫描 DOM（DOM 变化后手动调用）
 *  - window.__scrollRevealReset()：重置所有已揭示元素，下次滚动重新播放
 *  - 派发 'scroll-reveal:reset' 事件可触发同样的重置
 */
export function ScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealAll = () => {
      document
        .querySelectorAll<HTMLElement>(
          '.reveal-on-scroll, [data-reveal], .reveal-stagger, .stagger-children, .reveal-children > *',
        )
        .forEach((el) => {
          el.classList.add('is-visible', 'is-revealed');
        });
    };

    if (reduceMotion) {
      revealAll();
      return;
    }

    const observed = new Set<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.add('is-visible', 'is-revealed');
          // reveal-children 子项保留观察以便回顶重置后再次触发；
          // 其他元素触发一次后取消观察以提升性能。
          if (!el.parentElement?.classList.contains('reveal-children')) {
            io.unobserve(el);
            observed.delete(el);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    );

    const isInViewport = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const vw = window.innerWidth || document.documentElement.clientWidth;
      if (rect.width <= 0 || rect.height <= 0) return false;
      const visibleTop = 0;
      const visibleBottom = vh * 0.92;
      const visibleLeft = 0;
      const visibleRight = vw;
      return (
        rect.bottom > visibleTop &&
        rect.top < visibleBottom &&
        rect.right > visibleLeft &&
        rect.left < visibleRight
      );
    };

    const isAboveViewport = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      return rect.height > 0 && rect.bottom <= 0;
    };

    const flushVisible = () => {
      document
        .querySelectorAll<HTMLElement>(
          '.reveal-on-scroll:not(.is-revealed), [data-reveal]:not(.is-revealed), .reveal-stagger:not(.is-revealed), .stagger-children:not(.is-revealed)',
        )
        .forEach((el) => {
          if (isInViewport(el) || isAboveViewport(el)) {
            el.classList.add('is-visible', 'is-revealed');
            if (observed.has(el)) {
              io.unobserve(el);
              observed.delete(el);
            }
          }
        });
      document
        .querySelectorAll<HTMLElement>(
          '.reveal-children > *:not(.is-revealed)',
        )
        .forEach((el) => {
          if (isInViewport(el) || isAboveViewport(el)) {
            el.classList.add('is-visible', 'is-revealed');
          }
        });
    };

    const scan = () => {
      document
        .querySelectorAll<HTMLElement>(
          '.reveal-on-scroll:not(.is-revealed), [data-reveal]:not(.is-revealed), .reveal-stagger:not(.is-revealed), .stagger-children:not(.is-revealed)',
        )
        .forEach((el) => {
          if (observed.has(el)) return;
          observed.add(el);
          io.observe(el);
        });
      document
        .querySelectorAll<HTMLElement>('.reveal-children')
        .forEach((container) => {
          container.classList.add('is-visible', 'is-revealed');
          container
            .querySelectorAll<HTMLElement>(':scope > *:not(.is-revealed)')
            .forEach((child) => {
              if (observed.has(child)) return;
              observed.add(child);
              io.observe(child);
            });
        });
      // 兜底：双 rAF 后对仍在视口内但 IO 未及时回调的元素主动 reveal。
      // 解决条件渲染（tab 切换）时新挂载元素已在视口却因布局时序未触发 IO 的问题。
      requestAnimationFrame(() => {
        requestAnimationFrame(flushVisible);
      });
    };

    const reset = () => {
      // 取消全部观察
      observed.forEach((el) => io.unobserve(el));
      observed.clear();
      // 移除所有 is-visible / is-revealed，元素回到初始隐藏状态
      document
        .querySelectorAll<HTMLElement>(
          '.reveal-on-scroll.is-revealed, [data-reveal].is-revealed, .reveal-stagger.is-revealed, .stagger-children.is-revealed, .reveal-children.is-revealed, .reveal-children > *.is-revealed',
        )
        .forEach((el) => {
          el.classList.remove('is-visible', 'is-revealed');
          if (el.classList.contains('reveal-children')) {
            el.querySelectorAll<HTMLElement>(':scope > *').forEach((c) => {
              c.classList.remove('is-visible', 'is-revealed');
            });
          }
        });
      // 给浏览器一帧让样式应用到隐藏态，再重新扫描观察
      requestAnimationFrame(() => scan());
    };

    scan();

    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });

    const onResetEvent = () => reset();

    (window as unknown as {
      __scrollRevealRefresh?: () => void;
      __scrollRevealReset?: () => void;
    }).__scrollRevealRefresh = scan;
    (window as unknown as { __scrollRevealReset?: () => void }).__scrollRevealReset =
      reset;
    window.addEventListener('scroll-reveal:reset', onResetEvent);

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener('scroll-reveal:reset', onResetEvent);
      const w = window as unknown as {
        __scrollRevealRefresh?: () => void;
        __scrollRevealReset?: () => void;
      };
      delete w.__scrollRevealRefresh;
      delete w.__scrollRevealReset;
    };
  }, []);

  return null;
}

