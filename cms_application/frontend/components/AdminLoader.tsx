export function AdminLoader({ label = 'Checking secure access' }: { label?: string }) {
  return <main className="grid min-h-screen place-items-center bg-ink text-white" role="status" aria-live="polite"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" /><p className="mt-4 text-sm font-bold tracking-widest">{label}</p></div></main>;
}
