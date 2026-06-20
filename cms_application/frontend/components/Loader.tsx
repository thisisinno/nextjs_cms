'use client';

export function Loader({ label = 'Preparing your experience', fullScreen = true }: { label?: string; fullScreen?: boolean }) {
  return <main className={`premium-loader ${fullScreen ? 'min-h-screen' : 'min-h-[360px]'}`} role="status" aria-live="polite">
    <div className="loader-glass">
      <div className="loader-orb"><i /><i /><i /></div>
      <p className="mt-5 text-sm font-black tracking-[.24em] text-white">SCCL<span className="text-gold">.</span></p>
      <p className="mt-2 text-sm text-slate-300">{label}</p>
    </div>
  </main>;
}
