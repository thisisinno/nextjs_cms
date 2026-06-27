'use client';

export function Loader({ label = 'Preparing your experience', fullScreen = true, overlay = false }: { label?: string; fullScreen?: boolean; overlay?: boolean }) {
  const Tag = overlay ? 'div' : 'main';
  return <Tag className={`premium-loader ${overlay ? 'loader-overlay' : fullScreen ? 'min-h-screen' : 'min-h-[360px]'}`} role="status" aria-live="polite">
    <div className="loader-device" aria-hidden="true">
      <div className="loader-speaker" />
      <div className="loader-screen">
        <span /><span /><span />
      </div>
      <div className="loader-home" />
    </div>
    <div className="loader-copy">
      <p>SCCL<span>.</span></p>
      <small>{label}</small>
    </div>
  </Tag>;
}
