'use client';

import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import type { Project, Service } from '@/lib/types';
import { useCart } from './cart';
import { useEnquiryModal } from './enquiry-modal-context';
import { SkeletonCard } from './SkeletonCard';
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
  const [open, setOpen] = useState(false), [active, setActive] = useState('home');
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
    <header className="sccl-header">
      <div className="wrap sccl-header-inner">
        <button onClick={() => go('home')} className="sccl-logo" aria-label="Go to homepage">SCCL<span>.</span></button>
        <nav className="sccl-nav" aria-label="Primary navigation">{links.map(([label, id]) => <button key={id} onClick={() => go(id)} className={active === id ? 'is-active' : ''}>{label}</button>)}</nav>
        <div className="sccl-header-actions">
          <button className="sccl-language-btn">KISWAHILI</button>
          <button className="sccl-language-btn">ENGLISH</button>
          <button onClick={openEnquiry} className="enquiry-cart-button" aria-label={`Enquiry cart, ${count} selected services`} title="Enquiry cart"><RequestIcon /><AnimatedCount value={count} /></button>
          <button onClick={() => setOpen((value) => !value)} className="sccl-menu-toggle" aria-label="Open navigation">☰</button>
        </div>
      </div>
      {open && <nav className="wrap sccl-mobile-nav">{links.map(([label, id]) => <button key={id} onClick={() => go(id)} className={active === id ? 'is-active' : ''}>{label}</button>)}<div className="sccl-mobile-languages"><button className="sccl-language-btn">KISWAHILI</button><button className="sccl-language-btn">ENGLISH</button></div></nav>}
    </header>
    {count > 0 && <button onClick={openEnquiry} className="floating-enquiry-cart" aria-label={`View ${count} selected services`}><RequestIcon /><span className="hidden sm:inline">Your enquiry</span><AnimatedCount value={count} /></button>}
  </>;
}

export function SectionHeader({ eyebrow, title, text, light = false }: { eyebrow: string; title: string; text?: string; light?: boolean }) {
  return <div className={`sccl-section-heading ${light ? 'is-light' : ''}`}><div className="section-eyebrow"><span>{eyebrow}</span><i /></div><h2>{title}</h2>{text && <p>{text}</p>}</div>;
}

export function Placeholder({ label, kind = 'image' }: { label: string; kind?: string }) {
  return <div className={`architectural-placeholder placeholder-art ${kind}`}><span aria-hidden="true" /><p>{label}</p></div>;
}

export function ServiceCard({ service, onDetails, onAdded }: { service: Service; onDetails?: (service: Service) => void; onAdded?: (newItem: boolean) => void }) {
  const { add, hasService, countForService } = useCart();
  const active = hasService(service.id);
  const addItem = () => {
    add(service);
    onAdded?.(!active);
  };

  return <motion.article variants={fadeUp} whileHover={{ y: -7 }} className="sccl-service-card">
    <div className="service-icon-block"><ConstructionIcon /></div>
    <h3>{service.title}</h3>
    <p>{service.short_description}</p>
    <div className="service-actions"><button onClick={() => onDetails?.(service)}>Details</button><EnquiryIconButton active={active} count={countForService(service.id)} label={active ? `${service.title} is already in your enquiry` : `Add ${service.title} to enquiry`} onClick={addItem} /></div>
  </motion.article>;
}

export function ProjectCard({ project }: { project: Project }) {
  return <motion.article layout variants={fadeUp} initial="hidden" animate="visible" className="project-tile">
    <div className="project-image">
      {project.image ? <img src={project.image} alt={project.title} /> : <Placeholder label={project.title} />}
      <div className="project-caption"><p>{project.category}</p><h3>{project.title}</h3><span>{project.location || project.status || 'Selected project'}</span></div>
    </div>
  </motion.article>;
}

export function SkeletonGrid({ count = 3 }: { count?: number }) {
  return <div className="grid gap-6 md:grid-cols-3">{Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}</div>;
}

function ConstructionIcon() {
  return <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M8 38h32M12 38V18l12-7 12 7v20M18 38V25h12v13M16 19h16M22 25v13M8 38l32-20M40 38 8 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
