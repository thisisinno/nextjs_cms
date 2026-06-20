'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE, loginAdmin } from '@/lib/api';

export function AdminLoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter(); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  if (!open) return null;
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setError(''); try { const form = new FormData(event.currentTarget); const result = await loginAdmin(String(form.get('username') || ''), String(form.get('password') || '')); localStorage.setItem('admin-token', result.access); router.push('/admin'); } catch (issue: any) { setError(issue.message); } finally { setLoading(false); } }
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Admin sign in"><form onSubmit={submit} className="glass-panel w-full max-w-md p-7 text-white"><button type="button" onClick={onClose} className="float-right text-xl text-slate-300 hover:text-white" aria-label="Close login">×</button><p className="text-xs font-black tracking-[.24em] text-gold">SCCL CMS</p><h2 className="mt-3 text-3xl font-bold">Secure workspace</h2><p className="mt-2 text-sm text-slate-300">Sign in to manage content and client enquiries.</p><input className="input mt-6" name="username" required autoComplete="username" placeholder="Username" /><input className="input mt-3" name="password" type="password" required autoComplete="current-password" placeholder="Password" /><button className="btn btn-gold mt-5 w-full disabled:opacity-60" disabled={loading}>{loading && <span className="button-dot" />}{loading ? 'Connecting to secure workspace…' : 'Sign in securely'}</button>{error && <p className="mt-3 text-sm text-red-300">{error}</p>}{process.env.NODE_ENV !== 'production' && <p className="mt-4 break-all text-xs text-slate-400">API: {API_BASE}</p>}<Link href="/admin/login" className="mt-5 block text-center text-sm text-gold hover:text-white">Open full admin login page</Link></form></div>;
}
