'use client';

import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import type { Project, Service } from '@/lib/types';
import { useCart } from './cart';
import { useEnquiryModal } from './enquiry-modal-context';
import { SkeletonCard } from './SkeletonCard';
import { AdminLoginModal } from './AdminLoginModal';
import { AnimatedCount, EnquiryIconButton, RequestIcon } from './EnquiryIconButton';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
};

export const scrollToSection = (id: string) => {
  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
  }
};

export function AnimatedSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }} transition={{ duration: 0.65, ease: 'easeOut' }} variants={fadeUp} className={className}>{children}</motion.div>;
}

export function StaggerGroup({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.16 }} variants={stagger} className={className}>{children}</motion.div>;
}

export function RevealCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <motion.div variants={fadeUp} transition={{ duration: 0.55, ease: 'easeOut' }} className={className}>{children}</motion.div>;
}

export function PublicHeader() {
  const router = useRouter(), pathname = usePathname();
  const { totalItems, ready } = useCart();
  const { openEnquiry } = useEnquiryModal();
  const [open, setOpen] = useState(false), [active, setActive] = useState('home'), [adminOpen, setAdminOpen] = useState(false);
  const links: [string, string][] = [['Home', 'home'], ['About', 'about'], ['Services', 'services'], ['Advertisement', 'projects'], ['Contact', 'contact']];
  const go = (id: string) => {
    setOpen(false);
    setActive(id);
    if (pathname !== '/') {
      router.push(`/#${id}`);
      return;
    }
    scrollToSection(id);
    if (!document.getElementById(id)) setTimeout(() => scrollToSection(id), 180);
  };

  useEffect(() => {
    if (pathname !== '/') return;
    const ids = ['home', 'about', 'services', 'projects', 'contact', 'enquiry'];
    const observer = new IntersectionObserver((entries) => {
      const hit = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (hit) setActive(hit.target.id === 'enquiry' ? 'contact' : hit.target.id);
    }, { rootMargin: '-38% 0px -50% 0px', threshold: [.05, .25] });
    ids.forEach((id) => document.getElementById(id) && observer.observe(document.getElementById(id)!));
    const hash = location.hash.slice(1);
    if (hash) setTimeout(() => scrollToSection(hash), 250);
    return () => observer.disconnect();
  }, [pathname]);

  const count = ready ? totalItems : 0;
  return <>
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/85 text-white backdrop-blur-xl">
      <div className="wrap flex h-18 items-center justify-between gap-4">
        <button onClick={() => go('home')} className="text-left font-black tracking-[.18em]">SCCL<span className="text-gold">.</span></button>
        <nav className="hidden items-center gap-2 text-sm md:flex">{links.map(([label, id]) => <button key={id} onClick={() => go(id)} className={`rounded-full px-3 py-2 transition active:scale-95 ${active === id ? 'bg-white/10 text-gold' : 'text-slate-200 hover:bg-white/10 hover:text-gold'}`}>{label}</button>)}</nav>
        <div className="flex items-center gap-2"><button onClick={openEnquiry} className="enquiry-cart-button" aria-label={`Enquiry cart, ${count} selected services`} title="Enquiry cart"><RequestIcon /><AnimatedCount value={count} /></button><button onClick={() => setOpen((value) => !value)} className="rounded p-2 md:hidden" aria-label="Open navigation">☰</button></div>
      </div>
      {open && <nav className="wrap flex flex-col gap-1 border-t border-white/10 py-3 md:hidden">{links.map(([label, id]) => <button key={id} onClick={() => go(id)} className="rounded px-2 py-2 text-left hover:bg-white/10">{label}</button>)}</nav>}
    </header>
    {count > 0 && <button onClick={openEnquiry} className="floating-enquiry-cart" aria-label={`View ${count} selected services`}><RequestIcon /><span className="hidden sm:inline">Your enquiry</span><AnimatedCount value={count} /></button>}
    <button onClick={() => setAdminOpen(true)} className="fixed bottom-5 left-5 z-30 grid h-11 w-11 place-items-center rounded-full bg-ink text-gold shadow-xl ring-1 ring-white/20" aria-label="Admin access">⌑</button>
    <AdminLoginModal open={adminOpen} onClose={() => setAdminOpen(false)} />
  </>;
}

export function SectionHeader({ eyebrow, title, text, light = false }: { eyebrow: string; title: string; text?: string; light?: boolean }) {
  return <div className="mb-10 max-w-2xl"><p className="mb-2 text-sm font-bold uppercase tracking-[.2em] text-gold">{eyebrow}</p><h2 className={`text-3xl font-black leading-tight md:text-5xl ${light ? 'text-white' : 'text-ink'}`}>{title}</h2>{text && <p className={`mt-4 text-base leading-7 ${light ? 'text-slate-300' : 'text-slate-600'}`}>{text}</p>}</div>;
}

export function Placeholder({ label, kind = 'image' }: { label: string; kind?: string }) {
  return <div className={`architectural-placeholder placeholder-art ${kind}`}><span>◇</span><p>{label}</p></div>;
}

export function ServiceCard({ service, onDetails, onAdded }: { service: Service; onDetails?: (service: Service) => void; onAdded?: (newItem: boolean) => void }) {
  const { add, hasService, countForService } = useCart();
  const active = hasService(service.id);
  const addItem = () => {
    add(service);
    onAdded?.(!active);
  };

  return <motion.article variants={fadeUp} whileHover={{ y: -8 }} className="premium-card gradient-border-card group overflow-hidden">
    <div className="relative aspect-[4/3] overflow-hidden bg-ink/10">
      {service.image ? <img src={service.image} alt={service.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" /> : <Placeholder label={service.title} />}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
      <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-xs font-black uppercase text-ink shadow-lg">{service.category || 'Service'}</span>
    </div>
    <div className="p-6">
      <h3 className="text-xl font-black text-ink">{service.title}</h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{service.short_description}</p>
      <div className="mt-6 flex items-center justify-between gap-3"><button onClick={() => onDetails?.(service)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold transition hover:border-gold hover:text-gold">View details</button><EnquiryIconButton active={active} count={countForService(service.id)} label={active ? `${service.title} is already in your enquiry` : `Add ${service.title} to enquiry`} onClick={addItem} /></div>
    </div>
  </motion.article>;
}

export function ProjectCard({ project }: { project: Project }) {
  return <motion.article layout variants={fadeUp} initial="hidden" animate="visible" whileHover={{ y: -6 }} className="premium-card group overflow-hidden">
    <div className="relative aspect-[4/3] overflow-hidden bg-ink/10">
      {project.image ? <img src={project.image} alt={project.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" /> : <Placeholder label={project.title} />}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white"><p className="text-xs font-black uppercase tracking-[.16em] text-gold">{project.category}</p><h3 className="mt-2 text-xl font-black">{project.title}</h3><p className="mt-2 text-sm text-slate-200">{project.location || project.status || 'Selected project'}</p></div>
    </div>
  </motion.article>;
}

export function SkeletonGrid({ count = 3 }: { count?: number }) {
  return <div className="grid gap-6 md:grid-cols-3">{Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}</div>;
}
