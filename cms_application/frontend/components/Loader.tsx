export function Loader({ label = 'Loading site' }: { label?: string }) {
  return <div className="grid min-h-[45vh] place-items-center" role="status" aria-live="polite"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" /><p className="mt-4 text-sm font-black tracking-[.2em] text-ink">{label}</p></div></div>;
}
