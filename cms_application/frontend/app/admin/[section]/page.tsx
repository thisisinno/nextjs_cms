'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { api, getAdminToken } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/image';
import { AdminRows } from '@/components/AdminRows';
import { ImageUploader } from '@/components/ImageUploader';
import { Loader } from '@/components/Loader';

const config: Record<string, { endpoint: string; title: string; fields: string[] }> = {
  services: { endpoint: '/admin/services/', title: 'Services', fields: ['title', 'title_sw', 'slug', 'category', 'category_sw', 'short_description', 'short_description_sw', 'full_description', 'full_description_sw', 'image', 'image_external_url', 'icon', 'display_order', 'is_active'] },
  projects: { endpoint: '/admin/projects/', title: 'Projects', fields: ['title', 'title_sw', 'slug', 'category', 'description', 'description_sw', 'image', 'image_external_url', 'status', 'status_sw', 'location', 'location_sw', 'start_date', 'end_date', 'is_featured', 'display_order', 'is_active'] },
  home: { endpoint: '/admin/hero/', title: 'Hero content', fields: ['title', 'title_sw', 'subtitle', 'subtitle_sw', 'description', 'description_sw', 'background_image', 'primary_button_text', 'primary_button_link', 'secondary_button_text', 'secondary_button_link', 'is_active'] },
  about: { endpoint: '/admin/about/', title: 'About content', fields: ['title', 'title_sw', 'description', 'description_sw', 'image', 'bullet_points', 'bullet_points_sw', 'is_active'] },
  info: { endpoint: '/admin/info-cards/', title: 'Vision, mission and focus', fields: ['type', 'title', 'description', 'icon', 'display_order', 'is_active'] },
  team: { endpoint: '/admin/team/', title: 'Team', fields: ['name', 'position', 'position_sw', 'message', 'message_sw', 'photo', 'display_order', 'is_active'] },
  stats: { endpoint: '/admin/statistics/', title: 'Statistics', fields: ['label', 'label_sw', 'value', 'suffix', 'display_order', 'is_active'] },
  settings: { endpoint: '/admin/settings/', title: 'Site settings', fields: ['company_name', 'logo', 'primary_phone', 'secondary_phone', 'email', 'location', 'location_sw', 'address', 'address_sw', 'working_days', 'working_days_sw', 'working_hours', 'working_hours_sw', 'footer_text', 'footer_text_sw', 'facebook_url', 'instagram_url', 'whatsapp_number'] },
};

const fieldTypes: Record<string, 'bullet-list' | 'textarea' | 'image' | 'boolean' | 'text'> = {
  bullet_points: 'bullet-list',
  bullet_points_sw: 'bullet-list',
  description: 'textarea',
  description_sw: 'textarea',
  full_description: 'textarea',
  full_description_sw: 'textarea',
  short_description: 'textarea',
  short_description_sw: 'textarea',
  message: 'textarea',
  message_sw: 'textarea',
  footer_text: 'textarea',
  footer_text_sw: 'textarea',
  address: 'textarea',
  address_sw: 'textarea',
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

function normalizeFieldForSubmit(field: string, value: unknown) {
  if (field === 'bullet_points' || field === 'bullet_points_sw') {
    return JSON.stringify(
      toBulletRows(value)
        .map((item) => ({ title: item.title.trim(), description: item.description.trim() }))
        .filter((item) => item.title || item.description)
    );
  }
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value === null || value === undefined) return '';
  return String(value);
}

function friendlyError(message: string) {
  if (message.includes('bullet_points')) {
    return 'Please check your bullet points. Write one short point per row.';
  }
  if (message.includes('Translation service is not configured')) return 'Translation service is not configured. You can still enter Kiswahili content manually.';
  return message;
}

function getSaveRequest(sectionName: string, endpoint: string, values: any) {
  const singletonSections = new Set(['settings']);
  if (singletonSections.has(sectionName)) {
    return {
      url: endpoint,
      method: 'PATCH',
    };
  }

  return {
    url: `${endpoint}${values.id ? `${values.id}/` : ''}`,
    method: values.id ? 'PATCH' : 'POST',
  };
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
        <tbody>{rows.map((row) => <tr className="border-b" key={row.id || 'setting'}><td className="p-3 font-semibold">{name === 'settings' ? row.company_name || 'Site settings' : row.title || row.name || row.company_name}</td><td className="p-3">{row.is_active === false ? 'Hidden' : 'Published'}</td><td className="p-3 text-right"><button onClick={() => setEdit(row)}>Edit</button>{name !== 'settings' && row.id && <button className="ml-4 text-red-700" onClick={async () => { if (confirm('Delete this item?')) { await api(`${c.endpoint}${row.id}/`, { method: 'DELETE', headers: auth }); load(); } }}>Delete</button>}</td></tr>)}</tbody>
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
  const [filesByField, setFilesByField] = useState<Record<string, File>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState('');
  const auth = { Authorization: `Bearer ${getAdminToken()}` };
  const isAbout = sectionName === 'about';

  async function autoTranslate(targetField: string) {
    const sourceField = targetField.endsWith('_sw') ? targetField.slice(0, -3) : '';
    if (!sourceField) return;
    const sourceValue = values[sourceField];
    setTranslating(targetField);
    setError('');
    setSuccess('');
    try {
      if (targetField === 'bullet_points_sw') {
        const translated: BulletRow[] = [];
        for (const item of toBulletRows(sourceValue).filter((row) => row.title || row.description)) {
          const titleResult: any = item.title
            ? await api('/admin/translate/', { method: 'POST', headers: auth, body: JSON.stringify({ text: item.title, source: 'en', target: 'sw' }) })
            : { translatedText: '' };
          const descResult: any = item.description
            ? await api('/admin/translate/', { method: 'POST', headers: auth, body: JSON.stringify({ text: item.description, source: 'en', target: 'sw' }) })
            : { translatedText: '' };
          translated.push({
            title: titleResult.translatedText || item.title,
            description: descResult.translatedText || item.description,
          });
        }
        setValues((current: any) => ({ ...current, [targetField]: translated }));
      } else {
        const result: any = await api('/admin/translate/', { method: 'POST', headers: auth, body: JSON.stringify({ text: sourceValue || '', source: 'en', target: 'sw' }) });
        setValues((current: any) => ({ ...current, [targetField]: result.translatedText || current[targetField] || '' }));
      }
    } catch (e: any) {
      setError(friendlyError(e.message));
    } finally {
      setTranslating('');
    }
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const fd = new FormData();
      config.fields.forEach((field: string) => {
        if (fieldTypes[field] === 'image') {
          const selectedFile = filesByField[field];
          if (selectedFile) fd.append(field, selectedFile);
        } else {
          fd.append(field, normalizeFieldForSubmit(field, values[field]));
        }
      });
      const request = getSaveRequest(sectionName, config.endpoint, values);
      await api(request.url, { method: request.method, headers: auth, body: fd });
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
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{config.fields.map((field: string) => <Field key={field} field={field} value={values[field]} values={values} set={setValues} setFile={(file?: File) => setFilesByField((current) => {
        const next = { ...current };
        if (file) next[field] = file;
        else delete next[field];
        return next;
      })} onAutoTranslate={field.endsWith('_sw') && config.fields.includes(field.slice(0, -3)) ? () => autoTranslate(field) : undefined} translating={translating === field} />)}</div>
      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      {success && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{success}</p>}
      <div className="mt-6 flex gap-3"><button className="btn btn-gold" disabled={saving}>{saving ? 'Saving changes…' : 'Save changes'}</button><button type="button" className="btn" onClick={close}>Cancel</button></div>
    </form>
  </div>;
}

function Field({ field, value, values, set, setFile, onAutoTranslate, translating }: { field: string; value: any; values?: any; set: any; setFile: any; onAutoTranslate?: () => void; translating?: boolean }) {
  const type = fieldTypes[field] || 'text';
  const long = type === 'textarea' || type === 'bullet-list';
  const change = (e: ChangeEvent<any>) => set((v: any) => ({ ...v, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  if (type === 'image') {
    const current = resolveMediaUrl(values?.[`${field}_url`] || (field === 'logo' ? values?.logo_url : '') || (typeof value === 'string' ? value : undefined));
    return <ImageUploader label={field} current={current} onChange={setFile} />;
  }
  if (type === 'boolean') return <label className="flex items-center gap-2 pt-7 capitalize"><input type="checkbox" checked={!!value} onChange={change} />{labelFor(field)}</label>;
  if (type === 'bullet-list') return <BulletListEditor field={field} value={value} onChange={(items) => set((v: any) => ({ ...v, [field]: items }))} onAutoTranslate={onAutoTranslate} translating={translating} />;
  if (field === 'category') return <label className="text-sm font-semibold">Category<select className="input mt-1" value={value || ''} onChange={change}><option value="">Select category</option>{['completed', 'ongoing', 'daily', 'featured'].map((x) => <option key={x}>{x}</option>)}</select></label>;
  if (field === 'type') return <label className="text-sm font-semibold">Card type<select className="input mt-1" value={value || 'vision'} onChange={change}>{['vision', 'mission', 'focus', 'value'].map((x) => <option key={x}>{x}</option>)}</select></label>;
  return <label className={`text-sm font-semibold capitalize ${long ? 'sm:col-span-2' : ''}`}>
    <span className="flex items-center justify-between gap-3">{labelFor(field)}{onAutoTranslate && <button type="button" className="rounded border border-slate-300 px-2 py-1 text-xs font-bold normal-case text-slate-700 disabled:opacity-60" onClick={onAutoTranslate} disabled={translating}>{translating ? <span className="button-loading"><Loader label="" fullScreen={false} size="small" />Translating</span> : 'Auto translate to Kiswahili'}</button>}</span>
    {type === 'textarea' ? <textarea className="input mt-1 min-h-28 font-normal" value={value || ''} onChange={change} placeholder={field === 'description' ? 'Write clear content for this section.' : undefined} /> : <input className="input mt-1 font-normal" type={field.includes('date') ? 'date' : field === 'email' ? 'email' : field === 'display_order' || field === 'value' ? 'number' : 'text'} value={value || ''} onChange={change} />}
  </label>;
}

type BulletRow = { title: string; description: string };

function toBulletRows(value: unknown): BulletRow[] {
  if (Array.isArray(value)) {
    const rows = value.map((item) => {
      if (typeof item === 'string') return { title: item, description: '' };
      return {
        title: String((item as any)?.title || (item as any)?.text || '').trim(),
        description: String((item as any)?.description || (item as any)?.short_description || '').trim(),
      };
    }).filter((item) => item.title || item.description);

    return rows.length ? rows : [{ title: '', description: '' }];
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [{ title: '', description: '' }];

    try {
      const parsed = JSON.parse(trimmed);
      return toBulletRows(parsed);
    } catch {
      // Not JSON, continue.
    }

    return trimmed.split('\n').filter(Boolean).map((line) => ({ title: line.trim(), description: '' }));
  }

  return [{ title: '', description: '' }];
}

function BulletListEditor({ field = 'bullet_points', value, onChange, onAutoTranslate, translating }: { field?: string; value: unknown; onChange: (items: BulletRow[]) => void; onAutoTranslate?: () => void; translating?: boolean }) {
  const rows = toBulletRows(value);

  const update = (index: number, next: BulletRow) => {
    const copy = [...rows];
    copy[index] = next;
    onChange(copy);
  };

  const add = () => {
    onChange([...rows, { title: '', description: '' }]);
  };

  const remove = (index: number) => {
    const copy = rows.filter((_, i) => i !== index);
    onChange(copy.length ? copy : [{ title: '', description: '' }]);
  };

  return <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-sand/60 p-4">
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold">{labelFor(field)}</p>
        {onAutoTranslate && <button type="button" className="rounded border border-slate-300 px-2 py-1 text-xs font-bold text-slate-700 disabled:opacity-60" onClick={onAutoTranslate} disabled={translating}>{translating ? <span className="button-loading"><Loader label="" fullScreen={false} size="small" />Translating</span> : 'Auto translate to Kiswahili'}</button>}
      </div>
      <p className="mt-1 text-xs text-slate-600">Write short points. These appear as checklist items on the About section.</p>
    </div>
    <div className="mt-3 space-y-2">
      {rows.map((item, index) => <div className="rounded-xl border border-slate-200 bg-white p-3" key={index}>
        <input className="input bg-white" value={item.title} onChange={(event) => update(index, { ...item, title: event.target.value })} placeholder="Bullet title e.g. High quality workmanship" />
        <textarea className="input mt-2 min-h-20 bg-white" value={item.description} onChange={(event) => update(index, { ...item, description: event.target.value })} placeholder="Short description e.g. We use quality materials and skilled supervision." />
        <button type="button" className="mt-2 rounded border border-red-200 px-3 py-2 text-sm font-bold text-red-700 disabled:opacity-40" onClick={() => remove(index)} disabled={rows.length === 1 && !item.title && !item.description} aria-label="Remove bullet">Remove</button>
      </div>)}
    </div>
    {rows.every((item) => !item.title.trim() && !item.description.trim()) && <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600">Add key points that appear under About section.</p>}
    <button type="button" className="btn btn-dark mt-3" onClick={add}>+ Add bullet</button>
  </div>;
}
