'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminRows } from '@/components/AdminRows';
import { api } from '@/lib/api';

export default function Dashboard() {
  const [data, setData] = useState<any>();
  const [popup, setPopup] = useState<any>();
  const [error, setError] = useState('');
  useEffect(() => { api<any>('/admin/dashboard/').then(result => { setData(result); setPopup(result.recent_enquiries?.find((entry: any) => entry.status === 'new')); }).catch(issue => setError(issue.message)); }, []);
  async function status(nextStatus: string) {
    try { await api(`/enquiries/${popup.id}/`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) }); setPopup(null); setData((current: any) => current ? { ...current, new_enquiries: Math.max(0, current.new_enquiries - 1) } : current); }
    catch (issue: any) { setError(issue.message); }
  }
  if (!data) return <main className="p-8">{error ? <div className="card max-w-xl p-6"><h1 className="text-xl font-bold">Dashboard unavailable</h1><p className="mt-2 text-red-700">{error}</p></div> : <div className="space-y-4"><div className="h-9 w-48 animate-pulse rounded bg-white" /><div className="grid gap-4 md:grid-cols-5">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl bg-white" />)}</div></div>}</main>;
  return <main className="p-5 md:p-9"><h1 className="text-3xl font-bold">Dashboard</h1><p className="mt-2 text-slate-600">Operational overview for authorised staff.</p><div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[['Total enquiries', data.enquiries], ['New enquiries', data.new_enquiries], ['Contact messages', data.contact_messages], ['Services', data.services], ['Projects', data.projects]].map(([label, value]) => <div className="card p-5" key={String(label)}><p className="text-sm text-slate-500">{label}</p><strong className="text-3xl">{String(value)}</strong></div>)}</div><section className="mt-10"><div className="flex justify-between"><h2 className="text-xl font-bold">Recent enquiries</h2><Link className="text-sm text-gold" href="/admin/enquiries">View all</Link></div><AdminRows rows={data.recent_enquiries} /></section>{popup && <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6"><p className="font-bold uppercase text-gold">New enquiry</p><h2 className="mt-2 text-2xl font-bold">{popup.full_name}</h2><p>{popup.phone} · {popup.location} · {new Date(popup.created_at).toLocaleString()}</p><p className="mt-4 text-sm">{popup.message}</p><p className="mt-2 text-sm font-semibold">{popup.items?.map((item: any) => item.service_title_snapshot).join(', ')}</p><div className="mt-6 flex flex-wrap gap-2"><Link className="btn btn-dark" href="/admin/enquiries">View</Link><button className="btn btn-gold" onClick={() => status('viewed')}>Mark viewed</button><button className="btn" onClick={() => setPopup(null)}>Close</button></div><button className="mt-2 text-sm" onClick={() => status('contacted')}>Mark contacted</button></div></div>}</main>;
}
