'use client';

import { useEffect, useRef } from 'react';

export function DirectoryMotion() {
  const control = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    const shell = control.current?.closest<HTMLElement>('.directory-shell');
    const hero = shell?.querySelector('.connected-hero');
    const ribbon = shell?.querySelector('.connection-ribbon');
    if (!shell || !hero) return;
    let inView = true;
    let ribbonInView = false;
    const sync = () => {
      shell.dataset.motionSuspended = String(document.hidden || !inView);
      shell.dataset.ribbonSuspended = String(document.hidden || !ribbonInView);
    };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) inView = entry.isIntersecting;
        if (entry.target === ribbon) ribbonInView = entry.isIntersecting;
      }
      sync();
    });
    observer.observe(hero);
    if (ribbon) observer.observe(ribbon);
    document.addEventListener('visibilitychange', sync);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      delete shell.dataset.motionSuspended;
      delete shell.dataset.ribbonSuspended;
    };
  }, []);

  return (
    <label className="directory-motion" ref={control}>
      <input type="checkbox" aria-label="Pause connection animation" />
      <span>Pause motion</span>
    </label>
  );
}
