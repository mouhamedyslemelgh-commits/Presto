'use client';

import type {HTMLAttributes, PointerEvent} from 'react';

/**
 * Lightweight PRESTO interpretation of the React Bits SpotlightCard idea:
 * https://github.com/DavidHDev/react-bits
 * No WebGL, external textures, perpetual animation, or extra dependencies.
 */
export default function PrestoSpotlightCard({
  children, className = '', onPointerMove, ...props
}: HTMLAttributes<HTMLDivElement>) {
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
      const box = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty('--presto-pointer-x', `${event.clientX - box.left}px`);
      event.currentTarget.style.setProperty('--presto-pointer-y', `${event.clientY - box.top}px`);
    }
    onPointerMove?.(event);
  };
  return (
    <div className={`prestoSpotlightCard ${className}`} onPointerMove={move} {...props}>
      {children}
    </div>
  );
}
