'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Icon } from '@/components/ui/Icon';

export function Hero({ dict }: { dict: Dictionary }) {
  const layer = useRef<HTMLDivElement>(null);

  // Subtle parallax on the hero media — ported from initParallax().
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (layer.current) {
          layer.current.style.transform = `translate3d(0, ${Math.min(y * 0.14, 120)}px, 0)`;
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      <div ref={layer} className="hero-media absolute inset-0 -z-10">
        <Image
          src="/assets/images/stool-hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/25 to-surface/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-surface/40 via-transparent to-transparent" />
      </div>

      <div className="max-w-container mx-auto px-5 md:px-16 w-full">
        <div className="max-w-2xl">
          <p
            className="hero-fade text-xs font-semibold uppercase tracking-widest text-primary mb-5"
            style={{ '--fade-delay': '120ms' } as CSSProperties}
          >
            {dict.hero.eyebrow}
          </p>
          <h1 className="font-display font-bold text-primary leading-[1.05] text-5xl sm:text-6xl md:text-7xl">
            <span className="block overflow-hidden">
              <span className="hero-word" style={{ '--word-delay': '150ms' } as CSSProperties}>
                {dict.hero.title1}
              </span>{' '}
              <span className="hero-word" style={{ '--word-delay': '260ms' } as CSSProperties}>
                {dict.hero.title2}
              </span>
            </span>
            <span className="block overflow-hidden">
              <span className="hero-word" style={{ '--word-delay': '370ms' } as CSSProperties}>
                {dict.hero.title3}
              </span>{' '}
              <span
                className="hero-word text-on-surface"
                style={{ '--word-delay': '480ms' } as CSSProperties}
              >
                {dict.hero.title4}
              </span>
            </span>
          </h1>
          <p
            className="hero-fade text-lg text-on-surface-variant mt-6 max-w-lg leading-relaxed"
            style={{ '--fade-delay': '640ms' } as CSSProperties}
          >
            {dict.hero.subtitle}
          </p>
          <div
            className="hero-fade flex flex-wrap items-center gap-4 mt-9"
            style={{ '--fade-delay': '780ms' } as CSSProperties}
          >
            <Link href="/shop" className="btn btn-primary px-8 py-4 text-sm">
              <span>{dict.hero.ctaPrimary}</span>
              <Icon name="arrow_forward" className="flip-rtl !text-[20px]" />
            </Link>
            <Link href="/#story" className="btn btn-ghost px-8 py-4 text-sm text-primary">
              {dict.hero.ctaSecondary}
            </Link>
          </div>
        </div>
      </div>

      <Link
        href="/#categories"
        className="hero-fade absolute bottom-7 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-on-surface-variant"
        style={{ '--fade-delay': '1000ms' } as CSSProperties}
      >
        <span className="text-[11px] uppercase tracking-widest">{dict.hero.scroll}</span>
        <Icon name="expand_more" className="animate-bounce" />
      </Link>
    </section>
  );
}
