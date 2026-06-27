'use client';

import React from 'react';

export function Loader({
  label = 'Loading',
  fullScreen = true,
  overlay = false,
  size = 'large',
}: {
  label?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  size?: 'small' | 'medium' | 'large';
}) {
  return (
    <div
      className={[
        'smart-loader',
        fullScreen ? 'is-fullscreen' : '',
        overlay ? 'is-overlay' : '',
        `is-${size}`,
      ].join(' ')}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="ios-segment-spinner" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, index) => (
          <span key={index} style={{ '--i': index } as React.CSSProperties} />
        ))}
      </div>

      {label ? <p className="smart-loader-label">{label}</p> : null}
    </div>
  );
}
