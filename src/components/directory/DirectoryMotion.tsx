'use client';

import { useEffect, useRef } from 'react';

export function DirectoryMotion() {
  const control = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    const shell = control.current?.closest<HTMLElement>('.directory-shell');
    const hero = shell?.querySelector('.connected-hero');
    if (!shell || !hero) return;
    let inView = true;
    const sync = () => {
      shell.dataset.motionSuspended = String(document.hidden || !inView);
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    observer.observe(hero);
    document.addEventListener('visibilitychange', sync);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      delete shell.dataset.motionSuspended;
    };
  }, []);

  return (
    <label className="directory-motion" ref={control}>
      <input type="checkbox" aria-label="Pause connection animation" />
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          className="motion-pause-icon"
          d="M5 3v10M11 3v10"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          className="motion-play-icon"
          d="m5 3 8 5-8 5V3Z"
          fill="currentColor"
        />
      </svg>
      <span className="motion-pause-label">Pause motion</span>
      <span className="motion-play-label">Resume motion</span>
    </label>
  );
}
