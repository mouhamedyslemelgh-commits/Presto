'use client';

import {useEffect, useRef} from 'react';
import gsap from 'gsap';

type Props = {value: number; locale?: string};

/** Animate only four aggregate counters, never individual driver rows. */
export default function AnimatedMetric({value, locale = 'fr-FR'}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef(value);
  const formatter = new Intl.NumberFormat(locale, {maximumFractionDigits: 0});

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.textContent = formatter.format(value);
      previous.current = value;
      return;
    }
    if (previous.current === value) return;

    const progress = {n: previous.current};
    const tween = gsap.to(progress, {
      n: value, duration: 0.38, ease: 'power2.out',
      onUpdate: () => {node.textContent = formatter.format(Math.round(progress.n));},
      onComplete: () => {
        previous.current = value;
        node.textContent = formatter.format(value);
      }
    });
    return () => {
      previous.current = progress.n;
      tween.kill();
    };
  }, [value, locale]);

  return <span ref={ref} aria-label={formatter.format(value)}>{formatter.format(value)}</span>;
}
