'use client';

import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { CSSProperties, ReactNode, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DEFAULT_CONSTRUCTION_IMAGE, getAdvertisementImage, getServiceImage, resolveMediaUrl } from '@/lib/image';
import type { Project, Service } from '@/lib/types';
import { useCart } from './cart';
import { useEnquiryModal } from './enquiry-modal-context';
import { useLanguage } from './language-context';
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

export function RevealCard({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const shared = { variants: fadeUp, transition: { duration: 0.55, ease: 'easeOut' as const }, className };
  if (onClick) return <motion.button type="button" onClick={onClick} {...shared}>{children}</motion.button>;
  return <motion.div {...shared}>{children}</motion.div>;
}

export function PublicHeader() {
  const router = useRouter(), pathname = usePathname();
  const { totalItems, ready } = useCart();
  const { openEnquiry } = useEnquiryModal();
  const [open, setOpen] = useState(false), [active, setActive] = useState('home');
  const [site, setSite] = useState<any>();
  const { language, setLanguage, t } = useLanguage();
  const links = [[t('home'), 'home'], [t('about'), 'about'], [t('services'), 'services'], [t('advertisement'), 'projects'], [t('contact'), 'contact']] as const;
  const logoUrl = resolveMediaUrl(site?.logo_url || site?.logo);
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

  useEffect(() => {
    api<any>('/site-settings/').then(setSite).catch(() => setSite(undefined));
  }, []);

  const count = ready ? totalItems : 0;
  return <>
    <header className="sccl-header">
      <div className="wrap sccl-header-inner">
        <button onClick={() => go('home')} className={`sccl-logo ${logoUrl ? 'has-image' : ''}`} aria-label="Go to homepage">
          {logoUrl ? <img className="sccl-header-logo-img" src={logoUrl} alt={site?.company_name || 'Company logo'} /> : <>SCCL<span>.</span></>}
        </button>
        <nav className="sccl-nav" aria-label="Primary navigation">{links.map(([label, id]) => <button key={id} onClick={() => go(id)} className={active === id ? 'is-active' : ''}>{label}</button>)}</nav>
        <div className="sccl-header-actions">
          <button onClick={() => setLanguage('sw')} className={`sccl-language-btn ${language === 'sw' ? 'is-active' : ''}`} aria-pressed={language === 'sw'}>KISWAHILI</button>
          <button onClick={() => setLanguage('en')} className={`sccl-language-btn ${language === 'en' ? 'is-active' : ''}`} aria-pressed={language === 'en'}>ENGLISH</button>
          <button onClick={openEnquiry} className="enquiry-cart-button" aria-label={`Enquiry cart, ${count} selected services`} title="Enquiry cart"><RequestIcon /><AnimatedCount value={count} /></button>
          <button onClick={() => setOpen((value) => !value)} className="sccl-menu-toggle" aria-label="Open navigation">☰</button>
        </div>
      </div>
      {open && <nav className="wrap sccl-mobile-nav">{links.map(([label, id]) => <button key={id} onClick={() => go(id)} className={active === id ? 'is-active' : ''}>{label}</button>)}<div className="sccl-mobile-languages"><button onClick={() => setLanguage('sw')} className={`sccl-language-btn ${language === 'sw' ? 'is-active' : ''}`} aria-pressed={language === 'sw'}>KISWAHILI</button><button onClick={() => setLanguage('en')} className={`sccl-language-btn ${language === 'en' ? 'is-active' : ''}`} aria-pressed={language === 'en'}>ENGLISH</button></div></nav>}
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
  const { t, translateCms } = useLanguage();
  const active = hasService(service.id);
  const title = translateCms(service, 'title', service.title);
  const description = translateCms(service, 'short_description', service.short_description);
  const serviceImage = getServiceImage(service);
  const style = serviceImage ? ({ '--service-bg': `url(${serviceImage})` } as CSSProperties) : undefined;
  const addItem = () => {
    add(service);
    onAdded?.(!active);
  };

  return <motion.article variants={fadeUp} whileHover={{ y: -7 }} className={`sccl-service-card image-service-card ${serviceImage ? 'has-image' : 'no-image'}`} style={style}>
    {serviceImage ? <img className="service-card-bg-img" src={serviceImage} alt="" aria-hidden="true" loading="lazy" /> : null}
    <div className="service-card-overlay" />
    <div className="service-card-content">
      <div className="service-icon-block"><ConstructionIcon /></div>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="service-actions"><button onClick={() => onDetails?.(service)}>{t('details')}</button><EnquiryIconButton active={active} count={countForService(service.id)} label={active ? `${title} is already in your enquiry` : `${t('addToEnquiry')}: ${title}`} onClick={addItem} /></div>
    </div>
  </motion.article>;
}

export function ProjectCard({ project }: { project: Project }) {
  const { translateCms, t } = useLanguage();
  const title = translateCms(project, 'title', project.title);
  const status = translateCms(project, 'status', project.status);
  const location = translateCms(project, 'location', project.location);
  const description = translateCms(project, 'description', project.description);
  const [projectImage, setProjectImage] = useState(() => getAdvertisementImage(project));
  useEffect(() => {
    setProjectImage(getAdvertisementImage(project));
  }, [project.id, project.image_url, project.image, project.image_external_url, project.title, project.category]);
  return <motion.article layout variants={fadeUp} initial="hidden" animate="visible" className={`project-tile image-project-card ${projectImage ? 'has-image' : 'no-image'}`}>
    <div className="project-image">
      {projectImage ? <img src={projectImage} alt={title} loading="lazy" onError={() => setProjectImage((current) => current === DEFAULT_CONSTRUCTION_IMAGE ? '' : DEFAULT_CONSTRUCTION_IMAGE)} /> : <Placeholder label={title || t('selectedProject')} />}
      <div className="project-image-overlay" />
      {process.env.NODE_ENV === 'development' && !projectImage ? <span className="project-image-warning">Missing project image</span> : null}
      <div className="project-caption">
        <p>{status || project.category}</p>
        <h3>{title}</h3>
        {description ? <span className="project-short-desc">{description}</span> : null}
        <small>{location || t('selectedProject')}</small>
      </div>
    </div>
  </motion.article>;
}

export function SkeletonGrid({ count = 3 }: { count?: number }) {
  return <div className="grid gap-6 md:grid-cols-3">{Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}</div>;
}

function ConstructionIcon() {
  return <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M8 38h32M12 38V18l12-7 12 7v20M18 38V25h12v13M16 19h16M22 25v13M8 38l32-20M40 38 8 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
