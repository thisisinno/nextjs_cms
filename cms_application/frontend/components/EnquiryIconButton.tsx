'use client';

import { AnimatePresence, motion } from 'framer-motion';

export function RequestIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M7 4h10v16H7zM10 8h4M10 12h4M10 16h2" /><path strokeLinecap="round" d="M5 7V3h10" /></svg>;
}

function CheckIcon() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4.2 4.2L19 6.8" /></svg>;
}

function PlusIcon() {
  return <svg className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-ink p-[2px] text-gold" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" d="M8 3v10M3 8h10" /></svg>;
}

export function AnimatedCount({ value }: { value: number }) {
  return <AnimatePresence initial={false} mode="popLayout"><motion.span key={value} initial={{ opacity: 0, scale: .45, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .45 }} transition={{ type: 'spring', stiffness: 550, damping: 19 }} className="enquiry-mini-badge">{value}</motion.span></AnimatePresence>;
}

export function EnquiryIconButton({ active, count = 0, onClick, label }: { active: boolean; count?: number; onClick: () => void; label: string }) {
  return <motion.button type="button" whileTap={{ scale: .82 }} animate={active ? { scale: [1, 1.08, 1] } : { scale: 1 }} transition={{ duration: .28 }} onClick={onClick} aria-label={label} title={active ? 'Already in enquiry' : 'Add to enquiry'} className={`enquiry-icon-button ${active ? 'is-active' : ''}`}>
    <span className="relative grid place-items-center">{active ? <CheckIcon /> : <><RequestIcon /><PlusIcon /></>}</span>
    {count > 0 && <AnimatedCount value={count} />}
    <span className="sr-only">{label}</span>
  </motion.button>;
}
