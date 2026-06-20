'use client';

import { useState } from 'react';
import { resizeImage } from '@/lib/image';

type Props = { label: string; current?: string; onChange: (file: File | undefined) => void };

export function ImageUploader({ label, current, onChange }: Props) {
  const [preview, setPreview] = useState(current || '');
  const [error, setError] = useState('');
  async function select(file?: File) {
    setError('');
    if (!file) return;
    try {
      const prepared = await resizeImage(file);
      setPreview(URL.createObjectURL(prepared));
      onChange(prepared);
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'Image processing failed.'); }
  }
  return <label className="sm:col-span-2 text-sm font-semibold capitalize">{label.replaceAll('_', ' ')}
    <input className="input mt-1" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={event => select(event.target.files?.[0])} />
    <span className="mt-1 block text-xs font-normal text-slate-500">JPG, PNG or WebP, up to 3MB. Images are optimized before upload.</span>
    {error && <span className="mt-1 block text-xs font-normal text-red-700">{error}</span>}
    {preview && <img src={preview} className="mt-2 h-24 w-36 rounded object-cover" alt={`Preview of ${label}`} />}
  </label>;
}
