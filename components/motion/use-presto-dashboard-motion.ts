'use client';

import {useRef} from 'react';
import gsap from 'gsap';
import {useGSAP} from '@gsap/react';

gsap.registerPlugin(useGSAP);

/**
 * PRESTO: gentle, scoped, disposable entrance animation.
 * Never depend on rows: Supabase reloads those every five seconds.
 */
export function usePrestoDashboardMotion(view: string, loading: boolean) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const root = scope.current;
    if (!root || loading || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>(
      '.pageHead, .stat, .paymentGrid .payment, .bottomGrid > .panel, .driverRegisterPanel, .settingsCard, .opsSettingsIntro'
    )).slice(0, 14);
    if (!targets.length) return;

    gsap.fromTo(targets,
      {autoAlpha: 0, y: 12},
      {
        autoAlpha: 1, y: 0, duration: 0.34, stagger: 0.035,
        ease: 'power2.out', overwrite: 'auto',
        clearProps: 'opacity,visibility,transform'
      }
    );
  }, {scope, dependencies: [view, loading], revertOnUpdate: true});

  return scope;
}
