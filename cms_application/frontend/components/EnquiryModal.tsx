'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useCart } from './cart';

type Fields = {
  full_name: string;
  phone: string;
  email: string;
  location: string;
  preferred_contact_method: string;
  message: string;
};

const initialFields: Fields = { full_name: '', phone: '', email: '', location: '', preferred_contact_method: 'Phone', message: '' };

function validEmail(value: string) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function EnquiryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, totalItems, remove, updateNote, clear } = useCart();
  const [fields, setFields] = useState<Fields>(initialFields);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError('');
  }, [open]);

  function update(field: keyof Fields, value: string) {
    setFields(current => ({ ...current, [field]: value }));
  }

  function exploreServices() {
    onClose();
    setTimeout(() => {
      const target = document.getElementById('services');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      full_name: String(fields.full_name || '').trim(),
      phone: String(fields.phone || '').trim(),
      email: String(fields.email || '').trim(),
      location: String(fields.location || '').trim(),
      preferred_contact_method: String(fields.preferred_contact_method || 'Phone'),
      message: String(fields.message || '').trim(),
      items: items.map(item => ({
        service: item.service > 0 ? item.service : null,
        service_title_snapshot: item.service_title_snapshot,
        note: item.note || '',
        quantity: Math.max(1, item.quantity || 1),
      })),
    };

    if (!payload.items.length) { setError('Select at least one service before sending enquiry.'); return; }
    if (!payload.full_name) { setError('Please enter your full name.'); return; }
    if (!payload.phone) { setError('Please enter your phone number.'); return; }
    if (!payload.location) { setError('Please enter project location.'); return; }
    if (!validEmail(payload.email)) { setError('Please enter a valid email address.'); return; }

    setSending(true);
    setError('');
    try {
      await api('/enquiries/', { method: 'POST', body: JSON.stringify(payload) });
      clear();
      setFields(initialFields);
      setSent(true);
      setTimeout(() => { setSent(false); onClose(); }, 1800);
    } catch (err: any) {
      setError(err.message || 'We could not send your enquiry. Please check the form and try again.');
    } finally {
      setSending(false);
    }
  }

  return <AnimatePresence>
    {open && <motion.div className="fixed inset-0 z-[90] overflow-y-auto bg-ink/80 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex min-h-full items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 24, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: .98 }} transition={{ type: 'spring', damping: 24, stiffness: 260 }} className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/15 bg-white shadow-2xl">
          <div className="relative bg-ink px-6 py-5 text-white">
            <div className="absolute inset-0 opacity-30 hero-grid" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.22em] text-gold">Request quotation</p>
                <h2 className="mt-2 text-2xl font-black md:text-4xl">Complete your enquiry</h2>
                <p className="mt-2 text-sm text-slate-300">{totalItems} selected {totalItems === 1 ? 'service' : 'services'}</p>
              </div>
              <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-xl hover:bg-white/20" aria-label="Close enquiry form">×</button>
            </div>
          </div>

          {sent ? <div className="grid min-h-[420px] place-items-center p-8 text-center">
            <motion.div initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold text-4xl text-ink">✓</div>
              <h3 className="mt-6 text-3xl font-bold">Enquiry sent successfully</h3>
              <p className="mt-2 text-slate-600">Our team will contact you shortly.</p>
            </motion.div>
          </div> : <form onSubmit={submit} className="grid gap-0 lg:grid-cols-[1.05fr_.95fr]">
            <section className="border-b border-slate-200 bg-sand/70 p-5 lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-ink">Selected services</h3>
                <span className="rounded-full bg-ink px-3 py-1 text-sm font-bold text-gold">{totalItems}</span>
              </div>
              {items.length ? <div className="mt-4 max-h-[440px] space-y-3 overflow-y-auto pr-1">
                {items.map(item => <article key={item.service} className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-ink">{item.service_title_snapshot}</p>
                      {item.service <= 0 && <p className="mt-1 text-xs font-semibold text-gold">Placeholder service</p>}
                    </div>
                    <button type="button" onClick={() => remove(item.service)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sand text-lg text-red-700 hover:bg-red-50" aria-label={`Remove ${item.service_title_snapshot}`}>×</button>
                  </div>
                  <textarea className="input mt-3 min-h-20" value={item.note} onChange={event => updateNote(item.service, event.target.value)} placeholder="Note for this service" />
                </article>)}
              </div> : <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <p className="text-4xl text-gold">◇</p>
                <h4 className="mt-3 text-xl font-bold">Choose services first</h4>
                <p className="mt-2 text-sm text-slate-600">Select one or more services, then complete your enquiry here.</p>
                <button type="button" className="btn btn-gold mt-5" onClick={exploreServices}>Explore services</button>
              </div>}
            </section>

            <section className="p-5">
              <h3 className="text-lg font-bold text-ink">Contact details</h3>
              <div className="mt-4 space-y-3">
                <input className="input" value={fields.full_name} onChange={event => update('full_name', event.target.value)} required placeholder="Full name" />
                <input className="input" value={fields.phone} onChange={event => update('phone', event.target.value)} required placeholder="Phone" />
                <input className="input" type="email" value={fields.email} onChange={event => update('email', event.target.value)} placeholder="Email (optional)" />
                <input className="input" value={fields.location} onChange={event => update('location', event.target.value)} required placeholder="Project location" />
                <select className="input" value={fields.preferred_contact_method} onChange={event => update('preferred_contact_method', event.target.value)}>
                  <option>Phone</option>
                  <option>WhatsApp</option>
                  <option>Email</option>
                </select>
                <textarea className="input min-h-28" value={fields.message} onChange={event => update('message', event.target.value)} placeholder="Tell us about the project" />
              </div>
              {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
              <div className="mt-5 flex flex-wrap gap-3">
                <button className="btn btn-gold" disabled={sending}>{sending && <span className="button-dot" />}{sending ? 'Sending enquiry' : 'Send enquiry'}</button>
                <button type="button" className="btn bg-sand text-ink" onClick={onClose}>Cancel</button>
              </div>
            </section>
          </form>}
        </motion.div>
      </div>
    </motion.div>}
  </AnimatePresence>;
}
