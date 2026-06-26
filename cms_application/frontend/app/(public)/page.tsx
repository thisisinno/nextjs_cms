'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '@/lib/api';
import type { Project, Service } from '@/lib/types';
import { Loader } from '@/components/Loader';
import { AnimatedSection, Placeholder, ProjectCard, RevealCard, SectionHeader, ServiceCard, SkeletonGrid, StaggerGroup, scrollToSection } from '@/components/site';
import { useCart } from '@/components/cart';
import { useEnquiryModal } from '@/components/enquiry-modal-context';
import { AdminLoginModal } from '@/components/AdminLoginModal';
import { RequestIcon } from '@/components/EnquiryIconButton';

const categories = ['all', 'completed', 'ongoing', 'daily', 'featured'];
const fallbackBullets = ['Reputation for excellence', 'Partnership with clients', 'Guided by commitment', 'A team of professionals'];
const fallbackServices: Service[] = ['Building Construction', 'Buildings Renew', 'Interior & Exterior Design', 'Buildings Renovation', 'Architectural Design', 'Construction Project Management'].map((title, index) => ({ id: -(index + 1), title, slug: title.toLowerCase().replaceAll(' ', '-'), category: 'Construction', short_description: 'Professional planning and delivery shaped around your project goals.', full_description: 'A disciplined construction and consultancy service with clear communication, quality control and reliable delivery from concept through handover.' }));
const fallbackProjects: Project[] = [['Modern Residential House', 'completed'], ['Commercial Building Renovation', 'ongoing'], ['Interior Finishing Project', 'completed'], ['Architectural Design Concept', 'featured'], ['Ongoing Site Supervision', 'daily'], ['Apartment Block Construction', 'ongoing']].map(([title, category], index) => ({ id: -(index + 20), title, slug: title.toLowerCase().replaceAll(' ', '-'), category, description: 'A considered construction project delivered with practical detail.', status: category } as Project));
const fallbackInfo = [{ type: 'vision', title: 'Vision', description: 'To become a trusted construction and consultancy partner known for reliable, lasting and modern project delivery.' }, { type: 'mission', title: 'Mission', description: 'To deliver safe, efficient and high-quality construction services through professionalism, transparency and commitment.' }, { type: 'focus', title: 'Focus', description: 'Client satisfaction, project quality, cost control, safety and timely delivery.' }];
const fallbackStats = [{ value: 120, suffix: '+', label: 'Happy Clients' }, { value: 86, suffix: '+', label: 'Projects' }, { value: 15, suffix: '+', label: 'Years Experience' }, { value: 28, suffix: '+', label: 'Team Members' }];
const fallbackTeam = [{ name: 'Managing Director', position: 'Leadership & delivery', message: 'Guiding every engagement with accountability and long-term client partnership.' }, { name: 'Project Manager', position: 'Planning & control', message: 'Coordinating schedules, budgets and communication across every stage.' }, { name: 'Site Engineer', position: 'Technical supervision', message: 'Protecting quality, safety and practical details on site.' }, { name: 'Architectural Designer', position: 'Design & detailing', message: 'Shaping spaces with precision, usability and visual balance.' }];

export default function HomePage() {
  const { add, items } = useCart();
  const { openEnquiry } = useEnquiryModal();
  const [data, setData] = useState<any>();
  const [category, setCategory] = useState('all'), [detail, setDetail] = useState<Service | null>(null), [notice, setNotice] = useState(''), [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => {
    api<any>('/home/').then(setData).catch(() => setData({}));
  }, []);

  const services: Service[] = data?.services?.length ? data.services : data?.featured_services?.length ? data.featured_services : fallbackServices;
  const allProjects: Project[] = data?.projects?.length ? data.projects : data?.featured_projects?.length ? data.featured_projects : fallbackProjects;
  const projects = useMemo(() => allProjects.filter((item) => category === 'all' || (category === 'featured' ? item.is_featured || item.category === 'featured' : item.category === category)), [allProjects, category]);
  if (!data) return <Loader />;

  const hero = data.hero || {}, site = data.site_settings || {}, about = data.about || {};
  const info = data.info_cards?.length ? data.info_cards : fallbackInfo;
  const stats = data.stats?.length ? data.stats : fallbackStats;
  const team = data.team?.length ? data.team : fallbackTeam;
  const bullets = Array.isArray(about.bullet_points) && about.bullet_points.length ? about.bullet_points : fallbackBullets;

  return <main>
    <section id="home" className="hero-shell relative isolate min-h-[calc(100vh-72px)] overflow-hidden bg-ink text-white">
      <div className="absolute inset-0">
        {hero.background_image && <img src={hero.background_image} alt="" className="h-full w-full object-cover opacity-50" />}
        <div className="hero-grid absolute inset-0" />
        <div className="hero-animated-overlay absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/88 to-ink/35" />
      </div>
      <div className="wrap relative grid min-h-[calc(100vh-72px)] items-center gap-10 py-24 lg:grid-cols-[1fr_360px]">
        <div className="max-w-4xl">
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-5 font-bold uppercase tracking-[.24em] text-gold">{hero.subtitle || 'Engineering · Construction · Consultancy'}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="text-5xl font-black leading-[.95] md:text-7xl">{hero.title || 'We Build Your'} <span className="text-gold">Future</span></motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .22 }} className="mt-7 max-w-2xl text-lg leading-8 text-slate-200">{hero.description || 'From concept to completion, we deliver construction, renovation, design and project management services with discipline, clarity and care.'}</motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .34 }} className="mt-9 flex flex-wrap gap-3"><button onClick={() => scrollToSection('services')} className="btn btn-gold premium-cta">{hero.primary_button_text || 'Explore Services'}</button><button onClick={openEnquiry} className="btn request-quote-button border border-white/30 text-white"><RequestIcon />{hero.secondary_button_text || 'Request Quotation'}</button></motion.div>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .45 }} className="mt-12 grid max-w-3xl gap-3 sm:grid-cols-3">{stats.slice(0, 3).map((stat: any) => <div className="hero-stat" key={stat.label}><strong>{stat.value}{stat.suffix}</strong><span>{stat.label}</span></div>)}</motion.div>
        </div>
        <StaggerGroup className="hidden space-y-4 lg:block">{services.slice(0, 3).map((service, index) => <RevealCard key={service.id} className="floating-service-card" ><button onClick={() => scrollToSection('services')} className="w-full text-left"><span className="text-gold">0{index + 1}</span><strong>{service.title}</strong><small>{service.short_description}</small></button></RevealCard>)}</StaggerGroup>
      </div>
    </section>

    <section id="about" className="premium-section bg-white">
      <div className="wrap grid items-center gap-12 lg:grid-cols-[1.02fr_.98fr]">
        <AnimatedSection className="premium-card p-7 md:p-9">
          <SectionHeader eyebrow="Who we are" title={about.title || 'About Scenic Construction & Consultancy Company Limited'} />
          <p className="whitespace-pre-line text-lg leading-8 text-slate-600">{about.description || 'Scenic Construction and Consultancy Company Limited is a locally owned construction and project management company focused on engineering, construction, renovation and architectural design services. We combine professional standards, client partnership and practical delivery to create reliable spaces that last.'}</p>
          <StaggerGroup className="mt-8 grid gap-3 sm:grid-cols-2">{bullets.map((point: string) => <RevealCard className="checklist-card" key={point}><span className="gold-check">✓</span><b>{point}</b></RevealCard>)}</StaggerGroup>
        </AnimatedSection>
        <AnimatedSection className="relative">
          <div className="about-image-frame aspect-[5/4] overflow-hidden rounded-[1.75rem] bg-ink/10">{about.image ? <img src={about.image} alt="Construction team at work" className="h-full w-full object-cover" /> : <Placeholder label="Construction · Consultancy · Project Management" kind="about" />}</div>
          <div className="floating-badge left-5 top-6">Quality-first delivery</div>
          <div className="floating-badge right-4 top-1/2">Client partnership</div>
          <div className="floating-badge bottom-5 left-10">Professional team</div>
        </AnimatedSection>
      </div>
    </section>

    <section className="premium-section dark-band">
      <div className="wrap"><StaggerGroup className="grid gap-5 md:grid-cols-3">{info.slice(0, 3).map((card: any) => <RevealCard className="info-card gradient-border-card" key={card.id || card.type}><span>{card.type === 'mission' ? '↗' : card.type === 'focus' ? '◇' : '◉'}</span><h3>{card.title}</h3><p>{card.description}</p></RevealCard>)}</StaggerGroup></div>
    </section>

    <section id="services" className="premium-section bg-white">
      <div className="wrap"><AnimatedSection><SectionHeader eyebrow="Capabilities" title="Technical capability, carefully delivered" text="Select the services relevant to your project and send one focused enquiry." /></AnimatedSection><StaggerGroup className="grid gap-6 md:grid-cols-3">{services.length ? services.map((service) => <ServiceCard key={service.id} service={service} onDetails={setDetail} onAdded={(fresh) => setNotice(fresh ? 'Service added to enquiry' : 'Service already in enquiry cart')} />) : <SkeletonGrid />}</StaggerGroup></div>
    </section>

    <section className="premium-section stats-band text-white">
      <div className="wrap"><StaggerGroup className="grid gap-5 text-center sm:grid-cols-2 lg:grid-cols-4">{stats.map((stat: any) => <RevealCard className="stat-card" key={stat.id || stat.label}><Stat value={Number(stat.value) || 0} suffix={stat.suffix} label={stat.label} /></RevealCard>)}</StaggerGroup></div>
    </section>

    <section id="projects" className="premium-section">
      <div className="wrap"><AnimatedSection><SectionHeader eyebrow="Advertisement / selected work" title="Projects with lasting value" /></AnimatedSection><div className="mb-8 flex flex-wrap gap-2">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`animated-filter-pill ${category === item ? 'is-active' : ''}`}>{item}</button>)}</div><motion.div layout className="grid gap-6 md:grid-cols-3">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</motion.div></div>
    </section>

    <section id="team" className="premium-section bg-white">
      <div className="wrap"><AnimatedSection><SectionHeader eyebrow="Our people" title="Experience you can speak to" /></AnimatedSection><StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{team.map((member: any, index: number) => <RevealCard className="team-card" key={member.id || member.name}><div className="team-photo">{member.photo ? <img src={member.photo} alt={member.name} /> : <span>{member.name?.slice(0, 1) || index + 1}</span>}</div><h3>{member.name}</h3><p>{member.position}</p><small>{member.message || 'Focused on practical delivery, clear communication and quality control.'}</small></RevealCard>)}</StaggerGroup></div>
    </section>

    <ContactSection site={site} notify={setNotice} />

    <footer className="bg-ink py-12 text-slate-300"><div className="wrap grid gap-8 md:grid-cols-3"><div><p className="font-black tracking-[.18em] text-white">{site.company_name || 'SCCL'}<span className="text-gold">.</span></p><p className="mt-4 text-sm">{site.footer_text || 'Built with technical care and lasting accountability.'}</p></div><div className="text-sm"><p>{site.address || site.location || 'Dar es Salaam & Zanzibar, Tanzania'}</p><p className="mt-2">{site.primary_phone || '+255 700 000 000'} · {site.email || 'info@scenicconstruction.co.tz'}</p><p className="mt-2">{site.working_days || 'Monday - Saturday'} {site.working_hours || '08:00 - 17:00'}</p></div><div className="md:text-right"><button className="text-sm text-gold hover:text-white" onClick={() => setAdminOpen(true)}>Admin Access</button></div></div></footer>

    <AdminLoginModal open={adminOpen} onClose={() => setAdminOpen(false)} />
    <AnimatePresence>{detail && <ServiceDetail service={detail} close={() => setDetail(null)} notify={setNotice} />}</AnimatePresence>
    {notice && <button onClick={() => setNotice('')} className="fixed bottom-5 right-5 z-[80] rounded-xl bg-ink px-5 py-4 text-sm font-semibold text-white shadow-xl">{notice}</button>}
  </main>;
}

function Stat({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame = 0;
    const total = 36;
    const timer = window.setInterval(() => {
      frame += 1;
      setDisplay(Math.round((value * frame) / total));
      if (frame >= total) window.clearInterval(timer);
    }, 24);
    return () => window.clearInterval(timer);
  }, [value]);
  return <><strong>{display}{suffix}</strong><p>{label}</p></>;
}

function ServiceDetail({ service, close, notify }: { service: Service; close: () => void; notify: (message: string) => void }) {
  const { add, items } = useCart();
  const { openEnquiry } = useEnquiryModal();
  return <div className="fixed inset-0 z-50 grid place-items-center bg-ink/75 p-4 backdrop-blur-sm">
    <motion.div initial={{ opacity: 0, scale: .94, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .96, y: 10 }} className="premium-modal max-h-[88vh] w-full max-w-3xl overflow-y-auto p-0">
      <div className="architectural-placeholder min-h-48 p-7 text-white"><div className="flex justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.2em] text-gold">{service.category || 'Service'}</p><h2 className="mt-3 text-3xl font-black">{service.title}</h2></div><button onClick={close} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-xl">×</button></div></div>
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

  return <section id="contact" className="premium-section contact-band">
    <div className="wrap grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
      <AnimatedSection>
        <SectionHeader eyebrow="Contact" title="Let's discuss your next project." />
        <div className="grid gap-3">
          <div className="contact-info-card"><b>Location</b><span>{site.location || 'Dar es Salaam & Zanzibar, Tanzania'}</span></div>
          <div className="contact-info-card"><b>Phone</b><span>{site.primary_phone || '+255 700 000 000'}</span></div>
          <div className="contact-info-card"><b>Email</b><span>{site.email || 'info@scenicconstruction.co.tz'}</span></div>
        </div>
        <div id="enquiry" className="quotation-callout mt-6"><p className="font-bold uppercase tracking-widest text-gold">Need a quotation?</p><h3>Select services and submit your enquiry in seconds.</h3><button type="button" onClick={openEnquiry} className="btn btn-gold w-full">{items.length ? `Complete enquiry - ${totalItems} selected services` : 'Open enquiry form'}</button></div>
      </AnimatedSection>
      <AnimatedSection className="premium-card p-6 md:p-8">
        <form className="grid gap-3" onSubmit={submit}><input className="premium-input" name="full_name" required placeholder="Full name" /><div className="grid gap-3 sm:grid-cols-2"><input className="premium-input" name="phone" placeholder="Phone" /><input className="premium-input" type="email" name="email" placeholder="Email" /></div><input className="premium-input" name="subject" placeholder="Subject" /><textarea className="premium-input min-h-32" name="message" required placeholder="How can we help?" /><button className="btn btn-dark" disabled={sending}>{sending && <span className="button-dot" />}{sending ? 'Sending' : 'Send message'}</button></form>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-sand/60 p-5"><div className="flex items-center justify-between gap-3"><b>Your enquiry</b><span className="rounded-full bg-ink px-3 py-1 text-sm font-bold text-gold">{totalItems} selected</span></div>{items.length ? <ul className="mt-4 space-y-3">{items.map((item) => <li className="rounded-xl bg-white p-3 shadow-sm" key={item.service}><div className="flex items-center justify-between gap-3"><b>✓ {item.service_title_snapshot}</b><button type="button" onClick={() => remove(item.service)} className="grid h-8 w-8 place-items-center rounded-full text-lg text-slate-600 hover:bg-slate-100 hover:text-red-700" aria-label={`Remove ${item.service_title_snapshot}`}>×</button></div></li>)}<button type="button" onClick={clear} className="text-sm font-semibold text-red-700">Clear selected services</button></ul> : <p className="mt-3 text-sm text-slate-600">Choose one or more services above to build your quotation request.</p>}</div>
      </AnimatedSection>
    </div>
  </section>;
}
