'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Project, Service } from '@/lib/types';
import { useCart } from './cart';
import { SkeletonCard } from './SkeletonCard';

export const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export function PublicHeader() {
  const { items, ready } = useCart(); const [open, setOpen] = useState(false);
  const links = ['home', 'about', 'services', 'projects', 'contact'];
  const go = (id: string) => { setOpen(false); scrollToSection(id); };
  return <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/85 text-white backdrop-blur-xl"><div className="wrap flex h-18 items-center justify-between gap-4"><button onClick={() => go('home')} className="text-left font-black tracking-[.18em]">SCCL<span className="text-gold">.</span></button><nav className="hidden items-center gap-5 text-sm md:flex">{links.map(link => <button key={link} onClick={() => go(link)} className="capitalize text-slate-200 transition hover:text-gold">{link}</button>)}</nav><div className="flex items-center gap-2"><button onClick={() => go('enquiry')} className="rounded-full bg-white/10 px-3 py-2 text-sm transition hover:bg-white/20">Enquiry <b className="ml-1 text-gold">{ready ? items.length : 0}</b></button><button onClick={() => setOpen(!open)} className="rounded p-2 md:hidden" aria-label="Open menu">☰</button></div></div>{open && <nav className="wrap flex flex-col gap-1 border-t border-white/10 py-3 md:hidden">{links.map(link => <button key={link} onClick={() => go(link)} className="rounded px-2 py-2 text-left capitalize hover:bg-white/10">{link}</button>)}</nav>}</header>;
}

export function SectionHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) { return <div className="mb-10 max-w-2xl"><p className="mb-2 text-sm font-bold uppercase tracking-[.2em] text-gold">{eyebrow}</p><h2 className="text-3xl font-bold text-ink md:text-5xl">{title}</h2>{text && <p className="mt-4 text-slate-600">{text}</p>}</div>; }
export function ServiceCard({ service, onDetails }: { service: Service; onDetails?: (service: Service) => void }) { const { add } = useCart(); return <motion.article initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} whileHover={{ y: -7 }} className="card"><div className="aspect-[4/3] bg-ink/10">{service.image && <img src={service.image} alt={service.title} className="h-full w-full object-cover" />}</div><div className="p-6"><p className="text-xs font-bold uppercase text-gold">{service.category || 'Service'}</p><h3 className="mt-2 text-xl font-bold">{service.title}</h3><p className="mt-2 line-clamp-3 text-sm text-slate-600">{service.short_description}</p><div className="mt-5 flex gap-4"><button onClick={() => onDetails?.(service)} className="text-sm font-bold">Details</button><button onClick={() => add(service)} className="text-sm font-bold text-gold">Add to enquiry</button></div></div></motion.article>; }
export function ProjectCard({ project }: { project: Project }) { return <motion.article layout initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -5 }} className="card"><div className="aspect-[4/3] bg-ink/10">{project.image && <img src={project.image} alt={project.title} className="h-full w-full object-cover" />}</div><div className="p-5"><div className="flex justify-between gap-2"><h3 className="font-bold">{project.title}</h3><span className="text-xs uppercase text-gold">{project.category}</span></div><p className="mt-2 text-sm text-slate-600">{project.location || project.status}</p></div></motion.article>; }
export function SkeletonGrid({ count = 3 }: { count?: number }) { return <div className="grid gap-6 md:grid-cols-3">{Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}</div>; }
export function Loader() { return <div className="grid min-h-[45vh] place-items-center"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" /><p className="mt-4 font-black tracking-[.2em] text-ink">SCCL</p></div></div>; }
