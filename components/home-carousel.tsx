'use client';
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/prefer-tag-over-role -- A keyboard-scrollable carousel region needs a tab stop and arrow handlers; ARIA slide groups are not form fieldsets. */
import {
  Children,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from '@/components/travel-icons';

/** Native scrolling keeps touch gestures and trackpads usable without a carousel dependency. */
export function HomeCarousel({
  title,
  subtitle,
  children,
  actions,
  variant = 'default',
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  actions?: ReactNode;
  variant?: 'default' | 'social';
}) {
  const id = useId();
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const slides = Children.toArray(children);
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () =>
      setEdges({
        start: element.scrollLeft < 4,
        end:
          element.scrollLeft + element.clientWidth >= element.scrollWidth - 4,
      });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener('scroll', update, { passive: true });
    element.scrollTo({ left: 0 });
    update();
    return () => {
      observer.disconnect();
      element.removeEventListener('scroll', update);
    };
  }, [slides.length]);
  function scroll(direction: number) {
    const element = track.current;
    if (!element) return;
    const first = element.firstElementChild as HTMLElement | null;
    const distance =
      (first?.getBoundingClientRect().width ?? element.clientWidth) +
      (Number.parseFloat(getComputedStyle(element).columnGap) || 0);
    element.scrollBy({
      left: direction * distance,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  }
  return (
    <section
      className={
        'home-carousel' + (variant === 'social' ? ' social-feed-carousel' : '')
      }
      aria-label={title}
      aria-roledescription="轮播区"
    >
      <div className="section-heading carousel-heading">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="carousel-actions">
          {actions}
          <div className="carousel-arrows">
            <Button
              variant="outline"
              className="carousel-arrow"
              aria-controls={id}
              aria-label={title + '：向左浏览'}
              disabled={edges.start}
              onClick={() => scroll(-1)}
            >
              <ArrowLeft size={17} />
            </Button>
            <Button
              variant="outline"
              className="carousel-arrow"
              aria-controls={id}
              aria-label={title + '：向右浏览'}
              disabled={edges.end}
              onClick={() => scroll(1)}
            >
              <ArrowRight size={17} />
            </Button>
          </div>
        </div>
      </div>
      <div
        id={id}
        ref={track}
        className="carousel-track"
        role="region"
        tabIndex={0}
        aria-label={title + '，可左右滑动或使用方向键'}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            scroll(e.key === 'ArrowRight' ? 1 : -1);
          }
          if (e.key === 'Home' || e.key === 'End') {
            e.preventDefault();
            e.currentTarget.scrollTo({
              left: e.key === 'Home' ? 0 : e.currentTarget.scrollWidth,
            });
          }
        }}
      >
        {slides.map((slide, index) => (
          <div
            className="carousel-slide"
            key={(slide as { key?: string }).key ?? index}
            role="group"
            aria-roledescription="幻灯片"
            aria-label={`${index + 1} / ${slides.length}`}
          >
            {slide}
          </div>
        ))}
      </div>
      <p className="carousel-hint">
        左右滑动，发现更多 <span>{slides.length} 个灵感</span>
      </p>
    </section>
  );
}
