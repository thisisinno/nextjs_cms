import { API_BASE } from './api';
import type { Project, Service } from './types';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const CONSTRUCTION_IMAGE_FALLBACKS = {
  site: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1400',
  architecture: 'https://images.pexels.com/photos/323705/pexels-photo-323705.jpeg?auto=compress&cs=tinysrgb&w=1400',
  villa: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1400',
  interior: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1400',
  renovation: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1400',
  pool: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1400',
  commercial: 'https://images.pexels.com/photos/236698/pexels-photo-236698.jpeg?auto=compress&cs=tinysrgb&w=1400',
  workers: 'https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=1400',
} as const;

export const DEFAULT_CONSTRUCTION_IMAGE = CONSTRUCTION_IMAGE_FALLBACKS.workers;

export function resolveMediaUrl(value?: string | null) {
  const url = String(value || '').trim();
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/media') || url.startsWith('/static')) {
    return `${API_BASE.replace(/\/api\/?$/, '')}${url}`;
  }
  return url;
}

export function getConstructionFallbackImage(item?: Partial<Project | Service>) {
  const text = `${item?.title || ''} ${item?.category || ''} ${(item as Project | undefined)?.status || ''} ${item?.slug || ''}`.toLowerCase();
  if (/(villa|luxury|home|house|residential)/.test(text)) return CONSTRUCTION_IMAGE_FALLBACKS.villa;
  if (/(pool|swimming)/.test(text)) return CONSTRUCTION_IMAGE_FALLBACKS.pool;
  if (/(renovation|renovate|renew|re-new|repair|upgrade)/.test(text)) return CONSTRUCTION_IMAGE_FALLBACKS.renovation;
  if (/(interior|exterior|decor|finish|finishing)/.test(text)) return CONSTRUCTION_IMAGE_FALLBACKS.interior;
  if (/(site|daily|management|team|supervision)/.test(text)) return CONSTRUCTION_IMAGE_FALLBACKS.site;
  if (/(architect|architecture|blueprint|design)/.test(text)) return CONSTRUCTION_IMAGE_FALLBACKS.architecture;
  if (/(commercial|office|shop|hotel|business)/.test(text)) return CONSTRUCTION_IMAGE_FALLBACKS.commercial;
  return DEFAULT_CONSTRUCTION_IMAGE;
}

export function getAdvertisementImage(project: Partial<Project>) {
  return resolveMediaUrl(project.image_url)
    || resolveMediaUrl(project.image)
    || resolveMediaUrl(project.image_external_url)
    || getConstructionFallbackImage(project);
}

export function getServiceImage(service: Partial<Service>) {
  return resolveMediaUrl(service.image_url)
    || resolveMediaUrl(service.image)
    || resolveMediaUrl(service.image_external_url);
}

export async function resizeImage(file: File, maxWidth = 1920, maxHeight = 1440, quality = .84): Promise<File> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Use JPG, PNG, or WebP images.');
  if (file.size > MAX_IMAGE_SIZE) throw new Error('Image must be 5MB or smaller.');
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(maxWidth / bitmap.width, maxHeight / bitmap.height, 1);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * ratio);
  canvas.height = Math.round(bitmap.height * ratio);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
  if (!blob) throw new Error('Unable to process image.');
  return new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
}
