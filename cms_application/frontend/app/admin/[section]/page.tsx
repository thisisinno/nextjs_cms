'use client';

import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useState } from 'react';
import { api, getAdminToken } from '@/lib/api';
import { AdminRows } from '@/components/AdminRows';
import { ImageUploader } from '@/components/ImageUploader';

const config: Record<string, { endpoint: string; title: string; fields: string[] }> = {
  services: { endpoint: '/admin/services/', title: 'Services', fields: ['title', 'slug', 'category', 'short_description', 'full_description', 'image', 'icon', 'display_order', 'is_active'] },
  projects: { endpoint: '/admin/projects/', title: 'Projects', fields: ['title', 'slug', 'category', 'description', 'image', 'status', 'location', 'start_date', 'end_date', 'is_featured', 'display_order', 'is_active'] },
  home: { endpoint: '/admin/hero/', title: 'Hero content', fields: ['title', 'subtitle', 'description', 'background_image', 'primary_button_text', 'primary_button_link', 'secondary_button_text', 'secondary_button_link', 'is_active'] },
  about: { endpoint: '/admin/about/', title: 'About content', fields: ['title', 'description', 'image', 'bullet_points', 'is_active'] },
  info: { endpoint: '/admin/info-cards/', title: 'Vision, mission and focus', fields: ['type', 'title', 'description', 'icon', 'display_order', 'is_active'] },
  team: { endpoint: '/admin/team/', title: 'Team', fields: ['name', 'position', 'message', 'photo', 'display_order', 'is_active'] },
  stats: { endpoint: '/admin/statistics/', title: 'Statistics', fields: ['label', 'value', 'suffix', 'display_order', 'is_active'] },
  settings: { endpoint: '/admin/settings/', title: 'Site settings', fields: ['company_name', 'logo', 'primary_phone', 'secondary_phone', 'email', 'location', 'address', 'working_days', 'working_hours', 'footer_text', 'facebook_url', 'instagram_url', 'whatsapp_number'] },
};

const fieldTypes: Record<string, 'bullet-list' | 'textarea' | 'image' | 'boolean' | 'text'> = {
  bullet_points: 'bullet-list',
  description: 'textarea',
  full_description: 'textarea',
  short_description: 'textarea',
  message: 'textarea',
  footer_text: 'textarea',
  address: 'textarea',
  image: 'image',
  background_image: 'image',
  logo: 'image',
  photo: 'image',
  is_active: 'boolean',
  is_featured: 'boolean',
};

function labelFor(field: string) {
  return field.replaceAll('_', ' ');
}

function normalizeBulletPoints(value: unknown): string {
  const flatten = (input: unknown): string[] => {
    if (Array.isArray(input)) {
      return input.flatMap((item) => flatten(item));
    }

    if (typeof input === 'string') {
      const text = input.trim();
      if (!text) return [];

      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) return flatten(parsed);
      } catch {
        // Normal string input.
      }

      return input
        .split('\n')
        .flatMap((line) => line.split(','))
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (input === null || input === undefined) return [];
    return [String(input).trim()].filter(Boolean);
  };

  return JSON.stringify(flatten(value));
}

function normalizeFieldForSubmit(field: string, value: unknown) {
  if (field === 'bullet_points') return normalizeBulletPoints(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value === null || value === undefined) return '';
  return String(value);
}

function friendlyError(message: string) {
  if (message.includes('bullet_points')) {
    return 'Please check your bullet points. Write one short point per row.';
  }
  return message;
}

export default function Section({ params }: { params: Promise<{ section: string }> }) {
  const [name, setName] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [edit, setEdit] = useState<any>();
  const [error, setError] = useState('');
  const auth = { Authorization: `Bearer ${getAdminToken()}` };

  useEffect(() => {
    params.then((x) => setName(x.section));
  }, [params]);

  const c = config[name];

  async function load() {
    if (!name) return;
    try {
      const path = name === 'enquiries' ? '/enquiries/' : name === 'messages' ? '/contact-messages/' : c?.endpoint;
      if (!path) return;
      const result: any = await api(path, { headers: auth });
      setRows(Array.isArray(result) ? result : result.results ? [...result.results] : [result]);
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, [name]);

  if (!name) return null;
  if (name === 'enquiries' || name === 'messages') {
    return <main className="p-5 md:p-9"><h1 className="text-3xl font-bold">{name === 'enquiries' ? 'Enquiries' : 'Contact messages'}</h1>{name === 'enquiries' && <AdminRows rows={rows} />}<Status rows={rows} messages={name === 'messages'} reload={load} /></main>;
  }
  if (!c) return <main className="p-8">Not found.</main>;

  return <main className="p-5 md:p-9">
    <div className="flex justify-between gap-4">
      <div><h1 className="text-3xl font-bold">{c.title}</h1><p className="mt-2 text-slate-600">Manage published CMS content.</p></div>
      {name !== 'settings' && <button className="btn btn-gold" onClick={() => setEdit({})}>Add item</button>}
    </div>
    {error && <p className="mt-4 text-red-700">{error}</p>}
    <div className="mt-6 overflow-x-auto rounded-xl bg-white">
      <table className="w-full text-left text-sm">
        <thead><tr className="border-b"><th className="p-3">Name / title</th><th className="p-3">Status</th><th className="p-3" /></tr></thead>
        <tbody>{rows.map((row) => <tr className="border-b" key={row.id || 'setting'}><td className="p-3 font-semibold">{row.title || row.name || row.company_name}</td><td className="p-3">{row.is_active === false ? 'Hidden' : 'Published'}</td><td className="p-3 text-right"><button onClick={() => setEdit(row)}>Edit</button>{row.id && <button className="ml-4 text-red-700" onClick={async () => { if (confirm('Delete this item?')) { await api(`${c.endpoint}${row.id}/`, { method: 'DELETE', headers: auth }); load(); } }}>Delete</button>}</td></tr>)}</tbody>
      </table>
    </div>
    {edit && <Editor item={edit} sectionName={name} config={c} close={() => setEdit(undefined)} saved={load} />}
  </main>;
}

function Status({ rows, messages, reload }: { rows: any[]; messages: boolean; reload: () => void }) {
  const auth = { Authorization: `Bearer ${getAdminToken()}` };
  return <div className="mt-5 space-y-3">{rows.map((row) => <article className="card p-5" key={row.id}><div className="flex justify-between gap-4"><div><b>{row.full_name}</b><p className="text-sm text-slate-600">{row.phone || row.email} {row.subject && `· ${row.subject}`}</p><p className="mt-2 text-sm">{row.message}</p></div><select className="input h-11 w-auto" value={row.status} onChange={async (e) => { await api(`${messages ? '/contact-messages/' : '/enquiries/'}${row.id}/`, { method: 'PATCH', headers: auth, body: JSON.stringify({ status: e.target.value }) }); reload(); }}>{(messages ? ['new', 'viewed', 'replied'] : ['new', 'viewed', 'contacted', 'closed']).map((s) => <option key={s}>{s}</option>)}</select></div></article>)}</div>;
}

function Editor({ item, sectionName, config, close, saved }: any) {
  const [values, setValues] = useState<any>(item);
  const [file, setFile] = useState<File>();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const auth = { Authorization: `Bearer ${getAdminToken()}` };
  const image = config.fields.find((x: string) => fieldTypes[x] === 'image');
  const isAbout = sectionName === 'about';

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const fd = new FormData();
      config.fields.forEach((field: string) => {
        if (field === image && file) {
          fd.append(field, file);
        } else if (field !== image) {
          fd.append(field, normalizeFieldForSubmit(field, values[field]));
        }
      });
      await api(`${config.endpoint}${values.id ? `${values.id}/` : ''}`, { method: values.id ? 'PATCH' : 'POST', headers: auth, body: fd });
      setSuccess(isAbout ? 'About section updated successfully.' : 'Changes saved successfully.');
      saved();
      setTimeout(close, 350);
    } catch (e: any) {
      setError(friendlyError(e.message));
    } finally {
      setSaving(false);
    }
  }

  return <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 p-4">
    <form onSubmit={save} className="mx-auto my-8 max-w-2xl rounded-2xl bg-white p-6">
      <div className="flex justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{isAbout ? 'Edit About section' : `${values.id ? 'Edit' : 'Create'} ${config.title}`}</h2>
          {isAbout && <p className="mt-1 text-sm text-slate-600">Update the company story and key points shown on the website.</p>}
        </div>
        <button type="button" onClick={close}>✕</button>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{config.fields.map((field: string) => <Field key={field} field={field} value={values[field]} set={setValues} setFile={setFile} />)}</div>
      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      {success && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{success}</p>}
      <div className="mt-6 flex gap-3"><button className="btn btn-gold" disabled={saving}>{saving ? 'Saving changes…' : 'Save changes'}</button><button type="button" className="btn" onClick={close}>Cancel</button></div>
    </form>
  </div>;
}

function Field({ field, value, set, setFile }: { field: string; value: any; set: any; setFile: any }) {
  const type = fieldTypes[field] || 'text';
  const long = type === 'textarea' || type === 'bullet-list';
  const change = (e: ChangeEvent<any>) => set((v: any) => ({ ...v, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  if (type === 'image') return <ImageUploader label={field} current={typeof value === 'string' ? value : undefined} onChange={setFile} />;
  if (type === 'boolean') return <label className="flex items-center gap-2 pt-7 capitalize"><input type="checkbox" checked={!!value} onChange={change} />{labelFor(field)}</label>;
  if (type === 'bullet-list') return <BulletListEditor value={value} onChange={(items) => set((v: any) => ({ ...v, [field]: items }))} />;
  if (field === 'category') return <label className="text-sm font-semibold">Category<select className="input mt-1" value={value || ''} onChange={change}><option value="">Select category</option>{['completed', 'ongoing', 'daily', 'featured'].map((x) => <option key={x}>{x}</option>)}</select></label>;
  if (field === 'type') return <label className="text-sm font-semibold">Card type<select className="input mt-1" value={value || 'vision'} onChange={change}>{['vision', 'mission', 'focus', 'value'].map((x) => <option key={x}>{x}</option>)}</select></label>;
  return <label className={`text-sm font-semibold capitalize ${long ? 'sm:col-span-2' : ''}`}>{labelFor(field)}{type === 'textarea' ? <textarea className="input mt-1 min-h-28 font-normal" value={value || ''} onChange={change} placeholder={field === 'description' ? 'Write clear content for this section.' : undefined} /> : <input className="input mt-1 font-normal" type={field.includes('date') ? 'date' : field === 'email' ? 'email' : field === 'display_order' || field === 'value' ? 'number' : 'text'} value={value || ''} onChange={change} />}</label>;
}

function toBulletRows(value: unknown): string[] {
  if (Array.isArray(value)) {
    const rows = value.flatMap((item) => {
      if (Array.isArray(item)) return item.map((x) => String(x ?? ''));
      return [String(item ?? '')];
    });
    return rows.length ? rows : [''];
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [''];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        const rows = parsed.flatMap((item) => {
          if (Array.isArray(item)) return item.map((x) => String(x ?? ''));
          return [String(item ?? '')];
        });
        return rows.length ? rows : [''];
      }
    } catch {
      // Not JSON, continue.
    }

    return value.split('\n').length ? value.split('\n') : [value];
  }

  return [''];
}

function BulletListEditor({ value, onChange }: { value: unknown; onChange: (items: string[]) => void }) {
  const rows = toBulletRows(value);

  const update = (index: number, next: string) => {
    const copy = [...rows];
    copy[index] = next;
    onChange(copy);
  };

  const add = () => {
    onChange([...rows, '']);
  };

  const remove = (index: number) => {
    const copy = rows.filter((_, i) => i !== index);
    onChange(copy.length ? copy : ['']);
  };

  const keyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const copy = [...rows];
      copy.splice(index + 1, 0, '');
      onChange(copy);
    }
  };

  return <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-sand/60 p-4">
    <div>
      <p className="text-sm font-bold">Bullet points</p>
      <p className="mt-1 text-xs text-slate-600">Write short points. These appear as checklist items on the About section.</p>
    </div>
    <div className="mt-3 space-y-2">
      {rows.map((item, index) => <div className="flex gap-2" key={index}>
        <input className="input bg-white" value={item} onChange={(event) => update(index, event.target.value)} onKeyDown={(event) => keyDown(event, index)} placeholder={['Reputation for excellence', 'Partnership with clients', 'Guided by commitment', 'A team of professionals'][index] || 'Another key point'} />
        <button type="button" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-lg font-bold text-red-700 shadow-sm disabled:opacity-40" onClick={() => remove(index)} disabled={rows.length === 1 && !item} aria-label="Remove bullet">×</button>
      </div>)}
    </div>
    {rows.every((item) => !item.trim()) && <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600">Add key points that appear under About section.</p>}
    <button type="button" className="btn btn-dark mt-3" onClick={add}>+ Add bullet</button>
  </div>;
}
