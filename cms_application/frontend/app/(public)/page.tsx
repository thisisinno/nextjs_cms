'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '@/lib/api';
import type { Project, Service } from '@/lib/types';
import { Loader } from '@/components/Loader';
import { AnimatedSection, Placeholder, ProjectCard, RevealCard, SectionHeader, ServiceCard, StaggerGroup, scrollToSection } from '@/components/site';
import { useCart } from '@/components/cart';
import { useEnquiryModal } from '@/components/enquiry-modal-context';
import { AdminLoginModal } from '@/components/AdminLoginModal';

const serviceStrip = ['Building Construction', 'Buildings Re-new', 'Interior & Exterior Design', 'Buildings Renovation', 'Architectural Design'];
const categoryTabs = [{ label: 'ALL', value: 'all' }, { label: 'COMPLETED', value: 'completed' }, { label: 'CONTINUES', value: 'ongoing' }, { label: 'DAILY', value: 'daily' }];
const fallbackBullets = ['High quality workmanship', 'On-time project delivery', 'Cost effective solutions', 'Safety and integrity always', 'Client satisfaction guaranteed'];
const fallbackServices: Service[] = ['Luxury Villas', 'Swimming Pools', 'African Style Buildings', 'Renovations', 'Site Management', 'Project Management'].map((title, index) => ({ id: -(index + 1), title, slug: title.toLowerCase().replaceAll(' ', '-'), category: 'Construction', short_description: ['Elegant residential construction with practical site delivery.', 'Durable pool construction, finishing and surrounding works.', 'Locally inspired buildings with modern construction standards.', 'Careful upgrades for homes, offices and commercial spaces.', 'Daily site coordination, quality checks and progress control.', 'Planning, procurement and delivery leadership for your build.'][index], full_description: 'Professional construction support delivered with quality, safety, clear communication and client satisfaction at the center.' }));
const fallbackProjects: Project[] = ['Luxury Villa Construction', 'Swimming Pool Finishing', 'African Style Building', 'Renovation Works', 'Site Management Daily Update', 'Commercial Project Delivery', 'Interior and Exterior Design', 'Architectural Design'].map((title, index) => ({ id: -(index + 20), title, slug: title.toLowerCase().replaceAll(' ', '-'), category: ['completed', 'ongoing', 'completed', 'daily'][index % 4], description: 'High-quality construction project delivered with precision and attention to detail.', status: ['Completed', 'Continues', 'Completed', 'Daily'][index % 4], location: 'Zanzibar, Tanzania' } as Project));
const fallbackStats = [{ value: 183, suffix: '', label: 'Happy Clients' }, { value: 2363, suffix: '', label: 'Projects' }, { value: 5, suffix: '', label: 'Years of experience' }];
const fallbackTeam = [{ name: 'Adam Abdalla Said (Natepe)', position: 'Manager SCCL.', message: 'We are going to make SCCL the best Construction Company throughout.' }];
const fallbackAbout = 'We are a trusted construction company committed to delivering exceptional building solutions across Zanzibar, Tanzania. We specialize in residential, commercial and infrastructure projects with a strong focus on quality, safety and client satisfaction.';
const fallbackPortfolio = 'We take pride in delivering high-quality construction projects that stand the test of time. Our portfolio showcases a diverse range of residential, commercial, and infrastructure projects completed with precision, dedication, and attention to detail.';

export default function HomePage() {
  const { items } = useCart();
  const { openEnquiry } = useEnquiryModal();
  const [data, setData] = useState<any>();
  const [category, setCategory] = useState('all'), [detail, setDetail] = useState<Service | null>(null), [notice, setNotice] = useState(''), [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => {
    api<any>('/home/').then(setData).catch(() => setData({}));
  }, []);

  const services: Service[] = data?.services?.length ? data.services : data?.featured_services?.length ? data.featured_services : fallbackServices;
  const allProjects: Project[] = data?.projects?.length ? data.projects : data?.featured_projects?.length ? data.featured_projects : fallbackProjects;
  const projects = useMemo(() => allProjects.filter((item) => category === 'all' || item.category === category), [allProjects, category]);
  if (!data) return <Loader />;

  const hero = data.hero || {}, site = data.site_settings || {}, about = data.about || {};
  const stats = data.stats?.length ? data.stats : fallbackStats;
  const team = data.team?.length ? data.team : fallbackTeam;
  const bullets = Array.isArray(about.bullet_points) && about.bullet_points.length ? about.bullet_points : fallbackBullets;
  const thumbnails = allProjects.filter((project) => project.image).slice(0, 5);
  const testimonial = team[0] || fallbackTeam[0];

  return <main>
    <section id="home" className="sccl-hero">
      {hero.background_image && <img src={hero.background_image} alt="" className="hero-bg" />}
      <div className="hero-placeholder-bg" />
      <div className="hero-overlay" />
      <div className="wrap hero-content">
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>{hero.title || 'G&S CONTRACTORS LTD'}</motion.h1>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 }}>{hero.subtitle || hero.description || 'BUILDING QUALITY. DELIVERING EXCELLENCE.'}</motion.p>
      </div>
      <StaggerGroup className="wrap hero-service-strip">{serviceStrip.map((title, index) => <RevealCard className="hero-service-box" key={title}><span><LineIcon index={index} /></span><b>{title}</b></RevealCard>)}</StaggerGroup>
    </section>

    <section id="about" className="sccl-section bg-white">
      <div className="wrap about-layout">
        <AnimatedSection>
          <SectionHeader eyebrow="About" title={about.title || 'Welcome To G&S Contractors LTD'} />
          <p className="about-intro">{fallbackAbout}</p>
          <p>{about.description || fallbackAbout}</p>
          <ul className="about-checklist">{bullets.map((point: string) => <li key={point}>{point}</li>)}</ul>
        </AnimatedSection>
        <AnimatedSection className="about-media">{about.image ? <img src={about.image} alt="Construction project" /> : <Placeholder label="G&S Contractors LTD" kind="about" />}</AnimatedSection>
      </div>
      {thumbnails.length > 0 && <div className="wrap thumbnail-strip">{thumbnails.map((project) => <img src={project.image} alt={project.title} key={project.id} />)}</div>}
    </section>

    <section id="services" className="sccl-section bg-white">
      <div className="wrap">
        <AnimatedSection><SectionHeader eyebrow="Services" title="Check Our Services" /></AnimatedSection>
        <StaggerGroup className="services-grid">{services.map((service) => <ServiceCard key={service.id} service={service} onDetails={setDetail} onAdded={(fresh) => setNotice(fresh ? 'Service added to enquiry' : 'Service already in enquiry cart')} />)}</StaggerGroup>
      </div>
    </section>

    <section id="projects" className="sccl-section projects-section">
      <div className="wrap">
        <AnimatedSection><SectionHeader eyebrow="Advertisements" title="Check Our Advertisements" text={fallbackPortfolio} /></AnimatedSection>
        <div className="filter-tabs">{categoryTabs.map((item) => <button key={item.value} onClick={() => setCategory(item.value)} className={category === item.value ? 'is-active' : ''}>{item.label}</button>)}</div>
        <motion.div layout className="project-masonry">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</motion.div>
      </div>
    </section>

    <section className="stats-company-section">
      <div className="wrap stats-company-grid">
        <AnimatedSection className="company-logo-panel">{site.logo ? <img src={site.logo} alt={site.company_name || 'Company logo'} /> : <div className="text-logo">{site.company_name || 'G&S Contractors LTD'}<span>.</span></div>}</AnimatedSection>
        <AnimatedSection>
          <h2>{site.company_name || 'G&S Contractors LTD'}</h2>
          <p>We are proud on:</p>
          <div className="stats-list">{stats.slice(0, 3).map((stat: any) => <Stat key={stat.id || stat.label} value={Number(stat.value) || 0} suffix={stat.suffix} label={stat.label} />)}</div>
        </AnimatedSection>
      </div>
    </section>

    <section className="testimonial-band">
      <div className="wrap testimonial-inner">
        <div className="testimonial-photo">{testimonial.photo ? <img src={testimonial.photo} alt={testimonial.name} /> : <span>{initials(testimonial.name)}</span>}</div>
        <h3>{testimonial.name || 'Adam Abdalla Said (Natepe)'}</h3>
        <p className="role">{testimonial.position || 'Manager SCCL.'}</p>
        <blockquote>{testimonial.message || 'We are going to make SCCL the best Construction Company throughout.'}</blockquote>
      </div>
    </section>

    <ContactSection site={site} notify={setNotice} />
    <Footer site={site} openAdmin={() => setAdminOpen(true)} />
    <button className="back-to-top" onClick={() => scrollToSection('home')} aria-label="Back to top">↑</button>

    <AdminLoginModal open={adminOpen} onClose={() => setAdminOpen(false)} />
    <AnimatePresence>{detail && <ServiceDetail service={detail} close={() => setDetail(null)} notify={setNotice} />}</AnimatePresence>
    {notice && <button onClick={() => setNotice('')} className="notice-toast">{notice}</button>}
  </main>;
}

function Stat({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame = 0;
    const timer = window.setInterval(() => {
      frame += 1;
      setDisplay(Math.round((value * frame) / 32));
      if (frame >= 32) window.clearInterval(timer);
    }, 24);
    return () => window.clearInterval(timer);
  }, [value]);
  return <div className="stat-counter"><strong>{display}{suffix}</strong><span>{label}</span></div>;
}

function ServiceDetail({ service, close, notify }: { service: Service; close: () => void; notify: (message: string) => void }) {
  const { add, items } = useCart();
  const { openEnquiry } = useEnquiryModal();
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
    <motion.div initial={{ opacity: 0, scale: .94, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .96, y: 10 }} className="premium-modal max-h-[88vh] w-full max-w-3xl overflow-y-auto p-0">
      <div className="architectural-placeholder min-h-48 p-7 text-white"><div className="flex justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.2em] text-gold">{service.category || 'Service'}</p><h2 className="mt-3 text-3xl font-black">{service.title}</h2></div><button onClick={close} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-xl">x</button></div></div>
      <div className="p-7"><p className="whitespace-pre-line text-slate-600">{service.full_description}</p><div className="mt-7 flex flex-wrap gap-3"><button className="btn btn-gold" onClick={() => { const fresh = !items.some((item) => item.service === service.id); add(service); notify(fresh ? 'Service added to enquiry' : 'Service already in enquiry cart'); }}>Add to enquiry</button><button className="btn btn-dark" onClick={() => { add(service); close(); openEnquiry(); }}>Complete enquiry</button></div></div>
    </motion.div>
  </div>;
}

function ContactSection({ site, notify }: { site: any; notify: (message: string) => void }) {
  const { items, totalItems, remove, clear } = useCart();
  const { openEnquiry } = useEnquiryModal();
  const [sending, setSending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    try {
      const fields = Object.fromEntries(new FormData(event.currentTarget));
      await api('/contact-messages/', { method: 'POST', body: JSON.stringify(fields) });
      event.currentTarget.reset();
      notify('Thank you. We have received your message.');
    } catch (error: any) {
      notify(error.message);
    } finally {
      setSending(false);
    }
  }

  return <section id="contact" className="sccl-section contact-section">
    <div className="wrap">
      <AnimatedSection><SectionHeader eyebrow="Contact" title="Contact Us" /></AnimatedSection>
      <iframe className="contact-map" title="Zanzibar map" src="https://www.google.com/maps?q=Zanzibar,Tanzania&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      <div className="contact-grid">
        <AnimatedSection className="contact-info-list">
          <ContactCard title="Location" value={site.address || site.location || 'Zanzibar, Tanzania'} />
          <ContactCard title="Email" value={site.email || 'info@gscontractorsltd.com'} />
          <ContactCard title="Call" value={[site.primary_phone || '+255 745 113 963', site.secondary_phone || '+255 776 187 485'].filter(Boolean).join(' / ')} />
          <div id="enquiry" className="enquiry-panel"><b>Need a quotation?</b><p>Select services and submit your enquiry.</p><button type="button" onClick={openEnquiry}>{items.length ? `Complete enquiry - ${totalItems}` : 'Open enquiry form'}</button></div>
        </AnimatedSection>
        <AnimatedSection>
          <form className="contact-form" onSubmit={submit}>
            <input name="full_name" required placeholder="Your Name" />
            <input type="email" name="email" placeholder="Your Email" />
            <input name="subject" placeholder="Subject" />
            <textarea name="message" required placeholder="Message" />
            <button disabled={sending}>{sending ? 'Sending...' : 'Send Message'}</button>
          </form>
          {items.length > 0 && <div className="selected-services"><b>Your enquiry</b>{items.map((item) => <p key={item.service}>{item.service_title_snapshot}<button type="button" onClick={() => remove(item.service)}>x</button></p>)}<button type="button" onClick={clear}>Clear selected services</button></div>}
        </AnimatedSection>
      </div>
    </div>
  </section>;
}

function ContactCard({ title, value }: { title: string; value: string }) {
  return <div className="contact-info-card"><b>{title}</b><span>{value}</span></div>;
}

function Footer({ site, openAdmin }: { site: any; openAdmin: () => void }) {
  return <footer className="footer-dark">
    <div className="wrap footer-grid">
      <div><p className="footer-logo">{site.company_name || 'G&S Contractors LTD'}<span>.</span></p><p>{site.address || site.location || 'Zanzibar, Tanzania'}</p><p>{site.primary_phone || '+255 745 113 963'}</p><p>{site.email || 'info@gscontractorsltd.com'}</p><div className="social-row">{site.facebook_url && <a href={site.facebook_url}>f</a>}{site.instagram_url && <a href={site.instagram_url}>ig</a>}{site.whatsapp_number && <a href={`https://wa.me/${String(site.whatsapp_number).replace(/\D/g, '')}`}>wa</a>}</div></div>
      <div><h3>Working Days</h3><p>{site.working_days || 'Monday - Saturday'}</p></div>
      <div><h3>Services Time</h3><p>{site.working_hours || '08:00 - 17:00'}</p></div>
      <div><h3>Company</h3><p>{site.footer_text || 'Welcome to G&S Contractors LTD. Building quality and delivering excellence across Zanzibar, Tanzania.'}</p><button onClick={openAdmin}>Admin login</button></div>
    </div>
  </footer>;
}

function LineIcon({ index }: { index: number }) {
  const paths = [
    'M8 38h32M12 38V18l12-7 12 7v20M18 38V26h12v12',
    'M10 35h28M15 35V16h18v19M19 16v-5h10v5M18 23h12M18 29h12',
    'M12 12h24v24H12zM18 18h12v12H18zM12 24H6M42 24h-6',
    'M9 36h30M14 36V22l10-9 10 9v14M20 36v-8h8v8M33 15l6-6',
    'M8 38 24 10l16 28M16 26h16M20 18h8M24 10v28'
  ];
  return <svg viewBox="0 0 48 48" aria-hidden="true"><path d={paths[index] || paths[0]} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'GS';
}
