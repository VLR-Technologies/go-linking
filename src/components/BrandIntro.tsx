'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Brand } from '@/config/brands';

const seenBrands = new Set<string>();
const DURATION = 1350;
const CHEF = '/brands/mozza-italia/chef.png';
const LOGO = '/brands/mozza-italia/logo.png';

export function BrandIntro({ brand }: { brand: Brand }) {
  const [active, setActive] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = `go-linking:intro:${brand.slug}`;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let seen = seenBrands.has(key);
    try {
      seen ||= sessionStorage.getItem(key) === 'seen';
    } catch {
      /* Optional storage. */
    }
    if (seen) return;
    const remember = () => {
      seenBrands.add(key);
      try {
        sessionStorage.setItem(key, 'seen');
      } catch {
        /* In-memory fallback. */
      }
    };
    if (motion.matches) {
      remember();
      // A short fade at the existing final position, with no overlay or movement.
      const header = document.querySelector('.hub-brand-anchor');
      const fade = header?.animate([{ opacity: 0.4 }, { opacity: 1 }], {
        duration: 250,
      });
      return () => fade?.cancel();
    }
    let disposed = false;
    let timer: ReturnType<typeof setTimeout>;
    const images = [CHEF, LOGO].map((src) => {
      const image = new Image();
      image.src = src;
      return image;
    });
    // Never begin an incomplete visual or hold the hub behind a network request.
    Promise.all(images.map((image) => image.decode()))
      .then(() => {
        if (disposed || motion.matches) return;
        remember();
        setActive(true);
        timer = setTimeout(() => setActive(false), DURATION);
      })
      .catch(() => {
        /* Leave the existing page available if an intro asset fails. */
      });
    const dismiss = () => {
      disposed = true;
      setActive(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Tab') dismiss();
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', dismiss);
    motion.addEventListener('change', dismiss);
    return () => {
      disposed = true;
      clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', dismiss);
      motion.removeEventListener('change', dismiss);
    };
  }, [brand.slug]);

  useEffect(() => {
    if (!active || !stage.current) return;
    const element = stage.current;
    const target = document.querySelector('.hub-brand-anchor .brand-identity');
    const source = element.querySelector('.brand-identity');
    const chef = element.querySelector<HTMLElement>('.intro-chef');
    if (!target || !source || !chef) return;
    const from = source.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const wrapper = element.getBoundingClientRect();
    const x = to.left + to.width / 2 - (from.left + from.width / 2);
    const y = to.top + to.height / 2 - (from.top + from.height / 2);
    element.style.transformOrigin = `${from.left + from.width / 2 - wrapper.left}px ${from.top + from.height / 2 - wrapper.top}px`;
    const animations: Animation[] = [];
    const play = (
      node: Element | null,
      frames: Keyframe[],
      options: KeyframeAnimationOptions = {},
    ) => {
      if (node)
        animations.push(
          node.animate(frames, {
            duration: DURATION,
            fill: 'both',
            easing: 'linear',
            ...options,
          }),
        );
    };
    const ease = 'cubic-bezier(.22,.7,.3,1)';
    const end = `translate(${x}px, ${y}px) scale(${to.width / from.width})`;
    play(element, [
      { transform: 'none', opacity: 1, offset: 0 },
      { transform: 'none', opacity: 1, offset: 0.66, easing: ease },
      { transform: end, opacity: 1, offset: 0.88 },
      { transform: end, opacity: 1, offset: 0.92 },
      { transform: end, opacity: 0, offset: 1 },
    ]);
    const chefBox = chef.getBoundingClientRect();
    const dx = innerWidth / 2 - (chefBox.left + chefBox.width / 2);
    const dy = innerHeight / 2 - (chefBox.top + chefBox.height / 2);
    const scale = Math.min(210, innerWidth * 0.48) / chefBox.width;
    play(chef, [
      {
        opacity: 0,
        transform: `translate(${dx}px, ${dy}px) scale(${scale * 0.94})`,
        offset: 0,
        easing: ease,
      },
      {
        opacity: 1,
        transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
        offset: 0.18,
        easing: ease,
      },
      { opacity: 1, transform: 'none', offset: 0.43 },
      { opacity: 0, transform: 'none', offset: 0.55 },
      { opacity: 0, transform: 'none', offset: 1 },
    ]);
    // Lettering is revealed outside the embedded-chef area first. Only one
    // aligned chef is visible during the complementary opacity handoff.
    play(element.querySelector('.intro-logo-wings'), [
      { opacity: 0, clipPath: 'inset(0 50%)', offset: 0 },
      { opacity: 0, clipPath: 'inset(0 50%)', offset: 0.18, easing: ease },
      { opacity: 1, clipPath: 'inset(0 0)', offset: 0.43 },
      { opacity: 0, clipPath: 'inset(0 0)', offset: 0.55 },
      { opacity: 0, offset: 1 },
    ]);
    play(element.querySelector('.intro-logo-full'), [
      { opacity: 0, offset: 0 },
      { opacity: 0, offset: 0.43 },
      { opacity: 1, offset: 0.55 },
      { opacity: 1, offset: 1 },
    ]);
    play(element.querySelector('.intro-plate'), [
      { opacity: 0, offset: 0 },
      { opacity: 0, offset: 0.18 },
      { opacity: 1, offset: 0.46 },
      { opacity: 1, offset: 1 },
    ]);
    return () => animations.forEach((animation) => animation.cancel());
  }, [active]);

  if (!active) return null;
  return (
    <div
      ref={overlay}
      className="brand-intro chef-intro"
      data-testid="brand-intro"
      style={
        {
          '--brand-red': brand.theme.red,
          '--brand-green': brand.theme.green,
          '--brand-cream': brand.theme.cream,
        } as CSSProperties
      }
    >
      <div className="intro-light" aria-hidden="true" />
      <div className="intro-brand" ref={stage} aria-hidden="true">
        <div className="brand-header">
          <div className="brand-identity intro-identity">
            <div className="intro-plate" />
            <div className="intro-artwork">
              {/* Original files are composited only for the intro; no asset pixels are edited. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="intro-logo-full"
                src={LOGO}
                width="3557"
                height="1445"
                alt=""
              />
              <div className="intro-logo-wings">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={LOGO} width="3557" height="1445" alt="" />
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="intro-chef"
                src={CHEF}
                width="1254"
                height="1254"
                alt=""
              />
            </div>
          </div>
          <div className="intro-tagline">
            <div className="tricolore">
              <i />
              <i />
              <i />
            </div>
            <p className="tagline">{brand.tagline}</p>
          </div>
        </div>
      </div>
      <button className="intro-skip" onClick={() => setActive(false)}>
        Skip intro <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
